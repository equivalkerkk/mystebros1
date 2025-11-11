import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sendTelegramNotification, getUserIP } from '../utils/telegram';
import { loginUser } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    
    // Login via backend API
    const result = await loginUser(cleanUsername, cleanPassword);
    
    if (result.success) {
      if (!result.token) {
        alert('Login error: No token received from server');
        return false;
      }
      
      // Send Telegram notification (always send, even if IP fetch fails)
      try {
        const ipAddress = await getUserIP().catch(() => undefined);
        await sendTelegramNotification({
          username: cleanUsername,
          timestamp: new Date().toISOString(),
          action: 'login',
          ipAddress,
        });
      } catch (err) {
        console.error('Telegram notification failed:', err);
      }
      
      // Successful login - save token to localStorage
      const authData = { 
        token: result.token,
        username: cleanUsername,
        loginTime: new Date().toISOString() 
      };
      
      localStorage.setItem('rektnow_auth', JSON.stringify(authData));
      
      // Verify it was saved
      const saved = localStorage.getItem('rektnow_auth');
      
      if (saved) {
        // DON'T reload - just close modal
        // Parent component will handle state update
        onClose();
      } else {
        alert('Storage failed. Please check browser settings.');
      }
    } else {
      // Invalid credentials
      setErrorMessage(result.message || 'Invalid username or password');
      setShowError(true);
    }
    
    return false;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        zIndex: 999999,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: '1.5rem',
            cursor: 'pointer',
            width: '30px',
            height: '30px'
          }}
        >
          ×
        </button>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
          {t.modalTitle}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '24px' }}>
          {t.modalSubtitle}
        </div>
        {showError && (
          <div
            style={{
              display: 'block',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '16px'
            }}
          >
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#999',
                marginBottom: '8px',
                fontWeight: 500
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '0.95rem'
              }}
              placeholder="Enter your username"
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#999',
                marginBottom: '8px',
                fontWeight: 500
              }}
            >
              {t.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '0.95rem'
              }}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '14px 32px',
              fontSize: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              width: '100%'
            }}
          >
            {t.signInBtn}
          </button>
        </form>
      </div>
    </div>
  );
};
