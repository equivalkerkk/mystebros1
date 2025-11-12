import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeBannerProps {
  displayName: string;
  username: string;
  isHidden?: boolean;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ displayName, username, isHidden = false }) => {
  const { t } = useLanguage();
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
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        color: '#e0e0e0',
        lineHeight: '1',
        textAlign: 'center',
        flexWrap: 'nowrap',
        overflow: 'hidden'
      }}>
        <span style={{ flexShrink: 0 }}>🤖</span>
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '3px',
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1'
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1' }}>
            {t.welcomeHey} <strong style={{ color: '#a855f7' }}>{displayName}</strong>, {isFirstVisit ? t.welcomeFirst : t.welcomeBack}
          </span>
        </span>
      </div>
    </div>
  );
};
