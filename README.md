# Financial Analytics Dashboard - MongoDB Edition

A full-stack financial application with MongoDB backend, user registration, transaction management, and dynamic data visualization.

## 🚀 New Features

### 🔐 **Complete Authentication System**
- **User Registration**: Create new accounts with email/password
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Session Management**: Persistent login sessions with token verification

### 🗄️ **MongoDB Integration**
- **Cloud Database**: Full MongoDB Atlas cluster integration
- **User Management**: Secure user storage with encrypted passwords
- **Transaction Storage**: All transactions stored in MongoDB collections
- **Data Seeding**: One-click database seeding with 300+ sample transactions

### ➕ **Transaction Management**
- **Add Transactions**: Create new income/expense transactions
- **Real-time Updates**: Dashboard updates immediately after adding transactions
- **Form Validation**: Comprehensive input validation and error handling
- **User-specific Data**: Each user sees only their own transactions

## 🛠 **Setup Instructions**

### 1. **Environment Variables**
Create a `.env.local` file with:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_analytics?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
\`\`\`

### 2. **MongoDB Setup**
1. Create a MongoDB Atlas account at [mongodb.com](https://mongodb.com)
2. Create a new cluster
3. Get your connection string
4. Replace `username`, `password`, and `cluster` in the MONGODB_URI

### 3. **Installation**
\`\`\`bash
npm install
npm run dev
\`\`\`

### 4. **Database Seeding**
1. Open the application at [http://localhost:3000](http://localhost:3000)
2. Register a new account or login
3. Click the "Seed DB" button to populate with sample data
4. This creates 4 demo users and 300 transactions

## 📊 **Features Overview**

### **Authentication Flow**
- **Registration**: Email, password, full name required
- **Login**: Email and password authentication
- **Security**: Passwords hashed with bcrypt, JWT tokens for sessions
- **Validation**: Email format, password length, duplicate user checks

### **Transaction Management**
- **Create**: Add new income or expense transactions
- **Categories**: Revenue and Expense categories
- **Status**: Paid or Pending status options
- **Validation**: Amount, description, category, status required
- **Real-time**: Dashboard updates immediately

### **Dashboard Analytics**
- **Summary Cards**: Total revenue, expenses, net income, transaction count
- **Interactive Charts**: Revenue vs expenses trends, category breakdowns
- **Advanced Filtering**: Search, category, status, date range, amount range
- **Data Export**: CSV export with configurable columns

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/verify` - Verify JWT token

### **Transactions**
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions` - Create new transaction

### **Database**
- `POST /api/seed` - Seed database with sample data

## 💾 **Database Schema**

### **Users Collection**
\`\`\`javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### **Transactions Collection**
\`\`\`javascript
{
  _id: ObjectId,
  date: String (ISO),
  amount: Number,
  category: String,
  description: String,
  status: String,
  userId: String,
  type: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🎯 **Demo Accounts**

After seeding, these accounts are available:
- **demo@example.com** / demo123
- **john@example.com** / password123
- **jane@example.com** / password123
- **bob@example.com** / password123

## 🔒 **Security Features**

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Input Validation**: Server-side validation for all inputs
- **Authorization**: User-specific data access
- **Error Handling**: Secure error messages without data leakage

## 🚀 **Deployment**

### **Vercel Deployment**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy automatically

### **MongoDB Atlas**
- Use MongoDB Atlas for production database
- Enable IP whitelisting for security
- Set up database users with appropriate permissions

## 📈 **Usage Flow**

1. **Register/Login**: Create account or sign in
2. **Seed Database**: Click "Seed DB" for sample data
3. **Add Transactions**: Use "Add Transaction" button
4. **Analyze Data**: View charts and filter transactions
5. **Export Data**: Download CSV reports

## 🔄 **Data Flow**

1. **User Registration** → MongoDB Users Collection
2. **Transaction Creation** → MongoDB Transactions Collection
3. **Dashboard Load** → Fetch user-specific transactions
4. **Real-time Updates** → Immediate UI refresh after changes

---

**Built with MongoDB, Next.js, TypeScript, and Tailwind CSS**
