import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';
import { sendPaymentCreatedNotification, sendPaymentStatusNotification, sendPaymentCancelledNotification } from '../utils/telegram';

interface PaymentButtonsProps {
  price: string;
  currency: { code: string; symbol: string };
  selectedTransaction?: any;
  onTransactionHandled?: () => void;
}

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  logoUrl: string;
  color: string;
  networks?: NetworkOption[]; // Multi-chain support
}

interface NetworkOption {
  id: string;
  name: string;
  code: string;
  fee: 'High' | 'Low';
}

const cryptoOptions: CryptoOption[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    networks: [
      { id: 'erc20', name: 'Ethereum Mainnet', code: 'eth', fee: 'High' },
      { id: 'arbitrum', name: 'Arbitrum', code: 'etharb', fee: 'Low' },
      { id: 'bsc', name: 'BNB Smart Chain (BEP20)', code: 'ethbsc', fee: 'Low' }
    ]
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    color: '#26A17B',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    networks: [
      { id: 'erc20', name: 'Ethereum (ERC20)', code: 'usdterc20', fee: 'High' },
      { id: 'trc20', name: 'Tron (TRC20)', code: 'usdttrc20', fee: 'Low' },
      { id: 'bsc', name: 'BNB Chain (BEP20)', code: 'usdtbsc', fee: 'Low' },
      { id: 'polygon', name: 'Polygon', code: 'usdtmatic', fee: 'Low' }
    ]
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    color: '#F3BA2F',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    networks: [
      { id: 'bsc', name: 'BNB Smart Chain', code: 'BNBBSC', fee: 'Low' }
    ]
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    color: '#14F195',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    color: '#2775CA',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    networks: [
      { id: 'erc20', name: 'Ethereum (ERC20)', code: 'USDC', fee: 'High' },
      { id: 'bsc', name: 'BNB Chain (BEP20)', code: 'USDCBSC', fee: 'Low' },
      { id: 'polygon', name: 'Polygon', code: 'USDCMATIC', fee: 'Low' }
    ]
  },
  {
    id: 'trx',
    name: 'Tron',
    symbol: 'TRX',
    color: '#FF0013',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    networks: [
      { id: 'trc20', name: 'Tron Network', code: 'trx', fee: 'Low' }
    ]
  },
  {
    id: 'xrp',
    name: 'Ripple',
    symbol: 'XRP',
    color: '#00AAE4',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png'
  },
  {
    id: 'ton',
    name: 'Toncoin',
    symbol: 'TON',
    color: '#0098EA',
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png'
  }
];

// Card payment providers and configurations (from paynsm)
const MERCHANT_WALLET = '0x7712B8792A1eB9c8338f8a7149ff2844C4F11665';

const cardProviders = [
  { value: 'hosted', label: '🏢 Multi Hosted Providers', minAmount: 1 },
  { value: 'stripe', label: '💳 Stripe (USA Only)', minAmount: 2, usdOnly: true },
  { value: 'sardine', label: '🐟 Sardine.ai', minAmount: 30 },
  { value: 'revolut', label: '🏦 Revolut', minAmount: 15 },
  { value: 'guardarian', label: '🛡️ Guardarian', minAmount: 20 },
  { value: 'particle', label: '⚛️ particle.network', minAmount: 30 },
  { value: 'transak', label: '🔄 Transak', minAmount: 15 },
  { value: 'banxa', label: '🏛️ Banxa', minAmount: 20 },
  { value: 'simplex', label: '📱 Simplex', minAmount: 50 },
  { value: 'mercuryo', label: '💰 mercuryo.io', minAmount: 30 },
  { value: 'rampnetwork', label: '🚀 ramp.network (USD)', minAmount: 4, usdOnly: true },
  { value: 'moonpay', label: '🌙 MoonPay', minAmount: 20 },
  { value: 'alchemypay', label: '⚗️ Alchemy Pay', minAmount: 15 },
  { value: 'robinhood', label: '🏹 Robinhood (USD)', minAmount: 5, usdOnly: true },
  { value: 'utorg', label: '🔷 UTORG', minAmount: 50 },
  { value: 'unlimit', label: '♾️ Unlimit', minAmount: 10 },
  { value: 'bitnovo', label: '🔵 Bitnovo', minAmount: 10 },
  { value: 'topper', label: '🎯 Topper', minAmount: 10 },
  { value: 'transfi', label: '💸 Transfi (USD)', minAmount: 70, usdOnly: true },
  { value: 'interac', label: '🇨🇦 Interac (CAD)', minAmount: 100, cadOnly: true },
  { value: 'upi', label: '🇮🇳 UPI/IMPS (INR)', minAmount: 100, inrOnly: true }
];

const cardCurrencies = [
  { value: 'USD', label: '🇺🇸 USD', symbol: '$' },
  { value: 'EUR', label: '🇪🇺 EUR', symbol: '€' },
  { value: 'CAD', label: '🇨🇦 CAD', symbol: 'C$' },
  { value: 'INR', label: '🇮🇳 INR', symbol: '₹' }
];

const platforms = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: '📷', 
    color: '#E1306C',
    svg: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: '🎵', 
    color: '#000000',
    svg: '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>'
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: '✈️', 
    color: '#0088CC',
    svg: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>'
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: '▶️', 
    color: '#FF0000',
    svg: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: '👍', 
    color: '#1877F2',
    svg: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>'
  },
  { 
    id: 'twitter', 
    name: 'Twitter / X', 
    icon: '🐦', 
    color: '#1DA1F2',
    svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>'
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: '💬', 
    color: '#5865F2',
    svg: '<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>'
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: '💬', 
    color: '#25D366',
    svg: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>'
  },
  { 
    id: 'snapchat', 
    name: 'Snapchat', 
    icon: '👻', 
    color: '#FFFC00',
    svg: '<path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3 0 .605-.153.908-.313.417-.22.849-.447 1.376-.447.4 0 .753.146 1.022.423.45.458.529 1.157.303 1.702-.374.909-1.49 1.52-2.014 1.843-.08.05-.226.122-.485.264a.562.562 0 0 0-.155.125c-.015.015-.045.061-.03.11.016.053.05.135.124.197.024.023.043.05.06.078.062.107.132.227.217.352.127.19.27.405.556.711.245.262.577.663.925 1.067.682.78 1.358 1.567 1.358 2.445 0 .877-.952 1.322-2.19 1.544-.706.127-1.53.2-2.42.2-.172 0-.34-.012-.507-.012-.36 0-.72.024-1.055.05-.514.04-.993.076-1.404.076-.12 0-.237-.007-.352-.007C11.644 23.97 8.915 24 8.508 24c-.345 0-.673-.012-1.003-.024-.488-.017-1.003-.035-1.511-.035-.422 0-.826.05-1.234.05-.562 0-1.126-.05-1.588-.124-.826-.123-1.455-.296-1.89-.595C.644 22.948.5 22.636.5 22.27c0-.917.676-1.704 1.358-2.445.348-.404.68-.805.925-1.067.286-.306.43-.52.556-.711.085-.125.155-.245.217-.352.017-.028.036-.055.06-.078.074-.062.108-.144.124-.197.015-.049-.015-.095-.03-.11a.562.562 0 0 0-.155-.125c-.259-.142-.405-.214-.485-.264-.524-.323-1.64-.934-2.014-1.843-.226-.545-.147-1.244.303-1.702.269-.277.622-.423 1.022-.423.527 0 .959.227 1.376.447.303.16.608.313.908.313.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.634.299-4.847C7.859 1.069 11.216.793 12.206.793z"/>'
  }
];

