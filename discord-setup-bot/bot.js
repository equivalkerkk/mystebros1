const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, SlashCommandBuilder } = require('discord.js');

// Bot Token'ınızı buraya yazın
const BOT_TOKEN = 'MTQzNzg5MTYxMDA0OTM4NDU0OQ.GiqqaH.cS_H1Yt_MunMQ34a6tEQJWuho_bWyC62RGTHpo';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

// Verification states (in-memory storage)
const verificationStates = new Map();

// Error handling for unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

client.on('warn', (info) => {
  console.warn('⚠️ Discord client warning:', info);
});

// Handle WebSocket errors
client.on('shardError', (error) => {
  console.error('❌ WebSocket connection error:', error);
  console.log('🔄 Attempting to reconnect...');
});

// Handle disconnect and auto-reconnect
client.on('shardDisconnect', (event, shardId) => {
  console.warn(`⚠️ Discord bot disconnected (Shard ${shardId}) - Code: ${event.code}`);
  console.log('🔄 Discord.js will automatically reconnect...');
  
  // If close code is 1000 or 1001 (normal closure), don't worry
  if (event.code === 1000 || event.code === 1001) {
    console.log('ℹ️ Normal disconnect, reconnecting...');
  } else {
    console.warn(`⚠️ Abnormal disconnect (Code ${event.code}), reconnecting...`);
  }
});

client.on('shardReconnecting', (shardId) => {
  console.log(`🔄 Reconnecting to Discord (Shard ${shardId})...`);
});

client.on('shardResume', (shardId, replayedEvents) => {
  console.log(`✅ Discord bot reconnected successfully (Shard ${shardId})`);
  console.log(`📊 Replayed ${replayedEvents} events`);
});

// Handle ready event (fires after reconnect too)
client.on('shardReady', (shardId) => {
  console.log(`✅ Shard ${shardId} is ready and connected`);
});

