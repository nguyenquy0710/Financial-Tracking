const axios = require('axios');
const { default: config } = require('../config/config');

/**
 * Verify Cloudflare Turnstile token
 * @param {string} token - The Turnstile token to verify
 * @param {string} remoteip - Optional: The user's IP address
 * @returns {Promise<boolean>} - Returns true if verification is successful
 */
async function verifyTurnstileToken(token, remoteip = null) {
  // Skip verification in test environment
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  if (!token) {
    throw new Error('Turnstile token is required');
  }

  const secretKey = config.turnstile.secretKey;
  if (!secretKey) {
    throw new Error('Turnstile secret key is not configured');
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await axios.post(config.turnstile.verifyURL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error.message);
    throw new Error('Failed to verify Turnstile token');
  }
}

module.exports = {
  verifyTurnstileToken
};
