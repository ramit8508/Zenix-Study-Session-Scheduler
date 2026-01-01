import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import { Pause, Play, Square } from 'lucide-react';
import '../Styles/ActiveSession.css';

function ActiveSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionData = location.state || {};
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check for existing active session
    const activeSession = JSON.parse(localStorage.getItem('activeSession'));
    
    if (activeSession) {
      // Calculate elapsed time based on start time
      const startTime = new Date(activeSession.startTime).getTime();
      const now = Date.now();
      const pausedDuration = activeSession.pausedDuration || 0;
      const calculatedTime = Math.floor((now - startTime) / 1000) - pausedDuration;
      setElapsedTime(calculatedTime);
      setIsPaused(activeSession.isPaused || false);
    } else if (sessionData.subject) {
      // New session - save to localStorage
      const newSession = {
        ...sessionData,
        startTime: new Date().toISOString(),
        isPaused: false,
        pausedDuration: 0,
        lastPauseTime: null,
      };
      localStorage.setItem('activeSession', JSON.stringify(newSession));
    }
  }, [sessionData]);

  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          // Update localStorage with current time
          const activeSession = JSON.parse(localStorage.getItem('activeSession'));
          if (activeSession) {
            localStorage.setItem('activeSession', JSON.stringify({
              ...activeSession,
              currentElapsed: newTime,
            }));
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePauseResume = () => {
    const activeSession = JSON.parse(localStorage.getItem('activeSession'));
    
    if (!isPaused) {
      // Pausing - record pause time
      localStorage.setItem('activeSession', JSON.stringify({
        ...activeSession,
        isPaused: true,
        lastPauseTime: new Date().toISOString(),
      }));
    } else {
      // Resuming - calculate paused duration
      const pauseTime = new Date(activeSession.lastPauseTime).getTime();
      const now = Date.now();
      const pausedDuration = (activeSession.pausedDuration || 0) + Math.floor((now - pauseTime) / 1000);
      
      localStorage.setItem('activeSession', JSON.stringify({
        ...activeSession,
        isPaused: false,
        pausedDuration,
        lastPauseTime: null,
      }));
    }
    
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    const activeSession = JSON.parse(localStorage.getItem('activeSession'));
    
    // Save session to sessions history
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const newSession = {
      id: Date.now(),
      subject: activeSession.subject,
      type: activeSession.sessionType,
      duration: elapsedTime,
      goalDuration: activeSession.duration ? parseInt(activeSession.duration) * 60 : null,
      date: new Date().toISOString().split('T')[0],
    };
    sessions.push(newSession);
    localStorage.setItem('sessions', JSON.stringify(sessions));

    // Update today's study time
    const today = new Date().toDateString();
    const todayTime = JSON.parse(localStorage.getItem('todayStudyTime') || '{}');
    todayTime[today] = (todayTime[today] || 0) + elapsedTime;
    localStorage.setItem('todayStudyTime', JSON.stringify(todayTime));

    // Clear active session
    localStorage.removeItem('activeSession');

    navigate('/dashboard');
  };

  // Get session data from active session or location state
  const activeSessionData = JSON.parse(localStorage.getItem('activeSession')) || sessionData;

  return (
    <div className="dashboard-container">
      <NavBar />
      <div className="active-session-container">
        <div className="session-badge">Session in Progress</div>
        
        <h1 className="session-subject">{activeSessionData.subject || 'Study'}</h1>
        <p className="session-type">{activeSessionData.sessionType || 'Study'} Session</p>

        <div className="timer-circle">
          <div className="timer-display">{formatTime(elapsedTime)}</div>
        </div>

        {activeSessionData.duration && (
          <p className="goal-duration">Goal: {activeSessionData.duration} minutes</p>
        )}

        <div className="session-controls">
          <button 
            className="btn-pause"
            onClick={handlePauseResume}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn-end" onClick={handleEndSession}>
            <Square size={18} />
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActiveSession;
