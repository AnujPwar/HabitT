import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Insights from './pages/Insights';
import AddHabit from './pages/AddHabit';
import TrophyRoom from './pages/TrophyRoom';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function App() {
  const [userName, setUserName] = useState(localStorage.getItem('habitUser'));
  const [userStats, setUserStats] = useState(null);

  const handleLogin = (name) => {
    localStorage.setItem('habitUser', name);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('habitUser');
    setUserName(null);
    setUserStats(null);
  };

  const fetchUserStats = async () => {
    if(userName) {
      try {
        const res = await axios.get(`${API_BASE}/user/${userName}`);
        setUserStats(res.data);
      } catch(err) {
        console.error("Failed fetching user stats", err);
      }
    }
  };

  useEffect(() => {
    if(userName) {
      axios.post(`${API_BASE}/user/sync`, { user_name: userName })
        .then(res => setUserStats(res.data.user))
        .catch(err => {
          console.error("Sync Error:", err.message);
          if (err.response) console.error("Sync Response Error:", err.response.data);
        });
    }
  }, [userName]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      {!userName ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="webapp-layout">
          <Sidebar onLogout={handleLogout} userName={userName} userStats={userStats} />
          <div className="main-column">
            <Routes>
              <Route path="/" element={<Home userName={userName} refreshStats={fetchUserStats} />} />
              <Route path="/insights" element={<Insights userName={userName} />} />
              <Route path="/add" element={<AddHabit userName={userName} />} />
              <Route path="/trophies" element={<TrophyRoom userName={userName} userStats={userStats} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <BottomNav />
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
