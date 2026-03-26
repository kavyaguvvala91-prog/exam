import axios from "axios";

const DEFAULT_API_URL =
  process.env.REACT_APP_API_URL ||
  `http://${process.env.REACT_APP_BACKEND_HOST || "127.0.0.1"}:${
    process.env.REACT_APP_BACKEND_PORT || 5000
  }/api/auth`;

const API = axios.create({
  baseURL: DEFAULT_API_URL
});

export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);

export const fetchLoggedUsers = (token) =>
  API.get("/logged-users", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
