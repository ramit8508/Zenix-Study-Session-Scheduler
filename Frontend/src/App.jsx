import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import DashBoard from './Pages/DashBoard';
import ActiveSession from './Pages/ActiveSession';
import Sessions from './Pages/Sessions';
import Analytics from './Pages/Analytics';
import Settings from './Pages/Settings';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/active-session" element={<ActiveSession />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App
