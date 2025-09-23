// src/components/RequireAdmin/RequireAdmin.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../../utils/auth';

const RequireAdmin: React.FC = () => {
  const user = getUser();
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RequireAdmin;