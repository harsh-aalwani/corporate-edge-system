import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true, 
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null; // No need to return anything unless you want to expose socket events
};

export default useSocket;
