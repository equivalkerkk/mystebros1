import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaYoutube,
  FaTwitter,
  FaTelegram,
  FaWhatsapp,
  FaSnapchat,
  FaDiscord
} from 'react-icons/fa';

interface BanNotification {
  id: number;
  platform: string;
  icon: React.ReactNode;
  targetType: string;
  username: string;
  banDuration: string;
  followers: number | null;
  timeAgo: string;
  timestamp: number;
}

const platforms = [
  {
    name: 'Instagram',
    icon: <FaInstagram />,
    color: '#E4405F',
    targetTypes: ['Profile', 'Business Account', 'Post', 'Story', 'Reels', 'Live Stream', 'Comment', 'IGTV']
  },
  {
    name: 'TikTok',
    icon: <FaTiktok />,
    color: '#FF0050',
    targetTypes: ['Profile', 'Video', 'Live Stream', 'Comment']
  },
  {
    name: 'Facebook',
    icon: <FaFacebook />,
    color: '#1877F2',
    targetTypes: ['Profile', 'Page', 'Group', 'Post']
  },
  {
    name: 'YouTube',
    icon: <FaYoutube />,
    color: '#FF0000',
    targetTypes: ['Channel', 'Video', 'Live Stream', 'Comment']
  },
  {
    name: 'Twitter (X)',
    icon: <FaTwitter />,
    color: '#1DA1F2',
    targetTypes: ['Account', 'Tweet', 'Reply', 'Space']
  },
  {
    name: 'Telegram',
    icon: <FaTelegram />,
    color: '#0088CC',
    targetTypes: ['Group', 'Channel', 'User Account', 'Message']
  },
  {
    name: 'WhatsApp',
    icon: <FaWhatsapp />,
    color: '#25D366',
    targetTypes: ['Phone Number', 'Group Link', 'Business Account']
  },
  {
    name: 'Snapchat',
    icon: <FaSnapchat />,
    color: '#FFFC00',
    targetTypes: ['Account', 'Story', 'Spotlight Video']
  },
  {
    name: 'Discord',
    icon: <FaDiscord />,
    color: '#5865F2',
    targetTypes: ['Server', 'User', 'Message']
  }
];

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const generateBanDuration = () => {
  const random = Math.random();
  
  if (random < 0.3) {
    const seconds = Math.floor(Math.random() * (120 - 5 + 1)) + 5;
    if (seconds < 60) {
      return seconds === 1 ? '1 second' : `${seconds} seconds`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return minutes === 1 ? '1 minute' : `${minutes} minutes`;
      } else {
        return `${minutes}m ${remainingSeconds}s`;
      }
    }
  } else if (random < 0.6) {
    const minutes = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else if (random < 0.85) {
    const minutes = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    return `${minutes} minutes`;
  } else {
    const totalMinutes = Math.floor(Math.random() * (120 - 30 + 1)) + 30;
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (minutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
        const minuteText = minutes === 1 ? '1 minute' : `${minutes} minutes`;
        return `${hourText} ${minuteText}`;
      }
    }
  }
};

const generateTimeAgo = () => {
  const random = Math.random();
  
  if (random < 0.6) {
    const minutes = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (random < 0.9) {
    const minutes = Math.floor(Math.random() * (90 - 20 + 1)) + 20;
    
    if (minutes < 60) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      } else {
        const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
        const minuteText = remainingMinutes === 1 ? '1 minute' : `${remainingMinutes} minutes`;
        return `${hourText} ${minuteText} ago`;
      }
    }
  } else {
    const totalMinutes = Math.floor(Math.random() * (180 - 90 + 1)) + 90;
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else {
      const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
      const minuteText = remainingMinutes === 1 ? '1 minute' : `${remainingMinutes} minutes`;
      return `${hourText} ${minuteText} ago`;
    }
  }
};

const getAccountBasedTargets = (platform: string) => {
  const accountTargetsByPlatform: { [key: string]: string[] } = {
    'Instagram': ['Profile', 'Business Account'],
    'TikTok': ['Profile'],
    'Facebook': ['Profile', 'Page'],
    'YouTube': ['Channel'],
    'Twitter (X)': ['Account'],
    'Telegram': ['Group', 'Channel', 'User Account'],
    'WhatsApp': ['Phone Number', 'Business Account'],
    'Snapchat': ['Account'],
    'Discord': ['Server', 'User']
  };
  
  return accountTargetsByPlatform[platform] || [];
};

const generateFollowers = (platform: string, targetType: string) => {
  if (platform === 'WhatsApp' || platform === 'Telegram' || platform === 'Discord' || platform === 'Facebook') {
    return null;
  }
  
  const accountBasedTargets = getAccountBasedTargets(platform);
  
  if (!accountBasedTargets.includes(targetType)) {
    return null;
  }
  
  const random = Math.random();
  
  if (random < 0.6) {
    return Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000;
  } else if (random < 0.85) {
    return Math.floor(Math.random() * (35000 - 15000 + 1)) + 15000;
  } else {
    return Math.floor(Math.random() * (80000 - 35000 + 1)) + 35000;
  }
};

const getFollowersLabel = (platform: string) => {
  return platform === 'YouTube' ? 'subscribers' : 'followers';
};

interface LiveBansProps {
  onClose: () => void;
  username: string;
}

