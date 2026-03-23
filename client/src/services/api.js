import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prevent infinite loops by checking if the request was to the login endpoint
    const isLoginRequest = error.config.url.includes("/users/login");

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      
      // Only redirect if not already on the login page to avoid refresh loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
