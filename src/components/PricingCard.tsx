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

              {/* Divider */}
              <div style={{
                margin: '24px 0',
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)'
              }}></div>

              <FAQ />

              <Features />

              <PaymentButtons price={convertedPrice} currency={currency} selectedTransaction={selectedTransaction} onTransactionHandled={onTransactionHandled} />

              {/* Community Section */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.03), rgba(59, 130, 246, 0.03))',
                border: '1px solid rgba(168, 85, 247, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '24px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '16px',
                  letterSpacing: '0.5px'
                }}>JOIN OUR COMMUNITY</h4>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <a 
                    href="https://t.me/rektnowlinks" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'rgba(0, 136, 204, 0.1)',
                      border: '1px solid rgba(0, 136, 204, 0.3)',
                      borderRadius: '8px',
                      color: '#0088cc',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 136, 204, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(0, 136, 204, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 136, 204, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(0, 136, 204, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>Telegram</span>
                  </a>
                  <a 
                    href="https://discord.gg/JPmz9Kdu2H" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'rgba(88, 101, 242, 0.1)',
                      border: '1px solid rgba(88, 101, 242, 0.3)',
                      borderRadius: '8px',
                      color: '#5865f2',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(88, 101, 242, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span>Discord</span>
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                margin: '24px 0',
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)'
              }}></div>

              {/* Footer */}
              <div style={{
                textAlign: 'center',
                marginTop: '32px',
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
