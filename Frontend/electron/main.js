const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let backendServer = null;
let backendPath = '';

const isDev = process.env.NODE_ENV === 'development';

// Import backend using dynamic import (ESM)
let connectDB, startServer, closeDB, User, Session;

async function initializeBackend() {
  try {
    backendPath = isDev 
      ? path.resolve(__dirname, '../../Backend')
      : path.join(process.resourcesPath, 'Backend');

    console.log('🔄 Initializing backend from:', backendPath);

    // Dynamically import backend modules
    const dbModule = await import(`file://${backendPath}/Db/sqlite.js`);
    const serverModule = await import(`file://${backendPath}/index.js`);
    const userModule = await import(`file://${backendPath}/Models/user.model.sqlite.js`);
    const sessionModule = await import(`file://${backendPath}/Models/session.model.sqlite.js`);

    connectDB = dbModule.connectDB;
    closeDB = dbModule.closeDB;
    startServer = serverModule.startServer;
    User = userModule.User;
    Session = sessionModule.Session;

    // Initialize database
    await connectDB();
    console.log('✅ Backend database initialized');

    // Start Express server
    backendServer = await startServer();
    console.log('✅ Backend server started');

  } catch (error) {
    console.error('❌ Failed to initialize backend:', error);
    throw error;
  }
}

// IPC Handlers for direct backend communication
function setupIPCHandlers() {
  // Auth handlers
  ipcMain.handle('auth:register', async (event, userData) => {
    try {
      const { name, email, password } = userData;

      // Validation
      if (!name || !email || !password) {
        return { success: false, message: 'All fields are required' };
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { success: false, message: 'User with email already exists' };
      }

      // Create user
      const user = await User.create({ name, email, password });
      const token = user.generateAccessToken();
      const userWithoutPassword = await User.findByIdWithoutPassword(user.id);

      return {
        success: true,
        data: { user: userWithoutPassword, accessToken: token },
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('auth:login', async (event, credentials) => {
    try {
      const { email, password } = credentials;

      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User does not exist' };
      }

      const isValid = await user.isPasswordCorrect(password);
      if (!isValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      const token = user.generateAccessToken();
      const userWithoutPassword = await User.findByIdWithoutPassword(user.id);

      return {
        success: true,
        data: { user: userWithoutPassword, accessToken: token },
        message: 'User logged in successfully'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    return { success: true, message: 'User logged out successfully' };
  });

  ipcMain.handle('auth:getCurrentUser', async (event, token) => {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
      const user = await User.findByIdWithoutPassword(decoded.id);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return { success: true, data: user, message: 'User fetched successfully' };
    } catch (error) {
      return { success: false, message: 'Invalid token' };
    }
  });

  // Session handlers
  ipcMain.handle('sessions:create', async (event, sessionData) => {
    try {
      const session = await Session.create(sessionData);
      return { success: true, data: session, message: 'Session created successfully' };
    } catch (error) {
      console.error('Create session error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('sessions:getAll', async (event, userId) => {
    try {
      const sessions = await Session.findByUserId(userId);
      return { success: true, data: sessions, message: 'Sessions fetched successfully' };
    } catch (error) {
      console.error('Get sessions error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('sessions:delete', async (event, { sessionId, userId }) => {
    try {
      await Session.deleteById(sessionId, userId);
      return { success: true, message: 'Session deleted successfully' };
    } catch (error) {
      console.error('Delete session error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('sessions:getAnalytics', async (event, userId) => {
    try {
      const analytics = await Session.getAnalytics(userId);
      return { success: true, data: analytics, message: 'Analytics fetched successfully' };
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('sessions:getTodayTime', async (event, userId) => {
    try {
      const totalTime = await Session.getTodayStudyTime(userId);
      return { success: true, data: totalTime, message: 'Today study time fetched' };
    } catch (error) {
      console.error('Get today time error:', error);
      return { success: false, message: error.message };
    }
  });

  // User profile handlers
  ipcMain.handle('user:update', async (event, { userId, updateData }) => {
    try {
      const bcrypt = require('bcryptjs');
      const { getDB } = await import(`file://${backendPath}/Db/sqlite.js`);
      const db = getDB();

      if (updateData.name) {
        await db.run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
          [updateData.name, userId]);
      }

      if (updateData.email) {
        await db.run('UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
          [updateData.email, userId]);
      }

      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        await db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
          [hashedPassword, userId]);
      }

      const user = await User.findByIdWithoutPassword(userId);
      return { success: true, data: user, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: error.message };
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Zenix Study Tracker',
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    const startURL = 'http://localhost:5173';
    console.log('Loading dev server from:', startURL);
    
    mainWindow.loadURL(startURL).catch(err => {
      console.error('Failed to load URL:', err);
      setTimeout(() => {
        mainWindow.loadURL(startURL);
      }, 1000);
    });
    
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Initialize backend first
    await initializeBackend();
    
    // Setup IPC handlers
    setupIPCHandlers();
    
    // Create window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Close database connection
  if (closeDB) {
    await closeDB();
  }
  
  // Close backend server
  if (backendServer) {
    backendServer.close();
  }
});
