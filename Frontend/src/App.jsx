import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import './App.css';

// Lazy load components for better performance
// COMMENTED OUT - Login/Signup disabled for device-based auth
// const Login = lazy(() => import('./Pages/Login'));
// const Signup = lazy(() => import('./Pages/Signup'));
const DashBoard = lazy(() => import('./Pages/DashBoard'));
const ActiveSession = lazy(() => import('./Pages/ActiveSession'));
const Sessions = lazy(() => import('./Pages/Sessions'));
const Analytics = lazy(() => import('./Pages/Analytics'));
const Settings = lazy(() => import('./Pages/Settings'));

// Animated loading component with app startup animation
const LoadingFallback = () => (
  <div className="app-loading-container">
    <div className="app-loading-animation">
      <div className="loader-circle"></div>
      <h2 className="app-loading-text">Zenix Study Tracker</h2>
      <p className="app-loading-subtext">Preparing your workspace...</p>
    </div>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [deviceUser, setDeviceUser] = useState(null);

  useEffect(() => {
    // Auto-login with device-based authentication
    const initializeDeviceAuth = async () => {
      try {
        // Get or create device user
        const userStr = localStorage.getItem('deviceUser');
        let user;
        
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          // Create a default device user
          const defaultUser = {
            id: 'device-user-' + Date.now(),
            name: 'Local User',
            email: 'user@local.device',
            deviceId: navigator.userAgent || 'unknown-device',
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('deviceUser', JSON.stringify(defaultUser));
          localStorage.setItem('user', JSON.stringify(defaultUser));
          localStorage.setItem('accessToken', 'device-token-' + Date.now());
          user = defaultUser;
        } else {
          // Parse existing user
          user = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setDeviceUser(user);
        
        // Simulate loading animation (minimum 1.5 seconds for smooth UX)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsInitializing(false);
      } catch (error) {
        console.error('Device auth initialization failed:', error);
        // Create fallback user even on error
        const fallbackUser = {
          id: 'device-user-' + Date.now(),
          name: 'Local User',
          email: 'user@local.device',
          deviceId: 'fallback-device',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('deviceUser', JSON.stringify(fallbackUser));
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setDeviceUser(fallbackUser);
        setIsInitializing(false);
      }
    };

    initializeDeviceAuth();
  }, []);

  if (isInitializing) {
    return <LoadingFallback />;
  }

  return (
    <div className="App">
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* COMMENTED OUT - Login/Signup routes disabled */}
            {/* <Route path="/" element={<Login />} /> */}
            {/* <Route path="/signup" element={<Signup />} /> */}
            
            {/* Redirect root to dashboard with device-based auth */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/active-session" element={<ActiveSession />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App
