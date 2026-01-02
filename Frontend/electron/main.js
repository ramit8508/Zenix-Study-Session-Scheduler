const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');

let mainWindow;
let backendProcess;

const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function getBackendPath() {
  if (isDev) {
    // In development, backend is in the parent directory
    return path.resolve(__dirname, '../../Backend');
  } else {
    // In production, backend is in resources
    return path.join(process.resourcesPath, 'Backend');
  }
}

function ensureBackendDependencies(backendPath) {
  const nodeModulesPath = path.join(backendPath, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('Installing backend dependencies...');
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const npmCmd = isWindows ? 'npm.cmd' : 'npm';
      
      const npmInstall = spawn(npmCmd, ['install'], {
        cwd: backendPath,
        stdio: 'inherit',
        shell: true
      });

      npmInstall.on('close', (code) => {
        if (code === 0) {
          console.log('Backend dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });

      npmInstall.on('error', (err) => {
        reject(err);
      });
    });
  }
  return Promise.resolve();
}

async function startBackend() {
  const backendPath = getBackendPath();
  
  console.log('Starting backend server from:', backendPath);
  
  try {
    // Ensure dependencies are installed
    await ensureBackendDependencies(backendPath);
    
    // Start the backend server
    const isWindows = process.platform === 'win32';
    const nodeCmd = isWindows ? 'node.exe' : 'node';
    
    backendProcess = spawn(nodeCmd, ['index.js'], {
      cwd: backendPath,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data.toString()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data.toString()}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

    // Wait for backend to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('Error starting backend:', error);
  }
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
    show: false // Don't show until ready
  });

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
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
  // Start backend first
  await startBackend();
  
  // Create window after backend is ready
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill backend process when app quits
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
});

app.on('quit', () => {
  // Ensure backend is killed
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGKILL');
  }
});
