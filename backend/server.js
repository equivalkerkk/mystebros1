import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const { sendPaymentStatusNotification } = await import('./telegram.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://rektnow.wtf', 'https://www.rektnow.wtf'],
  credentials: true
}));
app.use(express.json());

const usersFile = path.join(__dirname, 'users.json');
const sessionsFile = path.join(__dirname, 'sessions.json');

// Initialize files
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, '[]');
}
if (!fs.existsSync(sessionsFile)) {
  fs.writeFileSync(sessionsFile, '{}');
}

// Get users
function getUsers() {
  const data = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(data);
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Get sessions
function getSessions() {
  const data = fs.readFileSync(sessionsFile, 'utf8');
  return JSON.parse(data);
}

// Save sessions
function saveSessions(sessions) {
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
}

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Register endpoint
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Missing credentials' });
  }

  const users = getUsers();

  // Check if user already exists
  if (users.find(u => u.username === username)) {
    return res.json({ success: false, message: 'Username already exists' });
  }

  // Add new user
  const newUser = {
    username,
    password,
    displayName: username, // Default display name = username
    nameChangeCount: 0, // Track how many times name has been changed
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  users.push(newUser);
  saveUsers(users);

  console.log(`✅ User registered: ${username}`);

  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      username: newUser.username,
      createdAt: newUser.createdAt
    }
  });
});

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Missing credentials' });
  }

  const users = getUsers();

  // Find matching user
  const userIndex = users.findIndex(u => u.username === username && u.password === password);

  if (userIndex !== -1) {
    // Update last login
    users[userIndex].lastLogin = new Date().toISOString();
    saveUsers(users);

    // Create session token
    const token = generateToken();
    const sessions = getSessions();
    sessions[token] = {
      username: users[userIndex].username,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    saveSessions(sessions);

    console.log(`✅ User logged in: ${username}`);
    console.log(`🔑 Session token: ${token}`);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        username: users[userIndex].username,
        displayName: users[userIndex].displayName || users[userIndex].username,
        nameChangeCount: users[userIndex].nameChangeCount || 0,
        createdAt: users[userIndex].createdAt,
        lastLogin: users[userIndex].lastLogin
      }
    });
  } else {
    console.log(`❌ Login failed: ${username}`);
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

// List users (for debugging)
app.get('/auth/list', (req, res) => {
  const users = getUsers();
  res.json({
    success: true,
    total: users.length,
    users: users.map(u => ({
      username: u.username,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    }))
  });
});

// Verify session
app.post('/auth/verify', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.json({ success: false, message: 'No token provided' });
  }
  
  const sessions = getSessions();
  const session = sessions[token];
  
  if (!session) {
    return res.json({ success: false, message: 'Invalid session' });
  }
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    saveSessions(sessions);
    return res.json({ success: false, message: 'Session expired' });
  }
  
  // Get user's display name
  const users = getUsers();
  const user = users.find(u => u.username === session.username);
  
  console.log(`✅ Session verified: ${session.username}`);
  
  res.json({
    success: true,
    user: {
      username: session.username,
      displayName: user?.displayName || session.username,
      nameChangeCount: user?.nameChangeCount || 0,
      loginTime: session.loginTime
    }
  });
});

// Update display name endpoint
app.post('/auth/update-display-name', (req, res) => {
  const { token, displayName } = req.body;
  
  if (!token || !displayName) {
    return res.json({ success: false, message: 'Missing parameters' });
  }
  
  // Verify session
  const sessions = getSessions();
  const session = sessions[token];
  
  if (!session) {
    return res.json({ success: false, message: 'Invalid session' });
  }
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    saveSessions(sessions);
    return res.json({ success: false, message: 'Session expired' });
  }
  
  // Update display name
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === session.username);
  
  if (userIndex === -1) {
    return res.json({ success: false, message: 'User not found' });
  }
  
  // Check name change limit (3 times)
  const currentCount = users[userIndex].nameChangeCount || 0;
  if (currentCount >= 3) {
    return res.json({ 
      success: false, 
      message: 'You have reached the maximum number of name changes (3)' 
    });
  }
  
  users[userIndex].displayName = displayName.trim();
  users[userIndex].nameChangeCount = currentCount + 1;
  saveUsers(users);
  
  console.log(`✅ Display name updated: ${session.username} -> ${displayName} (${users[userIndex].nameChangeCount}/3)`);
  
  res.json({
    success: true,
    message: 'Display name updated',
    displayName: users[userIndex].displayName,
    nameChangeCount: users[userIndex].nameChangeCount,
    remainingChanges: 3 - users[userIndex].nameChangeCount
  });
});

// NOWPayments IPN (Instant Payment Notification) callback
app.post('/api/payment-callback', async (req, res) => {
  try {
    console.log('=== Payment Callback Received ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const paymentData = req.body;
    
    // Send Telegram notification about payment status change
    try {
      await sendPaymentStatusNotification({
        paymentId: paymentData.payment_id || 'N/A',
        status: paymentData.payment_status || 'unknown',
        amount: paymentData.pay_amount || '0',
        crypto: paymentData.pay_currency || 'N/A',
        network: paymentData.network || undefined,
        timestamp: new Date().toISOString()
      });
    } catch (notifyError) {
      console.error('Failed to send Telegram notification:', notifyError);
    }
    
    console.log(`💰 Payment Status Update: ${paymentData.payment_id} - ${paymentData.payment_status}`);
    
    // Respond to NOWPayments
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PayGate.to callback handler
app.all('/api/paygate-callback', async (req, res) => {
  try {
    console.log('=== PayGate Callback Received ===');
    console.log('Method:', req.method);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    const paymentId = req.query.payment || req.body.payment || 'N/A';
    const status = req.query.status || req.body.status || 'completed';
    const amount = req.query.amount || req.body.amount || 'N/A';
    
    // Send Telegram notification
    try {
      await sendPaymentStatusNotification({
        paymentId: paymentId,
        status: status,
        amount: amount,
        crypto: 'Card Payment',
        network: req.query.provider || req.body.provider,
        timestamp: new Date().toISOString()
      });
    } catch (notifyError) {
      console.error('Failed to send Telegram notification:', notifyError);
    }
    
    console.log(`💳 Card Payment Callback: ${paymentId} - ${status}`);
    
    // Respond OK
    res.status(200).send('OK');
  } catch (error) {
    console.error('PayGate callback error:', error);
    res.status(500).send('Error');
  }
});

// NOWPayments API Proxy - Estimate
app.get('/api/nowpayments/estimate', async (req, res) => {
  try {
    const { amount, currency_from, currency_to } = req.query;
    const API_KEY = 'WDTQ64V-WMN4M4M-JNCK2PM-1QWZYBH';
    
    const url = `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currency_from}&currency_to=${currency_to}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Estimate proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch estimate' });
  }
});

// NOWPayments API Proxy - Create Payment
app.post('/api/nowpayments/payment', async (req, res) => {
  try {
    const API_KEY = 'WDTQ64V-WMN4M4M-JNCK2PM-1QWZYBH';
    
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Payment proxy error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📋 Users file: ${usersFile}`);
});
