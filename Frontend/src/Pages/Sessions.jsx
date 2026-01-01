import React, { useState, useEffect } from 'react';
import NavBar from '../Components/NavBar';
import { Search, Trash2, Clock, Calendar } from 'lucide-react';
import '../Styles/Sessions.css';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    setSessions(storedSessions.reverse());
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const groupSessionsByDate = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      const dateKey = getRelativeDate(session.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    return grouped;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'All' || session.type === filter;
    const matchesSearch = session.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const deleteSession = (id) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem('sessions', JSON.stringify(updatedSessions));
  };

  return (
    <div className="dashboard-container">
      <NavBar />
      <div className="sessions-page-container">
        <h1 className="sessions-heading">Study Sessions</h1>
        <p className="sessions-subheading">View and manage your study history</p>

        <div className="sessions-header">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {['All', 'Study', 'Review', 'Practice'].map(type => (
              <button
                key={type}
                className={`filter-btn ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="sessions-list">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="no-sessions">
              <Calendar size={48} />
              <p>No sessions found</p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date} className="session-date-group">
                <div className="date-header">
                  <Calendar size={16} />
                  <span>{date}</span>
                </div>
                {dateSessions.map(session => (
                  <div key={session.id} className="session-item">
                    <div className="session-icon">
                      <Clock size={20} />
                    </div>
                    <div className="session-details">
                      <h3 className="session-subject-name">{session.subject}</h3>
                      <div className="session-meta">
                        <Clock size={14} />
                        <span>{formatTime(session.duration)}</span>
                        <span className="session-type-badge">{session.type}</span>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Sessions;
