// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8376404138:AAFSo4jr52Dvr6l2hswgsTbjDQ28XREMgJs';
const TELEGRAM_CHAT_ID = '-5036897679';

interface LoginNotification {
  username: string;
  timestamp: string;
  action: 'login' | 'register';
  ipAddress?: string;
}

interface IPInfo {
  country?: string;
  countryCode?: string;
  isVPN?: boolean;
  isp?: string;
}

interface PaymentCreatedNotification {
  username?: string;
  amount: string;
  crypto: string;
  network?: string;
  address: string;
  paymentId: string;
  orderDescription: string;
  timestamp: string;
}

interface PaymentStatusNotification {
  paymentId: string;
  status: 'waiting' | 'processing' | 'sending' | 'finished' | 'failed' | 'rejected';
  amount: string;
  crypto: string;
  network?: string;
  timestamp: string;
}

// Send notification to Telegram
export const sendTelegramNotification = async (data: LoginNotification): Promise<void> => {
  try {
    const { username, timestamp, ipAddress } = data;
    
    const emoji = '✅';
    const actionText = 'Successful Login';
    
    let ipInfo: IPInfo = {};
    let locationText = '';
    
    // Get IP geolocation if IP is available
    if (ipAddress) {
      ipInfo = await getIPInfo(ipAddress);
      
      if (ipInfo.country) {
        const countryEmojis: { [key: string]: string } = {
          'US': '🇺🇸', 'TR': '🇹🇷', 'DE': '🇩🇪', 'GB': '🇬🇧', 'FR': '🇫🇷',
          'NL': '🇳🇱', 'CA': '🇨🇦', 'AU': '🇦🇺', 'JP': '🇯🇵', 'KR': '🇰🇷',
          'CN': '🇨🇳', 'RU': '🇷🇺', 'BR': '🇧🇷', 'IN': '🇮🇳', 'IT': '🇮🇹',
          'ES': '🇪🇸', 'SE': '🇸🇪', 'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰',
          'PL': '🇵🇱', 'UA': '🇺🇦', 'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪',
          'GR': '🇬🇷', 'PT': '🇵🇹', 'CZ': '🇨🇿', 'RO': '🇷🇴', 'HU': '🇭🇺',
          'IL': '🇮🇱', 'AE': '🇦🇪', 'SA': '🇸🇦', 'SG': '🇸🇬', 'MY': '🇲🇾',
          'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'NZ': '🇳🇿',
          'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬', 'KE': '🇰🇪', 'AR': '🇦🇷',
          'CL': '🇨🇱', 'CO': '🇨🇴', 'MX': '🇲🇽', 'PE': '🇵🇪', 'VE': '🇻🇪'
        };
        
        const countryEmoji = countryEmojis[ipInfo.country] || '🌍';
        const vpnBadge = ipInfo.isVPN ? ' (🛡️ VPN)' : '';
        
        locationText = `📍 <b>IP:</b> <code>${ipAddress}</code> <b>Country:</b> ${ipInfo.country} ${countryEmoji}${vpnBadge}`;
      } else {
        locationText = `🌐 <b>IP:</b> <code>${ipAddress}</code>`;
      }
    }
    
    const message = `
${emoji} <b>${actionText}</b>

👤 <b>Username:</b> <code>${username}</code>
🕒 <b>Time:</b> ${new Date(timestamp).toLocaleString()}
${locationText ? locationText : ''}

━━━━━━━━━━━━━━━━━━━━
<i>RektNow Mass Report Panel</i>
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Telegram notification failed:', await response.text());
    } else {
      console.log('✅ Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

// Get user's IP address and location info
export const getUserIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return undefined;
  }
};

// Get IP geolocation and VPN detection
export const getIPInfo = async (ip: string): Promise<IPInfo> => {
  try {
    // Using ipinfo.io with token for VPN detection
    // Token provides access to privacy/VPN detection features
    const IPINFO_TOKEN = 'e209c0989355ee';
    const response = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    const data = await response.json();
    
    console.log('IPInfo Response:', JSON.stringify(data, null, 2)); // DEBUG
    
    if (data.country) {
      const org = (data.org || '').toLowerCase();
      
      // VPN/Proxy/Hosting detection with ipinfo.io privacy field
      const isVPN = data.privacy?.vpn === true || 
                    data.privacy?.proxy === true || 
                    data.privacy?.hosting === true ||
                    data.privacy?.tor === true ||
                    org.includes('vpn') || 
                    org.includes('proxy') || 
                    org.includes('hosting') ||
                    org.includes('cloudflare') ||
                    org.includes('google') ||
                    org.includes('amazon') ||
                    org.includes('digitalocean') ||
                    org.includes('ovh') ||
                    org.includes('hetzner') ||
                    org.includes('linode') ||
                    org.includes('vultr') ||
                    org.includes('m247') || // VPN provider
                    org.includes('datacamp') ||
                    org.includes('privatelayer');
      
      console.log('VPN Detection:', { org, isVPN, privacy: data.privacy }); // DEBUG
      
      return {
        country: data.country, // Country code (e.g., "NL")
        countryCode: data.country,
        isVPN: isVPN,
        isp: data.org
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting IP info:', error);
    return {};
  }
};

// Send payment created notification to Telegram
export const sendPaymentCreatedNotification = async (data: PaymentCreatedNotification): Promise<void> => {
  try {
    const { username, amount, crypto, network, address, paymentId, orderDescription, timestamp } = data;
    
    const emoji = '💰';
    const networkText = network ? ` (${network})` : '';
    const usernameText = username ? `👤 <b>User:</b> <code>${username}</code>\n` : '';
    
    const message = `
${emoji} <b>New Payment Created</b>

${usernameText}💵 <b>Amount:</b> <code>${amount} ${crypto}</code>${networkText}
📦 <b>Order:</b> ${orderDescription}
🔑 <b>Payment ID:</b> <code>${paymentId}</code>
📬 <b>Address:</b> <code>${address}</code>
🕒 <b>Time:</b> ${new Date(timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━
<i>RektNow Mass Report Panel</i>
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Telegram payment created notification failed:', await response.text());
    } else {
      console.log('✅ Payment created notification sent to Telegram');
    }
  } catch (error) {
    console.error('Error sending payment created notification:', error);
  }
};

// Send payment status update notification to Telegram
export const sendPaymentStatusNotification = async (data: PaymentStatusNotification): Promise<void> => {
  try {
    const { paymentId, status, amount, crypto, network, timestamp } = data;
    
    // Status emoji mapping
    const statusEmoji: { [key: string]: string } = {
      'waiting': '⏳',
      'processing': '🔄',
      'sending': '📤',
      'finished': '✅',
      'failed': '❌',
      'rejected': '🚫'
    };
    
    const emoji = statusEmoji[status] || '📊';
    const networkText = network ? ` (${network})` : '';
    
    // Status color/style
    const statusText = status.toUpperCase();
    
    const message = `
${emoji} <b>Payment Status: ${statusText}</b>

🔑 <b>Payment ID:</b> <code>${paymentId}</code>
💵 <b>Amount:</b> <code>${amount} ${crypto}</code>${networkText}
🕒 <b>Time:</b> ${new Date(timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━
<i>RektNow Mass Report Panel</i>
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Telegram payment status notification failed:', await response.text());
    } else {
      console.log(`✅ Payment status (${status}) notification sent to Telegram`);
    }
  } catch (error) {
    console.error('Error sending payment status notification:', error);
  }
};
