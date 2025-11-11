import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { useTelegram } from './hooks/useTelegram.js';
import UserProfile from './components/UserProfile.jsx';
import MyBans from './components/MyBans.jsx';
import { 
  FaInstagram, 
  FaTiktok, 
  FaFacebook, 
  FaYoutube, 
  FaTwitter, 
  FaTelegram, 
  FaWhatsapp, 
  FaSnapchat, 
  FaDiscord, 
  FaSteam 
} from 'react-icons/fa';
import { SiKick, SiRoblox } from 'react-icons/si';

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
    targetTypes: ['Profile', 'Video', 'Sound', 'Live Stream', 'Comment', 'Hashtag', 'Effect']
  },
  { 
    name: 'Facebook', 
    icon: <FaFacebook />, 
    color: '#1877F2',
    targetTypes: ['Profile', 'Page', 'Group', 'Post', 'Game', 'Reel', 'Comment', 'Story']
  },
  { 
    name: 'YouTube', 
    icon: <FaYoutube />, 
    color: '#FF0000',
    targetTypes: ['Channel', 'Video', 'Comment', 'Shorts', 'Community Post', 'Live Stream']
  },
  { 
    name: 'Twitter (X)', 
    icon: <FaTwitter />, 
    color: '#1DA1F2',
    targetTypes: ['Profile', 'Tweet', 'Reply', 'Retweet', 'Media', 'Space', 'List']
  },
  { 
    name: 'Telegram', 
    icon: <FaTelegram />, 
    color: '#0088CC',
    targetTypes: ['Profile', 'Channel', 'Group', 'Message', 'Bot', 'Sticker Pack']
  },
  { 
    name: 'WhatsApp', 
    icon: <FaWhatsapp />, 
    color: '#25D366',
    targetTypes: ['Phone Number', 'Group', 'Message', 'Status']
  },
  { 
    name: 'Snapchat', 
    icon: <FaSnapchat />, 
    color: '#FFFC00',
    targetTypes: ['Profile', 'Story', 'Snap', 'Message', 'Snap Map']
  },
  { 
    name: 'Discord', 
    icon: <FaDiscord />, 
    color: '#5865F2',
    targetTypes: ['Profile', 'Server', 'Message', 'Channel', 'Bot']
  },
  { 
    name: 'Steam', 
    icon: <FaSteam />, 
    color: '#1b2838',
    targetTypes: ['Profile', 'Game', 'Comment', 'Group', 'Screenshot', 'Video', 'Workshop Item']
  },
  { 
    name: 'Kick', 
    icon: <SiKick />, 
    color: '#53FC18',
    targetTypes: ['Profile', 'Stream', 'Chat Message', 'Community', 'Clip', 'Comment']
  },
  { 
    name: 'Roblox', 
    icon: <SiRoblox />, 
    color: '#00A2FF',
    targetTypes: ['Profile', 'Game', 'Asset', 'Group', 'Comment', 'Forum Post']
  }
];

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const generateBanDuration = () => {
  // Weighted random for varied ban durations
  const random = Math.random();
  
  if (random < 0.3) {
    // 30% chance: Very short bans (5 seconds - 2 minutes)
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
    // 30% chance: Short bans (2-10 minutes)
    const minutes = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else if (random < 0.85) {
    // 25% chance: Medium bans (10-30 minutes)
    const minutes = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    return `${minutes} minutes`;
  } else {
    // 15% chance: Long bans (30 minutes - 2 hours)
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
  // Weighted random for live ban feeds (much more recent)
  const random = Math.random();
  
  if (random < 0.6) {
    // 60% chance: Very recent (1-20 minutes ago)
    const minutes = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (random < 0.9) {
    // 30% chance: Recent (20 minutes - 1.5 hours ago)
    const minutes = Math.floor(Math.random() * (90 - 20 + 1)) + 20;
    
    if (minutes < 60) {
      // Less than 1 hour: just show minutes
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
      // 1 hour or more
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
    // 10% chance: Older (1.5-3 hours ago max)
    const totalMinutes = Math.floor(Math.random() * (180 - 90 + 1)) + 90; // 90-180 minutes
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
    'Twitter (X)': ['Profile'],
    'Telegram': ['Profile', 'Channel', 'Bot'],
    'WhatsApp': ['Phone Number'],
    'Snapchat': ['Profile'],
    'Discord': ['Profile'],
    'Steam': ['Profile'],
    'Kick': ['Profile'],
    'Roblox': ['Profile']
  };
  
  return accountTargetsByPlatform[platform] || [];
};

const generateFollowers = (platform: string, targetType: string) => {
  // These platforms don't show follower counts for regular users
  if (platform === 'WhatsApp' || platform === 'Telegram' || platform === 'Discord' || platform === 'Facebook' || platform === 'Steam') {
    return null;
  }
  
  // Only show followers for account-based targets, not content-based targets
  const accountBasedTargets = getAccountBasedTargets(platform);
  
  if (!accountBasedTargets.includes(targetType)) {
    return null; // Content-based targets (posts, videos, comments etc.) don't show follower counts
  }
  
  // Roblox has much lower follower counts (kids platform)
  if (platform === 'Roblox') {
    const random = Math.random();
    
    if (random < 0.7) {
      // 70% chance: Very small accounts (10 - 500)
      return Math.floor(Math.random() * (500 - 10 + 1)) + 10;
    } else if (random < 0.9) {
      // 20% chance: Small accounts (500 - 2K)
      return Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
    } else {
      // 10% chance: Medium accounts (2K - 5K)
      return Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
    }
  }
  
  // Weighted random - smaller accounts get banned more often (other platforms)
  const random = Math.random();
  
  if (random < 0.6) {
    // 60% chance: Small accounts (1K - 15K)
    return Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000;
  } else if (random < 0.85) {
    // 25% chance: Medium accounts (15K - 35K)
    return Math.floor(Math.random() * (35000 - 15000 + 1)) + 15000;
  } else {
    // 15% chance: Larger accounts (35K - 80K)
    return Math.floor(Math.random() * (80000 - 35000 + 1)) + 35000;
  }
};

const getFollowersLabel = (platform: string) => {
  return platform === 'YouTube' ? 'subscribers' : 'followers';
};

function App() {
  const [bans, setBans] = useState<BanNotification[]>([]);
  const { user, isLoading: userLoading } = useTelegram();
  const [currentView, setCurrentView] = useState('liveBans'); // 'liveBans' | 'myReports'

  // Admin kontrolü - örnek admin ID'leri
  const adminIds = [123456789, 987654321]; // Buraya admin ID'leri ekleyin
  const isAdmin = user && adminIds.includes((user as any).id);

  const generateBanNotification = useCallback(() => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    
    // 97% chance for profile bans, 3% for other types (realistic pricing - users pay $99.99 for account bans)
    const profileTargets = getAccountBasedTargets(platform.name);
    const otherTargets = platform.targetTypes.filter(t => !profileTargets.includes(t));
    
    let targetType;
    if (Math.random() < 0.97 && profileTargets.length > 0) {
      // 97% chance: Select profile/account-based target (users pay $99.99 for these)
      targetType = profileTargets[Math.floor(Math.random() * profileTargets.length)];
    } else {
      // 3% chance: Select other target types (comments, posts etc. - rare and cheap)
      const allTargets = otherTargets.length > 0 ? otherTargets : platform.targetTypes;
      targetType = allTargets[Math.floor(Math.random() * allTargets.length)];
    }
    
    const followers = generateFollowers(platform.name, targetType);
    
    const newBan: BanNotification = {
      id: Date.now() + Math.random(), // Unique ID with timestamp + random
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
    // Initial load: Generate 4-5 ban notifications immediately
    const initialCount = Math.floor(Math.random() * 2) + 4; // 4 or 5 initial bans
    for (let i = 0; i < initialCount; i++) {
      setTimeout(() => {
        generateBanNotification();
      }, i * 300); // 300ms delay between each
    }
    
    // Then start the regular interval for new notifications
    const interval = setInterval(() => {
      generateBanNotification();
    }, Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000); // 8-15 seconds (faster)
    
    return () => clearInterval(interval);
  }, [generateBanNotification]);

  if (userLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0d0d0d, #1a1a1a, #0d0d0d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ 
            width: '4rem', 
            height: '4rem', 
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0d0d0d, #1a1a1a, #0d0d0d)',
      padding: '2rem',
      color: '#f3f4f6'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>


        {/* User Profile */}
        {user && (
          <UserProfile 
            user={user} 
            isAdmin={isAdmin} 
            onViewChange={setCurrentView}
          />
        )}

        {/* Content based on current view */}
        {currentView === 'liveBans' ? (
          /* Live Feed */
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-effect" style={{ 
              borderRadius: '1rem', 
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  minWidth: '12px',
                  minHeight: '12px',
                  background: '#10b981', 
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                  flexShrink: 0
                }}></div>
                <span style={{ color: '#10b981', fontWeight: '600' }}>Live Bans</span>
              </div>
              
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#9ca3af', 
                fontStyle: 'italic',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(17, 24, 39, 0.6)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                maxWidth: '600px',
                margin: '0 auto 1rem auto'
              }}>
                <span style={{ fontSize: '1rem' }}>💡</span>
                <span>
                  Real-time social media ban notifications - System is actively running - These ban results are shown from reports sent via{' '}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FaTelegram style={{ color: '#0088CC', fontSize: '0.875rem' }} />
                    <span style={{ color: '#0088CC', fontWeight: '500' }}>@sfxrepbot</span>
                  </span>
                </span>
              </div>
              
              <AnimatePresence mode="popLayout">
                {bans.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <p>Waiting for new ban notifications...</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bans.map((ban) => (
                      <motion.div
                        key={ban.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        layout
                        style={{
                          background: 'rgba(31, 41, 55, 0.5)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(107, 114, 128, 0.3)',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Header - Platform & Warning */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            color: platforms.find(p => p.name === ban.platform)?.color || '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {ban.icon}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#ffffff', fontSize: '1rem' }}>{ban.platform}</span>
                              <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>⚠️</span>
                            </div>
                          </div>
                        </div>

                        {/* Content - Target Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                            Target: <span style={{ color: '#f59e0b', fontWeight: '500' }}>{ban.targetType}</span>
                          </div>
                          {/* Only show user info for account-based targets */}
                          {getAccountBasedTargets(ban.platform).includes(ban.targetType) && (
                            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                              User: <span style={{ color: '#e5e7eb' }}>{ban.username}</span>
                            </div>
                          )}
                          {ban.followers && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                              <span>👥</span>
                              <span>{formatNumber(ban.followers)} {getFollowersLabel(ban.platform)}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer - Ban Status */}
                        <div style={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <div style={{ 
                            display: 'inline-block',
                            background: 'rgba(239, 68, 68, 0.1)',
                            backdropFilter: 'blur(8px)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            letterSpacing: '0.025em',
                            textAlign: 'center'
                          }}>
                            Banned in: {ban.banDuration}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280',
                            textAlign: 'center'
                          }}>
                            {ban.timeAgo}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : currentView === 'myReports' ? (
          /* My Reports */
          <MyBans onBackClick={() => setCurrentView('liveBans')} />
        ) : null}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          style={{ textAlign: 'center', marginTop: '3rem' }}
        >
          <div className="glass-effect" style={{ 
            borderRadius: '0.75rem',
            padding: '1rem',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            maxWidth: '384px',
            margin: '0 auto'
          }}>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: 0
            }}>
              Made with{' '}
              <motion.span
                animate={{ 
                  y: [0, -3, 0, -3, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
                style={{ color: '#ef4444', fontSize: '1rem' }}
              >
                ❤️
              </motion.span>
              by{' '}
              <span style={{ fontWeight: '500' }}>
                <span className="glow-sm">sm</span>
                <span className="glow-rep">rep</span>
                <span className="glow-bot">bot</span>
              </span>
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
