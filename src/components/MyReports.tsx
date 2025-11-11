import { useState } from 'react';

interface MyReportsProps {
  onClose: () => void;
  username: string;
}

export const MyReports: React.FC<MyReportsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="payment-modal-header">
          <div className="payment-modal-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <h2 className="payment-modal-title">
            My Reports
          </h2>
          <button className="payment-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="payment-modal-body" style={{ flex: 1, overflow: 'auto' }}>
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px',
            borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
            paddingBottom: '12px'
          }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: activeTab === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                border: activeTab === 'pending' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '8px',
                color: activeTab === 'pending' ? '#fbbf24' : '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'pending') {
                  e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'pending') {
                  e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                }
              }}
            >
              ⏳ Pending
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: activeTab === 'completed' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: activeTab === 'completed' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '8px',
                color: activeTab === 'completed' ? '#3b82f6' : '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'completed') {
                  e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'completed') {
                  e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                }
              }}
            >
              ✅ Completed
            </button>
          </div>

          {/* Pending Reports Tab Content */}
          {activeTab === 'pending' && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9ca3af' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" style={{ width: '80px', height: '80px', margin: '0 auto', opacity: 0.6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No Pending Reports</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                You don't have any pending reports yet.
              </p>
            </div>
          )}

          {/* Completed Reports Tab Content */}
          {activeTab === 'completed' && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9ca3af' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" style={{ width: '80px', height: '80px', margin: '0 auto', opacity: 0.6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No Completed Reports</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                You don't have any completed reports yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
