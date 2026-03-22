import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const user = JSON.parse(userInfo);
    if (user && user.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

export default API;
