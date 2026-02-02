const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// IPC without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  
  // Auth API - Device-based authentication (auto-login)
  auth: {
    // NEW: Device-based auth
    getDeviceUser: () => ipcRenderer.invoke('auth:getDeviceUser'),
    
    // COMMENTED OUT - Traditional login/signup (kept for reference)
    // register: (userData) => ipcRenderer.invoke('auth:register', userData),
    // login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    // logout: () => ipcRenderer.invoke('auth:logout'),
    // getCurrentUser: (token) => ipcRenderer.invoke('auth:getCurrentUser', token),
  },

  // Sessions API - for study session tracking
  sessions: {
    create: (sessionData) => ipcRenderer.invoke('sessions:create', sessionData),
    getAll: (userId) => ipcRenderer.invoke('sessions:getAll', userId),
    delete: (data) => ipcRenderer.invoke('sessions:delete', data),
    getAnalytics: (userId) => ipcRenderer.invoke('sessions:getAnalytics', userId),
    getTodayTime: (userId) => ipcRenderer.invoke('sessions:getTodayTime', userId),
  },

  // User API - for profile management
  user: {
    update: (data) => ipcRenderer.invoke('user:update', data),
  },
});
