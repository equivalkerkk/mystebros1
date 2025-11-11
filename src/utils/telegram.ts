// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8376404138:AAFSo4jr52Dvr6l2hswgsTbjDQ28XREMgJs';
const TELEGRAM_CHAT_ID = '-5036897679';

interface LoginNotification {
  username: string;
  timestamp: string;
  action: 'login' | 'register';
  ipAddress?: string;
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
    
    const message = `
${emoji} <b>${actionText}</b>

👤 <b>Username:</b> <code>${username}</code>
🕒 <b>Time:</b> ${new Date(timestamp).toLocaleString()}
${ipAddress ? `🌐 <b>IP:</b> <code>${ipAddress}</code>` : ''}

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

// Get user's IP address (optional)
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
