import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Database, Download, Upload, Trash2, LogOut, Edit, Save, X } from 'lucide-react';
import NavBar from '../Components/NavBar';
import { userAPI } from '../api/user';
import '../Styles/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        password: '',
        confirmPassword: ''
      });
    }

    // Load preferences
    const notifPref = localStorage.getItem('notifications');
    const autoSavePref = localStorage.getItem('autoSave');
    
    if (notifPref !== null) setNotifications(JSON.parse(notifPref));
    if (autoSavePref !== null) setAutoSave(JSON.parse(autoSavePref));
  }, []);

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
    setEditError('');
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!editForm.name || !editForm.email) {
      setEditError('Name and email are required');
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setEditError('Passwords do not match');
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      setEditError('Password must be at least 6 characters');
      return;
    }

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
      };

      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const response = await userAPI.update(user.id, updateData);
      
      if (response.success) {
        setUser(response.data);
        setIsEditingProfile(false);
        setEditForm({
          ...editForm,
          password: '',
          confirmPassword: ''
        });
        alert('Profile updated successfully!');
      } else {
        setEditError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setEditError('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: ''
    });
    setEditError('');
  };

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', JSON.stringify(newValue));
  };

  const handleAutoSaveToggle = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    localStorage.setItem('autoSave', JSON.stringify(newValue));
  };

  const handleExportData = () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const todayStudyTime = JSON.parse(localStorage.getItem('todayStudyTime') || '{}');
    
    const exportData = {
      user,
      sessions,
      todayStudyTime,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `zensync-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target.result);
          
          if (importData.sessions) {
            localStorage.setItem('sessions', JSON.stringify(importData.sessions));
          }
          if (importData.todayStudyTime) {
            localStorage.setItem('todayStudyTime', JSON.stringify(importData.todayStudyTime));
          }
          
          alert('Data imported successfully!');
          window.location.reload();
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      localStorage.removeItem('sessions');
      localStorage.removeItem('todayStudyTime');
      localStorage.removeItem('activeSession');
      alert('All study data has been deleted.');
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="settings-page-wrapper">
      <NavBar />
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your account and app preferences</p>
        </div>

        {/* Profile Section */}
        <div className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h2>Profile</h2>
            {!isEditingProfile && (
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>
          <p className="section-description">Your account information</p>
          
          {!isEditingProfile ? (
            <>
              <div className="profile-info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <p className="info-value">{user?.name || 'Guest User'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p className="info-value">{user?.email || 'guest@example.com'}</p>
                </div>
              </div>

              <div className="info-item full-width">
                <label>Member since</label>
                <p className="info-value">{user?.created_at ? formatDate(user.created_at) : 'Unknown'}</p>
              </div>
            </>
          ) : (
            <div className="edit-profile-form">
              {editError && (
                <div className="error-message">{editError}</div>
              )}
              
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>New Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editForm.confirmPassword}
                  onChange={handleEditChange}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="edit-actions">
                <button className="action-btn primary" onClick={handleSaveProfile}>
                  <Save size={16} />
                  Save Changes
                </button>
                <button className="action-btn secondary" onClick={handleCancelEdit}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h2>Preferences</h2>
          </div>
          <p className="section-description">Customize your experience</p>
          
          <div className="preference-item">
            <div className="preference-info">
              <h3>Notifications</h3>
              <p>Receive study reminders</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications}
                onChange={handleNotificationToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <h3>Auto-save</h3>
              <p>Automatically save session data</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={autoSave}
                onChange={handleAutoSaveToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="settings-section">
          <div className="section-header">
            <Database size={20} />
            <h2>Data Management</h2>
          </div>
          <p className="section-description">Import, export, or delete your data</p>
          
          <div className="data-actions">
            <button className="action-btn secondary" onClick={handleExportData}>
              <Download size={18} />
              Export Data
            </button>
            <button className="action-btn secondary" onClick={handleImportData}>
              <Upload size={18} />
              Import Data
            </button>
          </div>

          <button className="action-btn danger" onClick={handleDeleteAllData}>
            <Trash2 size={18} />
            Delete All Data
          </button>
        </div>

        {/* Sign Out Section */}
        <div className="settings-section">
          <button className="action-btn signout" onClick={handleSignOut}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
