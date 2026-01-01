import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play } from 'lucide-react';
import '../Styles/StartSessionModal.css';

function StartSessionModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    sessionType: 'Study',
    duration: '',
  });

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Other'
  ];

  const sessionTypes = ['Study', 'Review', 'Practice', 'Project'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/active-session', { state: formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">Start Study Session</h2>
        <p className="modal-subtitle">
          Configure your study session and start tracking your progress.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="sessionType">Session Type</label>
            <select
              id="sessionType"
              name="sessionType"
              value={formData.sessionType}
              onChange={handleChange}
              required
            >
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="duration">Goal Duration (optional)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              placeholder="Minutes (e.g., 60)"
              value={formData.duration}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-start">
              <Play size={18} />
              Start Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartSessionModal;
