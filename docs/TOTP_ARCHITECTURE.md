# TOTP Implementation Architecture

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOTP Page (totp.ejs)                    │
├─────────────────────────────────────────────────────────────────┤
│  External Libraries:                                            │
│  • jsSHA (CDN) - HMAC cryptographic functions                   │
├─────────────────────────────────────────────────────────────────┤
│  Custom JavaScript Modules:                                     │
│  1. totp-indexeddb.js - IndexedDB storage manager               │
│  2. totp-lib.js       - TOTP code generator                     │
│  3. totp.js           - Main application logic                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Browser IndexedDB                            │
├─────────────────────────────────────────────────────────────────┤
│  Database: FinTrackTOTP                                         │
│  Store: accounts                                                │
│  Fields:                                                        │
│    • _id (primary key)                                          │
│    • serviceName                                                │
│    • accountName                                                │
│    • secret (plaintext Base32)                                  │
│    • algorithm (SHA1/SHA256/SHA512)                             │
│    • digits (6/7/8)                                             │
│    • period (seconds)                                           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Sync
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server API                                 │
├─────────────────────────────────────────────────────────────────┤
│  GET /api/totp                                                  │
│    → Returns all accounts with decrypted secrets                │
│                                                                 │
│  POST /api/totp                                                 │
│    → Creates new account                                        │
│                                                                 │
│  PUT /api/totp/:id                                              │
│    → Updates account                                            │
│                                                                 │
│  DELETE /api/totp/:id                                           │
│    → Deletes account                                            │
│                                                                 │
│  [DEPRECATED] GET /api/totp/:id/generate                        │
│    → No longer used by client                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MongoDB Database                            │
├─────────────────────────────────────────────────────────────────┤
│  Collection: totps                                              │
│  Fields:                                                        │
│    • userId (reference)                                         │
│    • serviceName                                                │
│    • accountName                                                │
│    • encryptedSecret (AES-256-CBC encrypted)                    │
│    • algorithm                                                  │
│    • digits                                                     │
│    • period                                                     │
│    • createdAt, updatedAt                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Page Load Flow

```
User opens TOTP page
       │
       ├──> Initialize IndexedDB
       │         │
       │         └──> Create database "FinTrackTOTP"
       │
       ├──> Load from IndexedDB (Step 1)
       │         │
       │         ├──> If data exists → Display codes immediately ✓
       │         └──> If empty → Show loading message
       │
       ├──> Fetch from Server (Step 2)
       │         │
       │         ├──> GET /api/totp
       │         │         │
       │         │         └──> Returns accounts with secrets
       │         │
       │         ├──> Sync to IndexedDB
       │         │         │
       │         │         └──> Save/Update all accounts
       │         │
       │         └──> Generate TOTP codes (client-side)
       │                   │
       │                   ├──> For each account:
       │                   │    ├──> TOTPGenerator.generate(secret)
       │                   │    ├──> Display 6-digit code
       │                   │    └──> Start countdown timer
       │                   │
       │                   └──> Auto-refresh when timer expires
       │
       └──> Setup UI event handlers
```

### 2. Code Generation Flow (Client-Side)

```
Every second:
    │
    ├──> Get current timestamp
    │
    ├──> Calculate time remaining = period - (now % period)
    │
    ├──> Update timer display
    │
    └──> If time remaining < 1:
              │
              ├──> Calculate counter = floor(now / period)
              │
              ├──> Base32 decode secret
              │
              ├──> HMAC-SHA(secret, counter)
              │         │
              │         └──> jsSHA library
              │
              ├──> Dynamic truncation
              │
              ├──> Extract 6/7/8 digits
              │
              └──> Display new code
```

### 3. Add Account Flow

```
User fills form
    │
    ├──> Validate input
    │     ├──> Service name (required)
    │     ├──> Account name (required)
    │     └──> Secret (Base32 format)
    │
    ├──> POST /api/totp
    │     │
    │     ├──> Server encrypts secret
    │     └──> Save to MongoDB
    │
    ├──> Sync with server
    │     │
    │     ├──> GET /api/totp (get all accounts)
    │     └──> Update IndexedDB
    │
    └──> Re-render UI
          │
          └──> Generate codes for all accounts
```

### 4. Offline Mode Flow

```
No internet connection
    │
    ├──> Page load
    │
    ├──> Initialize IndexedDB ✓
    │
    ├──> Load from IndexedDB ✓
    │     │
    │     └──> Display cached accounts
    │
    ├──> Try sync with server ✗
    │     │
    │     └──> Network error (ignore)
    │
    └──> Generate codes locally ✓
          │
          ├──> All data available in IndexedDB
          ├──> jsSHA works offline
          └──> Codes update normally
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Device                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Browser Memory:                                                │
│    • Decrypted secrets (temporary)                              │
│    • Generated TOTP codes (6 digits)                            │
│                                                                 │
│  IndexedDB:                                                     │
│    • Plaintext secrets ⚠️                                       │
│    • Account metadata                                           │
│                                                                 │
│  Protection:                                                    │
│    • Device-level security (OS login)                           │
│    • Browser sandboxing                                         │
│    • Same-origin policy                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS Only
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Server                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MongoDB:                                                       │
│    • AES-256-CBC encrypted secrets 🔒                           │
│    • Encryption key in environment variable                     │
│                                                                 │
│  API Response:                                                  │
│    • Decrypts secret before sending                             │
│    • Requires valid JWT token                                   │
│    • User can only access their own accounts                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Comparison

### Before (Server-Side Generation)

```
User Action: View TOTP code
    │
    ├──> Page load: 200ms
    │
    ├──> Fetch accounts: 150ms
    │
    ├──> For each account:
    │     │
    │     └──> GET /api/totp/:id/generate: 50ms
    │           │
    │           └──> Total for 5 accounts: 250ms
    │
    └──> Total time: 600ms
```

### After (Client-Side Generation)

```
User Action: View TOTP code
    │
    ├──> Page load: 200ms
    │
    ├──> Initialize IndexedDB: 100ms
    │
    ├──> Load from IndexedDB: 50ms
    │     │
    │     └──> Display codes immediately ✓
    │
    ├──> Fetch accounts: 150ms
    │
    ├──> Generate all codes: 5ms (client-side)
    │
    └──> Total time: 505ms (19% faster)
         │
         └──> Subsequent loads: 150ms (from cache)
                                  75% faster!
```

## Technology Stack

```
Frontend:
├── Vanilla JavaScript (ES6+)
├── IndexedDB API
├── jsSHA 3.3.1 (SHA hashing)
└── Bootstrap 5.3 (UI)

Backend:
├── Node.js + Express
├── MongoDB + Mongoose
├── otplib 12.0.1 (server validation)
└── crypto (AES encryption)

Standards:
├── RFC 6238 (TOTP)
├── RFC 4226 (HOTP)
└── RFC 4648 (Base32)
```
