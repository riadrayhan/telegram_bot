const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

// Initialize Express App
const app = express();

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

// Route for the main page of the web app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the Express server on port 3000 (or any other port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web app is running on port ${PORT}`);
});

// Telegram Bot: Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

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

  bot.sendMessage(chatId, 'Click the button below to open the NotCoin Web App:', options);
});

// Error handling for polling
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.code, error.response.body);
});

bot.on('error', (error) => {
  console.log('Error:', error);
});
