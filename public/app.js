// Generate user ID and save to local storage
let userId = localStorage.getItem('userId') || Date.now().toString();
localStorage.setItem('userId', userId);

// Format numbers for display (e.g., 1K for 1000, 1M for 1,000,000)
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Update the UI with user data
const updateUI = (user) => {
  document.getElementById('userId').textContent = user.name;  // Show the user's name
  document.getElementById('points').textContent = formatNumber(user.points);
  document.getElementById('clicks').textContent = formatNumber(user.clicks);
  document.getElementById('earningRate').textContent = user.earningRate;
  document.getElementById('boostButton').disabled = user.boostActive;
};

// Fetch user data from the server and update the UI
const fetchUser = async () => {
  const response = await fetch(`/api/user/${userId}`);
  const user = await response.json();
  updateUI(user);
};

// Handle the "coin" button click (tap/click action)
const tap = async () => {
  const response = await fetch(`/api/user/${userId}/tap`, { method: 'POST' });
  const user = await response.json();
  updateUI(user);
};

// Handle the "boost" button click
const boost = async () => {
  const response = await fetch(`/api/user/${userId}/boost`, { method: 'POST' });
  const user = await response.json();
  updateUI(user);
};

// Add event listeners for buttons
document.getElementById('coinButton').addEventListener('click', tap);
document.getElementById('boostButton').addEventListener('click', boost);

// Fetch user data on page load and periodically update every 5 seconds
fetchUser();
setInterval(fetchUser, 5000);  // Update every 5 seconds
