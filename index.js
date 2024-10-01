const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

// Initialize Express App
const app = express();
app.use(express.json());

// Telegram Bot Token
const token = '7568885051:AAESycbgLcX_SqG4LGoK7qc64V4hEzjpUcg';

// Initialize Telegram Bot
const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

app.use(express.static(path.join(__dirname, 'public')));

let users = {};

const initializeUser = (userId, userName = 'Unknown User') => {
  if (!users[userId]) {
    users[userId] = {
      name: userName,
      points: 0,
      clicks: 0,
      earningRate: 10,
      boostActive: false,
      lastUpdateTime: Date.now()
    };
  }
  console.log(`Initialized user: ${userId} (${users[userId].name})`);
};

// Update points for a user
const updateUserPoints = (userId) => {
  const user = users[userId];
  if (user) {
    const now = Date.now();
    const timeDiff = now - user.lastUpdateTime;
    const pointsToAdd = Math.floor(timeDiff / (2 * 60 * 1000)) * 100;
    
    if (pointsToAdd > 0) {
      user.points += pointsToAdd;
      user.lastUpdateTime = now - (timeDiff % (2 * 60 * 1000));
      console.log(`Added ${pointsToAdd} points to user ${userId} (${user.name}). Total points: ${user.points}`);
    }
  }
};

app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  initializeUser(userId);
  updateUserPoints(userId);
  res.json(users[userId]);
});

app.post('/api/user/:userId/tap', (req, res) => {
  const userId = req.params.userId;
  initializeUser(userId);
  updateUserPoints(userId);
  
  users[userId].points += users[userId].earningRate;
  users[userId].clicks += 1;
  
  res.json(users[userId]);
});

app.post('/api/user/:userId/boost', (req, res) => {
  const userId = req.params.userId;
  initializeUser(userId);
  updateUserPoints(userId);

  if (!users[userId].boostActive) {
    users[userId].points += 100;
    users[userId].boostActive = true;

    setTimeout(() => {
      users[userId].boostActive = false;
    }, 5 * 60 * 1000);
  }

  res.json(users[userId]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Web app is running on port ${PORT}`);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;

  initializeUser(chatId.toString(), userName);

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ 
          text: 'Open NotCoin Web App', 
          web_app: { url: 'https://telegram-bot-1-hg91.onrender.com' }
        }]
      ]
    }
  };

  bot.sendMessage(chatId, `Hello ${userName}! Click the button below to open the NotCoin Web App:`, options);
});

bot.on('polling_error', (error) => {
  console.log('Polling error:', error.code, error.response.body);
});

bot.on('error', (error) => {
  console.log('Error:', error);
});