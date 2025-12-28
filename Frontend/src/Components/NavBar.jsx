import React from 'react';
import { LayoutGrid, Timer, TrendingUp, Settings, Clock } from 'lucide-react';
import '../Styles/NavBar.css';

function NavBar() {
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
          <li className="nav-item active">
            <LayoutGrid size={20} />
            <span>Dashboard</span>
          </li>
          <li className="nav-item">
            <Timer size={20} />
            <span>Sessions</span>
          </li>
          <li className="nav-item">
            <TrendingUp size={20} />
            <span>Analytics</span>
          </li>
          <li className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </li>
        </ul>

        {/* Bottom User Section */}
        <div className="user-profile">
          <div className="avatar">R</div>
          <div className="user-info">
            <p className="user-name">Ramit Goyal</p>
            <p className="user-email">24BAI70506@cuchd.in</p>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;