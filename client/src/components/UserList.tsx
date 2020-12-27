import React, { useEffect, useState } from 'react';
import { UserListItem } from './UserListItem';
import axios from 'axios';
import { ApiEndpoint } from '../properties';

interface UserListProps {
    ipAddress: string,
    reRenderImages: () => void
}

export const UserList: React.FC<UserListProps> = ({ ipAddress, reRenderImages }) => {
    const [users, setUsers] = useState(new Array<User>());

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await axios.post(ApiEndpoint + "/users", { ip: ipAddress }, {});
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        getUsers();
    }, [ipAddress]);

    return (
        <table>
            <tbody>
                {users.map(user => {
                    user.user_ip_address = ipAddress;
                    return (
                        <UserListItem key={user.ip_address} user={user} reRenderImages={reRenderImages}/>
                    );
                })}
            </tbody>
        </table>
    );
};
