import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginLeftContent from "../Components/LoginLeftContent.jsx";
import "../Styles/Login.css";
import { authAPI } from "../api/auth.js";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");
    
    if (rememberedEmail && rememberedPassword) {
      setFormData({
        email: rememberedEmail,
        password: rememberedPassword,
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("accessToken", response.data.accessToken);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberedPassword", formData.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="main-container">
        <LoginLeftContent />
        <div className="login-form">
          <h2 className="login-heading">Welcome Back</h2>
          <h3 className="login-para">
            Enter your credentials to access your account
          </h3>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="remember-me-container">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-me-checkbox"
                />
                <span>Remember me</span>
              </label>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="login-signup-button-box">
            <p className="signup-para">Don't have an account?</p>
            <button className="signup-button" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
