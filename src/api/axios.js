import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(
      "Axios interceptor: Error response",
      error.response?.status,
      error.response?.config?.url
    );
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if this is a property save operation - don't auto-logout for these
      const isPropertySave =
        error.response?.config?.url?.includes("/properties/") &&
        error.response?.config?.method === "post" &&
        error.response?.config?.url?.endsWith("/save");

      // Check if this is a user interests operation - don't auto-logout for these
      const isUserInterests =
        error.response?.config?.url?.includes("/user/interests") &&
        error.response?.config?.method === "get";

      // Check if this is a refresh token request - don't retry
      const isRefreshRequest =
        error.response?.config?.url?.includes("/auth/refresh");

      if (isPropertySave || isUserInterests || isRefreshRequest) {
        console.log(
          "Axios interceptor: 401 on property save, user interests, or refresh - not logging out"
        );
        return Promise.reject(error);
      }

      // Try to refresh the token if we have a refresh token
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          console.log("Axios interceptor: Attempting token refresh");

          const refreshResponse = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
          });
          const { access_token } = refreshResponse.data;

          // Update the stored access token
          localStorage.setItem("token", access_token);

          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Retry the original request
          console.log(
            "Axios interceptor: Retrying original request with new token"
          );
          return api(originalRequest);
        } catch (refreshError) {
          console.log("Axios interceptor: Token refresh failed", refreshError);
          // Refresh failed, proceed to logout
        }
      } else {
        console.log(
          "Axios interceptor: No refresh token available, logging out"
        );
      }

      // Token refresh failed or no refresh token available
      console.log("Axios interceptor: Clearing tokens due to 401");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    } else if (error.response?.status === 422) {
      // Unprocessable entity - check if it's auth-related
      console.log(
        "Axios interceptor: 422 error details:",
        error.response?.data
      );
      // For now, don't auto-clear on 422 - might be validation errors
    }
    return Promise.reject(error);
  }
);

export default api;
