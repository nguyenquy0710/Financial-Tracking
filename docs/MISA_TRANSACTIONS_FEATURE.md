# MISA Transaction Search and Import Feature

## Overview

This feature adds the ability to search for and import income/expense transactions from MISA Money Keeper into the FinTrack system.

## New Endpoints

### 1. Search Transactions
**POST** `/api/misa/transactions/search`

Searches for income and expense transactions from MISA Money Keeper.

**Features:**
- Filter by date range (fromDate, toDate)
- Filter by transaction type (0 = expense, 1 = income, null = all)
- Search by text
- Filter by wallet account IDs
- Filter by category IDs
- Pagination support (skip, take)

### 2. Import Income Transactions
**POST** `/api/misa/transactions/import/income`

Imports income transactions from MISA into FinTrack Salary records.

**Features:**
- Batch import multiple transactions
- Automatically groups by month
- Adds to `freelance.other` field
- Updates total salary calculations
- Error handling for individual transactions

### 3. Import Expense Transactions
**POST** `/api/misa/transactions/import/expense`

Imports expense transactions from MISA into FinTrack Expense records.

**Features:**
- Batch import multiple transactions
- Maps categories from MISA to FinTrack
- Default allocation to NEC (Nhu cầu thiết yếu)
- Tracks source as 'MISA'
- Preserves notes and transaction IDs

## Implementation Details

### Modified Files

1. **src/controllers/misaController.js**
   - Added `searchTransactions()` - Search for transactions
   - Added `importIncomeTransactions()` - Import income to Salary
   - Added `importExpenseTransactions()` - Import expenses to Expense

2. **src/routes/misaRoutes.js**
   - Added route for `/transactions/search`
   - Added route for `/transactions/import/income`
   - Added route for `/transactions/import/expense`
   - Complete Swagger documentation for all new endpoints

3. **src/models/Expense.js**
   - Added `source` field (enum: 'manual', 'MISA', 'Excel', 'API')
   - Tracks the origin of expense records

4. **tests/misa.test.js**
   - Added tests for search transactions endpoint
   - Added tests for income import endpoint
   - Added tests for expense import endpoint
   - Tests validate authentication, parameter validation, and successful imports

5. **docs/MISA_INTEGRATION.md**
   - Updated overview to list 8 endpoints (was 5)
   - Added complete documentation for new endpoints
   - Added usage examples with cURL
   - Added workflow documentation

## Usage Workflow

### Basic Import Flow

1. **Login to MISA**
   ```bash
   POST /api/misa/login
   {
     "UserName": "user@example.com",
     "Password": "password"
   }
   ```

2. **Search for Transactions**
   ```bash
   POST /api/misa/transactions/search
   {
     "misaToken": "...",
     "fromDate": "2024-01-01",
     "toDate": "2024-01-31",
     "transactionType": 1  # 1 for income
   }
   ```

3. **Import Income Transactions**
   ```bash
   POST /api/misa/transactions/import/income
   {
     "misaToken": "...",
     "transactions": [...]
   }
   ```

4. **Import Expense Transactions**
   ```bash
   POST /api/misa/transactions/import/expense
   {
     "misaToken": "...",
     "transactions": [...]
   }
   ```

## Data Mapping

### Income Transactions → Salary

| MISA Field | FinTrack Field |
|------------|----------------|
| transactionDate | month |
| amount | freelance.other |
| - | totalFreelance (calculated) |
| - | totalSalary (calculated) |

### Expense Transactions → Expense

| MISA Field | FinTrack Field |
|------------|----------------|
| transactionDate | month |
| amount | totalAmount, unitPrice |
| category.name | category |
| note | itemName, notes |
| id | notes (appended) |
| - | source = 'MISA' |
| - | allocation.nec = amount |

## Error Handling

Both import endpoints return:
- `imported`: Array of successfully imported transactions
- `errors`: Array of transactions that failed with error messages

This allows partial success - some transactions can import while others fail without blocking the entire operation.

## Testing

Run tests with:
```bash
npm test tests/misa.test.js
```

Tests cover:
- Authentication requirements
- Parameter validation
- Request format validation
- Successful import scenarios
- Response structure validation

## Security

All endpoints require:
1. FinTrack JWT authentication (Bearer token in header)
2. MISA token (in request body)
3. User ID from authenticated session

Imported records are automatically associated with the authenticated user.

## Benefits

1. **Time Saving**: Import multiple transactions at once instead of manual entry
2. **Accuracy**: Direct import reduces data entry errors
3. **Traceability**: Source field tracks origin of all transactions
4. **Flexibility**: Can import all or selectively filter transactions
5. **Error Recovery**: Partial import allows retrying failed transactions

## Future Enhancements

Potential improvements:
- Duplicate detection based on transaction IDs
- Smart category mapping using keywords
- Automatic 6 Jars allocation for expenses
- Scheduled automatic sync
- Transaction reconciliation between MISA and FinTrack
