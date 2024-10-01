const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

// Initialize Express App
const app = express();
app.use(express.json());  // To parse JSON requests

// Telegram Bot Token
const token = '7568885051:AAESycbgLcX_SqG4LGoK7qc64V4hEzjpUcg';  // Replace with your actual bot token

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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user data (for testing, use a proper database for production)
let users = {};

// Helper function to initialize a user
const initializeUser = (userId, userName) => {
  if (!users[userId]) {
    users[userId] = {
      name: userName || 'Unknown User',  // Store the user's name
      points: 0,
      clicks: 0,
      earningRate: 10,
      boostActive: false
    };
  }
};

// Timer to add 100 points every 2 minutes for each user
setInterval(() => {
  Object.keys(users).forEach((userId) => {
    users[userId].points += 100;  // Add 100 points to every user
    console.log(`Added 100 points to user ${userId} (${users[userId].name}). Total points: ${users[userId].points}`);
  });
}, 2 * 60 * 1000);  // 2 minutes in milliseconds

// Route for fetching user data
app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  initializeUser(userId);  // Initialize if not present
  res.json(users[userId]);  // Send back the user's data
});

// Route for handling coin tap (click)
app.post('/api/user/:userId/tap', (req, res) => {
  const userId = req.params.userId;
  initializeUser(userId);  // Initialize if not present

  // Update the user points based on their earning rate
  users[userId].points += users[userId].earningRate;
  users[userId].clicks += 1;
  
  res.json(users[userId]);  // Send updated user data back
});

// Route for handling boost action
app.post('/api/user/:userId/boost', (req, res) => {
  const userId = req.params.userId;
  initializeUser(userId);  // Initialize if not present

  // Only apply boost if not already active
  if (!users[userId].boostActive) {
    users[userId].points += 100;  // Add 100 points as a boost
    users[userId].boostActive = true;

    // Set a timeout to reset boost after 5 minutes
    setTimeout(() => {
      users[userId].boostActive = false;
    }, 5 * 60 * 1000);  // 5 minutes in milliseconds
  }

  res.json(users[userId]);  // Send updated user data back
});

// Start the Express server on port 3000 (or any other port)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Web app is running on port ${PORT}`);
});

// Telegram Bot: Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;  // Get the user's first name from Telegram message

  initializeUser(chatId.toString(), userName);  // Initialize the user with the name

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ 
          text: 'Open NotCoin Web App', 
          web_app: { url: 'https://telegram-bot-1-hg91.onrender.com' }  // Replace with your Render URL
        }]
      ]
    }
  };

  bot.sendMessage(chatId, `Hello ${userName}! Click the button below to open the NotCoin Web App:`, options);
});

// Error handling for polling
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.code, error.response.body);
});

bot.on('error', (error) => {
  console.log('Error:', error);
});
