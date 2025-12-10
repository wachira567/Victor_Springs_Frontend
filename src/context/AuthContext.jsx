import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Initializing auth check");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");

    console.log(
      "AuthContext: Stored values - token:",
      !!token,
      "role:",
      role,
      "userId:",
      userId
    );

    if (token && role && userId) {
      try {
        const decoded = jwtDecode(token);
        console.log("AuthContext: Decoded token:", decoded);
        // Check expiry
        if (decoded.exp * 1000 < Date.now()) {
          console.log("AuthContext: Token expired, logging out");
          logout();
        } else {
          console.log("AuthContext: Token valid, setting user");
          setUser({
            username: "User", // We'll get the real username from /users/me
            role: role,
            id: userId,
          });
        }
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

  const login = useCallback((token, role, id) => {
    localStorage.setItem("token", token);
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
