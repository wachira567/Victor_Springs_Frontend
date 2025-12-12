import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch and update user data
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get("/users/me");
      const userData = response.data;
      console.log("AuthContext: Fetched user data:", userData);
      setUser({
        username: userData.first_name || userData.username || "User",
        role: user.role,
        id: user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
      });
    } catch (error) {
      console.error("AuthContext: Failed to fetch user data:", error);
    }
  }, [user]);

  useEffect(() => {
    console.log("AuthContext: Initializing auth check");
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");

    console.log(
      "AuthContext: Stored values - token:",
      !!token,
      "refresh_token:",
      !!refreshToken,
      "role:",
      role,
      "userId:",
      userId
    );

    if (token && role && userId) {
      try {
        const decoded = jwtDecode(token);
        console.log("AuthContext: Decoded token:", decoded);
        console.log("AuthContext: Current time:", Date.now());
        console.log("AuthContext: Token expiry:", decoded.exp * 1000);
        // Check expiry - if access token is expired, we'll let the axios interceptor handle refresh
        if (decoded.exp * 1000 < Date.now()) {
          console.log(
            "AuthContext: Access token expired, but keeping session for refresh"
          );
          // Don't logout immediately - axios interceptor will handle refresh
        }
        console.log("AuthContext: Token valid, setting user");
        setUser({
          username: "User", // We'll get the real username from /users/me
          role: role,
          id: userId,
        });
      } catch (e) {
        console.log("AuthContext: Token decode failed:", e);
        // Only logout if we don't already have a user (prevent HMR clearing valid sessions)
        if (!user) {
          logout();
        }
      }
    } else {
      console.log("AuthContext: Missing stored auth data");
      // Only clear user if we have one (prevent unnecessary state changes on HMR)
      if (user) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []); // Keep empty dependency array to only run on mount

  // Fetch user data when user is set
  useEffect(() => {
    if (user && user.username === "User") {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const login = useCallback((token, refreshToken, role, id) => {
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    localStorage.setItem("role", role);
    localStorage.setItem("user_id", id);
    setUser({ username: "User", role, id }); // Username will be updated when we fetch user data
  }, []);

  const logout = useCallback(() => {
    console.log("AuthContext: Logout called");
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
