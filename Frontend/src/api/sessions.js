// Check if running in Electron
const isElectron = window.electron !== undefined;

export const sessionsAPI = {
  create: async (sessionData) => {
    try {
      if (isElectron) {
        const response = await window.electron.sessions.create(sessionData);
        return response;
      } else {
        // Fallback to localStorage for web version
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const newSession = {
          ...sessionData,
          id: Date.now(),
          created_at: new Date().toISOString(),
        };
        sessions.push(newSession);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        return { success: true, data: newSession };
      }
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  },

  getAll: async (userId) => {
    try {
      if (isElectron) {
        const response = await window.electron.sessions.getAll(userId);
        return response;
      } else {
        // Fallback to localStorage
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        return { success: true, data: sessions };
      }
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  },

  delete: async (sessionId, userId) => {
    try {
      if (isElectron) {
        const response = await window.electron.sessions.delete({ sessionId, userId });
        return response;
      } else {
        // Fallback to localStorage
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const filtered = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('sessions', JSON.stringify(filtered));
        return { success: true };
      }
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  },

  getAnalytics: async (userId) => {
    try {
      if (isElectron) {
        const response = await window.electron.sessions.getAnalytics(userId);
        return response;
      } else {
        // Fallback - calculate from localStorage
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgSession = sessions.length > 0 ? totalTime / sessions.length : 0;
        
        return {
          success: true,
          data: {
            totalSessions: sessions.length,
            totalTime,
            avgSession,
            weeklyData: [],
            monthlyData: [],
            subjectBreakdown: []
          }
        };
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  },

  getTodayTime: async (userId) => {
    try {
      if (isElectron) {
        const response = await window.electron.sessions.getTodayTime(userId);
        return response;
      } else {
        // Fallback
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = sessions.filter(s => s.date === today);
        const totalTime = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return { success: true, data: totalTime };
      }
    } catch (error) {
      console.error('Get today time error:', error);
      throw error;
    }
  },
};
