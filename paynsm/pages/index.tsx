import { useState, useEffect } from 'react';
import Head from 'next/head';

// Sabit merchant wallet address
const MERCHANT_WALLET = '0x7712B8792A1eB9c8338f8a7149ff2844C4F11665';

// Döviz kurları için interface
interface ExchangeRates {
  [key: string]: number;
}

// Ürün paketleri (fiyatlar USD cinsinden, %8 kart ödemesi komisyonu dahil)
const productPackages = [
  {
    id: 'basic',
    icon: '⚡️',
    title: '1 Report',
    price: 107.99,
    description: 'Price for one successful ban.',
    popular: false
  },
  {
    id: 'unlimited',
    icon: '👑',
    title: 'Tool Access',
    price: 323.99,
    description: 'Full access with automation tools',
    features: [
      'Unlimited Free Reports - No daily/monthly limits',
      'Automatic Proxies - Auto-rotating, high-speed',
      'Automatic Accounts - Millions of automated bot accounts ready for reporting for all platforms',
      'Boost account - Send views, likes and shares to your social media videos/reels or send millions of followers to your social media accounts',
      'SMS & Call Bomber - Send mass SMS and calls to target numbers, (all countries)',
      'Unban Service - Professional account recovery and restoration'
    ],
    popular: true
  },
  {
    id: 'pro',
    icon: '🔥',
    title: '2 Reports',
    price: 194.38,
    originalPrice: 215.98,
    discount: '10% OFF',
    description: 'Price for two successful bans.',
    popular: false
  }
];

// Provider'ların minimum tutarları
const minAmounts = {
  'hosted': 1,
  'guardarian': 20,
  'revolut': 15,
  'particle': 30,
  'robinhood': 5,
  'stripe': 2,
  'coinbase': 2,
  'transak': 15,
  'sardine': 30,
  'simpleswap': 30,  
  'banxa': 20,
  'utorg': 50,
  'simplex': 50,
  'transfi': 70,
  'alchemypay': 15,	
  'mercuryo': 30,
  'finchpay': 40,
  'topper': 10,
  'swipelux': 14,
  'unlimit': 10,
  'bitnovo': 10,
  'rampnetwork': 4,
  'upi': 100,
  'interac': 100,
  'moonpay': 20
};

// Currency restrictions
const usdOnlyProviders = ['stripe', 'transfi', 'robinhood', 'rampnetwork'];
const inrOnlyProviders = ['upi'];
const cadOnlyProviders = ['interac'];

