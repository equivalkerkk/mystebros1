import TelegramBot from 'node-telegram-bot-api';

// Bot Token
const BOT_TOKEN = '8510767562:AAHB7AkJB32-q-YmmkpGwzV2eP9xz-p1zL0';

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('═══════════════════════════════════════');
console.log('✅ RektNow Telegram Verify Bot is ONLINE!');
console.log('═══════════════════════════════════════');
console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 20)}...`);
console.log(`📅 Started: ${new Date().toLocaleString()}`);
console.log('🔧 Listening for /verify commands...\n');

// Welcome message when bot is added to group
bot.on('new_chat_members', async (msg) => {
  const newMembers = msg.new_chat_members;
  const chatId = msg.chat.id;
  const botInfo = await bot.getMe();

  // Check if bot is the new member
  const botAdded = newMembers.some(member => member.id === botInfo.id);

  if (botAdded) {
    console.log(`✅ Bot added to group: ${msg.chat.title || 'Unknown'} (ID: ${chatId})`);
    
    const welcomeMessage = `🎯 *Welcome to RektNow Verification Bot!*

Thank you for adding me to your group!

🔒 *Verification Required:*
To verify your Panel Access, use the /verify command.

📋 *How to Verify:*
Use: \`/verify YOUR_ACCESS_KEY\`

*Example:*
\`/verify A1B2-C3D4-E5F6-G7H8\`

*Format:* XXXX-XXXX-XXXX-XXXX

⚡ *Need Panel Access?*
Visit: https://rektnow.wtf

_Note: Only verified users with Panel Access can use RektNow services._`;

    await bot.sendMessage(chatId, welcomeMessage, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
  }
});

// Handle /start command (for private messages)
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  console.log(`📩 /start command from: ${msg.from.username || msg.from.first_name} (ID: ${msg.from.id})`);

  const startMessage = `🎯 *RektNow Verification Bot*

Hello ${msg.from.first_name}! 👋

🔒 *Verification System*
This bot verifies your Panel Access Key.

📋 *How to Use:*
1. Add this bot to your group
2. Use: \`/verify YOUR_ACCESS_KEY\`

*Example:*
\`/verify A1B2-C3D4-E5F6-G7H8\`

*Key Format:* XXXX-XXXX-XXXX-XXXX

⚡ *Purchase Panel Access:*
Visit: https://rektnow.wtf

_Have questions? Contact our support team._`;

  await bot.sendMessage(chatId, startMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Handle /verify command
bot.onText(/\/verify(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;
  const accessKey = match[1]?.trim();

  console.log(`🔐 /verify command from: ${username} (ID: ${userId}) in chat: ${chatId}`);

  // Check if access key is provided
  if (!accessKey) {
    const helpMessage = `❌ *Invalid Command*

*Usage:*
\`/verify YOUR_ACCESS_KEY\`

*Example:*
\`/verify A1B2-C3D4-E5F6-G7H8\`

*Key Format:* XXXX-XXXX-XXXX-XXXX

⚡ *Need a Panel Access Key?*
Purchase at: https://rektnow.wtf`;

    await bot.sendMessage(chatId, helpMessage, { 
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id,
      disable_web_page_preview: true
    });
    return;
  }

  // Validate key format (XXXX-XXXX-XXXX-XXXX)
  const keyFormat = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

  if (!keyFormat.test(accessKey)) {
    const formatError = `❌ *Invalid Key Format*

*Error:* Panel Access Key format is invalid.

*Expected Format:*
\`XXXX-XXXX-XXXX-XXXX\`

*Example:*
\`A1B2-C3D4-E5F6-G7H8\`

Please check your key and try again.`;

    await bot.sendMessage(chatId, formatError, { 
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id 
    });
    return;
  }

  // Send verifying message
  const verifyingMsg = await bot.sendMessage(chatId, 
    `🔄 *Verifying Panel Access*

*User:* ${username}
*Access Key:* \`${accessKey}\`

⏳ Checking credentials with RektNow servers...`, 
    { 
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id 
    }
  );

  // Simulate verification delay (2-4 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Always fail (no real backend validation)
  const failedMessage = `❌ *Verification Failed*

*User:* ${username}
*Access Key:* \`${accessKey.substring(0, 9)}...\`

*Error:* Invalid credentials or Panel Access not found.

*Possible reasons:*
• Panel Access Key is incorrect
• Panel Access has not been activated yet
• Panel Access has expired or been revoked

*Solutions:*
1. *Double-check your credentials* - Make sure you copied the exact key
2. *Purchase Panel Access* at https://rektnow.wtf if you haven't
3. *Contact Support* if you believe this is an error

*Need Help?*
Contact our support team with your order details.`;

  await bot.editMessageText(failedMessage, {
    chat_id: chatId,
    message_id: verifyingMsg.message_id,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });

  console.log(`❌ Verification failed: ${username} | Key: ${accessKey}`);
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `📖 *RektNow Verification Bot - Help*

*Available Commands:*

/verify YOUR_ACCESS_KEY
    Verify your Panel Access Key
    Example: \`/verify A1B2-C3D4-E5F6-G7H8\`

/help
    Show this help message

*Key Format:*
\`XXXX-XXXX-XXXX-XXXX\`

*How to Get Access:*
1. Visit https://rektnow.wtf
2. Purchase Mass Report Panel
3. You will receive your Panel Access Key
4. Use /verify command to activate

*Need Support?*
Contact our team through the website.`;

  await bot.sendMessage(chatId, helpMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

// Keep-alive: Log status every 5 minutes
setInterval(() => {
  console.log('✅ Telegram bot is running...');
}, 5 * 60 * 1000);

console.log('═══════════════════════════════════════\n');
