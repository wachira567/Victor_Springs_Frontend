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

    if (!allowedRoles.includes(user.role)) {
        // Logged in but wrong role? Send home.
        return <Navigate to="/" replace />;
    }

    // Access granted
    return <Outlet />;
};

export default ProtectedRoute;