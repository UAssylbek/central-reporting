import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../../utils/auth";

const RequireAdminOrModerator: React.FC = () => {
  const user = getUser();
  return user && (user.role === "admin" || user.role === "moderator") ? (
    <Outlet />
  ) : (
    <Navigate to="/home" replace />
  );
};

export default RequireAdminOrModerator;
