import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { decryptData } from '../../utils/decrypt'; // Import decryption function

const ProtectedRoute = ({ requiredRoles, Component }) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRoleid');
    if (storedRole) {
      // Decrypt the stored role
      const decryptedRole = decryptData(storedRole);
      setUserRole(decryptedRole);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  if (!userRole || !requiredRoles.includes(userRole)) {
    return <Navigate to="/login" />; // Redirect to login if unauthorized
  }

  return <Component />; // Render the assigned component
};

export default ProtectedRoute;
