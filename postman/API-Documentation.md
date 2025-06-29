# Financial Analytics Dashboard API Documentation

## Overview
This API provides comprehensive financial analytics functionality including user authentication, transaction management, and data visualization capabilities.

**Base URL (Development):** `http://localhost:3000`
**Base URL (Production):** `https://your-production-domain.com`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `http://localhost:3000/api/auth/register`

Register a new user account.

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
\`\`\`

**Success Response (201):**
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "name": "John Doe"
  },
  "message": "Account created successfully! Welcome to Financial Analytics!"
}
\`\`\`

**Error Response (400):**
\`\`\`json
{
  "success": false,
  "message": "User already exists with this email"
}
\`\`\`

#### 2. Login User
**POST** `http://localhost:3000/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Smith"
  },
  "message": "Login successful! Welcome back!"
}
\`\`\`

**Error Response (401):**
\`\`\`json
{
  "success": false,
  "message": "Invalid email or password"
}
\`\`\`

#### 3. Verify Token
**GET** `http://localhost:3000/api/auth/verify`

Verify JWT token validity and get user information.

**Headers:**
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Smith"
  }
}
\`\`\`

**Error Response (401):**
\`\`\`json
{
  "success": false,
  "message": "Invalid or expired token"
}
\`\`\`

#### 4. Initialize User Data
**POST** `http://localhost:3000/api/auth/initialize`

Initialize user account with sample transaction data (300 transactions).

**Headers:**
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

**Request Body:**
\`\`\`json
{}
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Data initialized successfully!",
  "transactionsCreated": 300
}
\`\`\`

### Transaction Endpoints

#### 1. Get All Transactions
**GET** `http://localhost:3000/api/transactions`

Retrieve all transactions for the authenticated user.

**Headers:**
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

**Success Response (200):**
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-12-29T10:30:00.000Z",
    "amount": 1500.00,
    "category": "Revenue",
    "description": "Revenue Transaction #1",
    "status": "paid",
    "user": "507f1f77bcf86cd799439012",
    "type": "income"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2024-12-28T14:20:00.000Z",
    "amount": -1200.50,
    "category": "Expense",
    "description": "Expense Transaction #2",
    "status": "paid",
    "user": "507f1f77bcf86cd799439012",
    "type": "expense"
  }
]
\`\`\`

#### 2. Create New Transaction
**POST** `http://localhost:3000/api/transactions`

Create a new transaction for the authenticated user.

**Headers:**
\`\`\`
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
\`\`\`

**Request Body (Income):**
\`\`\`json
{
  "amount": 2500.00,
  "category": "Revenue",
  "description": "Consulting Services Payment",
  "status": "paid",
  "type": "income"
}
\`\`\`

**Request Body (Expense):**
\`\`\`json
{
  "amount": 850.00,
  "category": "Expense",
  "description": "Office Supplies Purchase",
  "status": "pending",
  "type": "expense"
}
\`\`\`

**Success Response (201):**
\`\`\`json
{
  "success": true,
  "transaction": {
    "_id": "507f1f77bcf86cd799439014",
    "date": "2024-12-29T15:30:00.000Z",
    "amount": 2500.00,
    "category": "Revenue",
    "description": "Consulting Services Payment",
    "status": "paid",
    "userId": "507f1f77bcf86cd799439012",
    "type": "income",
    "createdAt": "2024-12-29T15:30:00.000Z",
    "updatedAt": "2024-12-29T15:30:00.000Z",
    "user": "507f1f77bcf86cd799439012"
  }
}
\`\`\`

### Utility Endpoints

#### 1. Test Database Connection
**GET** `http://localhost:3000/api/test-connection`

Test MongoDB database connection and system health.

**Success Response (200):**
\`\`\`json
{
  "success": true,
  "message": "MongoDB connection is working perfectly!",
  "collections": 3,
  "timestamp": "2024-12-29T15:40:00.000Z"
}
\`\`\`

## Data Models

### User Model
\`\`\`json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
\`\`\`

### Transaction Model
\`\`\`json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "amount": "number",
  "category": "string",
  "description": "string",
  "status": "string (paid|pending|cancelled)",
  "type": "string (income|expense)",
  "date": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
\`\`\`

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Demo Credentials

For testing purposes, you can use these demo accounts:

| Email | Password | Name |
|-------|----------|------|
| john@example.com | password123 | John Smith |
| sarah@example.com | password123 | Sarah Johnson |
| mike@example.com | password123 | Mike Wilson |
| emily@example.com | password123 | Emily Davis |

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- Transaction endpoints: 100 requests per minute per user
- Utility endpoints: 10 requests per minute per IP

## Security Notes

1. All passwords are hashed using bcrypt
2. JWT tokens expire after 24 hours
3. HTTPS is required in production
4. API keys should be kept secure and never exposed in client-side code
5. Input validation is performed on all endpoints
6. SQL injection protection is implemented
7. CORS is configured for allowed origins only

## Support

For API support, please contact: support@yourcompany.com
