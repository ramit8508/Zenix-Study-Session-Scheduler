import React, { useState, useEffect } from 'react';
import NavBar from '../Components/NavBar';
import { Search, Trash2, Clock, Calendar } from 'lucide-react';
import { sessionsAPI } from '../api/sessions';
import '../Styles/Sessions.css';

// Check if running in Electron
const isElectron = window.electron !== undefined;

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSessions();
    
    // Also reload sessions when window gains focus (navigating back to this page)
    const handleFocus = () => {
      console.log('Window focused - reloading sessions');
      loadSessions();
    };
    
    // Storage event listener for cross-tab updates
    const handleStorageChange = (e) => {
      if (e.key === 'sessions') {
        console.log('Sessions updated in localStorage - reloading');
        loadSessions();
      }
    };
    
    // Custom event listener for same-window updates (Electron fix)
    const handleSessionsUpdated = (e) => {
      console.log('📢 sessionsUpdated event received:', e.detail);
      loadSessions();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sessionsUpdated', handleSessionsUpdated);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionsUpdated', handleSessionsUpdated);
    };
  }, []);

  const loadSessions = async () => {
    console.log('=== LOADING SESSIONS ===');
    console.log('📦 localStorage.sessions:', localStorage.getItem('sessions'));
    try {
      // Try to get user from localStorage (device user)
      const userStr = localStorage.getItem('user') || localStorage.getItem('deviceUser');
      let user = null;
      
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      console.log('User found:', user);
      
      // ALWAYS load from localStorage first for device-based auth
      console.log('Loading from localStorage...');
      const sessionsStr = localStorage.getItem('sessions');
      console.log('📦 Raw sessions string:', sessionsStr);
      
      const storedSessions = (sessionsStr && sessionsStr !== 'undefined' && sessionsStr !== 'null') 
        ? JSON.parse(sessionsStr) 
        : [];
      
      console.log('✅ Loaded from localStorage:', storedSessions.length, 'sessions');
      console.log('📊 Sessions data:', storedSessions);
      
      // Sort by most recent first (by id which is timestamp)
      const sortedSessions = storedSessions.sort((a, b) => (b.id || 0) - (a.id || 0));
      console.log('🔄 Sorted sessions:', sortedSessions);
      setSessions(sortedSessions);
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      // Final fallback to empty array
      setSessions([]);
    }
    console.log('=== SESSIONS LOAD COMPLETE ===');
  };

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
    const matchesSearch = session.subject ? session.subject.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesFilter && matchesSearch;
  });

  console.log('📊 Sessions state:', sessions);
  console.log('📊 Filtered sessions:', filteredSessions.length, 'Total sessions:', sessions.length);
  console.log('📊 Filter:', filter, 'Search:', searchQuery);

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const deleteSession = async (id) => {
    console.log('=== DELETING SESSION ===', id);
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('deviceUser');
      let user = null;
      
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      if (isElectron && user?.id) {
        // Try IPC delete
        await sessionsAPI.delete(id, user.id);
      }
      
      // Get current sessions from localStorage
      const sessionsStr = localStorage.getItem('sessions');
      const currentSessions = (sessionsStr && sessionsStr !== 'undefined' && sessionsStr !== 'null') 
        ? JSON.parse(sessionsStr) 
        : [];
      
      const updatedSessions = currentSessions.filter(s => s.id !== id);
      
      // Update localStorage
      localStorage.setItem('sessions', JSON.stringify(updatedSessions));
      
      // Update state (already sorted)
      setSessions(sessions.filter(s => s.id !== id));
      
      console.log('✅ Session deleted');
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      // Fallback - just update state
      setSessions(sessions.filter(s => s.id !== id));
    }
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
