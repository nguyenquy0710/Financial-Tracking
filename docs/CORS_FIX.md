# CORS Fix for Cloudflare Turnstile

## Problem
The application was experiencing CORS (Cross-Origin Resource Sharing) errors when using Cloudflare Turnstile CAPTCHA:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3000/cdn-cgi/challenge-platform/h/g/rc/997af4f32d13cbe1. (Reason: CORS request did not succeed). Status code: (null).
```

## Root Cause
The `helmet` middleware was commented out, and when it was used previously, it didn't have the necessary Content Security Policy (CSP) directives to allow Cloudflare Turnstile to function properly.

Cloudflare Turnstile requires:
1. **Script loading** from `https://challenges.cloudflare.com`
2. **API connections** to `https://challenges.cloudflare.com`
3. **iframe embedding** from `https://challenges.cloudflare.com`

## Solution
Enabled the `helmet` middleware with proper CSP configuration in `src/index.js`:

### Changes Made:
1. **Uncommented helmet import:**
   ```javascript
   const helmet = require('helmet');
   ```

2. **Configured CSP directives for Turnstile:**
   ```javascript
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
   ```

## Verification Steps
To verify the fix works correctly:

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

3. **Open browser DevTools (F12)** and check:
   - **Console tab:** Should have no CORS errors related to Cloudflare Turnstile
   - **Network tab:** Requests to `challenges.cloudflare.com` should succeed (200 status)
   - **Application/Storage tab:** Check CSP headers in response headers

4. **Inspect response headers:**
   You should see a `content-security-policy` header that includes:
   - `script-src ... https://challenges.cloudflare.com`
   - `connect-src ... https://challenges.cloudflare.com`
   - `frame-src ... https://challenges.cloudflare.com`

5. **Test Turnstile functionality:**
   - The Turnstile widget should load correctly on login/register pages
   - You should be able to complete the CAPTCHA challenge
   - Form submission should work with Turnstile verification

## Additional Notes

### Security Best Practices
- The `helmet` middleware is now enabled, providing additional security headers
- CSP directives are configured to be restrictive while allowing necessary external resources
- `frameAncestors` directive prevents clickjacking attacks

### Environment-Specific Configuration
The fix works for both development and production environments. Make sure:
- `TURNSTILE_SITE_KEY` is set in your `.env` file
- `TURNSTILE_SECRET_KEY` is set in your `.env` file

### Related Files
- **Main configuration:** `src/index.js`
- **Turnstile verification:** `src/utils/turnstile.js`
- **Login page:** `views/login.ejs`
- **Register page:** `views/register.ejs`
- **Configuration:** `src/config/config.ts`

## Testing
While the existing test suite has TypeScript configuration issues unrelated to this fix, you can manually verify:

1. **Health check endpoint:**
   ```bash
   curl -I http://localhost:3000/health
   ```
   Look for `content-security-policy` header in the response.

2. **Browser testing:**
   Open the login page and check DevTools console for any CORS errors.

## Troubleshooting

### If CORS errors persist:
1. **Check browser console** for specific error messages
2. **Verify CSP headers** are being sent (check Network tab → Response Headers)
3. **Ensure Turnstile site key** is correctly configured in `.env`
4. **Clear browser cache** and hard reload (Ctrl+Shift+R)

### If Turnstile doesn't load:
1. Check that `https://challenges.cloudflare.com/turnstile/v0/api.js` is loading
2. Verify the site key in the template matches your Cloudflare dashboard
3. Check for any JavaScript errors in the console

## References
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Helmet CSP Configuration](https://helmetjs.github.io/docs/csp/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
