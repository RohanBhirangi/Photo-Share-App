import React, { useEffect, useState } from 'react';
import { UploadImageForm } from './components/UploadImageForm';
import { UserList } from './components/UserList';
import { ImageList } from './components/ImageList';
import axios from 'axios';
import { ApiEndpoint } from './properties';

const App: React.FC = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [renderImageList, setRenderImageList] = useState(false);

  useEffect(() => {
    const saveUserIp = async () => {
      const res = await fetch('https://api.ipify.org/?format=json');
      const ipObj = await res.json();
      axios.post(ApiEndpoint + "/saveUser", ipObj, {}).then(res => {
        setIpAddress(ipObj.ip);
      });
    };
    if(ipAddress === "")
      saveUserIp();
  }, [ipAddress]);

  const reRenderImages = () => {
    setRenderImageList(!renderImageList);
  };

  return (
    <React.Fragment>
      <UploadImageForm/>
      <ImageList ipAddress={ipAddress} render={renderImageList}/>
      <UserList ipAddress={ipAddress} reRenderImages={reRenderImages}/>
    </React.Fragment>
  );
};

export default App;
