import React, { useEffect } from 'react';

const UserActivityHandler = () => {
  useEffect(() => {
    const handleTabClose = () => {
      // Use `navigator.sendBeacon` for reliability on tab close
      const url = 'http://localhost:5000/api/users/logout'; // Endpoint for updating status
      const data = JSON.stringify({});
      navigator.sendBeacon(url, data); // Send a request to mark the user offline
    };

    // Add `beforeunload` event listener
    window.addEventListener('beforeunload', handleTabClose);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  return null; // No UI needed for this handler
};

export default UserActivityHandler;
