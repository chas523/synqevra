import axios from "axios";

export const proxyApi = axios.create({
  baseURL: '/api', //process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:3003/api",
  timeout: 100000,
  withCredentials: true,
});

proxyApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Error response:", error.response);
    const originalRequest = error.config;

    // we avoid refreshing tokens on /auth endpoints ie. on login form (which also throws 401)
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    //check if tb refresh token is expired (by message)
    if (
      error.response?.data?.statusCode === 401 &&
      error.response?.data?.message.includes("Token has expired")
    ) {
      proxyApi.post("/auth/logout");

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }

      return Promise.reject(error);
    }
    //handle our refresh token expiration (user's refresh token)
    else if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await proxyApi.post("/auth/refresh");
        return proxyApi(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);
