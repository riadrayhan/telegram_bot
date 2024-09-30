const TelegramBot = require('node-telegram-bot-api');
const express = require('express'); // Add this to create the server
const token = '7568885051:AAGOLMzgD971lYQ9k17aNO5Rr9Cwo62U-wI';
const bot = new TelegramBot(token, { polling: true });

// Store user data: points, clicks, and store purchases
let userData = {};

// Function to send the main interface message
const sendMainInterface = (chatId) => {
  const user = userData[chatId] || { points: 0, clicks: 0, boostActive: false, earningRate: 10 };

  const message = `
    *NotCoin*
    _User:_ *${chatId}*
    _Points:_ *${user.points}*
    _Clicks:_ *${user.clicks}*
    _Earning Rate:_ *${user.earningRate} points per click*

    Click below to earn more points or visit the store!
  `;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '💰 Click to Earn Points', callback_data: 'earn_points' }],
        [{ text: '🚀 Boost (+100 points)', callback_data: 'boost_points' }],
        [{ text: '🛒 Store', callback_data: 'store' }]
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

  if (query.data === 'earn_points') {
    // User clicks to earn points
    user.points += user.earningRate;
    user.clicks += 1;
    bot.answerCallbackQuery(query.id, { text: `You earned ${user.earningRate} points! Total: ${user.points}` });

    // Update the interface
    sendMainInterface(chatId);

  } else if (query.data === 'boost_points') {
    // User clicks the boost button
    if (user.boostActive) {
      bot.answerCallbackQuery(query.id, { text: 'You already have an active boost!' });
    } else {
      user.points += 100;
      user.boostActive = true;
      bot.answerCallbackQuery(query.id, { text: 'Boost applied! You earned 100 points! Total: ' + user.points });

      // Reset boost after a certain time (e.g., 5 minutes)
      setTimeout(() => {
        user.boostActive = false;
        bot.sendMessage(chatId, 'Your boost has expired. You can boost again!');
      }, 5 * 60000); // 5 minutes

      // Update the interface
      sendMainInterface(chatId);
    }

  } else if (query.data === 'store') {
    // Store menu: users can buy upgrades here
    const storeMessage = `
      🛒 *Store*
      - Buy a 2x Earning Rate for 500 points
      - Buy 500 points for $5 (for example)
    `;

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Buy 2x Earning Rate (500 points)', callback_data: 'buy_earning_rate' }],
          [{ text: 'Back', callback_data: 'back_to_main' }]
        ]
      }
    };

    bot.sendMessage(chatId, storeMessage, options);

  } else if (query.data === 'buy_earning_rate') {
    // User purchases 2x earning rate
    if (user.points >= 500) {
      user.points -= 500;
      user.earningRate *= 2; // Double the earning rate
      bot.answerCallbackQuery(query.id, { text: 'You have purchased 2x earning rate! Total points: ' + user.points });

      // Update the interface
      sendMainInterface(chatId);
    } else {
      bot.answerCallbackQuery(query.id, { text: 'Not enough points!' });
    }

  } else if (query.data === 'back_to_main') {
    // Return to the main interface
    sendMainInterface(chatId);
  }
});

// Express server setup
const app = express();
const port = process.env.PORT || 7000;

app.get('/', (req, res) => {
  res.send('Telegram bot is running.');
});

// Start the Express server
app.listen(port, () => console.log(`Server running on port ${port}`));
