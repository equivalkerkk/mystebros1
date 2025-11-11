import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types/translations';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLoginClick: () => void;
  onLogout?: () => void;
  onLiveBansClick?: () => void;
  onMyReportsClick?: () => void;
}

const languages = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
];

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLoginClick, onLogout, onLiveBansClick, onMyReportsClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLiveBansOpen, setIsLiveBansOpen] = useState(false);
  const [username, setUsername] = useState('User');
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const liveBansRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Load username from localStorage on mount and when authenticated changes
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const auth = localStorage.getItem('rektnow_auth');
        if (auth) {
          const { username: storedUsername } = JSON.parse(auth);
          if (storedUsername) {
            setUsername(storedUsername);
          }
        }
      } catch (e) {
        console.error('Error getting username:', e);
      }
    }
  }, [isAuthenticated]);

  // Get username from localStorage
  const getUsername = () => {
    return username;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (liveBansRef.current && !liveBansRef.current.contains(event.target as Node)) {
        setIsLiveBansOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (code: string) => {
    setLanguage(code as Language);
    setIsLangOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo-section">
        <span className="logo-icon">🎯</span>
        <div className="logo-text">
          <span className="rektnow-glow">RektNow</span>
        </div>
      </div>
      <div className="nav-actions">
        {isAuthenticated && (onLiveBansClick || onMyReportsClick) && (
          <div className="live-bans-dropdown" ref={liveBansRef} style={{ position: 'relative' }}>
            <button 
              className="live-bans-btn"
              onClick={() => setIsLiveBansOpen(!isLiveBansOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                height: '40px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                animation: 'pulse 2s infinite'
              }} />
              <span>Live Bans</span>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 14 14"
                style={{ 
                  transition: 'transform 0.3s ease',
                  transform: isLiveBansOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <path fill="currentColor" d="M7 10L2 5h10z"/>
              </svg>
            </button>
            
            {isLiveBansOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                minWidth: '200px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    onLiveBansClick?.();
                    setIsLiveBansOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ color: '#10b981', fontWeight: 500 }}>Live Feed</span>
                </button>
                <div style={{
                  height: '1px',
                  background: '#2a2a2a',
                  margin: '0'
                }} />
                <button
                  onClick={() => {
                    onMyReportsClick?.();
                    setIsLiveBansOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="#667eea" style={{ width: '16px', height: '16px' }}>
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  <span style={{ color: '#667eea', fontWeight: 500 }}>My Reports</span>
                </button>
              </div>
            )}
          </div>
        )}
        <a 
          href="https://t.me/your_telegram" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-widget telegram-widget"
        >
          <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="social-text">Telegram</span>
        </a>
        <a 
          href="https://discord.gg/your_discord" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-widget discord-widget"
        >
          <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
          </svg>
          <span className="social-text">Discord</span>
        </a>
        <div className="language-selector" ref={langRef}>
          <button 
            className="language-select" 
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <span className="lang-flag">{currentLang.flag}</span>
            <svg 
              className="lang-arrow" 
              width="14" 
              height="14" 
              viewBox="0 0 14 14"
              style={{ transform: isLangOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path fill="currentColor" d="M7 10L2 5h10z"/>
            </svg>
          </button>
          {isLangOpen && (
            <div className="language-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${language === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                  {language === lang.code && (
                    <svg className="lang-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13 4L6 11L3 8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {isAuthenticated ? (
          <div className="user-profile" ref={profileRef}>
            <button 
              className="profile-btn" 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <svg className="profile-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <span className="profile-username">{getUsername()}</span>
              <svg 
                className="profile-arrow" 
                width="14" 
                height="14" 
                viewBox="0 0 14 14"
                style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path fill="currentColor" d="M7 10L2 5h10z"/>
              </svg>
            </button>
            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-info-label">Logged in as</div>
                  <div className="profile-info-username">{getUsername()}</div>
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #2a2a2a',
                  borderBottom: '1px solid #2a2a2a',
                  margin: '8px 0',
                  background: '#0a0a0a'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginBottom: '4px'
                  }}>
                    Account Status
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#ef4444',
                    fontWeight: 500
                  }}>
                    ⚠️ Not Activated
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    Purchase a plan to activate
                  </div>
                </div>
                <button className="profile-logout" onClick={() => {
                  setIsProfileOpen(false);
                  onLogout?.();
                }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            {t.loginBtn}
          </button>
        )}
      </div>
    </nav>
  );
};
