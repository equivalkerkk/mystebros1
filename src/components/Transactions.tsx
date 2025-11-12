import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface Transaction {
  id: string;
  crypto: string;
  network: string | null;
  address: string;
  amount: string;
  paymentId: string;
  timestamp: number;
  status: string;
  packageType: 'full' | 'single';
  usdAmount: number;
}

interface TransactionsProps {
  onClose: () => void;
  onContinuePayment: (transaction: Transaction) => void;
}

type TabType = 'pending' | 'completed' | 'cancelled' | 'all';

export const Transactions: React.FC<TransactionsProps> = ({ onClose, onContinuePayment }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadTransactions = () => {
    // Load transactions from localStorage
    const username = localStorage.getItem('rektnow_auth') 
      ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
      : 'guest';
    
    const savedPayments = localStorage.getItem(`rektnow_pending_payments_${username}`);
    if (savedPayments) {
      try {
        const parsed = JSON.parse(savedPayments);
        const txList: Transaction[] = Object.entries(parsed).map(([key, payment]: [string, any]) => ({
          id: key,
          crypto: payment.crypto,
          network: payment.network,
          address: payment.address,
          amount: payment.amount,
          paymentId: payment.paymentId,
          timestamp: payment.timestamp,
          status: payment.status,
          packageType: payment.packageType,
          usdAmount: payment.packageType === 'single' ? 99.99 : 299.99
        }));
        
        // Sort by timestamp (newest first)
        txList.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(txList);
      } catch (e) {
        console.error('Failed to load transactions:', e);
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadTransactions();
    
    // Listen for storage changes to reload transactions
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('rektnow_pending_payments_')) {
        loadTransactions();
      }
    };
    
    // Listen for custom event when payment is cancelled
    const handlePaymentCancelled = () => {
      loadTransactions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('paymentCancelled', handlePaymentCancelled);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('paymentCancelled', handlePaymentCancelled);
    };
  }, []);

  const filterTransactions = (txs: Transaction[]) => {
    switch (activeTab) {
      case 'pending':
        return txs.filter(tx => 
          tx.status === 'waiting' || 
          tx.status === 'processing' || 
          tx.status === 'sending'
        );
      case 'completed':
        return txs.filter(tx => 
          tx.status === 'finished'
        );
      case 'cancelled':
        return txs.filter(tx => 
          tx.status === 'cancelled' ||
          tx.status === 'failed' || 
          tx.status === 'rejected'
        );
      case 'all':
      default:
        return txs;
    }
  };

  const filteredTransactions = filterTransactions(transactions);

  console.log('Transactions component - total transactions:', transactions.length);
  console.log('Transactions component - showClearConfirm:', showClearConfirm);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
        return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' };
      case 'waiting':
        return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' };
      case 'processing':
      case 'sending':
        return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' };
      case 'cancelled':
        return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)', text: '#9ca3af' };
      case 'failed':
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)', text: '#9ca3af' };
    }
  };

  const getTabName = (tab: TabType) => {
    switch (tab) {
      case 'pending': return t.transactionsTabPending;
      case 'completed': return t.transactionsTabCompleted;
      case 'cancelled': return t.transactionsTabCancelled;
      case 'all': return t.transactionsTabAll;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return t.transactionsStatusWaiting;
      case 'processing': return t.transactionsStatusProcessing;
      case 'sending': return t.transactionsStatusProcessing;
      case 'finished': return t.transactionsStatusCompleted;
      case 'failed': return t.transactionsStatusFailed;
      case 'rejected': return t.transactionsStatusFailed;
      case 'cancelled': return t.transactionsStatusCancelled;
      default: return status;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getCryptoName = (cryptoId: string): string => {
    const cryptoNames: { [key: string]: string } = {
      'btc': 'Bitcoin',
      'eth': 'Ethereum',
      'usdt': 'Tether',
      'usdc': 'USD Coin',
      'bnb': 'BNB',
      'sol': 'Solana',
      'trx': 'Tron',
      'xrp': 'Ripple',
      'ton': 'Toncoin'
    };
    return cryptoNames[cryptoId.toLowerCase()] || cryptoId.toUpperCase();
  };

  const getNetworkName = (networkId: string | null): string | null => {
    if (!networkId) return null;
    
    const networkNames: { [key: string]: string } = {
      'erc20': 'Ethereum (ERC20)',
      'trc20': 'Tron (TRC20)',
      'bsc': 'BNB Smart Chain (BEP20)',
      'polygon': 'Polygon',
      'arbitrum': 'Arbitrum',
      'bep20': 'BNB Chain (BEP20)',
      'matic': 'Polygon'
    };
    return networkNames[networkId.toLowerCase()] || networkId.toUpperCase();
  };

  const handleClearAll = () => {
    const username = localStorage.getItem('rektnow_auth') 
      ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
      : 'guest';
    
    // Remove all transactions from localStorage
    localStorage.removeItem(`rektnow_pending_payments_${username}`);
    
    // Clear state
    setTransactions([]);
    setShowClearConfirm(false);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('paymentCancelled'));
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="payment-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 10001 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="payment-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="payment-modal-header">
          <h2 className="payment-modal-title" style={{ flex: 1 }}>{t.transactionsTitle}</h2>
          
          {/* Clear All Button */}
          {transactions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Clear All clicked, transactions:', transactions.length);
                setShowClearConfirm(true);
              }}
              style={{
                padding: '8px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginRight: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              🗑️ {t.transactionsClearAll}
            </button>
          )}
          
          <button className="payment-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          {(['pending', 'completed', 'cancelled', 'all'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: activeTab === tab 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === tab 
                  ? '1px solid rgba(168, 85, 247, 0.4)' 
                  : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                color: activeTab === tab ? '#fff' : '#888',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
            >
              {getTabName(tab)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="payment-modal-body" style={{ 
          padding: '16px 20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {filteredTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#888' }}>
                {activeTab === 'all' ? t.transactionsEmpty : `${t.transactionsEmpty}`}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {t.transactionsEmptyDesc}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTransactions.map((tx) => {
                const statusColors = getStatusColor(tx.status);
                const isPending = tx.status === 'waiting' || tx.status === 'processing' || tx.status === 'sending';
                
                return (
                  <div
                    key={tx.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 0.2s ease',
                      cursor: isPending ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (isPending) {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onClick={() => {
                      if (isPending) {
                        onContinuePayment(tx);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          fontSize: '1.5rem',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(168, 85, 247, 0.1)',
                          borderRadius: '10px'
                        }}>
                          {tx.crypto.toLowerCase() === 'btc' ? '₿' :
                           tx.crypto.toLowerCase() === 'eth' ? 'Ξ' :
                           tx.crypto.toLowerCase() === 'usdt' ? '₮' :
                           tx.crypto.toLowerCase() === 'sol' ? '◎' :
                           tx.crypto.toLowerCase() === 'trx' ? 'Ť' :
                           tx.crypto.toLowerCase() === 'xrp' ? 'ⓧ' :
                           tx.crypto.toLowerCase() === 'ton' ? '💎' :
                           tx.crypto.toLowerCase() === 'bnb' ? 'Ⓑ' : '💰'}
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '0.95rem', 
                            fontWeight: 600, 
                            color: '#fff',
                            marginBottom: '4px'
                          }}>
                            {getCryptoName(tx.crypto)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            {tx.network ? getNetworkName(tx.network) : 'Main Network'} • {formatTimestamp(tx.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        background: statusColors.bg,
                        border: `1px solid ${statusColors.border}`,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: statusColors.text
                      }}>
                        {getStatusText(tx.status)}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Amount</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                          {tx.amount} {getCryptoName(tx.crypto)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          ${tx.usdAmount} USD
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '6px 12px',
                        background: tx.packageType === 'full' 
                          ? 'rgba(168, 85, 247, 0.1)' 
                          : 'rgba(59, 130, 246, 0.1)',
                        border: `1px solid ${tx.packageType === 'full' 
                          ? 'rgba(168, 85, 247, 0.3)' 
                          : 'rgba(59, 130, 246, 0.3)'}`,
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: tx.packageType === 'full' ? '#a855f7' : '#3b82f6'
                      }}>  
                        {tx.packageType === 'full' ? t.paymentFullPanel : t.paymentSingleReport}
                      </div>
                    </div>

                    {isPending && (
                      <div style={{ 
                        marginTop: '12px',
                        padding: '10px',
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: '#a855f7',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        👆 {t.transactionsClickToContinue}
                      </div>
                    )}
                    
                    {tx.status === 'cancelled' && (
                      <div style={{ 
                        marginTop: '12px',
                        padding: '10px',
                        background: 'rgba(156, 163, 175, 0.08)',
                        border: '1px solid rgba(156, 163, 175, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        🚫 {t.transactionsCancelledByUser}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
      
    {/* Clear Confirmation Modal */}
    {showClearConfirm && (
        <div 
          className="payment-modal-overlay" 
          style={{ zIndex: 10002 }} 
          onClick={(e) => {
            e.stopPropagation();
            console.log('Overlay clicked');
            setShowClearConfirm(false);
          }}
        >
          <div 
            className="payment-modal-container" 
            style={{ maxWidth: '450px' }} 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Container clicked');
            }}
          >
            <div className="payment-modal-header">
              <div className="payment-modal-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </div>
              <h2 className="payment-modal-title">{t.transactionsClearConfirmTitle}</h2>
            </div>
            <div className="payment-modal-body">
              <p style={{ 
                textAlign: 'center', 
                color: '#999', 
                marginBottom: '8px', 
                fontSize: '0.95rem', 
                lineHeight: '1.6' 
              }}>
                {t.transactionsClearConfirmDesc}
              </p>
              <p style={{ 
                textAlign: 'center', 
                color: '#ef4444', 
                marginBottom: '24px', 
                fontSize: '0.85rem', 
                fontWeight: 600
              }}>
                ⚠️ {t.transactionsClearConfirmWarning}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="pay-btn" 
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                    fontSize: '0.95rem',
                    padding: '12px 20px'
                  }}
                  onClick={() => setShowClearConfirm(false)}
                >
                  {t.transactionsClearConfirmCancel}
                </button>
                <button 
                  className="pay-btn" 
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    fontSize: '0.95rem',
                    padding: '12px 20px'
                  }}
                  onClick={handleClearAll}
                >
                  {t.transactionsClearConfirmYes}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
