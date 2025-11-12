import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeBannerProps {
  displayName: string;
  username: string;
  onUpdateName: () => void;
  isHidden?: boolean;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ displayName, username, onUpdateName, isHidden = false }) => {
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
    <div className={`welcome-banner ${isHidden ? 'hidden' : ''}`}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        color: '#e0e0e0',
        lineHeight: '1.3',
        textAlign: 'center'
      }}>
        <span>🤖</span>
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          <span>{t.welcomeHey} <strong style={{ color: '#a855f7' }}>{displayName}</strong>, {isFirstVisit ? t.welcomeFirst : t.welcomeBack}</span>
          {!hasChangedName && (
            <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px' }}>
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
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  touchAction: 'manipulation'
                }}
              >
                {t.welcomeClickHere}
              </button>
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
