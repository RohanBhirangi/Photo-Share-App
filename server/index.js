import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongodb from 'mongodb';
import bodyParser from 'body-parser';

const MongoClient = mongodb.MongoClient;
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

const app = express();
const port = process.env.PORT || 8080;
let ipAddress = "";


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log('Listening on port: ' + port);
});

app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.post('/saveUser', (req, res) => {
    createUser(client, req.body.ip);
    ipAddress = req.body.ip;
    res.sendStatus(200);
});

app.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        addImageURLForIpAddress(client, ipAddress, '/' + req.file.path).then(response => {
            return res.status(200).send(req.file);
        }).catch(error => {
            return res.sendStatus(500);
        });
    });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + ipAddress);
    }
});

const upload = multer({ storage: storage }).single('file');

app.post('/images', (req, res) => {
    const getImages = async () => {
        if (req.body.ip) {
            const followedUsers = await findFollowedUsersForUser(client, req.body.ip);
            findImageURLsForUsers(client, followedUsers).then(images => {
                res.send(images);
            }).catch(err => {
                res.sendStatus(500);
            });
        } else {
            res.send([]);
        }
    };
    getImages();
});

const createUser = async (client, ipAddress) => {
    const user = await findUserByIpAddress(client, ipAddress);
    if(user) {
        console.log('Found:' + user._id);
    } else {
        const res = await client.db("photo-share-app").collection("master").insertOne({ ip_address: ipAddress });
        console.log('Created:' + res.insertedId);
    }
};

const findUserByIpAddress = async (client, ipAddress) => {
    const res = await client.db("photo-share-app").collection("master").findOne({ ip_address: ipAddress });
    return res;
};

const findUsersByIpAddresses = async (client, ipAddresses) => {
    const users = await client.db("photo-share-app").collection("master").find({ ip_address: { $in: ipAddresses } });
    return users.toArray();
};

const findAllUsers = async (client) => {
    const users = await client.db("photo-share-app").collection("master").find();
    return users.toArray();
};

const findFollowedUsersForUser = async (client, ipAddress) => {
    const user = await findUserByIpAddress(client, ipAddress);
    return user != null && user.follows != null ? user.follows : [];
};

const findImageURLsForUsers = async (client, ipAddresses) => {
    const images = [];
    if (ipAddresses) {
        const users = await findUsersByIpAddresses(client, ipAddresses);
        users.forEach(user => {
            user.images != null && user.images.forEach(image => {
                images.push(image);
            })
        });
    }
    return images;
};

app.post('/users', (req, res) => {
    const getUsers = async () => {
        const users = [];
        const user = await findUserByIpAddress(client, req.body.ip);
        if (user) {
            const followedUsers = new Set(user.follows != null ? user.follows : []);
            const allUsers = await findAllUsers(client);
            allUsers.forEach(user => {
                req.body.ip != user.ip_address && users.push({
                    ip_address: user.ip_address,
                    followed: followedUsers.has(user.ip_address)
                });
            });
        }
        res.send(users);
    };
    getUsers();
});

app.post('/follow', (req, res) => {
    const followUser = async () => {
        if(req.body.followed) {
            await addFollowedUserForIpAddress(client, req.body.user, req.body.followedUser);
        } else {
            await removeFollowedUserForIpAddress(client, req.body.user, req.body.followedUser);
        }
        res.sendStatus(200);
    };
    followUser();
});

const addFollowedUserForIpAddress = async (client, ipAddress, followedUser) => {
    const followedUsers = await findFollowedUsersForUser(client, ipAddress);
    followedUsers.push(followedUser);
    await client.db("photo-share-app").collection("master").updateOne({ ip_address: ipAddress }, { $set: { follows: followedUsers } });
};

const removeFollowedUserForIpAddress = async (client, ipAddress, followedUser) => {
    const followedUsers = await findFollowedUsersForUser(client, ipAddress);
    const filteredFollowedUsers = followedUsers.filter((value, index, arr) => {
        return value != followedUser;
    });
    await client.db("photo-share-app").collection("master").updateOne({ ip_address: ipAddress }, { $set: { follows: filteredFollowedUsers } });
};

const addImageURLForIpAddress = async (client, ipAddress, image) => {
    const images = await findImageURLsForUsers(client, [ipAddress]);
    images.push(image);
    await client.db("photo-share-app").collection("master").updateOne({ ip_address: ipAddress }, { $set: { images: images } });
};
