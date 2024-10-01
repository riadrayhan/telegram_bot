let userId = localStorage.getItem('userId') || Date.now().toString();
localStorage.setItem('userId', userId);

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const updateUI = (user) => {
    document.getElementById('points').textContent = formatNumber(user.points);
    document.getElementById('clicks').textContent = formatNumber(user.clicks);
    document.getElementById('earningRate').textContent = user.earningRate;
    document.getElementById('level').textContent = user.level;
    document.getElementById('levelProgress').style.setProperty('--progress', `${(user.level / 10) * 100}%`);
    document.getElementById('boostButton').disabled = user.boostActive;
};

const fetchUser = async () => {
    const response = await fetch(`/api/user/${userId}`);
    const user = await response.json();
    updateUI(user);
};

const tap = async () => {
    const response = await fetch(`/api/user/${userId}/tap`, { method: 'POST' });
    const user = await response.json();
    updateUI(user);
};

const boost = async () => {
    const response = await fetch(`/api/user/${userId}/boost`, { method: 'POST' });
    const user = await response.json();
    updateUI(user);
};

document.getElementById('coin').addEventListener('click', tap);
document.getElementById('boostButton').addEventListener('click', boost);

['achievementsButton', 'shopButton', 'referralButton'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        alert('This feature is coming soon!');
    });
});

fetchUser();
setInterval(fetchUser, 5000); // Update every 5 seconds