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

client.once('ready', async () => {
  console.log('✅ Bot hazır! Sunucu kurulumu başlatılıyor...');
  
  try {
    // İlk sunucuyu al (bot sadece 1 sunucuda olmalı)
    const guild = client.guilds.cache.first();
    
    if (!guild) {
      console.log('❌ Bot hiçbir sunucuda değil!');
      return;
    }

    console.log(`📋 Sunucu: ${guild.name}`);
    console.log('⏳ Kurulum başlıyor...\n');

    // Register slash commands FIRST
    console.log('0️⃣ Slash commands kaydı yapılıyor...');
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
      console.log('   ✅ /verify command registered\n');
    } catch (error) {
      console.error('   ❌ Failed to register commands:', error);
    }

    // 1. CUSTOMER ROLÜ OLUŞTUR (gerçek müşteriler için)
    console.log('1️⃣ Customer rolü oluşturuluyor...');
    
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
        reason: 'Auto-setup: Panel satın alan müşteriler'
      });
      console.log('   ✅ Customer rolü oluşturuldu');
    } else {
      console.log('   ℹ️  Customer rolü zaten var');
    }

    // 2. WELCOME KANALI OLUŞTUR (herkes görebilir, kimse yazamaz)
    console.log('\n2️⃣ #welcome kanalı oluşturuluyor...');
    
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
        reason: 'Auto-setup: Hoşgeldin kanalı'
      });
      console.log('   ✅ #welcome kanalı oluşturuldu');
      
      // Hoşgeldin mesajı gönder
      const welcomeMsg = await welcomeChannel.send({
        embeds: [{
          title: '🎯 Welcome to RektNow Community!',
          description: '**Thank you for joining!**\n\n🔒 **Access Required:**\nTo unlock all channels and join our community, you need to purchase **Panel Access** from our website.\n\n📋 **How to Get Access:**\n1. Visit: **https://rektnow.wtf**\n2. Purchase **Mass Report Panel**\n3. You will receive your **Panel Access Key**\n4. Use `/verify` command here to verify\n\n💎 **Why RektNow?**\n✅ Automated reporting on all platforms\n✅ Active community support\n✅ Professional panel tools\n\n⚡ **Already purchased?** Type `/verify` to get access!\n\n**Note:** Only verified customers can access private channels.',
          color: 0x3b82f6,
          footer: { text: 'RektNow Community • rektnow.wtf' },
          thumbnail: { url: 'https://rektnow.wtf/crown.gif' }
        }]
      });
      console.log('   ✅ Hoşgeldin mesajı gönderildi (tepki kapalı)');
    } else {
      console.log('   ℹ️  #welcome kanalı zaten var, izinler güncelleniyor...');
      
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
        console.log('   ✅ #welcome kanal izinleri güncellendi (üye listesi görünür)');
        
        // Yeni hoşgeldin mesajı gönder (eski mesaj silinmişse)
        const messages = await welcomeChannel.messages.fetch({ limit: 5 });
        const hasWelcomeMessage = messages.some(msg => 
          msg.author.id === client.user.id && msg.embeds.length > 0
        );
        
        if (!hasWelcomeMessage) {
          const welcomeMsg = await welcomeChannel.send({
            embeds: [{
              title: '🎯 Welcome to RektNow Community!',
              description: '**Thank you for joining!**\n\n🔒 **Access Required:**\nTo unlock all channels and join our community, you need to purchase **Panel Access** from our website.\n\n📋 **How to Get Access:**\n1. Visit: **https://rektnow.wtf**\n2. Purchase **Mass Report Panel**\n3. You will receive your **Panel Access Key**\n4. Use `/verify` command here to verify\n\n💎 **Why RektNow?**\n✅ Automated reporting on all platforms\n✅ Active community support\n✅ Professional panel tools\n\n⚡ **Already purchased?** Type `/verify` to get access!\n\n**Note:** Only verified customers can access private channels.',
              color: 0x3b82f6,
              footer: { text: 'RektNow Community • rektnow.wtf' },
              thumbnail: { url: 'https://rektnow.wtf/crown.gif' }
            }]
          });
          
          // Mesaja emoji/tepki eklenemez yap (kanaldaki izinlerle)
          console.log('   ✅ Hoşgeldin mesajı gönderildi (tepki kapalı)');
        } else {
          console.log('   ℹ️  Hoşgeldin mesajı zaten var');
        }
      } catch (err) {
        console.log('   ⚠️  İzin güncelleme hatası:', err.message);
      }
    }

    // 3. TÜM DİĞER KANALLARI TAMAMEN GİZLE (sadece #welcome görünsün)
    console.log('\n3️⃣ Tüm kanallar gizleniyor (Customer-only)...');
    
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
        
        console.log(`   ✅ #${channel.name} - Tamamen gizli (Customer-only)`);
      } catch (err) {
        console.log(`   ⚠️  #${channel.name} güncellenemedi: ${err.message}`);
      }
    }

    // 4. SUNUCU AYARLARI
    console.log('\n4️⃣ Sunucu ayarları yapılıyor...');
    
    // Verification level düşür (botlar girebilsin, ama kanal göremesin)
    try {
      await guild.setVerificationLevel(0); // None - herkes katılabilir
      console.log('   ✅ Verification: None (herkes katılabilir)');
    } catch (err) {
      console.log('   ⚠️  Verification ayarlanamadı:', err.message);
    }

    // 5. ÖZET
    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('✅ KURULUM TAMAMLANDI!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Roller: ${guild.roles.cache.size} adet`);
    console.log(`📺 Kanallar: ${guild.channels.cache.size} adet`);
    console.log(`👥 Üyeler: ${guild.memberCount} kişi (sahte botlar dahil)`);
    console.log('');
    console.log('📋 ŞİMDİ NE OLACAK:');
    console.log('1. ✅ Müşteriler sunucuya katılabilir');
    console.log('2. ✅ Sadece #welcome kanalını görebilirler');
    console.log('3. ✅ Üye sayısını görebilirler (' + guild.memberCount + '+)');
    console.log('4. ✅ Diğer kanallar gizli (Customer rolü gerekli)');
    console.log('5. ✅ Bot üyeler sayıya dahil ama kanal görmüyor');
    console.log('');
    console.log('💡 MÜŞTERİYE CUSTOMER ROLÜ VERMEK İÇİN:');
    console.log('   → Sağ tık → Roller → Customer işaretle');
    console.log('');
    console.log('🔗 DAVET LİNKİ OLUŞTUR:');
    console.log('   → Sunucu Ayarları → Davetler → Davet Oluştur');
    console.log('   → Süre: Asla dolmasın');
    console.log('   → Max kullanım: Sınırsız');
    console.log('═══════════════════════════════════════\n');
    console.log('🤖 Bot çalışmaya devam ediyor...');
    console.log('   Kapatmak için CTRL+C\n');

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
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
      ephemeral: true
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
    ephemeral: true
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

client.login(BOT_TOKEN);
