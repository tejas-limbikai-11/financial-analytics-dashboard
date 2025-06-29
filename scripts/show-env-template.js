console.log("📋 Copy this content to your .env.local file:")
console.log("=" * 50)
console.log(`# MongoDB Connection String
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_analytics?retryWrites=true&w=majority

# JWT Secret Key  
# Use a long random string for security
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-123456789

# Environment
NODE_ENV=development`)

console.log("=" * 50)
console.log("\n📝 Instructions:")
console.log("1. Create a file named '.env.local' in your project root")
console.log("2. Copy the content above into the file")
console.log("3. Replace 'username', 'password', and 'cluster' with your actual MongoDB details")
console.log("4. Save the file")
console.log("5. Run: npm run check-env")

console.log("\n📁 Your project structure should look like:")
console.log("your-project/")
console.log("├── .env.local          ← Create this file")
console.log("├── package.json")
console.log("├── next.config.js")
console.log("└── ...")
