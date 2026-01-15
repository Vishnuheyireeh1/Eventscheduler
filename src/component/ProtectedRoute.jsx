import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the static token exists in localStorage
  const isAuthenticated = localStorage.getItem('adminToken') === 'secret-token-123';
  
  if (!isAuthenticated) {
    // If not logged in, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;