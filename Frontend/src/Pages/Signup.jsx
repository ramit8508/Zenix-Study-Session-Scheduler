import React, { useState } from "react";
import LoginLeftContent from "../Components/LoginLeftContent.jsx";
import "../Styles/Login.css";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth.js";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await authAPI.register(formData);
      
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("accessToken", response.data.accessToken);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberedPassword", formData.password);
      }
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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
          <h2 className="login-heading">Create Account</h2>
          <h3 className="login-para">
            Sign up to start tracking your study sessions
          </h3>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          <div className="login-signup-button-box">
            <p className="signup-para">Already have an account?</p>
            <button className="signup-button" onClick={() => navigate("/")}>
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
