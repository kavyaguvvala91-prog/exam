import React, { useState, useEffect } from "react";
import "../App.css";
import { MdEmail } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import { loginUser, registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const USERNAME_PATTERN = /^2451-\d{2}-\d{3}-\d{3}$/;
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || 5000;
const LOADING_DURATION_MS = 30000;

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLogin = async (event) => {
    event?.preventDefault();

    if (isLoading) {
      return;
    }

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      alert("Please enter username and password");
      return;
    }

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      alert("Username must be in 2451-xx-xxx-xxx format");
      return;
    }

    if (password !== normalizedUsername) {
      alert("Password must be the same as username");
      return;
    }

    setIsLoading(true);
    const loadingStartedAt = Date.now();

    try {
      let response;

      try {
        response = await loginUser({ username: normalizedUsername, password });
      } catch (err) {
        if (err?.response?.status !== 404) {
          throw err;
        }

        await registerUser({ username: normalizedUsername, password });
        response = await loginUser({ username: normalizedUsername, password });
      }

      const { token, user } = response.data;

      localStorage.setItem("authToken", token || "");
      localStorage.setItem("loggedInUsername", user?.username || normalizedUsername);
      localStorage.setItem("userRole", user?.role || "user");

      const elapsedMs = Date.now() - loadingStartedAt;
      const remainingMs = Math.max(LOADING_DURATION_MS - elapsedMs, 0);

      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs));
      }

      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      const backendMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "");
      const axiosCode = err?.code || "";

      const isNetworkError = !err?.response && (
        axiosCode === "ERR_NETWORK" ||
        axiosCode === "ECONNABORTED" ||
        !!err?.request
      );
      const isServiceUnavailable = status === 503;
      const isAuthIssue = status === 400 || status === 401 || status === 403 || status === 404;

      const message =
        (isNetworkError
          ? `Cannot reach backend server. Make sure backend is running on port ${BACKEND_PORT}.`
          : isServiceUnavailable
            ? `Backend is running on port ${BACKEND_PORT}, but database is unavailable. Start MongoDB on port 27017.`
            : isAuthIssue
              ? backendMessage || "Invalid credentials. Please check your username and password."
              : backendMessage || "Login failed. Please try again.");
      alert(message);
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="wrapper">
      <form className="login-card" onSubmit={handleLogin}>

        <img src="/logo.png" alt="logo" className="logo" />

        <h2 className="heading">LOGIN</h2>

        {/* USERNAME */}
        <div className="input-field">
          <input
            type="text"
            placeholder="Username (2451-xx-xxx-xxx)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="icon-box">
            <MdEmail />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="input-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="icon-box">
            <FaKey />
          </div>
        </div>

        <div className="row">
          <label className="remember">
            <input type="checkbox" />
            <span>Remember Me</span>
          </label>

          <div className="right-links">
            <button type="button" className="link">Forgot Password?</button>
            <button type="button" className="link privacy-inline">Privacy Policy</button>
          </div>
        </div>

        <button className="login-btn" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "LOGIN"}
        </button>

      </form>
    </div>

    {isLoading && (
      <div className="loading-overlay">
        <div className="dice-container">
          <div className="cube">
            <div className="cube-face front" />
            <div className="cube-face back" />
            <div className="cube-face right" />
            <div className="cube-face left" />
            <div className="cube-face top" />
            <div className="cube-face bottom" />
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Login;
