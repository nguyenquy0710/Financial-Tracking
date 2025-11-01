#!/usr/bin/env node
/**
 * Verification script for CSP headers configuration
 * This script starts a minimal test server to verify helmet CSP configuration
 * without requiring database connection.
 */

const express = require('express');
const helmet = require('helmet');
const http = require('http');

console.log('🔍 Starting CSP Headers Verification...\n');

// Create minimal app with helmet configuration
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'https://code.jquery.com',
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
        'https://challenges.cloudflare.com' // Cloudflare Turnstile
      ],
      styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com'
      ],
      fontSrc: [
        '\'self\'',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net'
      ],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: [
        '\'self\'',
        'https://challenges.cloudflare.com' // Cloudflare Turnstile API
      ],
      frameSrc: [
        '\'self\'',
        'https://challenges.cloudflare.com' // Cloudflare Turnstile iframe
      ],
      frameAncestors: ['\'self\'']
    }
  }
}));

app.get('/test', (req, res) => {
  res.json({ message: 'CSP test endpoint' });
});

// Start server temporarily
const server = app.listen(3001, () => {
  console.log('✅ Test server started on port 3001\n');
  
  // Make a test request to check headers
  http.get('http://localhost:3001/test', (res) => {
    const cspHeader = res.headers['content-security-policy'];
    
    console.log('📋 Content-Security-Policy Header:');
    console.log('─'.repeat(60));
    console.log(cspHeader);
    console.log('─'.repeat(60));
    console.log('\n🔎 Verification Results:\n');
    
    // Check for required directives
    const checks = [
      {
        name: 'Turnstile Script Source (scriptSrc)',
        pattern: /script-src[^;]*challenges\.cloudflare\.com/,
        found: cspHeader.match(/script-src[^;]*challenges\.cloudflare\.com/) !== null
      },
      {
        name: 'Turnstile Connection Source (connectSrc)',
        pattern: /connect-src[^;]*challenges\.cloudflare\.com/,
        found: cspHeader.match(/connect-src[^;]*challenges\.cloudflare\.com/) !== null
      },
      {
        name: 'Turnstile Frame Source (frameSrc)',
        pattern: /frame-src[^;]*challenges\.cloudflare\.com/,
        found: cspHeader.match(/frame-src[^;]*challenges\.cloudflare\.com/) !== null
      },
      {
        name: 'Frame Ancestors (frameAncestors)',
        pattern: /frame-ancestors/,
        found: cspHeader.includes('frame-ancestors')
      }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      const status = check.found ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${check.name}`);
      if (!check.found) allPassed = false;
    });
    
    console.log('\n' + '─'.repeat(60));
    if (allPassed) {
      console.log('✅ All CSP directives are correctly configured!');
      console.log('🎉 Cloudflare Turnstile should work properly.\n');
    } else {
      console.log('❌ Some CSP directives are missing or incorrect.');
      console.log('⚠️  Cloudflare Turnstile may not work properly.\n');
    }
    
    // Close server
    server.close(() => {
      console.log('🛑 Test server stopped.\n');
      process.exit(allPassed ? 0 : 1);
    });
  }).on('error', (err) => {
    console.error('❌ Error making test request:', err.message);
    server.close();
    process.exit(1);
  });
});

server.on('error', (err) => {
  console.error('❌ Error starting server:', err.message);
  process.exit(1);
});
