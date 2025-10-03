// Check API health and update status
async function checkAPIHealth() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('api-status').textContent = '🟢 Online';
      document.getElementById('api-status').style.color = '#48bb78';
      
      // Update uptime
      const uptimeSeconds = Math.floor(data.uptime);
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      document.getElementById('uptime').textContent = `${hours}h ${minutes}m`;
    }
  } catch (error) {
    document.getElementById('api-status').textContent = '🔴 Offline';
    document.getElementById('api-status').style.color = '#f56565';
    console.error('Failed to check API health:', error);
  }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Check API health on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAPIHealth();
  
  // Check API health every 30 seconds
  setInterval(checkAPIHealth, 30000);
});

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all feature cards and API examples
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.feature-card, .api-example, .stat-card');
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
