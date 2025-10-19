/**
 * Client-side TOTP (Time-based One-Time Password) Library
 * Based on RFC 6238 standard
 */

class TOTPGenerator {
  /**
   * Generate TOTP code
   * @param {string} secret - Base32 encoded secret
   * @param {object} options - Configuration options
   * @returns {object} - { token, timeRemaining, period }
   */
  static generate(secret, options = {}) {
    const {
      algorithm = 'SHA1',
      digits = 6,
      period = 30
    } = options;

    const counter = Math.floor(Date.now() / 1000 / period);
    const token = this.generateHOTP(secret, counter, digits, algorithm);
    const timeRemaining = period - (Math.floor(Date.now() / 1000) % period);

    return {
      token,
      timeRemaining,
      period
    };
  }

  /**
   * Generate HOTP code (counter-based)
   * @param {string} secret - Base32 encoded secret
   * @param {number} counter - Counter value
   * @param {number} digits - Number of digits in output
   * @param {string} algorithm - Hash algorithm (SHA1, SHA256, SHA512)
   * @returns {string} - HOTP code
   */
  static generateHOTP(secret, counter, digits, algorithm) {
    const key = this.base32ToHex(secret);
    const time = this.leftpad(this.dec2hex(counter), 16, '0');
    
    // Use HMAC with the specified algorithm
    const hmac = this.hmac(algorithm, key, time);
    
    // Dynamic truncation
    const offset = parseInt(hmac.substring(hmac.length - 1), 16);
    const otp = (parseInt(hmac.substr(offset * 2, 8), 16) & 0x7fffffff) + '';
    
    return otp.substr(otp.length - digits, digits);
  }

  /**
   * Convert Base32 string to hex
   * @param {string} base32 - Base32 encoded string
   * @returns {string} - Hex string
   */
  static base32ToHex(base32) {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let hex = '';

    base32 = base32.replace(/=+$/, '');

    for (let i = 0; i < base32.length; i++) {
      const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
      if (val === -1) throw new Error('Invalid base32 character in key');
      bits += this.leftpad(val.toString(2), 5, '0');
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
      const chunk = bits.substr(i, 8);
      hex += this.leftpad(parseInt(chunk, 2).toString(16), 2, '0');
    }

    return hex;
  }

  /**
   * HMAC function using Web Crypto API
   * @param {string} algorithm - Hash algorithm
   * @param {string} key - Hex key
   * @param {string} message - Hex message
   * @returns {string} - HMAC hash in hex
   */
  static hmac(algorithm, key, message) {
    // For synchronous operation, use a simple implementation
    // This uses jsSHA if available, otherwise falls back to CryptoJS
    const hashAlgo = algorithm.toUpperCase().replace('SHA', 'SHA-');
    
    // Convert hex to bytes
    const keyBytes = this.hexToBytes(key);
    const messageBytes = this.hexToBytes(message);
    
    // Use SubtleCrypto API (async), but we'll use a sync polyfill
    return this.hmacSync(hashAlgo, keyBytes, messageBytes);
  }

  /**
   * Synchronous HMAC implementation
   * Uses a simple HMAC-SHA1 implementation
   */
  static hmacSync(algorithm, key, message) {
    // For now, we'll use a simple SHA-1 implementation
    // In production, you might want to use a library like jsSHA or CryptoJS
    
    // This is a simplified version - in real implementation,
    // you should use a proper crypto library
    if (algorithm === 'SHA-1') {
      return this.hmacSHA1(key, message);
    } else if (algorithm === 'SHA-256') {
      return this.hmacSHA256(key, message);
    } else if (algorithm === 'SHA-512') {
      return this.hmacSHA512(key, message);
    }
    
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  /**
   * HMAC-SHA1 implementation using built-in crypto
   */
  static hmacSHA1(key, message) {
    // Using a simple SHA-1 HMAC implementation
    // Block size for SHA-1 is 64 bytes
    const blockSize = 64;
    
    // Adjust key length
    if (key.length > blockSize) {
      key = this.sha1(key);
    }
    if (key.length < blockSize) {
      const padding = new Array(blockSize - key.length).fill(0);
      key = key.concat(padding);
    }
    
    // Create inner and outer padded keys
    const oKeyPad = key.map(b => b ^ 0x5c);
    const iKeyPad = key.map(b => b ^ 0x36);
    
    // HMAC = H(oKeyPad || H(iKeyPad || message))
    const innerHash = this.sha1(iKeyPad.concat(message));
    const hmac = this.sha1(oKeyPad.concat(innerHash));
    
    return this.bytesToHex(hmac);
  }

  /**
   * Simple SHA-1 implementation
   */
  static sha1(bytes) {
    // This is a placeholder - use a proper SHA-1 library
    // For now, we'll throw an error suggesting to use jsSHA
    throw new Error('SHA-1 implementation required. Please include jsSHA library.');
  }

  /**
   * HMAC-SHA256 placeholder
   */
  static hmacSHA256(key, message) {
    throw new Error('SHA-256 implementation required. Please include jsSHA library.');
  }

  /**
   * HMAC-SHA512 placeholder
   */
  static hmacSHA512(key, message) {
    throw new Error('SHA-512 implementation required. Please include jsSHA library.');
  }

  /**
   * Convert hex string to byte array
   */
  static hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  /**
   * Convert byte array to hex string
   */
  static bytesToHex(bytes) {
    return bytes.map(b => this.leftpad(b.toString(16), 2, '0')).join('');
  }

  /**
   * Left pad a string
   */
  static leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
      str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
  }

  /**
   * Convert decimal to hex
   */
  static dec2hex(s) {
    return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
  }
}

// Since implementing SHA-1/256/512 from scratch is complex and error-prone,
// let's use jsSHA library which is available via CDN
// We'll create a wrapper that uses jsSHA

class TOTPGeneratorWithJsSHA extends TOTPGenerator {
  /**
   * HMAC implementation using jsSHA library
   */
  static hmac(algorithm, key, message) {
    if (typeof jsSHA === 'undefined') {
      throw new Error('jsSHA library is required. Please include it in your HTML.');
    }

    // Map algorithm names
    const algoMap = {
      'SHA1': 'SHA-1',
      'SHA256': 'SHA-256',
      'SHA512': 'SHA-512'
    };

    const shaVariant = algoMap[algorithm.toUpperCase()] || 'SHA-1';
    
    try {
      const shaObj = new jsSHA(shaVariant, 'HEX');
      shaObj.setHMACKey(key, 'HEX');
      shaObj.update(message);
      return shaObj.getHMAC('HEX');
    } catch (error) {
      console.error('Error generating HMAC:', error);
      throw error;
    }
  }
}

// Export the appropriate class
if (typeof window !== 'undefined') {
  window.TOTPGenerator = TOTPGeneratorWithJsSHA;
}
