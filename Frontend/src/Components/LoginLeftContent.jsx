import React from 'react';
import Logo from '../../Public/Logo.jpg';
import { FaRegClock } from "react-icons/fa6";
import { FiTarget } from "react-icons/fi";
import { IoMdTrendingUp } from "react-icons/io";
import '../Styles/LoginLeftContent.css';

function LoginLeftContent() {
  return (
    <div className="login-content">
      {/* Top Branding Section */}
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo-image" />
        <h1 className="app-name">Zenix</h1>
      </div>

      {/* Hero Text Section */}
      <h1 className="app-heading">Track Your Study Sessions</h1>
      <p className="app-para">
        A focused, distraction-free study tracker built for serious learners.
      </p>

      {/* Feature List Section */}
      <div className="features">
        <div className="features-box">
          <div className="logo-features">
            <FaRegClock className='logo-improvement' />
          </div>
          <div className="features-box-details">
            <h2 className="features-box-heading">Smart Time Tracking</h2>
            <p className="features-box-para">Automatically track and categorize your study sessions.</p>
          </div>
        </div>

        <div className="features-box">
          <div className="logo-features">
            <IoMdTrendingUp className='logo-improvement' />
          </div>
          <div className="features-box-details">
            <h2 className="features-box-heading">Progress Analytics</h2>
            <p className="features-box-para">Visualize your study patterns and improvements.</p>
          </div>
        </div>

        <div className="features-box">
          <div className="logo-features">
            <FiTarget className='logo-improvement' />
          </div>
          <div className="features-box-details">
            <h2 className="features-box-heading">Streak Motivation</h2>
            <p className="features-box-para">Build consistency with daily study streaks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginLeftContent;