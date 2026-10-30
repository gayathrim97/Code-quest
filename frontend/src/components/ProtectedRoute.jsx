import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authStorage } from '../services/api';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuth = authStorage.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
