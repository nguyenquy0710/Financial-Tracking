// Check API health and update status
async function checkAPIHealth() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    console.log("🚀 QuyNH: checkAPIHealth -> data", data)

    if (data.success) {
      // document.getElementById('api-status').textContent = '🟢 Online';
      // document.getElementById('api-status').style.color = '#48bb78';

      // Update uptime
      const uptimeSeconds = Math.floor(data.uptime);
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      // document.getElementById('uptime').textContent = `${hours}h ${minutes}m`;
    }
  } catch (error) {
    // document.getElementById('api-status').textContent = '🔴 Offline';
    // document.getElementById('api-status').style.color = '#f56565';
    console.error('Failed to check API health:', error);
  }
}

// Check API health on page load
document.addEventListener('DOMContentLoaded', () => {
  // checkAPIHealth();

  // Check API health every 30 seconds
  // setInterval(checkAPIHealth, 30000);
});
