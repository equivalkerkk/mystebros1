import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { registerUser, loginUser } from '../utils/auth';
import { sendTelegramNotification, getUserIP } from '../utils/telegram';
import { CanvasBackground } from './CanvasBackground';

interface AuthModalProps {}

export const AuthModal: React.FC<AuthModalProps> = () => {
  const { t } = useLanguage();
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [copied, setCopied] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRegister = async () => {
    const username = generateRandomString(10);
    const password = generateRandomString(10);
    
    console.log('🔐 Creating new account...');
    console.log('Username:', username);
    console.log('Password:', password);
    
    // Save to backend (real database)
    const result = await registerUser(username, password);
    
    if (result.success) {
      console.log('✅ User registered successfully on backend');
      console.log('Response:', result);
      
      setCredentials({ username, password });
      setShowCredentials(true);
    } else {
      console.error('❌ Registration failed:', result.message);
      alert('Registration failed: ' + result.message);
    }
  };

  const handleCopyCredentials = () => {
    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCredentials = () => {
    const text = `RektNow Mass Report Panel - Login Credentials

Username: ${credentials.username}
Password: ${credentials.password}

Created: ${new Date().toLocaleString()}

⚠️ Keep these credentials safe! You will need them to access the panel.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rektnow-credentials-${credentials.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const result = await loginUser(loginUsername.trim(), loginPassword.trim());
    
    if (result.success && result.token) {
      // Send Telegram notification (always send, even if IP fetch fails)
      try {
        const ipAddress = await getUserIP().catch(() => undefined);
        await sendTelegramNotification({
          username: loginUsername,
          timestamp: new Date().toISOString(),
          action: 'login',
          ipAddress,
        });
      } catch (err) {
        console.error('Telegram notification failed:', err);
      }
      
      // Save to localStorage
      localStorage.setItem('rektnow_auth', JSON.stringify({
        token: result.token,
        username: loginUsername,
        loginTime: new Date().toISOString()
      }));
      
      // Reload page - state will be updated in App.tsx useEffect
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      setLoginError(result.message || 'Invalid username or password');
    }
  };

  if (showCredentials) {
    return (
      <div className="auth-modal-overlay">
        <CanvasBackground />
        <div className="auth-modal-container credentials-modal">
          <div className="auth-modal-header">
            <div className="auth-modal-icon success-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="auth-modal-title">{t.accountCreatedTitle}</h2>
            <p className="auth-modal-subtitle">{t.accountCreatedSubtitle}</p>
          </div>

          <div className="auth-modal-body">
            <div className="credentials-box">
              <div className="credential-item">
                <div className="credential-label">{t.credentialUsername}</div>
                <div className="credential-value">{credentials.username}</div>
              </div>
              <div className="credential-item">
                <div className="credential-label">{t.credentialPassword}</div>
                <div className="credential-value">{credentials.password}</div>
              </div>
            </div>

            <div className="credentials-warning">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <div>
                <strong>{t.credentialWarning}</strong> {t.credentialWarningText}
              </div>
            </div>

            <div className="credentials-actions">
              <button className="credential-btn copy-btn" onClick={handleCopyCredentials}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                {copied ? t.btnCopied : t.btnCopyCredentials}
              </button>

              {!isMobile && (
                <button className="credential-btn download-btn" onClick={handleDownloadCredentials}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                  </svg>
                  {t.btnDownloadTxt}
                </button>
              )}
            </div>

            <button className="auth-continue-btn" onClick={() => {
              // Close credentials and switch to login tab
              setShowCredentials(false);
              setIsLoginMode(true);
            }}>
              {t.btnSavedCredentials}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay">
      <CanvasBackground />
      <div className="auth-modal-container">
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h2 className="auth-modal-title">
            <img src="/crown.gif" alt="" style={{ width: '32px', height: '32px', marginRight: '8px', verticalAlign: 'middle' }} />
            <span className="rektnow-glow">RektNow</span>
          </h2>
          <p className="auth-modal-subtitle panel-subtitle">Mass Report Panel</p>
        </div>

        <div className="auth-modal-body">
          {/* Tab Buttons */}
          <div className="auth-tabs">
            <button
              onClick={() => setIsLoginMode(false)}
              className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
            >
              {t.tabCreateAccount}
            </button>
            <button
              onClick={() => setIsLoginMode(true)}
              className={`auth-tab ${isLoginMode ? 'active' : ''}`}
            >
              {t.tabLogin}
            </button>
          </div>

          {/* Login Form */}
          {isLoginMode ? (
            <form onSubmit={handleLogin}>
              {loginError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '16px'
                }}>
                  {loginError}
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#999',
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  {t.usernameLabel}
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0a0a0a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                  placeholder={t.usernamePlaceholder}
                  required
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#999',
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0a0a0a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                  placeholder={t.passwordPlaceholder}
                  required
                />
              </div>
              <button
                type="submit"
                className="auth-btn primary"
                style={{ width: '100%' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                {t.signInBtn}
              </button>
            </form>
          ) : (
            // Create Account Tab
            <div className="auth-buttons">
              {credentials.username ? (
                // Show existing credentials
                <div>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '8px' }}>
                      ✓ {t.accountAlreadyCreated}
                    </div>
                    <div style={{ color: '#999', fontSize: '0.8rem' }}>
                      {t.accountAlreadyCreatedText}
                    </div>
                  </div>
                  <div className="credentials-box">
                    <div className="credential-item">
                      <div className="credential-label">{t.credentialUsername}</div>
                      <div className="credential-value">{credentials.username}</div>
                    </div>
                    <div className="credential-item">
                      <div className="credential-label">{t.credentialPassword}</div>
                      <div className="credential-value">{credentials.password}</div>
                    </div>
                  </div>
                  <div className="credentials-actions">
                    <button className="credential-btn copy-btn" onClick={handleCopyCredentials}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      {copied ? t.btnCopied : t.btnCopy}
                    </button>
                    {!isMobile && (
                      <button className="credential-btn download-btn" onClick={handleDownloadCredentials}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                        </svg>
                        {t.btnDownload}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Create new account button
                <button className="auth-btn primary" onClick={handleRegister}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {t.btnCreateAccount}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
