import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { API_URL } from '../config/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error(t('invalid_credentials'));

      const data = await response.json();
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-card-top">
          <LanguageToggle />
        </div>

        <div className="login-header">
          <div className="login-icon">
            <LogIn size={44} color="var(--primary)" />
          </div>
          <h2>{t('woreda_reporting_system')}</h2>
          <p>{t('sign_in_to_continue')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('username')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full">
            {t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
