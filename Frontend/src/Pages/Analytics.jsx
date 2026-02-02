import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Target, Award } from 'lucide-react';
import NavBar from '../Components/NavBar';
import { sessionsAPI } from '../api/sessions';
import '../Styles/Analytics.css';

// Check if running in Electron
const isElectron = window.electron !== undefined;

function Analytics() {
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState('weekly'); // 'weekly' or 'monthly'
  const [stats, setStats] = useState({
    totalTime: 0,
    avgSession: 0,
    totalSessions: 0,
    longestStreak: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState([]);

  useEffect(() => {
    // Migrate old sessions to new date format
    migrateOldSessions();
    loadAnalyticsData();

    // Reload data when window gains focus (for Electron)
    const handleFocus = () => {
      console.log('Analytics window focused - reloading data');
      loadAnalyticsData();
    };
    
    // Listen for localStorage changes (when sessions are added)
    const handleStorageChange = (e) => {
      if (e.key === 'sessions' || e.key === 'todayStudyTime') {
        console.log('Storage changed - reloading analytics');
        loadAnalyticsData();
      }
    };
    
    // Custom event listener for same-window updates (Electron fix)
    const handleSessionsUpdated = (e) => {
      console.log('📊 Analytics received sessionsUpdated event:', e.detail);
      loadAnalyticsData();
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

  const migrateOldSessions = () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    let migrated = false;
    
    const updatedSessions = sessions.map(session => {
      // Check if date has time component (old format)
      if (session.date && session.date.includes('T')) {
        migrated = true;
        return {
          ...session,
          date: session.date.split('T')[0]
        };
      }
      return session;
    });
    
    if (migrated) {
      console.log('Migrated sessions to new date format:', updatedSessions);
      localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Use localStorage as primary source for device-based auth
      const sessionsStr = localStorage.getItem('sessions');
      const storedSessions = (sessionsStr && sessionsStr !== 'undefined' && sessionsStr !== 'null') 
        ? JSON.parse(sessionsStr) 
        : [];
      
      console.log('Analytics - Loaded sessions from localStorage:', storedSessions);
      
      if (storedSessions.length > 0) {
        // Use localStorage data
        setSessions(storedSessions);
        calculateStats(storedSessions);
        generateWeeklyData(storedSessions);
        generateMonthlyData(storedSessions);
        calculateSubjectBreakdown(storedSessions);
      } else {
        // Try backend as fallback (only if Electron and has user)
        const userStr = localStorage.getItem('user') || localStorage.getItem('deviceUser');
        const user = (userStr && userStr !== 'undefined' && userStr !== 'null') 
          ? JSON.parse(userStr) 
          : null;
        
        if (isElectron && user?.id) {
          try {
            const response = await sessionsAPI.getAnalytics(user.id);
            
            if (response.success && response.data.totalSessions > 0) {
              const analytics = response.data;
              
              setStats({
                totalTime: Math.floor(analytics.totalTime / 60),
                avgSession: Math.floor(analytics.avgSession / 60),
                totalSessions: analytics.totalSessions,
                longestStreak: calculateStreakFromData(analytics.weeklyData)
              });

              const sessionsResponse = await sessionsAPI.getAll(user.id);
              if (sessionsResponse.success) {
                setSessions(sessionsResponse.data);
                calculateStats(sessionsResponse.data);
                generateWeeklyData(sessionsResponse.data);
                generateMonthlyData(sessionsResponse.data);
              }

              setSubjectBreakdown(analytics.subjectBreakdown || []);
              return;
            }
          } catch (backendError) {
            console.log('Backend fetch failed, using empty state:', backendError);
          }
        }
        
        // No data available - set empty state
        setStats({
          totalTime: 0,
          avgSession: 0,
          totalSessions: 0,
          longestStreak: 0
        });
        setWeeklyData([]);
        setMonthlyData([]);
        setSubjectBreakdown([]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Final fallback to localStorage
      const storedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      console.log('Analytics - Error fallback to localStorage:', storedSessions);
      setSessions(storedSessions);
      if (storedSessions.length > 0) {
        calculateStats(storedSessions);
        generateWeeklyData(storedSessions);
        generateMonthlyData(storedSessions);
        calculateSubjectBreakdown(storedSessions);
      }
    }
  };

  const calculateSubjectBreakdown = (sessions) => {
    const breakdown = {};
    
    sessions.forEach(session => {
      const subject = session.subject || 'Unknown';
      if (!breakdown[subject]) {
        breakdown[subject] = {
          subject: subject,
          totalDuration: 0,
          sessionCount: 0
        };
      }
      breakdown[subject].totalDuration += session.duration || 0;
      breakdown[subject].sessionCount += 1;
    });

    const breakdownArray = Object.values(breakdown).sort((a, b) => b.totalDuration - a.totalDuration);
    console.log('Subject breakdown:', breakdownArray);
    setSubjectBreakdown(breakdownArray);
  };

  const calculateStats = (sessions) => {
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const avgSession = sessions.length > 0 ? Math.floor(totalTime / sessions.length) : 0;
    const longestStreak = calculateStreak(sessions);

    setStats({
      totalTime: Math.floor(totalTime / 60), // Convert to minutes
      avgSession: Math.floor(avgSession / 60),
      totalSessions: sessions.length,
      longestStreak
    });
  };

  const calculateStreak = (sessions) => {
    if (sessions.length === 0) return 0;

    const dates = [...new Set(sessions.map(s => s.date))].sort();
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const generateWeeklyData = (sessions) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => {
        // Handle both old format (with time) and new format (date only)
        const sessionDate = s.date.split('T')[0];
        return sessionDate === dateStr;
      });
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = (totalSeconds / 3600).toFixed(1);

      console.log(`${day} (${dateStr}): ${daySessions.length} sessions, ${totalMinutes} min, ${totalHours}h`);

      return {
        day,
        hours: parseFloat(totalHours),
        minutes: totalMinutes,
        sessionCount: daySessions.length,
        date: dateStr
      };
    });

    console.log('Weekly data generated:', weekData);
    setWeeklyData(weekData);
  };

  const generateMonthlyData = (sessions) => {
    const today = new Date();
    const daysInMonth = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => {
        // Handle both old format (with time) and new format (date only)
        const sessionDate = s.date.split('T')[0];
        return sessionDate === dateStr;
      });
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const totalMinutes = Math.floor(totalSeconds / 60);

      daysInMonth.push({
        dayNumber: date.getDate(),
        month: date.getMonth(),
        monthName: monthNames[date.getMonth()],
        dateStr: dateStr,
        displayDate: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        minutes: totalMinutes,
        sessionCount: daySessions.length,
        intensity: totalMinutes === 0 ? 0 : 
                   totalMinutes < 15 ? 1 : 
                   totalMinutes < 30 ? 2 : 
                   totalMinutes < 60 ? 3 : 4
      });
    }

    console.log('Monthly data generated:', daysInMonth);
    setMonthlyData(daysInMonth);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="analytics-page-wrapper">
      <NavBar />
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Analytics</h1>
          <p className="analytics-subtitle">Track your study patterns and progress</p>
        </div>

        {/* Stats Cards */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper blue">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Study Time</p>
              <h2 className="stat-value">{formatTime(stats.totalTime)}</h2>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper green">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Avg Session</p>
              <h2 className="stat-value">{formatTime(stats.avgSession)}</h2>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper purple">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Sessions</p>
              <h2 className="stat-value">{stats.totalSessions}</h2>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper teal">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Longest Streak</p>
              <h2 className="stat-value">{stats.longestStreak} days</h2>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'weekly' ? 'active' : ''}`}
            onClick={() => setView('weekly')}
          >
            Weekly
          </button>
          <button
            className={`toggle-btn ${view === 'monthly' ? 'active' : ''}`}
            onClick={() => setView('monthly')}
          >
            Monthly Heatmap
          </button>
        </div>

        {/* Weekly Chart */}
        {view === 'weekly' && (
          <div className="chart-container">
            <h3 className="chart-title">
              <Clock size={20} />
              Weekly Study Hours
            </h3>
            <div className="chart-wrapper">
              <div className="y-axis">
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
                <span>0</span>
              </div>
              <div className="bar-chart">
                <div className="grid-lines">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                {weeklyData.map((data, index) => {
                  // Calculate max hours in the week for better scaling
                  const maxWeekHours = Math.max(...weeklyData.map(d => d.hours), 0.1);
                  const hours = data.hours;
                  // Dynamic scale: use 4 if max is high, otherwise use ceiling of max hours
                  const scaleMax = maxWeekHours > 4 ? Math.ceil(maxWeekHours) : 4;
                  const heightPercent = (hours / scaleMax) * 100;
                  // Ensure minimum height for visibility when there's data
                  const finalHeight = hours > 0 ? Math.max(heightPercent, 5) : 0;
                  
                  console.log(`Bar ${data.day}: ${hours}h (${data.minutes}min), height: ${finalHeight}%, scale: ${scaleMax}`);
                  
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar" 
                          style={{ height: `${finalHeight}%` }}
                        >
                          <div className="bar-tooltip">
                            <div className="tooltip-day">{data.day}</div>
                            <div className="tooltip-time">
                              {data.hours > 0 ? `${data.hours}h (${data.minutes}m)` : 'No study time'}
                            </div>
                            {data.sessionCount > 0 && (
                              <div className="tooltip-sessions">{data.sessionCount} session{data.sessionCount > 1 ? 's' : ''}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="bar-label">{data.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Heatmap */}
        {view === 'monthly' && (
          <div className="chart-container">
            <h3 className="chart-title">
              <Clock size={20} />
              Last 30 Days Activity
            </h3>
            <div className="heatmap-grid">
              {monthlyData.map((data, index) => (
                <div
                  key={index}
                  className={`heatmap-cell intensity-${data.intensity}`}
                >
                  <span className="cell-date">{data.dayNumber}</span>
                  <div className="heatmap-tooltip">
                    <div className="tooltip-date">{data.displayDate}</div>
                    <div className="tooltip-time">
                      {data.minutes > 0 ? `${data.minutes} min` : 'No study time'}
                    </div>
                    {data.sessionCount > 0 && (
                      <div className="tooltip-sessions">{data.sessionCount} session{data.sessionCount > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span className="legend-label">Less</span>
              <div className="intensity-cell intensity-0"></div>
              <div className="intensity-cell intensity-1"></div>
              <div className="intensity-cell intensity-2"></div>
              <div className="intensity-cell intensity-3"></div>
              <div className="intensity-cell intensity-4"></div>
              <span className="legend-label">More</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
