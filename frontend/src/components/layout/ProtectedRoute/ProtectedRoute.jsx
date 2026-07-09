import React from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '../../../stores/userStore';

const ProtectedRoute = ({ children }) => {
  const token = useUserStore((s) => s.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
