
document.addEventListener('DOMContentLoaded', () => {
    const userId = '123456789'; // Replace with actual user ID from Telegram
    const coinButton = document.getElementById('coinButton');
    const boostButton = document.getElementById('boostButton');
    const storeButton = document.getElementById('storeButton');

    function updateUserInfo() {
        fetch(`/api/user/${userId}`)
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
        fetch(`/api/user/${userId}`, { method: 'POST' })
            .then(() => updateUserInfo());
    });

    boostButton.addEventListener('click', () => {
        // Simulating a boost
        fetch(`/api/user/${userId}/boost`, { method: 'POST' })
            .then(() => updateUserInfo());
    });

    storeButton.addEventListener('click', () => {
        // Open store modal or navigate to store page
        alert('Store functionality not implemented in this demo');
    });

    // Initial user info update
    updateUserInfo();
});