export const LiveBans: React.FC<LiveBansProps> = ({ onClose }) => {
  const [bans, setBans] = useState<BanNotification[]>([]);
  const [showAccessMsg, setShowAccessMsg] = useState(false);

  const generateBanNotification = useCallback(() => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    
    const profileTargets = getAccountBasedTargets(platform.name);
    const otherTargets = platform.targetTypes.filter(t => !profileTargets.includes(t));
    
    let targetType;
    if (Math.random() < 0.97 && profileTargets.length > 0) {
      targetType = profileTargets[Math.floor(Math.random() * profileTargets.length)];
    } else {
      const allTargets = otherTargets.length > 0 ? otherTargets : platform.targetTypes;
      targetType = allTargets[Math.floor(Math.random() * allTargets.length)];
    }
    
    const followers = generateFollowers(platform.name, targetType);
    
    const newBan: BanNotification = {
      id: Date.now() + Math.random(),
      platform: platform.name,
      icon: platform.icon,
      targetType: targetType,
      username: 'Hidden',
      banDuration: generateBanDuration(),
      followers: followers,
      timeAgo: generateTimeAgo(),
      timestamp: Date.now()
    };
    
    setBans(prev => {
      const updated = [newBan, ...prev];
      return updated.slice(0, 7);
    });
  }, []);

  useEffect(() => {
    const initialCount = Math.floor(Math.random() * 2) + 4;
    for (let i = 0; i < initialCount; i++) {
      setTimeout(() => {
        generateBanNotification();
      }, i * 300);
    }
    
    const interval = setInterval(() => {
      generateBanNotification();
    }, Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000);
    
    return () => clearInterval(interval);
  }, [generateBanNotification]);

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="payment-modal-header">
          <div className="payment-modal-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="payment-modal-title">
            Live Bans Feed
          </h2>
          <button className="payment-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="payment-modal-body" style={{ flex: 1, overflow: 'auto' }}>
          {/* Access Message Popup */}
          <AnimatePresence>
            {showAccessMsg && (
              <div className="payment-modal-overlay" onClick={() => setShowAccessMsg(false)}>
                <motion.div 
                  className="payment-modal-container"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: '450px' }}
                >
                  {/* Header */}
                  <div className="payment-modal-header">
                    <div className="payment-modal-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                      </svg>
                    </div>
                    <h2 className="payment-modal-title">
                      Panel Access Required
                    </h2>
                    <button className="payment-modal-close" onClick={() => setShowAccessMsg(false)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Body */}
                  <div className="payment-modal-body" style={{ textAlign: 'center', padding: '30px 24px' }}>
                    <div style={{ 
                      fontSize: '2.5rem', 
                      marginBottom: '20px',
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      🔒
                    </div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#f3f4f6',
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      Premium Feature
                    </h3>
                    <p style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      marginBottom: '24px'
                    }}>
                      Detailed user information is only available for panel members. Purchase access to unlock all features.
                    </p>
                    <button
                      onClick={() => setShowAccessMsg(false)}
                      className="payment-wallet-option"
                    >
                      <div className="payment-wallet-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                      </div>
                      <span className="payment-wallet-name">Got it!</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Info Banner */}
          <div style={{
                padding: '10px 12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.75rem',
                lineHeight: '1.4',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Animated gradient overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '200%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
                  animation: 'shimmer 3s infinite'
                }} />
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'start', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    minWidth: '8px',
                    background: '#10b981',
                    borderRadius: '50%',
                    marginTop: '4px',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <div style={{ color: '#a7f3d0', flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>Real-time</span> social media ban notifications - System is actively running - These ban results are shown from reports sent from <span style={{ fontWeight: 600, color: '#10b981' }}>RektNow</span> panel.
                  </div>
                </div>
              </div>

          {/* Bans List */}
          <AnimatePresence mode="popLayout">
                {bans.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.6 }}>⚠️</div>
                    <p>Waiting for new ban notifications...</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bans.map((ban) => (
                      <motion.div
                        key={ban.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        layout
                        className="payment-wallet-option"
                        style={{
                          cursor: 'default',
                          padding: '16px',
                          background: 'rgba(31, 41, 55, 0.3)',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        {/* Platform Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%'
                        }}>
                          <div style={{
                            fontSize: '1.5rem',
                            color: platforms.find(p => p.name === ban.platform)?.color || '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px'
                          }}>
                            {ban.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem' }}>{ban.platform}</span>
                              <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>⚠️</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                              {ban.timeAgo}
                            </div>
                          </div>
                        </div>

                        {/* Target Info */}
                        <div style={{ width: '100%', paddingLeft: '52px' }}>
                          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px' }}>
                            Target: <span style={{ color: '#f59e0b', fontWeight: 500 }}>{ban.targetType}</span>
                          </div>
                          {getAccountBasedTargets(ban.platform).includes(ban.targetType) && (
                            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px', position: 'relative' }}>
                              User: 
                              <span 
                                onClick={() => setShowAccessMsg(true)}
                                style={{ 
                                  color: '#e5e7eb',
                                  filter: 'blur(4px)',
                                  userSelect: 'none',
                                  cursor: 'pointer',
                                  padding: '2px 8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  borderRadius: '4px',
                                  marginLeft: '4px',
                                  display: 'inline-block',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                              >
                                {ban.username}
                              </span>
                            </div>
                          )}
                          {ban.followers && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#9ca3af' }}>
                              <span>👥</span>
                              <span>{formatNumber(ban.followers)} {getFollowersLabel(ban.platform)}</span>
                            </div>
                          )}
                        </div>

                        {/* Ban Status */}
                        <div style={{
                          width: '100%',
                          paddingLeft: '52px'
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            ⚡ Banned in: {ban.banDuration}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
