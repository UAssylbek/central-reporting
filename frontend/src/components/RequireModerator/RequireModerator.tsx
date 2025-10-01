import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../../utils/auth";

const RequireModerator: React.FC = () => {
  const user = getUser();
  return user && user.role === "moderator" ? (
    <Outlet />
  ) : (
    <Navigate to="/home" replace />
  );
};

export default RequireModerator;