client.once('ready', async () => {
  console.log('═══════════════════════════════════════');
  console.log('✅ RektNow Discord Bot is ONLINE!');
  console.log('═══════════════════════════════════════');
  console.log(`🤖 Bot: ${client.user.tag}`);
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  
  try {
    const guild = client.guilds.cache.first();
    
    if (!guild) {
      console.log('❌ Bot is not in any server!');
      return;
    }

    console.log(`🏠 Server: ${guild.name}`);
    console.log(`👥 Members: ${guild.memberCount}`);
    console.log('⏳ Setting up server...\n');

    // Register slash commands FIRST
    console.log('🔧 Registering /verify command...');
    const commands = [
      new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify your Panel Access to unlock all channels')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('Your RektNow panel username')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('access_key')
            .setDescription('Your Panel Access Key (Format: XXXX-XXXX-XXXX-XXXX)')
            .setRequired(true)
        )
    ];

    try {
      await guild.commands.set(commands);
      console.log('   ✅ /verify command registered');
    } catch (error) {
      console.error('   ❌ Failed to register commands:', error);
    }

    // 1. CUSTOMER ROLE (for real customers)
    console.log('\n🔧 Checking Customer role...');
    
    let customerRole = guild.roles.cache.find(r => r.name === 'Customer');
    if (!customerRole) {
      customerRole = await guild.roles.create({
        name: 'Customer',
        color: '#3b82f6', // Mavi
        permissions: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AddReactions,
          PermissionFlagsBits.UseExternalEmojis,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles
        ],
        reason: 'Auto-setup: Customers with Panel Access'
      });
      console.log('   ✅ Customer role created');
    } else {
      console.log('   ✅ Customer role exists');
    }

    // 2. WELCOME CHANNEL (everyone can see, no one can write)
    console.log('\n🔧 Checking #welcome channel...');
    
    let welcomeChannel = guild.channels.cache.find(c => c.name === 'welcome');
    if (!welcomeChannel) {
      welcomeChannel = await guild.channels.create({
        name: 'welcome',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone - herkes görebilir, yazamaz, TEPİK VEREMEZ
            allow: [
              PermissionFlagsBits.ViewChannel, 
              PermissionFlagsBits.ReadMessageHistory
            ],
            deny: [
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AddReactions  // Emoji/tepki ekleyemez
            ]
          }
        ],
        reason: 'Auto-setup: Welcome channel'
      });
      console.log('   ✅ #welcome channel created');
      
      // Hoşgeldin mesajı gönder
      const welcomeMsg = await welcomeChannel.send({
        embeds: [{
          title: '🎯 Welcome to RektNow Community!',
          description: '**Thank you for joining!**\n\n🔒 **Access Required:**\nTo unlock all channels and join our community, you need to purchase **Panel Access** from our website.\n\n📋 **How to Get Access:**\n1. Visit: **https://rektnow.wtf**\n2. Purchase **Mass Report Panel**\n3. You will receive your **Panel Access Key**\n4. Use `/verify` command here to verify\n\n⚡ **Already purchased?** Type `/verify` to get access!\n\n**Note:** Only verified customers can access private channels.',
          color: 0x3b82f6,
          footer: { text: 'RektNow Community • rektnow.wtf' },
          thumbnail: { url: 'https://rektnow.wtf/crown.gif' }
        }]
      });
      console.log('   ✅ Welcome message sent');
    } else {
      console.log('   ✅ #welcome channel exists');
      
      // Mevcut kanal için izinleri güncelle
      try {
        await welcomeChannel.permissionOverwrites.set([
          {
            id: guild.id, // @everyone
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory
            ],
            deny: [
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AddReactions  // Emoji/tepki ekleyemez
            ]
          }
        ]);
        console.log('   ✅ #welcome permissions updated');
        
        // Yeni hoşgeldin mesajı gönder (eski mesaj silinmişse)
        const messages = await welcomeChannel.messages.fetch({ limit: 5 });
        const hasWelcomeMessage = messages.some(msg => 
          msg.author.id === client.user.id && msg.embeds.length > 0
        );
        
        if (!hasWelcomeMessage) {
          const welcomeMsg = await welcomeChannel.send({
            embeds: [{
              title: '🎯 Welcome to RektNow Community!',
              description: '**Thank you for joining!**\n\n🔒 **Access Required:**\nTo unlock all channels and join our community, you need to purchase **Panel Access** from our website.\n\n📋 **How to Get Access:**\n1. Visit: **https://rektnow.wtf**\n2. Purchase **Mass Report Panel**\n3. You will receive your **Panel Access Key**\n4. Use `/verify` command here to verify\n\n⚡ **Already purchased?** Type `/verify` to get access!\n\n**Note:** Only verified customers can access private channels.',
              color: 0x3b82f6,
              footer: { text: 'RektNow Community • rektnow.wtf' },
              thumbnail: { url: 'https://rektnow.wtf/crown.gif' }
            }]
          });
          
          console.log('   ✅ Welcome message sent');
        } else {
          console.log('   ✅ Welcome message exists');
        }
      } catch (err) {
        console.log('   ⚠️  Permission update error:', err.message);
      }
    }

    // 3. HIDE ALL OTHER CHANNELS (Customer-only)
    console.log('\n🔧 Setting up private channels...');
    
    const allChannels = guild.channels.cache.filter(c => 
      (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) && 
      c.name !== 'welcome'
    );
    
    for (const [channelId, channel] of allChannels) {
      try {
        // @everyone kanalı TAMAMEN GÖREMEMELİ (hem listelemede hem içerik)
        await channel.permissionOverwrites.edit(guild.id, {
          ViewChannel: false  // Kanal listesinde bile görünmez
        });
        
        // Sadece Customer rolü HER ŞEYİ yapabilir
        await channel.permissionOverwrites.edit(customerRole.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          Connect: true,
          Speak: true
        });
        
        console.log(`   ✅ #${channel.name} - Hidden (Customer-only)`);
      } catch (err) {
        console.log(`   ⚠️  #${channel.name} update failed: ${err.message}`);
      }
    }

    // 4. SERVER SETTINGS
    console.log('\n🔧 Server settings...');
    
    // Verification level düşür (botlar girebilsin, ama kanal göremesin)
    try {
      await guild.setVerificationLevel(0); // None - herkes katılabilir
      console.log('   ✅ Verification: None (anyone can join)');
    } catch (err) {
      console.log('   ⚠️  Verification setting failed:', err.message);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Roles: ${guild.roles.cache.size}`);
    console.log(`📺 Channels: ${guild.channels.cache.size}`);
    console.log(`👥 Members: ${guild.memberCount}`);
    console.log('');
    console.log('🤖 Bot is now running 24/7...');
    console.log('   Listening for /verify commands');
    console.log('   Press CTRL+C to stop\n');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Setup error:', error);
  }
});



// Handle /verify command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== 'verify') return;

  const username = interaction.options.getString('username');
  const accessKey = interaction.options.getString('access_key');

  // Validate access key format (XXXX-XXXX-XXXX-XXXX)
  const keyFormat = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
  
  if (!keyFormat.test(accessKey)) {
    return await interaction.reply({
      embeds: [{
        title: '❌ Invalid Key Format',
        description: `**Error:** Panel Access Key format is invalid.

**Expected Format:**
\`\`\`XXXX-XXXX-XXXX-XXXX\`\`\`
**Example:**
\`\`\`A1B2-C3D4-E5F6-G7H8\`\`\`

Please check your key and try again.`,
        color: 0xef4444,
        footer: { text: 'RektNow Verification System' }
      }],
      flags: 64 // MessageFlags.Ephemeral
    });
  }

  // Send initial "verifying" message
  await interaction.reply({
    embeds: [{
      title: '🔄 Verifying Panel Access',
      description: `**Username:** \`${username}\`\n**Access Key:** \`${accessKey}\`\n\n⏳ Checking credentials with RektNow servers...`,
      color: 0xf59e0b,
      footer: { text: 'This may take a few seconds' }
    }],
    flags: 64 // MessageFlags.Ephemeral
  });

  // Simulate verification delay (2-4 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Always fail (since there's no real verification backend)
  await interaction.editReply({
    embeds: [{
      title: '❌ Verification Failed',
      description: `**Username:** \`${username}\`
**Access Key:** \`${accessKey.substring(0, 9)}...\`

**Error:** Invalid credentials or Panel Access not found.

**Possible reasons:**
• Panel Access Key is incorrect
• Username does not match purchase record
• Panel Access has not been activated yet
• Panel Access has expired or been revoked

**Solutions:**
1. **Double-check your credentials** - Make sure you copied the exact key
2. **Purchase Panel Access** at https://rektnow.wtf if you haven't
3. **Contact Support** if you believe this is an error

**Need Help?**
Contact our support team with your order details.`,
      color: 0xef4444,
      footer: { text: 'RektNow Verification System • rektnow.wtf' },
      timestamp: new Date()
    }]
  });

  console.log(`🔐 Verification attempt: ${interaction.user.tag} | Username: ${username} | Key: ${accessKey}`);
});

// New member handler
client.on('guildMemberAdd', async (member) => {
  console.log(`👤 New member joined: ${member.user.tag} (Total: ${member.guild.memberCount})`);
  // Note: No automatic role assignment, use /verify command
});

// Keep-alive: Log status every 5 minutes
setInterval(() => {
  if (client.ws.status === 0) {
    console.log('✅ Discord bot is online and connected');
  } else {
    console.warn('⚠️ Discord bot connection status:', client.ws.status);
  }
}, 5 * 60 * 1000); // Every 5 minutes

client.login(BOT_TOKEN).catch((error) => {
  console.error('❌ Failed to login to Discord:', error);
  console.log('🔄 Retrying in 5 seconds...');
  setTimeout(() => {
    client.login(BOT_TOKEN);
  }, 5000);
});
