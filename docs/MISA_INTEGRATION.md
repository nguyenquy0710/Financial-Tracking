# MISA Money Keeper API Integration

This document describes the integration of MISA Money Keeper (Sổ thủ chi) APIs into the FinTrack application.

## Overview

The MISA integration provides 5 API endpoints to interact with MISA Money Keeper service:

1. **Login** - Authentication with MISA Money Keeper
2. **Get User Info** - Retrieve user information
3. **Get Wallet Accounts** - List wallet accounts with pagination
4. **Get Wallet Summary** - Get summary of wallet accounts
5. **Get Transaction Addresses** - Retrieve transaction addresses

## Configuration

Add the following environment variables to your `.env` file:

```env
MISA_BASE_URL=https://moneykeeperapp.misa.vn/g1/api
MISA_AUTH_URL=https://moneykeeperapp.misa.vn/g1/api/auth/api/v1/auths/loginforweb
MISA_BUSINESS_URL=https://moneykeeperapp.misa.vn/g1/api/business/api/v1
```

## API Endpoints

All endpoints require FinTrack authentication (JWT Bearer token) and are prefixed with `/api/misa`.

### 1. Login to MISA

**POST** `/api/misa/login`

Login to MISA Money Keeper to get authentication token for subsequent requests.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "UserName": "username@gmail.com",
  "Password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    // MISA API response data including token
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/login' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "UserName": "username@gmail.com",
    "Password": "Password@"
}'
```

### 2. Get User Information

**GET** `/api/misa/users`

Retrieve user information from MISA Money Keeper.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    // MISA user data
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/users' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}'
```

### 3. Get Wallet Accounts

**POST** `/api/misa/wallets/accounts`

Retrieve a list of wallet accounts with filtering and pagination options.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "searchText": "",
  "walletType": null,
  "inActive": null,
  "excludeReport": null,
  "skip": 0,
  "take": 10
}
```

**Parameters:**
- `misaToken` (required): MISA authentication token
- `searchText` (optional): Search by wallet/account name
- `walletType` (optional): Filter by wallet type (null = all)
- `inActive` (optional): Filter by active status
- `excludeReport` (optional): Exclude from reports
- `skip` (optional): Number of records to skip (pagination), default: 0
- `take` (optional): Number of records to return, default: 10

**Response:**
```json
{
  "success": true,
  "message": "Wallet accounts retrieved successfully",
  "data": {
    // MISA wallet accounts data
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/wallets/accounts' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "searchText": "",
    "walletType": null,
    "inActive": null,
    "excludeReport": null,
    "skip": 0,
    "take": 10
}'
```

### 4. Get Wallet Account Summary

**POST** `/api/misa/wallets/summary`

Get summary information about wallet accounts.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "searchText": "",
  "walletType": null,
  "inActive": null,
  "excludeReport": null
}
```

**Parameters:**
- `misaToken` (required): MISA authentication token
- `searchText` (optional): Search by wallet/account name
- `walletType` (optional): Filter by wallet type (null = all)
- `inActive` (optional): Filter by active status
- `excludeReport` (optional): Exclude from reports

**Response:**
```json
{
  "success": true,
  "message": "Wallet account summary retrieved successfully",
  "data": {
    // MISA wallet summary data
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/wallets/summary' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "searchText": "",
    "walletType": null,
    "inActive": null,
    "excludeReport": null
}'
```

### 5. Get Transaction Addresses

**GET** `/api/misa/transactions/addresses`

Retrieve transaction addresses from MISA Money Keeper.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction addresses retrieved successfully",
  "data": {
    // MISA transaction addresses data
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/transactions/addresses' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}'
```

## Architecture

### Files Structure

```
src/
├── config/
│   └── config.js                  # MISA API configuration
├── controllers/
│   └── misaController.js          # MISA API controller
├── routes/
│   └── misaRoutes.js              # MISA API routes
└── index.js                       # Route registration

tests/
└── misa.test.js                   # MISA API integration tests
```

### Authentication Flow

1. User authenticates with FinTrack (gets FinTrack JWT token)
2. User calls `/api/misa/login` with MISA credentials
3. MISA returns a token that is used for subsequent MISA API calls
4. User stores both tokens (FinTrack JWT + MISA token)
5. For MISA operations, user sends FinTrack JWT in header and MISA token in body

### Error Handling

All endpoints follow the standard FinTrack error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- `400` - Missing required parameters
- `401` - Unauthorized (missing or invalid FinTrack token)
- `401/403` - Invalid or expired MISA token
- `500` - Server error or MISA API error

## Testing

Run the MISA integration tests:

```bash
npm test tests/misa.test.js
```

## Swagger Documentation

The MISA endpoints are fully documented in Swagger UI. Access the documentation at:

```
http://localhost:3000/api-docs
```

Look for the **MISA** tag in the API documentation.

## Security Considerations

1. **Dual Authentication**: All endpoints require both FinTrack authentication (header) and MISA token (body)
2. **Token Storage**: Store MISA tokens securely on the client side
3. **Token Expiration**: Handle token expiration and re-authentication gracefully
4. **HTTPS**: Always use HTTPS in production to protect credentials
5. **Environment Variables**: Never commit MISA credentials to source control

## Original MISA API Reference

The integration is based on the following MISA Money Keeper API endpoints:

1. Login: `https://moneykeeperapp.misa.vn/g1/api/auth/api/v1/auths/loginforweb`
2. User Info: `https://moneykeeperapp.misa.vn/g1/api/business/api/v1/users/true`
3. Wallet Accounts: `https://moneykeeperapp.misa.vn/g1/api/business/api/v1/wallets/accounts`
4. Wallet Summary: `https://moneykeeperapp.misa.vn/g1/api/business/api/v1/wallets/account/summary`
5. Transaction Addresses: `https://moneykeeperapp.misa.vn/g1/api/business/api/v1/transactions/addresses`

## Future Enhancements

Potential improvements for the MISA integration:

1. **Token Caching**: Cache MISA tokens to reduce login requests
2. **Webhook Integration**: Support MISA webhooks for real-time updates
3. **Batch Operations**: Add batch import/export functionality
4. **Data Synchronization**: Automatic sync between FinTrack and MISA
5. **Error Recovery**: Automatic retry logic for failed API calls
6. **Rate Limiting**: Implement rate limiting for MISA API calls

## Support

For issues or questions related to the MISA integration:

1. Check the Swagger documentation
2. Review the test files for usage examples
3. Contact the FinTrack development team

## License

This integration follows the MIT license of the FinTrack project.
