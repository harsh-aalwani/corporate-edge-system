// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn'); // You can modify this to your preferred state check

  if (!isLoggedIn) {
    return <Navigate to="/Login" />; // Redirect to login if not logged in
  }

  return children; // Render the protected component (e.g., Dashboard)
};

export default ProtectedRoute;
