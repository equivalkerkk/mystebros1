// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8376404138:AAFSo4jr52Dvr6l2hswgsTbjDQ28XREMgJs';
const TELEGRAM_CHAT_ID = '-5036897679';

// Send payment status update notification to Telegram
async function sendPaymentStatusNotification(data) {
  try {
    const { paymentId, status, amount, crypto, network, timestamp } = data;
    
    // Status emoji mapping
    const statusEmoji = {
      'waiting': '⏳',
      'processing': '🔄',
      'sending': '📤',
      'finished': '✅',
      'failed': '❌',
      'rejected': '🚫'
    };
    
    const emoji = statusEmoji[status] || '📊';
    const networkText = network ? ` (${network})` : '';
    
    // Status text
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
}

export {
  sendPaymentStatusNotification
};