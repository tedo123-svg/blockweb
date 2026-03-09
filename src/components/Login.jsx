import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <LanguageToggle />
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <LogIn size={48} color="#1e40af" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#334155', marginBottom: '8px' }}>{t('woreda_reporting_system')}</h2>
          <p style={{ color: '#64748b' }}>{t('sign_in_to_continue')}</p>
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

          {error && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
