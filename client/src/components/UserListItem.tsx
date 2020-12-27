import React, { useState } from 'react';
import axios from 'axios';
import { ApiEndpoint } from '../properties';

interface UserListItemProps {
    user: User,
    reRenderImages: () => void
};

export const UserListItem: React.FC<UserListItemProps> = ({ user, reRenderImages }) => {
    const [followed, setFollowed] = useState(user.followed);

    const handleSubmit = () => {
        const followUser = async () => {
            try {
                await axios.post(ApiEndpoint + "/follow", {
                    user: user.user_ip_address,
                    followedUser: user.ip_address,
                    followed: !followed
                }, {});
                setFollowed(!followed);
                reRenderImages();
            } catch (err) {
                console.error(err);
            }
        };
        followUser();
    };

    return (
        <tr>
            <td>{user.ip_address}</td>
            <td>
                <button type="submit" onClick={handleSubmit}>{followed ? "Unfollow" : "Follow"}</button>
            </td>
        </tr>
    );
};
