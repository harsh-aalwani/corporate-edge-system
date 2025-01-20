// ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Loader from '../Main/Loader';  // Import the Loader component

const ProtectedRoute = ({ children, requiredRoles }) => {
  const [isLoading, setIsLoading] = useState(true);  // Show loader while checking role
  const [isAuthorized, setIsAuthorized] = useState(false);  // Track if user is authorized

  useEffect(() => {
    const checkRole = () => {
      const userRole = Cookies.get('userRoleid');  // Get the user role from cookie
      if (userRole && requiredRoles.includes(userRole)) {
        setIsAuthorized(true);  // Set to true if the user role matches
      }
      setIsLoading(false);  // Stop loading after the role check is done
    };

    checkRole();  // Run role check
  }, [requiredRoles]);

  if (isLoading) {
    return <Loader />;  // Show loader while role is being checked
  }

  if (!isAuthorized) {
    return <Navigate to="/Login" />;  // Redirect to login page if not authorized
  }

  return children;  // If authorized, render the children (protected content)
};

export default ProtectedRoute;
