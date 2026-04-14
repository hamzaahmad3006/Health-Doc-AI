import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  // Check if user is authenticated (mock token for now)
  const isAuthenticated = localStorage.getItem("token") !== null;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
