import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './components/Login';
import WoredaDashboard from './components/WoredaDashboard';
import SubCityDashboard from './components/SubCityDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={
            user ? (
              user.role === 'woreda' ? 
                <WoredaDashboard user={user} token={token} onLogout={handleLogout} /> : 
                <SubCityDashboard user={user} token={token} onLogout={handleLogout} />
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
