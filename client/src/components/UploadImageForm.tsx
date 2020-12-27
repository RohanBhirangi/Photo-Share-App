import React, { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';
import { ApiEndpoint } from '../properties';

export const UploadImageForm: React.FC = () => {
    const [newImage, setNewImage] = useState<File>();
    const [image, setImage] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.files != null) {
            setImage(e.target.value);
            setNewImage(e.target.files[0]);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(newImage) {
            const data = new FormData();
            data.append('file', newImage);
            axios.post(ApiEndpoint + "/upload", data, {}).then(res => {
                setNewImage(undefined);
                setImage("");
            });
        }
    };

    return (
        <form>
            <label>Select image:</label>
            <input type="file" accept="image/*" value={image} onChange={handleChange}/>
            <button type="submit" onClick={handleSubmit}>Upload</button>
        </form>
    );
};
