import React from "react";
import LoginLeftContent from "../Components/LoginLeftContent.jsx";
import "../Styles/Login.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  return (
    
    <>
      <div className="main-container">
        <LoginLeftContent />
        <div className="login-form">
          <h2 className="login-heading">Create Account</h2>
          <h3 className="login-para">
            Sign up to start tracking your study sessions
          </h3>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" required />
            </div>
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
            <p className="signup-para">Already have an account?</p>
            <button className="signup-button" onClick={() => navigate('/')}>Login</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
