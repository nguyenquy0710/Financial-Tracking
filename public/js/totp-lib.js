/**
 * Client-side TOTP (Time-based One-Time Password) Library
 * Wrapper for otplib library
 */

class TOTPGenerator {
  /**
   * Generate TOTP code
   * @param {string} secret - Base32 encoded secret
   * @param {object} options - Configuration options
   * @returns {object} - { token, timeRemaining, period }
   */
  static generate(secret, options = {}) {
    if (typeof window.otplib === 'undefined') {
      throw new Error('otplib library is required. Please include it in your HTML.');
    }

    const {
      algorithm = 'SHA1',
      digits = 6,
      period = 30
    } = options;

    try {
      // Configure otplib authenticator with custom options
      const totp = window.otplib.totp;
      
      // Set options for this generation
      // Note: otplib expects lowercase algorithm names
      totp.options = {
        digits: digits,
        step: period,
        algorithm: algorithm.toLowerCase()
      };

      // Generate token
      const token = totp.generate(secret);
      
      // Calculate time remaining
      const timeRemaining = period - (Math.floor(Date.now() / 1000) % period);

      return {
        token,
        timeRemaining,
        period
      };
    } catch (error) {
      console.error('Error generating TOTP:', error);
      throw error;
    }
  }
}

// Export the class
if (typeof window !== 'undefined') {
  window.TOTPGenerator = TOTPGenerator;
}
