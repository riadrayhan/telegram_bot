const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get user data
app.get('/api/user/:chatId', (req, res) => {
  const chatId = req.params.chatId;
  const user = userData[chatId] || { points: 0, clicks: 0, boostActive: false, earningRate: 10 };
  res.json(user);
});

// Start the Express server
app.listen(port, () => console.log(`Server running on port ${port}`));

// Create the necessary directories and files
const fs = require('fs');
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir);
}

// Create index.html
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NotCoin Clone</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="container">
        <h1>NotCoin Clone</h1>
        <div id="userInfo">
            <p>User: <span id="userId"></span></p>
            <p>Points: <span id="points"></span></p>
            <p>Clicks: <span id="clicks"></span></p>
            <p>Earning Rate: <span id="earningRate"></span></p>
        </div>
        <div class="coin" id="coinButton">
            <img src="/coin.png" alt="Coin">
        </div>
        <button id="boostButton" class="boost-button">🚀 Boost</button>
        <button id="storeButton" class="store-button">🛒 Store</button>
    </div>
    <script src="/app.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

// Create styles.css
const stylesCss = `
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.container {
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

h1 {
    color: #4a4a4a;
}

#userInfo {
    margin-bottom: 20px;
}

.coin {
    width: 150px;
    height: 150px;
    margin: 20px auto;
    cursor: pointer;
    transition: transform 0.1s;
}

.coin:active {
    transform: scale(0.95);
}

.coin img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.boost-button {
    background-color: #ffd700;
    color: #4a4a4a;
}

.store-button {
    background-color: #4caf50;
    color: white;
}

button:hover {
    opacity: 0.8;
}
`;

fs.writeFileSync(path.join(publicDir, 'styles.css'), stylesCss);

// Create app.js
const appJs = `
document.addEventListener('DOMContentLoaded', () => {
    const userId = '123456789'; // Replace with actual user ID from Telegram
    const coinButton = document.getElementById('coinButton');
    const boostButton = document.getElementById('boostButton');
    const storeButton = document.getElementById('storeButton');

    function updateUserInfo() {
        fetch(\`/api/user/\${userId}\`)
            .then(response => response.json())
            .then(user => {
                document.getElementById('userId').textContent = userId;
                document.getElementById('points').textContent = user.points;
                document.getElementById('clicks').textContent = user.clicks;
                document.getElementById('earningRate').textContent = user.earningRate;
            });
    }

    coinButton.addEventListener('click', () => {
        // Simulating a click to earn points
        fetch(\`/api/user/\${userId}\`, { method: 'POST' })
            .then(() => updateUserInfo());
    });

    boostButton.addEventListener('click', () => {
        // Simulating a boost
        fetch(\`/api/user/\${userId}/boost\`, { method: 'POST' })
            .then(() => updateUserInfo());
    });

    storeButton.addEventListener('click', () => {
        // Open store modal or navigate to store page
        alert('Store functionality not implemented in this demo');
    });

    // Initial user info update
    updateUserInfo();
});
`;

fs.writeFileSync(path.join(publicDir, 'app.js'), appJs);

// You'll need to add a coin image to the public directory
// For this example, you can use a placeholder or add your own image named 'coin.png'