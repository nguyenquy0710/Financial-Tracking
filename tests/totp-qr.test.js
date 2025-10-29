/**
 * TOTP QR Code Parsing Tests
 * Tests the parseOtpAuthUrl function for QR code scanning
 */

describe('TOTP QR Code Parsing', () => {
  // Mock the parseOtpAuthUrl function from totp.js
  const parseOtpAuthUrl = (url) => {
    try {
      // Check if it's a valid otpauth URL
      if (!url.startsWith('otpauth://')) {
        return null;
      }

      const urlObj = new URL(url);
      
      // Extract type (totp or hotp) from hostname
      const type = urlObj.hostname.toUpperCase();
      
      // Extract label (issuer:accountName or just accountName)
      const path = decodeURIComponent(urlObj.pathname.substring(1));
      let issuer = '';
      let accountName = '';
      
      if (path.includes(':')) {
        const parts = path.split(':');
        issuer = parts[0];
        accountName = parts.slice(1).join(':');
      } else {
        accountName = path;
      }
      
      // Extract query parameters
      const params = new URLSearchParams(urlObj.search);
      const secret = params.get('secret');
      const algorithm = params.get('algorithm') || 'SHA1';
      const digits = parseInt(params.get('digits') || '6', 10);
      const period = parseInt(params.get('period') || '30', 10);
      const counter = parseInt(params.get('counter') || '0', 10);
      
      // Override issuer if provided in params
      if (params.get('issuer')) {
        issuer = params.get('issuer');
      }
      
      if (!secret) {
        throw new Error('Secret key không tìm thấy trong QR code');
      }
      
      // Fallback for issuer - use part before @ or the whole accountName
      if (!issuer) {
        issuer = accountName.includes('@') ? accountName.split('@')[0] : accountName;
      }
      
      return {
        type: type,
        issuer: issuer,
        accountName,
        secret,
        algorithm,
        digits,
        period,
        counter
      };
    } catch (error) {
      console.error('Failed to parse otpauth URL:', error);
      return null;
    }
  };

  describe('Valid TOTP QR Codes', () => {
    it('should parse standard TOTP QR code with issuer', () => {
      const url = 'otpauth://totp/ZaloForDevelopers:nguyen_quy?secret=B6CZ323QRPQ25DAHNS6ESAZPXQ33J7INVRGV73I2A7S3TRVFAQDA&issuer=ZaloForDevelopers';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.type).toBe('TOTP');
      expect(result.issuer).toBe('ZaloForDevelopers');
      expect(result.accountName).toBe('nguyen_quy');
      expect(result.secret).toBe('B6CZ323QRPQ25DAHNS6ESAZPXQ33J7INVRGV73I2A7S3TRVFAQDA');
      expect(result.algorithm).toBe('SHA1');
      expect(result.digits).toBe(6);
      expect(result.period).toBe(30);
    });

    it('should parse TOTP QR code without explicit issuer in params', () => {
      const url = 'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.type).toBe('TOTP');
      expect(result.issuer).toBe('Google');
      expect(result.accountName).toBe('user@example.com');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
    });

    it('should parse TOTP QR code with custom parameters', () => {
      const url = 'otpauth://totp/GitHub:myuser?secret=ABC123DEF456&algorithm=SHA256&digits=8&period=60';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.type).toBe('TOTP');
      expect(result.issuer).toBe('GitHub');
      expect(result.accountName).toBe('myuser');
      expect(result.secret).toBe('ABC123DEF456');
      expect(result.algorithm).toBe('SHA256');
      expect(result.digits).toBe(8);
      expect(result.period).toBe(60);
    });

    it('should parse TOTP QR code without issuer prefix', () => {
      const url = 'otpauth://totp/user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyService';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.type).toBe('TOTP');
      expect(result.issuer).toBe('MyService');
      expect(result.accountName).toBe('user@example.com');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
    });
  });

  describe('Valid HOTP QR Codes', () => {
    it('should parse HOTP QR code with counter', () => {
      const url = 'otpauth://hotp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&counter=5';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.type).toBe('HOTP');
      expect(result.issuer).toBe('Example');
      expect(result.accountName).toBe('user@example.com');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.counter).toBe(5);
    });
  });

  describe('Invalid QR Codes', () => {
    it('should return null for non-otpauth URLs', () => {
      const url = 'https://example.com/login';
      const result = parseOtpAuthUrl(url);

      expect(result).toBeNull();
    });

    it('should return null for otpauth URL without secret', () => {
      const url = 'otpauth://totp/Example:user@example.com';
      const result = parseOtpAuthUrl(url);

      expect(result).toBeNull();
    });

    it('should return null for invalid URL format', () => {
      const url = 'invalid-url-format';
      const result = parseOtpAuthUrl(url);

      expect(result).toBeNull();
    });
  });

  describe('URL Encoding', () => {
    it('should handle URL-encoded characters in label', () => {
      const url = 'otpauth://totp/My%20Service:user%40example.com?secret=JBSWY3DPEHPK3PXP';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.issuer).toBe('My Service');
      expect(result.accountName).toBe('user@example.com');
    });

    it('should handle accountName without @ symbol', () => {
      const url = 'otpauth://totp/username123?secret=JBSWY3DPEHPK3PXP';
      const result = parseOtpAuthUrl(url);

      expect(result).not.toBeNull();
      expect(result.issuer).toBe('username123');
      expect(result.accountName).toBe('username123');
    });
  });
});
