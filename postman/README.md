# Financial Analytics Dashboard - Postman Collection

This directory contains the complete Postman collection for testing the Financial Analytics Dashboard API.

## 📁 Files Included

- `Financial-Analytics-API.postman_collection.json` - Main API collection
- `Financial-Analytics-Environment.postman_environment.json` - Development environment
- `Financial-Analytics-Production.postman_environment.json` - Production environment
- `API-Documentation.md` - Complete API documentation

## 🚀 Quick Setup

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Financial-Analytics-API.postman_collection.json`
4. Collection will be imported with all endpoints

### 2. Import Environment
1. Click **Import** button again
2. Select `Financial-Analytics-Environment.postman_environment.json`
3. Select the environment from the dropdown (top-right)

### 3. Start Testing
1. Make sure your Next.js app is running on `http://localhost:3000`
2. Run "Test Database Connection" to verify setup
3. Run "Login User" with demo credentials
4. JWT token will be automatically saved
5. Test other endpoints

## 🔗 API Endpoints

### Authentication
- **POST** `http://localhost:3000/api/auth/register` - Register new user
- **POST** `http://localhost:3000/api/auth/login` - User login
- **GET** `http://localhost:3000/api/auth/verify` - Verify JWT token
- **POST** `http://localhost:3000/api/auth/initialize` - Initialize user data

### Transactions
- **GET** `http://localhost:3000/api/transactions` - Get all transactions
- **POST** `http://localhost:3000/api/transactions` - Create new transaction

### Utilities
- **GET** `http://localhost:3000/api/test-connection` - Test database connection

## 🎮 Demo Credentials

Use these accounts for testing:

| Email | Password | Description |
|-------|----------|-------------|
| john@example.com | password123 | Demo user with sample data |
| sarah@example.com | password123 | Demo user with sample data |
| mike@example.com | password123 | Demo user with sample data |
| emily@example.com | password123 | Demo user with sample data |

## 🔧 Environment Variables

### Development Environment
- `base_url`: `http://localhost:3000`
- `auth_token`: Auto-populated after login
- `demo_email`: `john@example.com`
- `demo_password`: `password123`

### Production Environment
- Update `base_url` to your production domain
- Update demo credentials for production testing

## 🧪 Testing Workflow

### 1. Basic Health Check
\`\`\`
GET http://localhost:3000/api/test-connection
\`\`\`

### 2. User Authentication
\`\`\`
POST http://localhost:3000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

### 3. Get User Transactions
\`\`\`
GET http://localhost:3000/api/transactions
Headers: Authorization: Bearer <token>
\`\`\`

### 4. Create New Transaction
\`\`\`
POST http://localhost:3000/api/transactions
Headers: Authorization: Bearer <token>
Body: {
  "amount": 1500.00,
  "category": "Revenue",
  "description": "New sale",
  "status": "paid",
  "type": "income"
}
\`\`\`

## 🔒 Authentication

The collection automatically handles JWT tokens:

1. **Login/Register** endpoints save tokens automatically
2. **Protected endpoints** use `{{auth_token}}` variable
3. **Token verification** happens on each request
4. **Manual token setting** available if needed

## 📊 Response Examples

### Successful Login
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

### Transaction List
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-12-29T10:30:00.000Z",
    "amount": 1500.00,
    "category": "Revenue",
    "description": "Revenue Transaction #1",
    "status": "paid",
    "type": "income"
  }
]
\`\`\`

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Next.js app is running on port 3000
   - Check if MongoDB is connected

2. **Authentication Failed**
   - Verify demo credentials
   - Check if JWT token is valid
   - Try re-logging in

3. **No Transactions Found**
   - Run "Initialize User Data" endpoint
   - Check if user is properly authenticated

4. **Environment Issues**
   - Ensure correct environment is selected
   - Verify environment variables are set

### Debug Steps

1. Check Postman Console for detailed logs
2. Verify request headers and body
3. Check server logs in terminal
4. Test individual endpoints in isolation

## 📝 Notes

- All URLs use `localhost:3000` directly (no environment variables in URLs)
- JWT tokens are automatically managed
- Response times are validated (< 5 seconds)
- Content-Type validation included
- Pre-request and test scripts included for automation

## 🔄 Updates

To update the collection:
1. Make changes in Postman
2. Export updated collection
3. Replace the JSON file
4. Update documentation as needed

## 📞 Support

For issues with the Postman collection:
1. Check the troubleshooting section
2. Verify your local development setup
3. Review the API documentation
4. Check server logs for errors

Happy testing! 🚀
