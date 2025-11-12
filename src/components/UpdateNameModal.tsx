import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface UpdateNameModalProps {
  isOpen: boolean;
  currentName: string;
  username: string; // Login username (immutable)
  nameChangeCount: number;
  onClose: () => void;
  onUpdate: (newName: string) => Promise<void>;
}

export const UpdateNameModal: React.FC<UpdateNameModalProps> = ({ 
  isOpen, 
  currentName,
  username,
  nameChangeCount,
  onClose, 
  onUpdate 
}) => {
  const { t } = useLanguage();
  const [newName, setNewName] = useState(currentName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      setError(t.updateNameErrorEmpty);
      return;
    }
    
    if (trimmedName === currentName) {
      setError(t.updateNameErrorSame);
      return;
    }
    
    if (trimmedName.length > 30) {
      setError(t.updateNameErrorTooLong);
      return;
    }
    
    setIsUpdating(true);
    setError('');
    
    try {
      await onUpdate(trimmedName);
      onClose();
    } catch (err) {
      setError(t.updateNameErrorFailed);
    } finally {
      setIsUpdating(false);
    }
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '20px',
          padding: '40px',
          width: '90%',
          maxWidth: '480px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.1)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#999';
          }}
        >
          ×
        </button>
        
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#fff',
            margin: 0,
            marginBottom: '8px'
          }}>
            {t.updateNameTitle}
          </h2>
        </div>
        
        {/* Info Text */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#999',
            lineHeight: '1.5',
            textAlign: 'center'
          }}>
            {t.updateNameInfo1}
            <br />
            {t.updateNameInfo2} <span style={{
              color: '#a855f7',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>{username}</span> {t.updateNameInfo3}
            <br />
            <span style={{
              fontSize: '0.8rem',
              color: nameChangeCount >= 3 ? '#ef4444' : '#3b82f6',
              fontWeight: 600,
              marginTop: '6px',
              display: 'inline-block'
            }}>
              {nameChangeCount >= 3 
                ? `⚠️ ${t.updateNameNoChanges}` 
                : `${3 - nameChangeCount} ${t.updateNameChangesRemaining}`
              }
            </span>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#ef4444',
              fontWeight: 500
            }}>
              {error}
            </span>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#999',
              marginBottom: '10px',
              fontWeight: 500
            }}>
              {t.updateNameLabel}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '14px 18px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
              }}
              placeholder={t.updateNamePlaceholder}
              maxLength={30}
              autoFocus
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: '0.75rem',
              color: '#666',
              marginTop: '8px'
            }}>
              {newName.length}/30 {t.updateNameCharacters}
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUpdating || nameChangeCount >= 3}
            style={{
              width: '100%',
              background: (isUpdating || nameChangeCount >= 3)
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: (isUpdating || nameChangeCount >= 3) ? '#666' : '#fff',
              cursor: (isUpdating || nameChangeCount >= 3) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!isUpdating && nameChangeCount < 3) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdating && nameChangeCount < 3) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            {nameChangeCount >= 3 ? t.updateNameMaxReached : (isUpdating ? t.updateNameUpdating : t.updateNameButton)}
          </button>
        </form>
      </div>
    </div>
  );
};
