import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {getUserRoleCookie, removeUserRoleCookie } from '../../utils/cookieHelper';
const ProtectedRoute = ({ requiredRoles, Component }) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = getUserRoleCookie();
    if (storedRole) {
      setUserRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  if (!userRole || !requiredRoles.includes(userRole)) {
    removeUserRoleCookie();
    return <Navigate to="/login" />; // Redirect to login if unauthorized
  }

  return <Component />; // Render the assigned component
};

export default ProtectedRoute;