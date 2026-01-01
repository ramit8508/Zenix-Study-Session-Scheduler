import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Timer, TrendingUp, Settings, Clock } from 'lucide-react';
import '../Styles/NavBar.css';

function NavBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Get first letter of name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar-container">
      <nav className="navbar">
        {/* Top Logo Section */}
        <div className="logo-container">
          <div className="logo-icon-wrapper">
            <Clock className="logo-image" size={24} />
          </div>
          <h1 className="app-name">ZenSync</h1>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-links">
          <li 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutGrid size={20} />
            <span>Dashboard</span>
          </li>
          <li 
            className={`nav-item ${isActive('/sessions') ? 'active' : ''}`}
            onClick={() => navigate('/sessions')}
          >
            <Timer size={20} />
            <span>Sessions</span>
          </li>
          <li 
            className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
            onClick={() => navigate('/analytics')}
          >
            <TrendingUp size={20} />
            <span>Analytics</span>
          </li>
          <li 
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </li>
        </ul>

        {/* Bottom User Section */}
        <div className="user-profile">
          <div className="avatar">{user ? getInitial(user.name) : 'U'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Guest User'}</p>
            <p className="user-email">{user?.email || 'guest@example.com'}</p>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;