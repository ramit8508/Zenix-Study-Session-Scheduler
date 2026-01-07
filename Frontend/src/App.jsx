import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';

// Lazy load components for better performance
const Login = lazy(() => import('./Pages/Login'));
const Signup = lazy(() => import('./Pages/Signup'));
const DashBoard = lazy(() => import('./Pages/DashBoard'));
const ActiveSession = lazy(() => import('./Pages/ActiveSession'));
const Sessions = lazy(() => import('./Pages/Sessions'));
const Analytics = lazy(() => import('./Pages/Analytics'));
const Settings = lazy(() => import('./Pages/Settings'));

// Simple loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