export default function Home() {
  const [email, setEmail] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('pro');
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState('hosted');
  const [paymentLink, setPaymentLink] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loadingRates, setLoadingRates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWaitingPayment, setShowWaitingPayment] = useState(false);

  // Döviz kurlarını yükle - Birden fazla API'yi deneyen sistem
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
         },
         {
           name: 'Fixer.io',
           url: 'https://api.fixer.io/latest?access_key=FREE&base=USD',
           parser: (data: any) => data.rates
         }
       ];

             for (const api of apis) {
         try {
           console.log(`Trying ${api.name}...`);
           const response = await fetch(api.url, {
             method: 'GET',
             headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
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
         EUR: 0.855,     // 1 USD = 0.855 EUR (1 EUR = 1.1696 USD)
         CAD: 1.485,     // 1 USD = 1.485 CAD
         INR: 88.5       // 1 USD = 88.5 INR
       });
      
      setLoadingRates(false);
    };

    fetchExchangeRates();
  }, []);

  const selectedProduct = productPackages.find(pkg => pkg.id === selectedPackage);
  const usdPrice = selectedProduct?.price || 0;
  
  // Fiyatı seçilen currency'ye dönüştür
  const convertPrice = (usdPrice: number, targetCurrency: string): number => {
    if (targetCurrency === 'USD') return usdPrice;
    const rate = exchangeRates[targetCurrency];
    if (!rate) return usdPrice;
    return Math.round(usdPrice * rate * 100) / 100; // 2 decimal places
  };

  const amount = convertPrice(usdPrice, currency);

  // Currency sembolü
  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      CAD: 'C$',
      INR: '₹'
    };
    return symbols[currency] || currency;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPaymentLink('');
    setTrackingNumber('');

    try {
      // Validation
      if (!email || !selectedPackage || !provider) {
        setError('Please fill out all fields.');
        setLoading(false);
        return;
      }

      const amountNum = amount;
      if (amountNum < minAmounts[provider as keyof typeof minAmounts]) {
        setError(`Minimum amount for ${provider} is $${minAmounts[provider as keyof typeof minAmounts]}`);
        setLoading(false);
        return;
      }

      // Currency restrictions
      if (currency !== 'USD' && usdOnlyProviders.includes(provider)) {
        setError(`${provider} supports USD currency only.`);
        setLoading(false);
        return;
      }
      
      if (currency !== 'INR' && inrOnlyProviders.includes(provider)) {
        setError(`${provider} supports INR currency only.`);
        setLoading(false);
        return;
      }
      
      if (currency !== 'CAD' && cadOnlyProviders.includes(provider)) {
        setError(`${provider} supports CAD currency only.`);
        setLoading(false);
        return;
      }

      // Generate tracking ID
      const payoutTrackingId = `https://paygate.to/payment-link/invoice.php?payment=${Date.now()}_${Math.floor(Math.random() * 9000000) + 1000000}`;
      const callback = encodeURIComponent(payoutTrackingId);

      // API call to get encoded address using fixed merchant wallet
      const response = await fetch(`https://api.paygate.to/control/wallet.php?address=${MERCHANT_WALLET}&callback=${callback}`);
      const data = await response.json();

      if (data && data.address_in) {
        const addressIn = data.address_in;
        const customerEmail = encodeURIComponent(email);
        
        // Generate payment link based on provider
        const baseUrl = provider === 'hosted' 
          ? 'https://checkout.paygate.to/pay.php'
          : 'https://checkout.paygate.to/process-payment.php';
        
        const generatedPaymentLink = `${baseUrl}?address=${addressIn}&amount=${amountNum}&provider=${provider}&email=${customerEmail}&currency=${currency}`;

        setPaymentLink(generatedPaymentLink);
        setTrackingNumber(addressIn);
      } else {
        setError('Invalid payout wallet. Please insert a valid USDC (Polygon) wallet address.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the request.');
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = (url: string) => {
    // Open payment URL in a new tab
    window.open(url, '_blank');
    setShowWaitingPayment(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    // Reset copy state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>SM Services</title>
        <meta name="description" content="Generate secure payment links without KYC using SM Services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="relative z-10 min-h-screen py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                SM Services
              </h1>
            </div>

            {/* Main Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">Choose Your Package</h2>
                <p className="text-slate-300">
                  Select the perfect plan for your needs
                </p>
                <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    💳 Card payment prices are 8% higher than our bot prices due to payment processing fees
                  </p>
                </div>
              </div>

              {/* Package Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {productPackages.map((pkg) => (
                                      <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                        selectedPackage === pkg.id
                          ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/25'
                          : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                    >
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    {selectedPackage === pkg.id && (
                      <div className="absolute -top-2 right-3">
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          SELECTED
                        </span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{pkg.icon}</div>
                        <h3 className="text-lg font-bold text-white">{pkg.title}</h3>
                        {pkg.id === 'unlimited' ? (
                          <div className="mt-2">
                            <p className="text-slate-300 text-sm font-medium">
                              Features
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs mt-1">{pkg.description}</p>
                        )}
                      </div>

                      <div className="text-center mb-3">
                        <div className="flex items-center justify-center gap-2">
                          {pkg.originalPrice && (
                            <span className="text-slate-500 line-through text-sm">
                              {loadingRates ? '...' : `${getCurrencySymbol(currency)}${convertPrice(pkg.originalPrice, currency)}`}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-green-400">
                            {loadingRates ? '...' : `${getCurrencySymbol(currency)}${convertPrice(pkg.price, currency)}`}
                          </span>
                        </div>
                        {pkg.discount && (
                          <span className="inline-block bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-full mt-1">
                            {pkg.discount}
                          </span>
                        )}
                      </div>

                      {/* Enhanced Features for unlimited package only */}
                      {pkg.id === 'unlimited' && pkg.features && (
                        <div className="space-y-2.5">
                          <div className="flex items-start text-xs">
                            <span className="text-blue-400 mr-2 flex-shrink-0 mt-0.5 font-bold">🔄</span>
                            <span className="text-slate-200"><span className="text-blue-300 font-semibold">Unlimited Reports</span> - No daily/monthly limits</span>
                          </div>
                          <div className="flex items-start text-xs">
                            <span className="text-purple-400 mr-2 flex-shrink-0 mt-0.5 font-bold">⚡</span>
                            <span className="text-slate-200"><span className="text-purple-300 font-semibold">Auto Proxies</span> - Rotating, high-speed infrastructure</span>
                          </div>
                          <div className="flex items-start text-xs">
                            <span className="text-orange-400 mr-2 flex-shrink-0 mt-0.5 font-bold">🤖</span>
                            <span className="text-slate-200"><span className="text-orange-300 font-semibold">Bot Network</span> - Millions of automated accounts</span>
                          </div>
                          <div className="flex items-start text-xs">
                            <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5 font-bold">📈</span>
                            <span className="text-slate-200"><span className="text-green-300 font-semibold">Social Boost</span> - Views, likes, followers automation</span>
                          </div>
                          <div className="flex items-start text-xs">
                            <span className="text-red-400 mr-2 flex-shrink-0 mt-0.5 font-bold">💥</span>
                            <span className="text-slate-200"><span className="text-red-300 font-semibold">SMS/Call Bombing</span> - Mass communication attacks</span>
                          </div>
                          <div className="flex items-start text-xs">
                            <span className="text-cyan-400 mr-2 flex-shrink-0 mt-0.5 font-bold">🔓</span>
                            <span className="text-slate-200"><span className="text-cyan-300 font-semibold">Unban Service</span> - Professional account recovery</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning Banner */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-yellow-100 font-medium">Important Notice</p>
                    <p className="text-yellow-200 text-sm mt-1">
                      Some payment providers may decline transactions. Try different providers until you find one that works.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                      Customer Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="currency" className="block text-sm font-semibold text-slate-200 mb-2">
                        Currency
                      </label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪🇺 EUR</option>
                        <option value="CAD">🇨🇦 CAD</option>
                        <option value="INR">🇮🇳 INR</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="provider" className="block text-sm font-semibold text-slate-200 mb-2">
                        Payment Provider
                      </label>
                      <select
                        id="provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="hosted">🏢 Multi Hosted</option>
                        <option value="stripe">💳 Stripe (USA ONLY)</option>
                        <option value="sardine">🐟 Sardine.ai</option>
                        <option value="revolut">🏦 Revolut</option>
                        <option value="guardarian">🛡️ Guardarian</option>
                        <option value="particle">⚛️ Particle</option>
                        <option value="transak">🔄 Transak</option>
                        <option value="banxa">🏛️ Banxa</option>
                        <option value="simplex">📱 Simplex</option>
                        <option value="mercuryo">💰 Mercuryo</option>
                        <option value="rampnetwork">🚀 Ramp</option>
                        <option value="moonpay">🌙 MoonPay</option>
                        <option value="alchemypay">⚗️ Alchemy Pay</option>
                        <option value="robinhood">🏹 Robinhood</option>
                        <option value="coinbase">🪙 Coinbase</option>
                        <option value="utorg">🔷 UTORG</option>
                        <option value="unlimit">♾️ Unlimit</option>
                        <option value="bitnovo">🔵 Bitnovo</option>
                        <option value="simpleswap">🔄 SimpleSwap</option>
                        <option value="finchpay">🐦 FinchPay</option>
                        <option value="topper">🎯 Topper</option>
                        <option value="swipelux">👆 Swipelux</option>
                        <option value="transfi">💸 Transfi</option>
                        <option value="interac">🇨🇦 Interac (Canada)</option>
                        <option value="upi">🇮🇳 UPI/IMPS (India)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : (
                    loadingRates ? '✨ Generate Payment Link • Loading...' : `✨ Generate Payment Link • ${getCurrencySymbol(currency)}${amount}`
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Section */}
              {paymentLink && (
                <div className="mt-8 space-y-6">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-xl font-bold text-green-100">Payment Link Generated!</h3>
                        <p className="text-green-200 text-sm">Your secure payment link is ready</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {selectedProduct?.icon} {selectedProduct?.title}
                          </p>
                          <p className="text-slate-300 text-sm">
                            {loadingRates ? 'Loading...' : `${getCurrencySymbol(currency)}${amount} ${currency} via ${provider}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            Ready
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Link Display Box */}
                    <div className="bg-slate-800/70 border border-slate-600/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-300">Payment Page:</p>
                        <button
                          onClick={() => proceedToPayment(paymentLink)}
                          className="font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center transform bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Proceed to Payment
                        </button>
                      </div>
                      <div className="bg-slate-900/50 rounded-md p-3 border border-slate-700/50">
                        <p className="text-green-300 font-mono text-sm break-all">{paymentLink}</p>
                      </div>
                      
                      {/* Important Note */}
                      <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-yellow-100 font-medium text-sm">Important:</p>
                            <p className="text-yellow-200 text-sm mt-1">
                              Click the "Proceed to Payment" button above to open the secure payment page in a new tab.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Waiting for Payment */}
                  {showWaitingPayment && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <p className="text-blue-300 font-medium">Waiting for payment...</p>
                      </div>
                      <p className="text-center text-blue-200 text-sm mt-2">
                        Complete your payment in the browser to continue
                      </p>
                    </div>
                  )}

                  {/* Tracking Number */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      🔍 Tracking Number
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={trackingNumber}
                        readOnly
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-l-xl text-slate-300 text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(trackingNumber)}
                        className={`px-4 py-3 rounded-r-xl transition-all duration-300 transform ${
                          copied 
                            ? 'bg-green-600 hover:bg-green-700 text-white scale-105' 
                            : 'bg-slate-600 hover:bg-slate-500 text-white hover:scale-105'
                        }`}
                      >
                        {copied ? (
                          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>



            {/* Footer */}
            <div className="text-center mt-8 text-slate-400">
              <p className="text-sm">
                Powered by <span className="text-blue-400 font-semibold">SM Services</span> • Secure & Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}