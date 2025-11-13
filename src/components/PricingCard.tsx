import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FAQ } from './FAQ';
import { Features } from './Features';
import { PaymentButtons } from './PaymentButtons';

const BASE_PRICE_USD = 299.99;

interface PricingCardProps {
  selectedTransaction?: any;
  onTransactionHandled?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ selectedTransaction, onTransactionHandled }) => {
  const { t, currency, convertPrice } = useLanguage();
  
  const convertedPrice = convertPrice(BASE_PRICE_USD);

  // Parse subtitle with bold markdown (**text**)
  const parseSubtitle = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/);
    return parts.map((part, index) => 
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  return (
    <div className="card">
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-brand">REKTNOW'S</div>
                  <div className="card-title">
                    Mass Report Panel
                  </div>
                </div>
                <div className="card-subtitle" style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginTop: '16px',
                  lineHeight: '1.6',
                  fontSize: '0.875rem',
                  color: '#d0d0d0',
                  boxShadow: '0 4px 20px rgba(168, 85, 247, 0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  {/* Animated Shield Icon */}
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    style={{
                      flexShrink: 0,
                      marginTop: '1px',
                      filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}
                  >
                    <path 
                      d="M12 2L4 6V12C4 16.5 7 20.5 12 22C17 20.5 20 16.5 20 12V6L12 2Z" 
                      fill="url(#gradient)"
                      opacity="0.2"
                    />
                    <path 
                      d="M12 2L4 6V12C4 16.5 7 20.5 12 22C17 20.5 20 16.5 20 12V6L12 2Z" 
                      stroke="url(#gradient)" 
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M9 12L11 14L15 10" 
                      stroke="url(#gradient)" 
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div style={{ flex: 1 }}>
                    {parseSubtitle(t.cardSubtitle)}
                  </div>
                </div>
                
                {/* CSS Animation */}
                <style>{`
                  @keyframes pulse {
                    0%, 100% {
                      opacity: 1;
                      transform: scale(1);
                    }
                    50% {
                      opacity: 0.8;
                      transform: scale(1.05);
                    }
                  }
                  
                  .card-subtitle strong {
                    background: linear-gradient(135deg, #a855f7, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    text-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
                  }
                `}</style>
              </div>

              <FAQ />

              <Features />

              <div className="purchase-info-box">
                <div className="purchase-info-icon">→</div>
                <div className="purchase-info-content">
                  <div className="purchase-info-title">{t.getStartedNow}</div>
                  <div className="purchase-info-text">{t.purchaseInfo}</div>
                </div>
              </div>

              <PaymentButtons price={convertedPrice} currency={currency} selectedTransaction={selectedTransaction} onTransactionHandled={onTransactionHandled} />

              <div className="payment-info">
                <svg className="payment-wallet-icon" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"/>
                </svg>
                <span>{t.paymentInfo}</span>
              </div>

              <div className="refund-guarantee">
                <span className="refund-guarantee-icon">⚡</span>
                <span>{t.refundInfo}</span>
              </div>

              {/* Footer */}
              <div style={{
                textAlign: 'center',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.9rem',
                color: '#888'
              }}>
                <span>Made with </span>
                <span style={{
                  display: 'inline-block',
                  animation: 'heartBeat 1.5s ease-in-out infinite',
                  fontSize: '1.1rem'
                }}>❤️</span>
                <span> by </span>
                <span style={{ fontWeight: 700 }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 3s ease infinite'
                  }}>Rekt</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 3s ease infinite reverse'
                  }}>Now</span>
                </span>
              </div>

              {/* Animations */}
              <style>{`
                @keyframes heartBeat {
                  0%, 100% {
                    transform: scale(1) translateY(0);
                  }
                  25% {
                    transform: scale(1.2) translateY(-3px);
                  }
                  50% {
                    transform: scale(1) translateY(0);
                  }
                }
                
                @keyframes gradientShift {
                  0%, 100% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                }
              `}</style>
    </div>
  );
};
