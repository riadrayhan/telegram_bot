const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// Replace with your bot token
const token = '7568885051:AAGOLMzgD971lYQ9k17aNO5Rr9Cwo62U-wI';
const bot = new TelegramBot(token, { webHook: true });

// Replace with your actual URL (e.g., https://your-domain.com)
const url = 'https://telegram-bot-1-oz7c.onrender.com';
const port = process.env.PORT || 7001;

// Set up the webhook
bot.setWebHook(`${url}/bot${token}`);

// Serve static files (CSS, images, etc.)
app.use(express.static('public'));

// Serve the HTML file for the Web App
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Middleware to handle incoming updates
app.use(express.json());
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot logic
let userData = {};

// Function to send the main interface message
const sendMainInterface = (chatId) => {
  const user = userData[chatId] || { points: 0, clicks: 0, boostActive: false, earningRate: 10 };

  const message = `
*💰 NotCoin Balance*
*Points:* ${user.points}
*Clicks:* ${user.clicks}
*Earning Rate:* ${user.earningRate} points per click

Choose an action below:
  `;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '💰 Earn Points', callback_data: 'earn_points' }],
        [{ text: '🚀 Boosts', callback_data: 'boosts' }],
        [{ text: '🧸 Frens', callback_data: 'frens' }],
        [{ text: '🛒 Store', callback_data: 'store' }],
        [{ text: '🌐 Open Dashboard', web_app: { url: `${url}` } }]
      ]
    }
  };

  bot.sendMessage(chatId, message, options);
};

// Function to handle automatic point increments (e.g., every 5 minutes)
const startScheduledPoints = (chatId, intervalInMinutes = 1) => {
  if (!userData[chatId].intervalId) {
    userData[chatId].intervalId = setInterval(() => {
      userData[chatId].points += 100; // Auto-earn points
      bot.sendMessage(chatId, `💵 You've earned 100 points automatically! Your total points: ${userData[chatId].points}`);
    }, intervalInMinutes * 60000); // interval in milliseconds
  }
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Initialize user data if not already set
  if (!userData[chatId]) {
    userData[chatId] = { points: 0, clicks: 0, boostActive: false, earningRate: 10, intervalId: null };
  }

  // Send the main interface
  sendMainInterface(chatId);

  // Start scheduled auto points (set to 5-minute intervals for this example)
  startScheduledPoints(chatId, 5);
});

// Handle button clicks (callback queries)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const user = userData[chatId];

  switch (query.data) {
    case 'earn_points':
      // User clicks to earn points
      user.points += user.earningRate;
      user.clicks += 1;
      bot.answerCallbackQuery(query.id, { text: `You earned ${user.earningRate} points! Total: ${user.points}` });
      // Update the interface
      sendMainInterface(chatId);
      break;

    case 'boosts':
      // Handle boost
      bot.sendMessage(chatId, '🚀 Boosts are coming soon.');
      break;

    case 'frens':
      // Handle frens
      bot.sendMessage(chatId, '🧸 Frens feature is coming soon.');
      break;

    case 'store':
      // Handle store
      bot.sendMessage(chatId, '🛒 The store is under development.');
      break;

    default:
      bot.answerCallbackQuery(query.id, { text: 'Unknown command.' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
