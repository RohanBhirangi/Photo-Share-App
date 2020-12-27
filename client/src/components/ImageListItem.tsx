import React from 'react';

interface ImageListItemProps {
    image: Image
};

export const ImageListItem: React.FC<ImageListItemProps> = ({ image }) => {
    return (
        <img src={image.url} alt="" width="640px" height="480px"/>
    );
};
