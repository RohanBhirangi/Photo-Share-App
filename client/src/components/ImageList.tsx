import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ApiEndpoint } from '../properties';
import { ImageListItem } from './ImageListItem';

interface ImageListProps {
    ipAddress: string,
    render: boolean
}

export const ImageList: React.FC<ImageListProps> = ({ ipAddress, render }) => {
    const [images, setImages] = useState(new Array<Image>());

    useEffect(() => {
        const getImages = async () => {
            try {
                const photos = new Array<Image>();
                const res = await axios.post(ApiEndpoint + "/images", { ip: ipAddress }, {});
                const names = res.data;
                names.forEach((name: string) => {
                    photos.push({
                        id: name,
                        url: ApiEndpoint + name
                    });
                });
                setImages(photos);
            } catch (err) {
                console.error(err);
            }
        };
        getImages();
    }, [ipAddress, render]);

    return (
        <React.Fragment>
            {images.map(image => {
                return (
                    <ImageListItem key={image.id} image={image}/>
                );
            })}
        </React.Fragment>
    );
};
