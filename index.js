require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

const app = express();
const token = process.env.TELEGRAM_BOT_TOKEN; // Load from Render environment variables or .env

// Initialize the bot with webhooks
const bot = new TelegramBot(token, { webHook: true });

// Set the webhook URL using Render's RENDER_EXTERNAL_URL environment variable
const URL = process.env.RENDER_EXTERNAL_URL;
bot.setWebHook(`${URL}/bot${token}`);

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Webhook endpoint for Telegram
app.use(express.json()); // For parsing JSON from Telegram
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body); // Pass the incoming webhook to Telegram
  res.sendStatus(200); // Respond with 200 OK to Telegram
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Webhook URL: ${URL}/bot${token}`);
});
