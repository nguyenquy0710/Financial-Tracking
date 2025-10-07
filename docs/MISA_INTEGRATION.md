# MISA Money Keeper API Integration

This document describes the integration of MISA Money Keeper (Sổ thủ chi) APIs into the FinTrack application.

## Overview

The MISA integration provides 8 API endpoints to interact with MISA Money Keeper service:

1. **Login** - Authentication with MISA Money Keeper
2. **Get User Info** - Retrieve user information
3. **Get Wallet Accounts** - List wallet accounts with pagination
4. **Get Wallet Summary** - Get summary of wallet accounts
5. **Get Transaction Addresses** - Retrieve transaction addresses
6. **Search Transactions** - Search for income/expense transactions (NEW)
7. **Import Income Transactions** - Import income transactions to Salary records (NEW)
8. **Import Expense Transactions** - Import expense transactions to Expense records (NEW)

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

### 6. Search Transactions

**POST** `/api/misa/transactions/search`

Search for income and expense transactions from MISA Money Keeper.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "transactionType": 1,
  "searchText": "",
  "walletAccountIds": null,
  "categoryIds": null,
  "skip": 0,
  "take": 20
}
```

**Parameters:**
- `misaToken` (required): MISA authentication token
- `fromDate` (optional): Start date for filtering (ISO 8601)
- `toDate` (optional): End date for filtering (ISO 8601)
- `transactionType` (optional): 0 = expense, 1 = income, null = all
- `searchText` (optional): Search by transaction content
- `walletAccountIds` (optional): Array of wallet IDs to filter
- `categoryIds` (optional): Array of category IDs to filter
- `skip` (optional): Number of records to skip (pagination), default: 0
- `take` (optional): Number of records to return, default: 20

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    // MISA transaction data including income and expense records
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/transactions/search' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31",
    "transactionType": null,
    "skip": 0,
    "take": 20
}'
```

### 7. Import Income Transactions

**POST** `/api/misa/transactions/import/income`

Import income transactions from MISA Money Keeper into FinTrack Salary records.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "transactions": [
    {
      "id": "misa-txn-1",
      "transactionDate": "2024-01-15",
      "amount": 5000000,
      "note": "Freelance work"
    },
    {
      "id": "misa-txn-2",
      "transactionDate": "2024-01-20",
      "amount": 3000000,
      "note": "Bonus payment"
    }
  ]
}
```

**Parameters:**
- `misaToken` (required): MISA authentication token
- `transactions` (required): Array of income transactions to import

**Response:**
```json
{
  "success": true,
  "message": "Imported 2 income transactions",
  "data": {
    "imported": [
      {
        "transactionId": "misa-txn-1",
        "salaryId": "65abc123...",
        "amount": 5000000,
        "month": "2024-01-15T00:00:00.000Z"
      }
    ],
    "errors": []
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/transactions/import/income' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "transactions": [
        {
            "id": "misa-txn-1",
            "transactionDate": "2024-01-15",
            "amount": 5000000,
            "note": "Freelance work"
        }
    ]
}'
```

### 8. Import Expense Transactions

**POST** `/api/misa/transactions/import/expense`

Import expense transactions from MISA Money Keeper into FinTrack Expense records.

**Headers:**
```
Authorization: Bearer <your-fintrack-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "transactions": [
    {
      "id": "misa-txn-3",
      "transactionDate": "2024-01-10",
      "amount": 500000,
      "category": {
        "name": "Food & Dining"
      },
      "note": "Restaurant"
    },
    {
      "id": "misa-txn-4",
      "transactionDate": "2024-01-12",
      "amount": 200000,
      "category": {
        "name": "Transportation"
      },
      "note": "Taxi fare"
    }
  ]
}
```

**Parameters:**
- `misaToken` (required): MISA authentication token
- `transactions` (required): Array of expense transactions to import

**Response:**
```json
{
  "success": true,
  "message": "Imported 2 expense transactions",
  "data": {
    "imported": [
      {
        "transactionId": "misa-txn-3",
        "expenseId": "65def456...",
        "amount": 500000,
        "month": "2024-01-10T00:00:00.000Z",
        "category": "Food & Dining"
      }
    ],
    "errors": []
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:3000/api/misa/transactions/import/expense' \
--header 'Authorization: Bearer <fintrack-token>' \
--header 'Content-Type: application/json' \
--data '{
    "misaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "transactions": [
        {
            "id": "misa-txn-3",
            "transactionDate": "2024-01-10",
            "amount": 500000,
            "category": {
                "name": "Food & Dining"
            },
            "note": "Restaurant"
        }
    ]
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
6. Transactions Search: `https://moneykeeperapp.misa.vn/g1/api/business/api/v1/transactions`

## Features

### Transaction Import Workflow

1. **Login to MISA** - Authenticate and get MISA token
2. **Search Transactions** - Query income/expense transactions by date range
3. **Review Transactions** - Filter and select transactions to import
4. **Import to FinTrack** - Convert MISA transactions to Salary/Expense records

### Automatic Mapping

- **Income → Salary**: MISA income transactions are imported to the `freelance.other` field
- **Expense → Expense**: MISA expense transactions are imported with default NEC allocation
- **Source Tracking**: All imported records are marked with `source: 'MISA'`
- **Month Grouping**: Transactions are grouped by month automatically

## Future Enhancements

Potential improvements for the MISA integration:

1. **Token Caching**: Cache MISA tokens to reduce login requests
2. **Webhook Integration**: Support MISA webhooks for real-time updates
3. **Batch Operations**: Enhanced batch import/export functionality with progress tracking
4. **Data Synchronization**: Automatic sync between FinTrack and MISA with conflict resolution
5. **Error Recovery**: Automatic retry logic for failed API calls
6. **Rate Limiting**: Implement rate limiting for MISA API calls
7. ~~**Duplicate Detection**: Prevent importing the same transaction multiple times~~ ✅ **IMPLEMENTED**
8. **Category Mapping**: Intelligent mapping between MISA and FinTrack categories
9. **6 Jars Allocation**: Smart allocation of imported expenses across the 6 jars method

## Support

For issues or questions related to the MISA integration:

1. Check the Swagger documentation
2. Review the test files for usage examples
3. Contact the FinTrack development team

## License

This integration follows the MIT license of the FinTrack project.