// Target type icons
const targetTypeIcons: { [key: string]: string } = {
  profile: '👤',
  business: '🏢',
  post: '📝',
  story: '📖',
  reels: '🎬',
  livestream: '📡',
  comment: '💬',
  igtv: '📺',
  video: '🎥',
  group: '👥',
  channel: '📢',
  user: '👤',
  message: '✉️',
  tweet: '🐦',
  reply: '↩️',
  space: '🎙️',
  server: '🖥️',
  dm: '💌'
};

interface PendingPayment {
  crypto: string;
  network: string | null;
  address: string;
  amount: string;
  paymentId: string;
  timestamp: number;
  status: string;
  packageType: 'full' | 'single'; // Track which package this payment is for
}

export const PaymentButtons: React.FC<PaymentButtonsProps> = ({ currency, selectedTransaction, onTransactionHandled }) => {
  const { t, convertPrice } = useLanguage();
  const [showCryptoSelect, setShowCryptoSelect] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(null);
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentQrUrl, setPaymentQrUrl] = useState<string>(''); // Payment QR URL
  const [paymentId, setPaymentId] = useState<string>(''); // Payment ID for status checking
  const [paymentStatus, setPaymentStatus] = useState<string>(''); // Current payment status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pendingPayments, setPendingPayments] = useState<{ [key: string]: PendingPayment }>({});
  const [showQR, setShowQR] = useState(false);
  
  // Single Ban states
  const [showSingleReportModal, setShowSingleReportModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTargetType, setSelectedTargetType] = useState<string | null>(null);
  const [isSingleBanPayment, setIsSingleBanPayment] = useState(false); // Track if payment is for single ban
  const currentPackageTypeRef = useRef<'full' | 'single'>('full'); // Ref to track current package type for reliable access
  const [isLoadingExistingPayment, setIsLoadingExistingPayment] = useState(false); // Track if we're loading an existing payment
  const [showCloseConfirm, setShowCloseConfirm] = useState(false); // Confirmation modal
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // Cancel payment confirmation modal
  
  // Card payment states
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [cardEmail, setCardEmail] = useState('');
  const [cardCurrency, setCardCurrency] = useState('USD');
  const [cardProvider, setCardProvider] = useState('hosted');
  const [cardPaymentLink, setCardPaymentLink] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [loadingRates, setLoadingRates] = useState(false);

  const usdPrice = 299.99;
  const singleBanPrice = 99.99;

  // Load pending payments from localStorage on mount
  useEffect(() => {
    const username = localStorage.getItem('rektnow_auth') 
      ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
      : 'guest';
    
    const savedPayments = localStorage.getItem(`rektnow_pending_payments_${username}`);
    if (savedPayments) {
      try {
        const parsed = JSON.parse(savedPayments);
        // Clean up old payments (older than 24 hours)
        const now = Date.now();
        const cleaned: { [key: string]: PendingPayment } = {};
        Object.entries(parsed).forEach(([key, payment]: [string, any]) => {
          if ((now - payment.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
            cleaned[key] = payment as PendingPayment;
          }
        });
        setPendingPayments(cleaned);
      } catch (e) {
        console.error('Failed to load pending payments:', e);
      }
    }
  }, []);

  // Save pending payments to localStorage
  const savePendingPayment = (crypto: string, network: string | null, packageType: 'full' | 'single', payment: PendingPayment) => {
    const username = localStorage.getItem('rektnow_auth') 
      ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
      : 'guest';
    
    const key = network ? `${crypto}_${network}_${packageType}` : `${crypto}_${packageType}`;
    const updated = { ...pendingPayments, [key]: payment };
    setPendingPayments(updated);
    localStorage.setItem(`rektnow_pending_payments_${username}`, JSON.stringify(updated));
  };

  // Check if there's a pending payment for this crypto/network
  const getPendingPayment = (crypto: string, network: string | null, packageType: 'full' | 'single'): PendingPayment | null => {
    const key = network ? `${crypto}_${network}_${packageType}` : `${crypto}_${packageType}`;
    return pendingPayments[key] || null;
  };

  // Cancel/Delete a pending payment
  const cancelPendingPayment = (crypto: string, network: string | null, packageType: 'full' | 'single') => {
    const username = localStorage.getItem('rektnow_auth') 
      ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
      : 'guest';
    
    const key = network ? `${crypto}_${network}_${packageType}` : `${crypto}_${packageType}`;
    const payment = pendingPayments[key];
    
    if (payment) {
      // Update status to cancelled instead of deleting
      payment.status = 'cancelled';
      const updated = { ...pendingPayments, [key]: payment };
      setPendingPayments(updated);
      localStorage.setItem(`rektnow_pending_payments_${username}`, JSON.stringify(updated));
    }
  };
  
  // Format price using the same convertPrice function as PricingCard
  const formatButtonPrice = (usdAmount: number): string => {
    const converted = convertPrice(usdAmount);
    return `${currency.symbol}${converted}`;
  };

  const NOWPAYMENTS_API_KEY = 'WDTQ64V-WMN4M4M-JNCK2PM-1QWZYBH';
  // Use backend proxy for production
  const IS_DEVELOPMENT = window.location.hostname === 'localhost';
  const BASE_URL = IS_DEVELOPMENT 
    ? 'http://localhost:8000/api/nowpayments'  // Dev: Local backend proxy
    : 'https://rektnow.wtf/api/nowpayments';  // Production: Backend proxy

  const handlePayClick = () => {
    setShowCryptoSelect(true);
  };

  // Fetch exchange rates (from paynsm)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setLoadingRates(true);
      
      // API'ler sırasıyla denenecek - Tamamen ücretsiz ve kayıt gerektirmeyenler
      const apis = [
        {
          name: 'ExchangeRate-API',
          url: 'https://api.exchangerate-api.com/v4/latest/USD',
          parser: (data: any) => data.rates
        },
        {
          name: 'ExchangeRate.host',
          url: 'https://api.exchangerate.host/latest?base=USD',
          parser: (data: any) => data.rates
        }
      ];

      for (const api of apis) {
        try {
          console.log(`Trying ${api.name}...`);
          const response = await fetch(api.url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          const rates = api.parser(data);
          
          if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
            console.log(`✅ ${api.name} başarılı`, rates);
            setExchangeRates(rates);
            setLoadingRates(false);
            return; // Başarılı olunca döngüden çık
          } else {
            throw new Error('Invalid rates data');
          }
        } catch (error) {
          console.error(`❌ ${api.name} hatası:`, error);
          continue; // Bir sonraki API'yi dene
        }
      }

      // Tüm API'ler başarısız olursa gerçek 2025 kurlarını kullan
      console.log('⚠️ Tüm API\'ler başarısız, fallback kurlar kullanılıyor');
      setExchangeRates({
        USD: 1,
        EUR: 0.93,     // 1 USD = 0.93 EUR
        CAD: 1.44,     // 1 USD = 1.44 CAD
        INR: 84.50     // 1 USD = 84.50 INR
      });
      
      setLoadingRates(false);
    };

    fetchExchangeRates();
  }, []);

  // Handle selected transaction from Transactions modal
  useEffect(() => {
    if (selectedTransaction && onTransactionHandled) {
      console.log('Opening transaction from Transactions modal:', selectedTransaction);
      
      // Find the crypto and network (case-insensitive)
      const crypto = cryptoOptions.find(c => c.id.toLowerCase() === selectedTransaction.crypto.toLowerCase());
      if (!crypto) {
        console.error('Crypto not found:', selectedTransaction.crypto);
        onTransactionHandled();
        return;
      }

      // Set package type
      const isFullPanel = selectedTransaction.packageType === 'full';
      setIsSingleBanPayment(!isFullPanel);
      currentPackageTypeRef.current = selectedTransaction.packageType;

      // Find network if exists
      let network: NetworkOption | null = null;
      if (selectedTransaction.network && crypto.networks) {
        network = crypto.networks.find(n => n.id === selectedTransaction.network) || null;
      }

      // Load the payment
      setSelectedCrypto(crypto);
      setSelectedNetwork(network);
      setPaymentAddress(selectedTransaction.address);
      setPaymentAmount(selectedTransaction.amount);
      setPaymentId(selectedTransaction.paymentId);
      setPaymentStatus(selectedTransaction.status);
      setPaymentQrUrl(''); // Will use address for QR
      setIsLoadingExistingPayment(true);
      
      setShowPaymentPage(true);
      setShowCryptoSelect(false);
      setShowNetworkSelect(false);
      setLoading(false);
      setError('');

      // Mark as handled
      onTransactionHandled();
    }
  }, [selectedTransaction, onTransactionHandled]);

  const handleCryptoClick = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    
    // If crypto has multiple networks, show network selector
    if (crypto.networks && crypto.networks.length > 0) {
      setShowCryptoSelect(false);
      setShowNetworkSelect(true);
    } else {
      // Single chain, proceed directly - use ref for current package type
      handleCryptoSelect(crypto, null, currentPackageTypeRef.current);
    }
  };

  const handleNetworkClick = (network: NetworkOption) => {
    setSelectedNetwork(network);
    if (selectedCrypto) {
      // Use ref for current package type
      handleCryptoSelect(selectedCrypto, network, currentPackageTypeRef.current);
    }
  };

  const handleCryptoSelect = async (crypto: CryptoOption, network: NetworkOption | null, forcedPackageType?: 'full' | 'single') => {
    console.log('=== PAYMENT FLOW START ===');
    console.log('Selected crypto:', crypto);
    console.log('Selected network:', network);

    // Check if there's already a pending payment for this crypto/network/package combination
    const packageType = forcedPackageType || (isSingleBanPayment ? 'single' : 'full');
    console.log('Package type:', packageType, '(forced:', forcedPackageType, ', state:', isSingleBanPayment, ')');
    const existingPayment = getPendingPayment(crypto.id, network?.id || null, packageType);
    
    // Only show existing payment if it's not cancelled or finished/failed
    if (existingPayment && existingPayment.status !== 'cancelled' && existingPayment.status !== 'finished' && existingPayment.status !== 'failed' && existingPayment.status !== 'rejected') {
      console.log('⚠️ Found existing pending payment for this package:', existingPayment);
      
      // Mark that we're loading an existing payment
      setIsLoadingExistingPayment(true);
      
      // Load existing payment details
      setSelectedCrypto(crypto);
      setSelectedNetwork(network);
      setPaymentAddress(existingPayment.address);
      setPaymentAmount(existingPayment.amount);
      setPaymentId(existingPayment.paymentId);
      setPaymentStatus(existingPayment.status);
      setPaymentQrUrl(''); // Will use address for QR
      
      setShowCryptoSelect(false);
      setShowNetworkSelect(false);
      setShowPaymentPage(true);
      setLoading(false);
      setError(''); // Clear any errors - this is NOT an error, just showing existing payment
      return;
    }
    
    // If we reach here, it's a NEW payment
    setIsLoadingExistingPayment(false);
    
    setShowCryptoSelect(false);
    setShowNetworkSelect(false);
    setShowPaymentPage(true);
    setLoading(true);
    setError('');
    setShowQR(false); // Reset QR visibility

    // Determine price based on whether it's single ban or full panel
    const paymentPrice = isSingleBanPayment ? singleBanPrice : usdPrice;
    console.log('Payment price:', paymentPrice);
    console.log('Is single ban payment:', isSingleBanPayment);

    try {
      // Determine pay currency based on network selection
      let payCurrency: string;
      
      if (network) {
        // Use network-specific code
        payCurrency = network.code;
      } else {
        // Single-chain cryptos - use default mapping
        const currencyMap: { [key: string]: string } = {
          'btc': 'btc',
          'eth': 'eth',
          'bnb': 'bnbbsc',
          'sol': 'sol',
          'trx': 'trx',
          'xrp': 'xrp',
          'ton': 'ton'
        };
        payCurrency = currencyMap[crypto.id] || crypto.symbol.toLowerCase();
      }
      console.log('Pay currency:', payCurrency);
      console.log('API Key:', NOWPAYMENTS_API_KEY);
      console.log('Base URL:', BASE_URL);
      console.log('Is Development:', IS_DEVELOPMENT);

      // Check if it's a stablecoin (USDT/USDC)
      const isStablecoin = payCurrency.toLowerCase().includes('usdt') || payCurrency.toLowerCase().includes('usdc');
      
      let cryptoAmount: string;
      
      if (isStablecoin) {
        // For stablecoins, amount is 1:1 with USD
        cryptoAmount = paymentPrice.toString();
        console.log('Stablecoin detected, using fixed amount:', cryptoAmount);
        setPaymentAmount(cryptoAmount);
      } else {
        // For other cryptos, get estimate from API
        const estimateUrl = `${BASE_URL}/estimate?amount=${paymentPrice}&currency_from=usd&currency_to=${payCurrency}`;
        console.log('Estimate URL:', estimateUrl);
        
        const estimateResponse = await fetch(estimateUrl, {
          method: 'GET'
        });

        console.log('Estimate response status:', estimateResponse.status);
        
        if (!estimateResponse.ok) {
          const errorText = await estimateResponse.text();
          console.error('Estimate error:', errorText);
          throw new Error(`Payment API Error (${estimateResponse.status}): ${errorText}`);
        }

        const estimateData = await estimateResponse.json();
        cryptoAmount = estimateData.estimated_amount;
        console.log('Crypto amount from API:', cryptoAmount);
        setPaymentAmount(cryptoAmount);
      }

      // Step 2: Create payment
      const paymentBody = {
        price_amount: paymentPrice,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: `ORDER-${Date.now()}`,
        order_description: isSingleBanPayment 
          ? `RektNow Single Ban - ${selectedPlatform} ${selectedTargetType}`
          : 'RektNow Panel Access',
        ipn_callback_url: window.location.origin + '/api/payment-callback',
        success_url: window.location.origin + '/success',
        cancel_url: window.location.origin
      };
      console.log('Payment body:', paymentBody);

      const paymentResponse = await fetch(`${BASE_URL}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentBody),
      });

      console.log('Payment response status:', paymentResponse.status);
      
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Payment error:', errorText);
        throw new Error(`Payment Processing Error (${paymentResponse.status}): ${errorText}`);
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment data:', paymentData);
      console.log('Full API Response:', JSON.stringify(paymentData, null, 2));
      
      const address = paymentData.pay_address;
      const currentPaymentId = paymentData.payment_id || paymentData.id || 'N/A';
      setPaymentAddress(address);
      setPaymentId(currentPaymentId);
      setPaymentStatus(paymentData.payment_status || 'waiting');

      // Save this payment to prevent duplicates
      const packageType = isSingleBanPayment ? 'single' : 'full';
      savePendingPayment(crypto.id, network?.id || null, packageType, {
        crypto: crypto.id,  // Use crypto.id (lowercase) instead of crypto.symbol
        network: network?.id || null,  // Use network.id instead of network.name
        address: address,
        amount: cryptoAmount,
        paymentId: currentPaymentId,
        timestamp: Date.now(),
        status: paymentData.payment_status || 'waiting',
        packageType: packageType
      });
      
      // Check if payment provider provides QR code URL
      if (paymentData.qr_code_url) {
        setPaymentQrUrl(paymentData.qr_code_url);
        console.log('QR Code URL from API:', paymentData.qr_code_url);
      } else if (paymentData.invoice_url) {
        setPaymentQrUrl(paymentData.invoice_url);
        console.log('Invoice URL from API:', paymentData.invoice_url);
      } else {
        console.log('No QR URL in API response, will use address');
        setPaymentQrUrl('');
      }
      
      console.log('=== PAYMENT FLOW SUCCESS ===');

      // Send Telegram notification about payment creation
      try {
        const username = localStorage.getItem('rektnow_auth') 
          ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
          : undefined;
        
        await sendPaymentCreatedNotification({
          username,
          amount: paymentData.pay_amount || cryptoAmount,
          crypto: crypto.symbol,
          network: network?.name,
          address,
          paymentId: currentPaymentId,
          orderDescription: paymentBody.order_description,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to send payment created notification:', err);
      }

    } catch (err) {
      console.error('=== PAYMENT FLOW ERROR ===');
      console.error('Error details:', err);
      setError(`Payment error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check payment status periodically
  const checkPaymentStatus = async (paymentIdToCheck: string) => {
    try {
      const statusUrl = `${BASE_URL}/payment/${paymentIdToCheck}`;
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.payment_status;
        
        // If status changed, send notification
        if (newStatus && newStatus !== paymentStatus) {
          console.log(`Payment status changed: ${paymentStatus} → ${newStatus}`);
          setPaymentStatus(newStatus);

          // Update saved payment status
          if (selectedCrypto) {
            const packageType = isSingleBanPayment ? 'single' : 'full';
            const key = selectedNetwork?.id ? `${selectedCrypto.id}_${selectedNetwork.id}_${packageType}` : `${selectedCrypto.id}_${packageType}`;
            const existing = pendingPayments[key];
            if (existing) {
              existing.status = newStatus;
              savePendingPayment(selectedCrypto.id, selectedNetwork?.id || null, packageType, existing);
            }

            // If payment is finished, remove from pending
            if (newStatus === 'finished' || newStatus === 'failed' || newStatus === 'rejected') {
              const username = localStorage.getItem('rektnow_auth') 
                ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
                : 'guest';
              const updated = { ...pendingPayments };
              delete updated[key];
              setPendingPayments(updated);
              localStorage.setItem(`rektnow_pending_payments_${username}`, JSON.stringify(updated));
            }
          }
          
          // Send Telegram notification about status change
          try {
            await sendPaymentStatusNotification({
              paymentId: paymentIdToCheck,
              status: newStatus,
              amount: paymentAmount,
              crypto: selectedCrypto?.symbol || 'N/A',
              network: selectedNetwork?.name,
              timestamp: new Date().toISOString()
            });
          } catch (err) {
            console.error('Failed to send payment status notification:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  // Poll payment status every 30 seconds when payment page is shown
  useEffect(() => {
    if (showPaymentPage && paymentId && paymentAddress) {
      // Check immediately
      checkPaymentStatus(paymentId);
      
      // Then check every 30 seconds
      const interval = setInterval(() => {
        checkPaymentStatus(paymentId);
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [showPaymentPage, paymentId, paymentAddress]);

  const handleBackToCryptos = () => {
    setShowPaymentPage(false);
    setShowCryptoSelect(true);
    setShowQR(false); // Reset QR when going back
  };

  // Card payment handler (using PayGate.to API from paynsm)
  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardLoading(true);
    setCardError('');
    setCardPaymentLink('');

    try {
      // Validation
      if (!cardEmail || !cardProvider) {
        setCardError('Please fill out all fields.');
        setCardLoading(false);
        return;
      }

      // Get payment price (based on whether it's single ban or panel access)
      const paymentPrice = isSingleBanPayment ? singleBanPrice : usdPrice;
      
      // Add 5% card processing fee
      const priceWithFee = Math.round(paymentPrice * 1.05 * 100) / 100;
      
      // Convert to selected currency
      const convertPrice = (usdPrice: number, targetCurrency: string): number => {
        if (targetCurrency === 'USD') return usdPrice;
        const rate = exchangeRates[targetCurrency];
        if (!rate) return usdPrice;
        return Math.round(usdPrice * rate * 100) / 100; // 2 decimal places
      };
      
      const amountInCurrency = convertPrice(priceWithFee, cardCurrency);

      // Check minimum amount for provider
      const selectedProviderData = cardProviders.find(p => p.value === cardProvider);
      if (selectedProviderData && amountInCurrency < selectedProviderData.minAmount) {
        setCardError(`Minimum amount for ${selectedProviderData.label} is $${selectedProviderData.minAmount}`);
        setCardLoading(false);
        return;
      }

      // Currency restrictions
      if (selectedProviderData?.usdOnly && cardCurrency !== 'USD') {
        setCardError(`${selectedProviderData.label} supports USD currency only.`);
        setCardLoading(false);
        return;
      }
      if (selectedProviderData?.inrOnly && cardCurrency !== 'INR') {
        setCardError(`${selectedProviderData.label} supports INR currency only.`);
        setCardLoading(false);
        return;
      }
      if (selectedProviderData?.cadOnly && cardCurrency !== 'CAD') {
        setCardError(`${selectedProviderData.label} supports CAD currency only.`);
        setCardLoading(false);
        return;
      }

      // Generate tracking ID with rektnow.wtf callback
      const paymentTrackingId = `${Date.now()}_${Math.floor(Math.random() * 9000000) + 1000000}`;
      const callbackUrl = `${window.location.origin}/api/paygate-callback?payment=${paymentTrackingId}`;
      const callback = encodeURIComponent(callbackUrl);

      // API call to get encoded address using fixed merchant wallet
      const response = await fetch(`https://api.paygate.to/control/wallet.php?address=${MERCHANT_WALLET}&callback=${callback}`);
      const data = await response.json();

      if (data && data.address_in) {
        const addressIn = data.address_in;
        const customerEmail = encodeURIComponent(cardEmail);
        
        // Generate payment link based on provider (using Cloudflare Worker domain)
        const baseUrl = cardProvider === 'hosted' 
          ? 'https://payment.rektnow.wtf/pay.php'
          : 'https://payment.rektnow.wtf/process-payment.php';
        
        const generatedPaymentLink = `${baseUrl}?address=${addressIn}&amount=${amountInCurrency}&provider=${cardProvider}&email=${customerEmail}&currency=${cardCurrency}`;

        setCardPaymentLink(generatedPaymentLink);
        
        // Open payment link in new tab
        window.open(generatedPaymentLink, '_blank');
        
        // Send Telegram notification
        try {
          const username = localStorage.getItem('rektnow_auth') 
            ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
            : undefined;
          
          await sendPaymentCreatedNotification({
            username,
            amount: `${amountInCurrency} ${cardCurrency}`,
            crypto: `Card Payment (${cardCurrency})`,
            network: cardProvider,
            address: addressIn,
            paymentId: paymentTrackingId,
            orderDescription: isSingleBanPayment 
              ? `RektNow Single Ban - Card Payment`
              : 'RektNow Panel Access - Card Payment',
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error('Failed to send payment notification:', err);
        }
      } else {
        setCardError('Invalid payout wallet. Please try again.');
      }
    } catch (error) {
      console.error('Card payment error:', error);
      setCardError('An error occurred while processing the request.');
    } finally {
      setCardLoading(false);
    }
  };

  const handleBackToButton = () => {
    // If payment page is shown with address, show confirmation modal
    if (showPaymentPage && paymentAddress) {
      setShowCloseConfirm(true);
      return;
    }
    
    // Otherwise close immediately
    closePaymentModal();
  };

  const closePaymentModal = () => {
    setShowPaymentPage(false);
    setShowCryptoSelect(false);
    setSelectedCrypto(null);
    setSelectedNetwork(null);
    setShowQR(false);
    setIsSingleBanPayment(false);
    currentPackageTypeRef.current = 'full'; // Reset to full
    setIsLoadingExistingPayment(false); // Reset existing payment flag
    setShowCloseConfirm(false);
    setShowCardPayment(false);
    setCardError('');
    setCardPaymentLink('');
    setError(''); // Clear errors when closing
    document.body.style.overflow = '';
  };

  // Cleanup on unmount and lock scroll when modal opens
  useEffect(() => {
    if (showCryptoSelect || showNetworkSelect || showPaymentPage || showCardPayment) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCryptoSelect, showNetworkSelect, showPaymentPage, showCardPayment]);

  return (
    <div style={{ listStyle: 'none' }}>
      {/* Payment Options Box */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.03), rgba(59, 130, 246, 0.03))',
        border: '1px solid rgba(168, 85, 247, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '6px'
          }}>Choose Your Plan</h3>
          <p style={{
            fontSize: '0.85rem',
            color: '#888',
            margin: 0
          }}>Select the plan that fits your needs</p>
        </div>

        {/* Panel Access Option */}
        <div style={{ marginBottom: '16px' }}>
          <button className="pay-btn primary-action nowpayments-trigger" onClick={handlePayClick} style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            padding: '16px 32px'
          }}>
            <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
            <span>
              <span>{t.payBtn}</span> <span className="amount-display">{formatButtonPrice(usdPrice)}</span>
            </span>
          </button>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            marginTop: '12px',
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'rgba(34, 197, 94, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>↳</span>
              <span style={{ fontWeight: 400 }}>One-time payment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>↳</span>
              <span style={{ fontWeight: 400 }}>Lifetime panel access</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>↳</span>
              <span style={{ fontWeight: 400 }}>Unlimited free reports on all platforms</span>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div style={{ 
          textAlign: 'center', 
          margin: '20px 0', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)'
          }}></div>
          <span style={{ 
            padding: '0 15px', 
            color: '#666', 
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>or</span>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)'
          }}></div>
        </div>
        
        {/* Single Report Option */}
        <div>
          <button className="pay-btn secondary-action" onClick={() => setShowSingleReportModal(true)} style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            padding: '16px 32px'
          }}>
            <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            <span>
              <span>{t.btnSingleReport}</span> <span className="amount-display">{formatButtonPrice(singleBanPrice)}</span>
            </span>
          </button>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            marginTop: '12px',
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'rgba(59, 130, 246, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>↳</span>
              <span style={{ fontWeight: 400 }}>Price for one successful ban</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>↳</span>
              <span style={{ fontWeight: 400 }}>No panel access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info - Outside Box */}
      <div style={{
        textAlign: 'center',
        marginTop: '16px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <svg style={{ width: '18px', height: '18px', opacity: 0.9, flexShrink: 0, color: '#a855f7' }} viewBox="0 0 512 512" fill="currentColor">
          <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"/>
        </svg>
        <span style={{ textAlign: 'center' }}>
          Pay with <span style={{ color: '#F7931A', fontWeight: 600 }}>Cryptocurrency</span> or <span style={{ color: '#667eea', fontWeight: 600 }}>Credit/Debit Card</span>
        </span>
      </div>

      {/* Divider */}
      <div style={{
        margin: '24px 0',
        height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)'
      }}></div>

      {/* Payment Modal - Connect Wallet Style */}
      {(showCryptoSelect || showNetworkSelect || showPaymentPage || showCardPayment) && (
        <div className="payment-modal-overlay" onClick={() => {
          // If payment is active, show confirmation modal
          if (showPaymentPage && paymentAddress) {
            setShowCloseConfirm(true);
            return;
          }
          closePaymentModal();
        }}>
          <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="payment-modal-header">
              <div className="payment-modal-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              </div>
              <h2 className="payment-modal-title">
                {showCryptoSelect 
                  ? t.paymentModalTitle 
                  : showNetworkSelect 
                    ? `Select ${selectedCrypto?.symbol || 'Crypto'} Network`
                    : showCardPayment
                      ? t.payWithCard
                      : `${selectedCrypto?.name}${selectedNetwork ? ` - ${selectedNetwork.name}` : ''}`
                }
              </h2>
              <button className="payment-modal-close" onClick={(e) => {
                e.stopPropagation();
                if (showNetworkSelect) {
                  // From network select, go back to crypto select
                  setShowNetworkSelect(false);
                  setShowCryptoSelect(true);
                } else if (showCardPayment) {
                  // From card payment, go back to crypto select
                  setShowCardPayment(false);
                  setShowCryptoSelect(true);
                  setCardError('');
                } else {
                  handleBackToButton();
                }
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Crypto Selection */}
            {showCryptoSelect && (
              <div className="payment-modal-body">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.id}
                    className="payment-wallet-option"
                    onClick={() => handleCryptoClick(crypto)}
                  >
                    <div className="payment-wallet-icon">
                      <img src={crypto.logoUrl} alt={crypto.name} />
                    </div>
                    <span className="payment-wallet-name">{crypto.name}</span>
                    <span className="payment-wallet-symbol">{crypto.symbol}</span>
                  </button>
                ))}
                
                {/* Divider */}
                <div style={{ 
                  margin: '20px 0', 
                  textAlign: 'center', 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)'
                  }}></div>
                  <span style={{ 
                    padding: '0 15px', 
                    color: '#888', 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>or</span>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)'
                  }}></div>
                </div>
                
                {/* Pay with Card Button */}
                <button
                  className="payment-wallet-option"
                  onClick={() => {
                    setShowCryptoSelect(false);
                    setShowCardPayment(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    marginBottom: '0'
                  }}
                >
                  <div className="payment-wallet-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <svg viewBox="0 0 24 24" fill="#fff" style={{ width: '24px', height: '24px' }}>
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <span className="payment-wallet-name" style={{ color: '#fff', fontWeight: 600 }}>{t.payWithCard}</span>
                  <span className="payment-wallet-symbol" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Visa, Mastercard, Apple Pay</span>
                </button>
              </div>
            )}

            {/* Network Selection */}
            {showNetworkSelect && selectedCrypto && selectedCrypto.networks && (
              <div className="payment-modal-body">
                {selectedCrypto.networks.map((network) => (
                  <button
                    key={network.id}
                    className="payment-wallet-option payment-network-option"
                    onClick={() => handleNetworkClick(network)}
                  >
                    <div className="payment-network-info">
                      <span className="payment-network-name">{network.name}</span>
                      <span className="payment-network-fee" style={{ color: network.fee === 'Low' ? '#22c55e' : '#ef4444' }}>
                        Fee: {network.fee}
                      </span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </button>
                ))}
                <button className="payment-back-btn" onClick={() => {
                  setShowNetworkSelect(false);
                  setShowCryptoSelect(true);
                }}>
                  ← Back to Cryptocurrencies
                </button>
              </div>
            )}
            
            {/* Card Payment Form */}
            {showCardPayment && (
              <div className="payment-modal-body" style={{ padding: '20px' }}>
                {/* Warning Banner */}
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                    <span style={{ color: '#fbbf24', fontSize: '14px', flexShrink: 0 }}>⚠️</span>
                    <div style={{ color: '#fde68a' }}>
                      {t.cardPaymentWarning}
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleCardPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Email Input */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#e5e7eb', fontSize: '0.875rem', fontWeight: 600 }}>
                      {t.cardPaymentEmail}
                    </label>
                    <input
                      type="email"
                      value={cardEmail}
                      onChange={(e) => setCardEmail(e.target.value)}
                      required
                      placeholder="customer@example.com"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  {/* Currency Select */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#e5e7eb', fontSize: '0.875rem', fontWeight: 600 }}>
                      {t.cardPaymentCurrency}
                    </label>
                    <select
                      value={cardCurrency}
                      onChange={(e) => setCardCurrency(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {cardCurrencies.map((curr) => (
                        <option key={curr.value} value={curr.value} style={{ background: '#1a1a1a' }}>
                          {curr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Provider Select */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#e5e7eb', fontSize: '0.875rem', fontWeight: 600 }}>
                      {t.cardPaymentProvider}
                    </label>
                    <select
                      value={cardProvider}
                      onChange={(e) => setCardProvider(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {cardProviders.map((provider) => (
                        <option key={provider.value} value={provider.value} style={{ background: '#1a1a1a' }}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Info Box */}
                  <div style={{
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#93c5fd'
                  }}>
                    {(() => {
                      const basePrice = isSingleBanPayment ? singleBanPrice : usdPrice;
                      const priceWithFee = Math.round(basePrice * 1.05 * 100) / 100;
                      const convertPrice = (usdPrice: number, targetCurrency: string): number => {
                        if (targetCurrency === 'USD') return usdPrice;
                        const rate = exchangeRates[targetCurrency];
                        if (!rate) return usdPrice;
                        return Math.round(usdPrice * rate * 100) / 100;
                      };
                      const amountInCurrency = convertPrice(priceWithFee, cardCurrency);
                      const basePriceInCurrency = convertPrice(basePrice, cardCurrency);
                      const currencySymbol = cardCurrencies.find(c => c.value === cardCurrency)?.symbol || cardCurrency;
                      
                      return (
                        <>
                          💳 {t.cardPaymentTotal}: <strong>{loadingRates ? 'Loading...' : `${currencySymbol}${amountInCurrency} ${cardCurrency}`}</strong>
                          <br />
                          <span style={{ fontSize: '0.7rem', color: '#7dd3fc' }}>
                            ({t.cardPaymentBase}: {currencySymbol}{basePriceInCurrency} {cardCurrency} + 5% {t.cardPaymentFee})
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Error Message */}
                  {cardError && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#fca5a5'
                    }}>
                      {cardError}
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {cardPaymentLink && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#86efac'
                    }}>
                      ✅ {t.cardPaymentSuccess}
                    </div>
                  )}
                  
                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={cardLoading}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: cardLoading ? '#4b5563' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: cardLoading ? 'not-allowed' : 'pointer',
                        opacity: cardLoading ? 0.6 : 1
                      }}
                    >
                      {cardLoading ? `⏳ ${t.cardPaymentProcessing}` : `💳 ${t.cardPaymentGenerate}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCardPayment(false);
                        setShowCryptoSelect(true);
                        setCardError('');
                      }}
                      style={{
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ← {t.cardPaymentBack}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment Details */}
            {showPaymentPage && selectedCrypto && (
              <div className="payment-modal-body payment-details">
                {/* Existing Payment Info Banner - Only show if we loaded an existing payment */}
                {isLoadingExistingPayment && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(96, 165, 250, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      fontSize: '1.1rem',
                      flexShrink: 0
                    }}>ℹ️</div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#93c5fd',
                      lineHeight: '1.4'
                    }}> <strong style={{ color: '#60a5fa' }}>{t.paymentActiveTitle}</strong> - {t.paymentActiveDesc}
                    </div>
                  </div>
                )}

                {/* Network Badge */}
                {selectedNetwork && (
                  <div className="payment-network-badge">
                    <span style={{ fontWeight: 700 }}>{selectedNetwork.name}</span>
                    <span className="network-fee-badge" style={{ 
                      background: selectedNetwork.fee === 'Low' ? '#22c55e20' : '#ef444420',
                      color: selectedNetwork.fee === 'Low' ? '#22c55e' : '#ef4444',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      Fee: {selectedNetwork.fee}
                    </span>
                  </div>
                )}

                <div className="payment-amount-box">
                  <div className="payment-amount-label">{t.paymentAmountLabel}</div>
                  <div className="payment-amount-value">
                    {loading ? '...' : paymentAmount || '...'} {selectedCrypto.symbol}
                  </div>
                  <div className="payment-amount-usd">${isSingleBanPayment ? singleBanPrice : usdPrice} USD</div>
                </div>

                <div className="payment-address-container">
                  {loading ? (
                    <div className="payment-address-loading">{t.paymentGenerating}</div>
                  ) : !paymentAddress ? (
                    <div className="payment-address-error">{t.paymentError}: {error || 'Address not available'}</div>
                  ) : (
                    <>
                      {/* Address Section */}
                      <div className="payment-address-label">{t.paymentAddressLabel}</div>
                      <div className="payment-address-box">
                        <code className="payment-address-text">{paymentAddress || 'Generating...'}</code>
                      </div>
                      
                      {/* Status Information */}
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: '#666', 
                        padding: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        margin: '16px 0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div className="payment-status-spinner" style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            border: '2px solid currentColor',
                            borderTop: '2px solid transparent',
                            animation: paymentStatus === 'waiting' || paymentStatus === 'processing' ? 'spin 1s linear infinite' : 'none',
                            color: paymentStatus === 'finished' ? '#22c55e' : 
                                 paymentStatus === 'failed' || paymentStatus === 'rejected' ? '#ef4444' : 
                                 paymentStatus === 'sending' ? '#3b82f6' : 
                                 '#f59e0b'
                          }}></div>
                          <span style={{ fontWeight: 500 }}>
                            {paymentStatus === 'waiting' ? t.paymentWaitingFor : 
                             paymentStatus === 'processing' ? t.paymentProcessing : 
                             paymentStatus === 'sending' ? t.paymentSending : 
                             paymentStatus === 'finished' ? t.paymentConfirmed : 
                             paymentStatus === 'failed' ? t.paymentFailed : 
                             paymentStatus === 'rejected' ? t.paymentRejected : 
                             paymentStatus || t.paymentCheckingStatus}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div>{t.paymentStatusUpdates}</div>
                          <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '4px' }}>
                            {t.paymentLastChecked} {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        className="payment-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentAddress);
                          alert(t.paymentCopied);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                        {t.paymentCopyBtn}
                      </button>

                      {/* Toggle QR Button */}
                      <button 
                        className="payment-qr-toggle-btn"
                        onClick={() => setShowQR(!showQR)}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2z"/>
                        </svg>
                        {showQR ? t.paymentHideQR : t.paymentShowQR}
                      </button>

                      {/* QR Code Section (Collapsible) */}
                      {showQR && (
                        <div className="payment-qr-section">
                          <div className="payment-qr-wrapper">
                            {paymentQrUrl ? (
                              <img 
                                src={paymentQrUrl} 
                                alt="Payment QR Code"
                                style={{
                                  width: '200px',
                                  height: '200px',
                                  borderRadius: '12px'
                                }}
                              />
                            ) : (
                              <QRCodeSVG 
                                value={paymentAddress}
                                size={200}
                                level="H"
                                includeMargin={true}
                                style={{
                                  background: 'white',
                                  padding: '12px',
                                  borderRadius: '12px'
                                }}
                              />
                            )}
                          </div>
                          <p className="payment-qr-hint">Scan with your {selectedCrypto.name} wallet</p>
                          <div className="payment-qr-debug">
                            <small style={{color: '#666', fontSize: '0.7rem'}}>
                              {paymentQrUrl ? 'Secure Payment QR' : 'Generated QR'}
                            </small>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <button className="payment-back-btn" onClick={handleBackToCryptos}>
                  {t.paymentBackBtn}
                </button>
                
                {/* Cancel Payment Button */}
                {!loading && paymentAddress && (
                  <button 
                    className="payment-back-btn"
                    onClick={() => setShowCancelConfirm(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      marginTop: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                  >
                    🗑️ {t.paymentCancelButton}
                  </button>
                )}
              </div>
            )}

            {/* Footer removed for privacy */}
          </div>
        </div>
      )}
      
      {/* Single Ban Modal */}
      {showSingleReportModal && (
        <div className="payment-modal-overlay" onClick={() => {
          setShowSingleReportModal(false);
          setSelectedPlatform(null);
          setSelectedTargetType(null);
        }}>
          <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="payment-modal-header">
              <div className="payment-modal-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                </svg>
              </div>
              <h2 className="payment-modal-title">
                {!selectedPlatform ? (t.btnSingleReport || 'Single Report') : !selectedTargetType ? (t.selectTargetType || 'Select Target Type') : 'Proceed to Payment'}
              </h2>
              <button className="payment-modal-close" onClick={() => {
                setShowSingleReportModal(false);
                setSelectedPlatform(null);
                setSelectedTargetType(null);
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="payment-modal-body">
              {/* Platform Selection */}
              {!selectedPlatform && (
                <>
                  {/* Service Details Info Box */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px',
                      maxWidth: '100%',
                      margin: '0 auto'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '10px 14px',
                        background: 'rgba(168, 85, 247, 0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{ fontSize: '0.8rem', color: '#d0d0d0' }}>{t.singleReportSuccessRate}</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: '#a855f7',
                          background: 'rgba(168, 85, 247, 0.15)',
                          padding: '4px 12px',
                          borderRadius: '6px'
                        }}>{t.singleReportSuccessValue}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '10px 14px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M13 10V3L4 14H11L11 21L20 10L13 10Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{ fontSize: '0.8rem', color: '#d0d0d0' }}>{t.singleReportProcessingTime}</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: '#3b82f6',
                          background: 'rgba(59, 130, 246, 0.15)',
                          padding: '4px 12px',
                          borderRadius: '6px'
                        }}>{t.singleReportProcessingValue}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Platform Selection Hint */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.3))'
                      }}
                    >
                      <path 
                        d="M19 9L12 15L5 9" 
                        stroke="url(#arrowGradient)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span style={{ 
                      color: '#999', 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      letterSpacing: '0.2px'
                    }}>
                      {t.selectPlatform || 'Select a platform below to proceed'}
                    </span>
                  </div>
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      className="payment-wallet-option"
                      onClick={() => setSelectedPlatform(platform.id)}
                      style={{ borderLeft: `3px solid ${platform.color}` }}
                    >
                      <div className="payment-wallet-icon" style={{ background: `${platform.color}20` }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={platform.color}>
                          <g dangerouslySetInnerHTML={{ __html: platform.svg }} />
                        </svg>
                      </div>
                      <span className="payment-wallet-name">{platform.name}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 'auto', opacity: 0.3, width: '20px', height: '20px' }}>
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                </>
              )}

              {/* Target Type Selection */}
              {selectedPlatform && !selectedTargetType && (
                <>
                  {/* Target Type Selection Hint */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.3))'
                      }}
                    >
                      <path 
                        d="M19 9L12 15L5 9" 
                        stroke="url(#arrowGradient2)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="arrowGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span style={{ 
                      color: '#999', 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      letterSpacing: '0.2px'
                    }}>
                      {t.selectTargetType || 'Select the appropriate target type below'}
                    </span>
                  </div>
                  {selectedPlatform === 'instagram' && (t as any).instagramTargets && Object.entries((t as any).instagramTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'tiktok' && (t as any).tiktokTargets && Object.entries((t as any).tiktokTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'telegram' && (t as any).telegramTargets && Object.entries((t as any).telegramTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'youtube' && (t as any).youtubeTargets && Object.entries((t as any).youtubeTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'facebook' && (t as any).facebookTargets && Object.entries((t as any).facebookTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'twitter' && (t as any).twitterTargets && Object.entries((t as any).twitterTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'discord' && (t as any).discordTargets && Object.entries((t as any).discordTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'whatsapp' && (t as any).whatsappTargets && Object.entries((t as any).whatsappTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  {selectedPlatform === 'snapchat' && (t as any).snapchatTargets && Object.entries((t as any).snapchatTargets).map(([key, value]) => (
                    <button key={key} className="payment-wallet-option payment-network-option" onClick={() => setSelectedTargetType(key)}>
                      <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>{targetTypeIcons[key] || '📍'}</span>
                      <span className="payment-network-name">{value as string}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="payment-network-arrow">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                      </svg>
                    </button>
                  ))}
                  <button className="payment-back-btn" onClick={() => setSelectedPlatform(null)}>
                    ← {t.singleReportBackToPlatforms}
                  </button>
                </>
              )}

              {/* Payment Step */}
              {selectedPlatform && selectedTargetType && (
                <>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.02))',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: `${platforms.find(p => p.id === selectedPlatform)?.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={platforms.find(p => p.id === selectedPlatform)?.color}>
                          <g dangerouslySetInnerHTML={{ __html: platforms.find(p => p.id === selectedPlatform)?.svg || '' }} />
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>{t.singleReportPlatformLabel}</p>
                        <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                          {platforms.find(p => p.id === selectedPlatform)?.name}
                        </p>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(59, 130, 246, 0.1)', paddingTop: '12px', marginTop: '12px' }}>
                      <p style={{ color: '#666', fontSize: '0.75rem', margin: '0 0 4px 0' }}>{t.singleReportTargetTypeLabel}</p>
                      <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                        {selectedTargetType.replace('_', ' ')}
                      </p>
                    </div>
                    <div style={{ 
                      borderTop: '1px solid rgba(59, 130, 246, 0.1)', 
                      paddingTop: '16px', 
                      marginTop: '16px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: '#666', fontSize: '0.75rem', margin: '0 0 4px 0' }}>{t.singleReportTotalAmount}</p>
                      <p style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                        {t.singleReportPrice || '$99.99'}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="pay-btn primary-action nowpayments-trigger" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }} 
                    onClick={() => {
                      setIsSingleBanPayment(true); // Mark this as single ban payment
                      currentPackageTypeRef.current = 'single'; // Update ref immediately
                      setShowSingleReportModal(false);
                      // Small delay to ensure modal closes before opening crypto select
                      setTimeout(() => {
                        setShowCryptoSelect(true);
                      }, 100);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                    </svg>
                    <span>{t.singleReportProceedToPayment}</span>
                  </button>
                  <button className="payment-back-btn" onClick={() => setSelectedTargetType(null)}>
                    ← {t.singleReportBackToTargetTypes}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="payment-modal-overlay" style={{ zIndex: 10002 }} onClick={() => setShowCloseConfirm(false)}>
          <div className="payment-modal-container" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <div className="payment-modal-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h2 className="payment-modal-title">{t.paymentCloseTitle}</h2>
            </div>
            <div className="payment-modal-body">
              <p style={{ textAlign: 'center', color: '#999', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {t.paymentCloseDesc}
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
                  onClick={() => setShowCloseConfirm(false)}
                >
                  {t.paymentContinue}
                </button>
                <button 
                  className="pay-btn" 
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    fontSize: '0.95rem',
                    padding: '12px 20px'
                  }}
                  onClick={closePaymentModal}
                >
                  {t.paymentCloseAnyway}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Payment Confirmation Modal */}
      {showCancelConfirm && (
        <div className="payment-modal-overlay" style={{ zIndex: 10002 }} onClick={() => setShowCancelConfirm(false)}>
          <div className="payment-modal-container" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <div className="payment-modal-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </div>
              <h2 className="payment-modal-title">{t.paymentCancelConfirmTitle}</h2>
            </div>
            <div className="payment-modal-body">
              <p style={{ textAlign: 'center', color: '#999', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {t.paymentCancelConfirmDesc}
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
                  onClick={() => setShowCancelConfirm(false)}
                >
                  {t.paymentCancelKeep}
                </button>
                <button 
                  className="pay-btn" 
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    fontSize: '0.95rem',
                    padding: '12px 20px'
                  }}
                  onClick={async () => {
                    if (selectedCrypto) {
                      const packageType = isSingleBanPayment ? 'single' : 'full';
                      const payment = getPendingPayment(selectedCrypto.id, selectedNetwork?.id || null, packageType);
                      
                      // Cancel the payment
                      cancelPendingPayment(selectedCrypto.id, selectedNetwork?.id || null, packageType);
                      
                      // Send Telegram notification
                      if (payment) {
                        try {
                          const username = localStorage.getItem('rektnow_auth') 
                            ? JSON.parse(localStorage.getItem('rektnow_auth')!).username 
                            : undefined;
                          
                          await sendPaymentCancelledNotification({
                            username,
                            amount: payment.amount,
                            crypto: selectedCrypto.symbol,
                            network: selectedNetwork?.name,
                            paymentId: payment.paymentId,
                            orderDescription: packageType === 'single' 
                              ? `Single Report - ${selectedPlatform || 'Unknown'} ${selectedTargetType || 'target'}` 
                              : 'RektNow Panel Access',
                            timestamp: new Date().toISOString()
                          });
                        } catch (err) {
                          console.error('Failed to send cancellation notification:', err);
                        }
                      }
                      
                      setShowCancelConfirm(false);
                      closePaymentModal();
                      
                      // Dispatch custom event to notify Transactions modal
                      window.dispatchEvent(new Event('paymentCancelled'));
                    }
                  }}
                >
                  {t.paymentCancelConfirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
