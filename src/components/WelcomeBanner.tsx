import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeBannerProps {
  displayName: string;
  username: string;
  onUpdateName: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ displayName, username, onUpdateName }) => {
  const { t } = useLanguage();
  const hasChangedName = displayName !== username;
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  useEffect(() => {
    // Check if user has visited before
    const visitedKey = `rektnow_visited_${username}`;
    const hasVisited = localStorage.getItem(visitedKey);
    
    if (hasVisited) {
      setIsFirstVisit(false);
    } else {
      // Mark as visited
      localStorage.setItem(visitedKey, 'true');
      setIsFirstVisit(true);
    }
  }, [username]);
  
  return (
    <div className="welcome-banner" style={{
      position: 'fixed',
      top: '60px', // Below navbar
      left: 0,
      right: 0,
      background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
      borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      padding: '12px 24px',
      zIndex: 999,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        color: '#e0e0e0'
      }}>
        <span>🤖</span>
        <span>{t.welcomeHey} <strong style={{ color: '#a855f7' }}>{displayName}</strong>, {isFirstVisit ? t.welcomeFirst : t.welcomeBack}</span>
        {!hasChangedName && (
          <>
            <span>{t.welcomeChangeName}</span>
            <button
              onClick={onUpdateName}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {t.welcomeClickHere}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
