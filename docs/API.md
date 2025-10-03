# FinTrack API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors if any
  ]
}
```

## Endpoints

### Authentication

#### Register User
- **POST** `/auth/register`
- **Access:** Public
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "0123456789",
  "language": "vi",
  "currency": "VND"
}
```

#### Login
- **POST** `/auth/login`
- **Access:** Public
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
- **GET** `/auth/me`
- **Access:** Private

#### Update Profile
- **PUT** `/auth/profile`
- **Access:** Private
- **Body:**
```json
{
  "name": "Updated Name",
  "phone": "0987654321",
  "language": "en",
  "currency": "USD"
}
```

### Transactions

#### Get All Transactions
- **GET** `/transactions`
- **Access:** Private
- **Query Parameters:**
  - `type`: income | expense
  - `categoryId`: Category ID
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `sortBy`: Field to sort by (default: date)
  - `sortOrder`: asc | desc (default: desc)

#### Get Transaction by ID
- **GET** `/transactions/:id`
- **Access:** Private

#### Create Transaction
- **POST** `/transactions`
- **Access:** Private
- **Body:**
```json
{
  "type": "expense",
  "amount": 50000,
  "categoryId": "category_id",
  "description": "Lunch at restaurant",
  "date": "2024-01-15",
  "paymentMethod": "cash",
  "location": "Hanoi",
  "tags": ["food", "lunch"]
}
```

#### Update Transaction
- **PUT** `/transactions/:id`
- **Access:** Private
- **Body:** Same as create (all fields optional)

#### Delete Transaction
- **DELETE** `/transactions/:id`
- **Access:** Private

#### Get Transaction Statistics
- **GET** `/transactions/stats/summary`
- **Access:** Private
- **Query Parameters:**
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Categories

#### Get All Categories
- **GET** `/categories`
- **Access:** Private
- **Query Parameters:**
  - `type`: income | expense

#### Get Category by ID
- **GET** `/categories/:id`
- **Access:** Private

#### Create Category
- **POST** `/categories`
- **Access:** Private
- **Body:**
```json
{
  "name": "Custom Category",
  "nameVi": "Danh mục tùy chỉnh",
  "type": "expense",
  "icon": "🎯",
  "color": "#3498db",
  "keywords": ["custom", "special"]
}
```

#### Update Category
- **PUT** `/categories/:id`
- **Access:** Private

#### Delete Category
- **DELETE** `/categories/:id`
- **Access:** Private

### Budgets

#### Get All Budgets
- **GET** `/budgets`
- **Access:** Private
- **Query Parameters:**
  - `period`: daily | weekly | monthly | yearly
  - `isActive`: true | false

#### Get Budget by ID
- **GET** `/budgets/:id`
- **Access:** Private

#### Create Budget
- **POST** `/budgets`
- **Access:** Private
- **Body:**
```json
{
  "name": "Monthly Food Budget",
  "categoryId": "category_id",
  "amount": 5000000,
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "alertThreshold": 80
}
```

#### Update Budget
- **PUT** `/budgets/:id`
- **Access:** Private

#### Delete Budget
- **DELETE** `/budgets/:id`
- **Access:** Private

#### Get Budget Alerts
- **GET** `/budgets/alerts`
- **Access:** Private

### Goals

#### Get All Goals
- **GET** `/goals`
- **Access:** Private
- **Query Parameters:**
  - `status`: active | completed | paused | cancelled
  - `priority`: low | medium | high

#### Get Goal by ID
- **GET** `/goals/:id`
- **Access:** Private

#### Create Goal
- **POST** `/goals`
- **Access:** Private
- **Body:**
```json
{
  "name": "Emergency Fund",
  "description": "Save 50 million for emergencies",
  "targetAmount": 50000000,
  "currentAmount": 0,
  "targetDate": "2024-12-31",
  "priority": "high",
  "icon": "🎯",
  "color": "#27ae60"
}
```

#### Update Goal
- **PUT** `/goals/:id`
- **Access:** Private

#### Delete Goal
- **DELETE** `/goals/:id`
- **Access:** Private

#### Add Contribution
- **POST** `/goals/:id/contribute`
- **Access:** Private
- **Body:**
```json
{
  "amount": 1000000
}
```

#### Get Goals Summary
- **GET** `/goals/summary`
- **Access:** Private

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

## Versioning

Current API version: v1.0.0
