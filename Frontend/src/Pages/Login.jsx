
import React from "react";
import { useNavigate } from "react-router-dom";
import LoginLeftContent from "../Components/LoginLeftContent.jsx";
import "../Styles/Login.css";

function Login() {
     const navigate = useNavigate();
  return (
    <>
      <div className="main-container">
        <LoginLeftContent />
        <div className="login-form">
          <h2 className="login-heading">Welcome Back</h2>
          <h3 className="login-para">
            Enter your credentials to access your account
          </h3>
          <form>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" required />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <div className="login-signup-button-box">
            <p className="signup-para">Don't have an account?</p>
            <button className="signup-button" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
