import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // Or a spinner

    if (!user) {
        // User not logged in? Send to login.
        return <Navigate to="/login" replace />;
    }

    // Map "tenant" role to "Client" for backward compatibility
    const userRole = user.role === "tenant" ? "Client" : user.role;

    if (!allowedRoles.includes(userRole)) {
        // Logged in but wrong role? Send home.
        return <Navigate to="/" replace />;
    }

    // Access granted
    return <Outlet />;
};

export default ProtectedRoute;