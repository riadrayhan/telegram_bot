let userId = localStorage.getItem('userId') || Date.now().toString();
localStorage.setItem('userId', userId);

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

let lastUpdateTime = Date.now();

const updateUI = (user) => {
    document.getElementById('userId').textContent = user.name;
    document.getElementById('points').textContent = formatNumber(user.points);
    document.getElementById('clicks').textContent = formatNumber(user.clicks);
    document.getElementById('earningRate').textContent = user.earningRate;
    document.getElementById('boostButton').disabled = user.boostActive;
    
    lastUpdateTime = Date.now();
};

const updateCountdown = () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime;
    const timeUntilNextUpdate = 120000 - (timeSinceLastUpdate % 120000);
    const seconds = Math.floor(timeUntilNextUpdate / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    document.getElementById('countdown').textContent = 
        `Next treasure in ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const fetchUser = async () => {
    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error(`Failed to fetch user data: ${response.statusText}`);
        
        const user = await response.json();
        updateUI(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const tap = async () => {
    try {
        const response = await fetch(`/api/user/${userId}/tap`, { method: 'POST' });
        if (!response.ok) throw new Error(`Failed to tap: ${response.statusText}`);
        
        const user = await response.json();
        updateUI(user);
        animateTarget();
    } catch (error) {
        console.error('Error during tap:', error);
    }
};

const boost = async () => {
    try {
        const response = await fetch(`/api/user/${userId}/boost`, { method: 'POST' });
        if (!response.ok) throw new Error(`Failed to boost: ${response.statusText}`);
        
        const user = await response.json();
        updateUI(user);
        animateBoost();
    } catch (error) {
        console.error('Error during boost:', error);
    }
};

const animateTarget = () => {
    const target = document.getElementById('coinButton');
    target.style.transform = 'scale(1.1)';
    setTimeout(() => {
        target.style.transform = 'scale(1)';
    }, 100);
};

const animateBoost = () => {
    const boostButton = document.getElementById('boostButton');
    boostButton.classList.add('boost-active');
    setTimeout(() => {
        boostButton.classList.remove('boost-active');
    }, 500);
};

document.getElementById('coinButton').addEventListener('click', tap);
document.getElementById('boostButton').addEventListener('click', boost);

fetchUser();
setInterval(fetchUser, 5000);
setInterval(updateCountdown, 1000);

// Add particle effect on click
document.getElementById('coinButton').addEventListener('click', (e) => {
    createParticles(e.clientX, e.clientY);
});

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--x', (Math.random() - 0.5) * 100 + 'px');
        particle.style.setProperty('--y', (Math.random() - 0.5) * 100 + 'px');
        document.body.appendChild(particle);
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}