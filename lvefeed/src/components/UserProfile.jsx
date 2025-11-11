import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Sparkles } from 'lucide-react'

const UserProfile = ({ user, isAdmin, onViewChange }) => {
  if (!user) return null

  // Avatar URL veya fallback
  const avatarUrl = user.photo_url || null
  const fallbackUrl = user.fallback_photo_url || null
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
  
  // Avatar türünü belirle (video/gif/resim)
  const isVideoAvatar = avatarUrl && (avatarUrl.includes('.mp4') || avatarUrl.includes('video'))
  const isGifAvatar = avatarUrl && avatarUrl.includes('.gif')
  
  // Video yükleme hatası için state
  const [videoError, setVideoError] = useState(false)
  
  // Premium emoji tespiti
  const premiumEmojis = ['⭐', '🌟', '✨', '💎', '👑', '🔥', '❤️', '🏆', '🎖️', '🥇']
  const hasPremiumEmoji = user.first_name && premiumEmojis.some(emoji => user.first_name.includes(emoji))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        width: '100%',
        maxWidth: '512px',
        margin: '0 auto 2rem auto'
      }}
    >
      <div className="glass-effect" style={{ 
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: '1px solid rgba(107, 114, 128, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Premium Badge (Top Right) */}
        {(user.is_premium || hasPremiumEmoji) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'linear-gradient(45deg, #10b981, #06b6d4)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Sparkles size={12} />
            Premium
          </motion.div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ position: 'relative', flexShrink: 0 }}
          >
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              overflow: 'hidden'
            }}>
              {avatarUrl ? (
                <>
                  {isVideoAvatar && !videoError ? (
                    <video 
                      src={avatarUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setVideoError(true)}
                    />
                  ) : (
                    <img 
                      src={videoError && fallbackUrl ? fallbackUrl : avatarUrl} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        imageRendering: isGifAvatar ? 'auto' : 'auto'
                      }}
                    />
                  )}
                </>
              ) : (
                initials
              )}
            </div>
            
            {/* Admin Crown */}
            {isAdmin && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  background: 'linear-gradient(45deg, #f59e0b, #f97316)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Crown size={12} style={{ color: 'white' }} />
              </motion.div>
            )}
          </motion.div>

          {/* User Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                flexWrap: 'wrap'
              }}
            >
              <h2 style={{ 
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#f3f4f6',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.first_name} {user.last_name}
              </h2>
              {isAdmin && (
                <span style={{
                  background: 'linear-gradient(45deg, #f59e0b, #f97316)',
                  color: 'black',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Crown size={12} />
                  ADMIN
                </span>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: '0.5rem' }}
            >
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                <span style={{ fontWeight: 500 }}>ID:</span> {user.id}
              </p>
              {user.username && (
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  <span style={{ fontWeight: 500 }}>Username:</span> @{user.username}
                </p>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* My Reports Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '1rem' }}
        >
          <motion.button
            onClick={() => onViewChange('myReports')}
            whileHover={{ 
              scale: 1.03,
              y: -2
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Subtle hover gradient */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                opacity: 0
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              position: 'relative',
              zIndex: 1
            }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                <span style={{ fontSize: '1rem' }}>📊</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  letterSpacing: '0.025em',
                  color: 'white'
                }}>
                  My Reports
                </span>
                <span style={{ 
                  fontSize: '0.75rem',
                  color: 'rgba(148, 163, 184, 0.8)',
                  fontWeight: '400'
                }}>
                  View your reports
                </span>
              </div>
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                zIndex: 1
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>›</span>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default UserProfile 