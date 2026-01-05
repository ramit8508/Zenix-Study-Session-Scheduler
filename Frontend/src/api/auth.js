// Check if running in Electron
const isElectron = window.electron !== undefined;

// Fallback to HTTP API for web version (if needed)
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Storage for access token
let accessToken = localStorage.getItem('accessToken') || null;

export const authAPI = {
  register: async (userData) => {
    try {
      if (isElectron) {
        // Use IPC for Electron
        const response = await window.electron.auth.register(userData);
        if (response.success) {
          accessToken = response.data.accessToken;
          localStorage.setItem('accessToken', accessToken);
        }
        return response;
      } else {
        // Fallback to HTTP
        const response = await api.post("/auth/register", userData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      if (isElectron) {
        // Use IPC for Electron
        const response = await window.electron.auth.login(credentials);
        if (response.success) {
          accessToken = response.data.accessToken;
          localStorage.setItem('accessToken', accessToken);
        }
        return response;
      } else {
        // Fallback to HTTP
        const response = await api.post("/auth/login", credentials);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      if (isElectron) {
        // Use IPC for Electron
        const response = await window.electron.auth.logout();
        accessToken = null;
        localStorage.removeItem('accessToken');
        return response;
      } else {
        // Fallback to HTTP
        const response = await api.post("/auth/logout");
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      if (isElectron) {
        // Use IPC for Electron
        if (!accessToken) {
          accessToken = localStorage.getItem('accessToken');
        }
        const response = await window.electron.auth.getCurrentUser(accessToken);
        return response;
      } else {
        // Fallback to HTTP
        const response = await api.get("/auth/current-user");
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default api;
