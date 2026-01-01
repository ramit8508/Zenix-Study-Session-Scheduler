import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import StartSessionModal from "../Components/StartSessionModal";
import "../Styles/DashBoard.css";
import { FaRegClock } from "react-icons/fa6";
import { FaFire } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";


function DashBoard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [subjectBreakdown, setSubjectBreakdown] = useState({});

  useEffect(() => {
    // Check if there's an active session
    const activeSession = localStorage.getItem('activeSession');
    if (activeSession) {
      // Redirect to active session page
      navigate('/active-session');
      return;
    }

    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Calculate stats
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const today = new Date().toDateString();
    const todayTime = JSON.parse(localStorage.getItem('todayStudyTime') || '{}');
    
    // Today's study time
    setTodayStudyTime(todayTime[today] || 0);
    
    // Total sessions
    setTotalSessions(sessions.length);
    
    // Calculate streak
    const sortedDates = Object.keys(todayTime).sort((a, b) => new Date(b) - new Date(a));
    let currentStreak = 0;
    let checkDate = new Date();
    
    for (const dateStr of sortedDates) {
      if (dateStr === checkDate.toDateString()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
    
    // Subject breakdown
    const breakdown = {};
    sessions.forEach(session => {
      if (!breakdown[session.subject]) {
        breakdown[session.subject] = 0;
      }
      breakdown[session.subject] += session.duration;
    });
    setSubjectBreakdown(breakdown);
  }, [navigate]);

  // Refresh stats when component gains focus (app reopens)
  useEffect(() => {
    const handleFocus = () => {
      // Recalculate stats when app comes back into focus
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const today = new Date().toDateString();
      const todayTime = JSON.parse(localStorage.getItem('todayStudyTime') || '{}');
      
      setTodayStudyTime(todayTime[today] || 0);
      setTotalSessions(sessions.length);
      
      // Recalculate subject breakdown
      const breakdown = {};
      sessions.forEach(session => {
        if (!breakdown[session.subject]) {
          breakdown[session.subject] = 0;
        }
        breakdown[session.subject] += session.duration;
      });
      setSubjectBreakdown(breakdown);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="dashboard-container">
        <NavBar />
        <div className="dashboard-content">
          <h1 className="dashboard-heading">Dashboard</h1>
          <h2 className="dashboard-subheading">
            Welcome Back, {user?.name || 'Guest'}
          </h2>
          <div className="start-session-button">
            <button 
              className="btn-start-session"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="plus">+</span>
              Start Session
            </button>
          </div>
          <div className="stats-cards">
            <div className="stats-card">
              <h1 className="stats-heading">Today's Study Time</h1>
              <h1 className="stats-subheading">{formatTime(todayStudyTime)}</h1>
              <h2 className="stats-para">Total time studied today</h2>
              <div className="stats-icon">
                <FaRegClock className="icon-dashboard" />
              </div>
            </div>
            <div className="stats-card">
              <h1 className="stats-heading">Current Streak</h1>
              <h1 className="stats-subheading">{streak}</h1>
              <h2 className="stats-para">Consecutive days</h2>
              <div className="stats-icon">
                <FaFire className="icon-dashboard" />
              </div>
            </div>
            <div className="stats-card">
              <h1 className="stats-heading">Total Sessions</h1>
              <h1 className="stats-subheading">{totalSessions}</h1>
              <h2 className="stats-para">All time sessions</h2>
              <div className="stats-icon">
                <FaBookOpen className="icon-dashboard" />
              </div>
            </div>
          </div>
          <div className="session-viewer-box">
            <h1 className="session-viewer-heading"><IoMdTrendingUp className="session-viewer-icon" />Subject Breakdown</h1>
            {Object.keys(subjectBreakdown).length === 0 ? (
              <div className="view-seesion-box">
                <FaBookOpen className="view-seesion-icon" />
                <h1 className="view-seesion-heading">No study sessions yet. Start your first session!</h1>
              </div>
            ) : (
              <div className="subject-breakdown-list">
                {Object.entries(subjectBreakdown).map(([subject, duration]) => (
                  <div key={subject} className="subject-item">
                    <div className="subject-name">{subject}</div>
                    <div className="subject-time">{formatTime(duration)}</div>
                    <div className="subject-bar">
                      <div 
                        className="subject-bar-fill" 
                        style={{ width: `${(duration / Math.max(...Object.values(subjectBreakdown))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <StartSessionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </>
  );
}

export default DashBoard;
