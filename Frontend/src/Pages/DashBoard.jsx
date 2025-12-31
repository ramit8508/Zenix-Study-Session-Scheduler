import React from "react";
import NavBar from "../Components/NavBar";
import "../Styles/DashBoard.css";
import { FaRegClock } from "react-icons/fa6";
import { FaFire } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";


function DashBoard() {
  return (
    <>
      <div className="dashboard-container">
        <NavBar />
        <div className="dashboard-content">
          <h1 className="dashboard-heading">Dashboard</h1>
          <h2 className="dashboard-subheading">Welcome Back,Ramit Goyal</h2>
          <div className="start-session-button">
            <button className="btn-start-session">
              <span className="plus">+</span>
              Start Session
            </button>
          </div>
          <div className="stats-cards">
            <div className="stats-card">
              <h1 className="stats-heading">Today's Study Time</h1>
              <h1 className="stats-subheading">00:00:00</h1>
              <h2 className="stats-para">Total time studied today</h2>
              <div className="stats-icon">
                <FaRegClock className="icon-dashboard" />
              </div>
            </div>
            <div className="stats-card">
              <h1 className="stats-heading">Current Streak</h1>
              <h1 className="stats-subheading">0</h1>
              <h2 className="stats-para">Consecutive days</h2>
              <div className="stats-icon">
                <FaFire className="icon-dashboard" />
              </div>
            </div>
            <div className="stats-card">
              <h1 className="stats-heading">Total Sessions</h1>
              <h1 className="stats-subheading">0</h1>
              <h2 className="stats-para">All time sessions</h2>
              <div className="stats-icon">
                <FaBookOpen className="icon-dashboard" />
              </div>
            </div>
          </div>
          <div className="session-viewer-box">
            <h1 className="session-viewer-heading"><IoMdTrendingUp className="session-viewer-icon" />Subject Breakdown</h1>
            <div className="view-seesion-box">
              <FaBookOpen className="view-seesion-icon" />
              <h1 className="view-seesion-heading">No study sessions yet. Start your first session!</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashBoard;
