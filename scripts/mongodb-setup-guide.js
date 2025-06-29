console.log("🚀 MongoDB Atlas Setup Guide")
console.log("=" * 50)

console.log("\n📋 STEP-BY-STEP SETUP:")

console.log("\n1. 🌐 CREATE MONGODB ATLAS ACCOUNT")
console.log("   • Go to: https://www.mongodb.com/atlas")
console.log("   • Click 'Try Free'")
console.log("   • Sign up with email")

console.log("\n2. 🏗️ CREATE A CLUSTER")
console.log("   • Choose 'Build a Database'")
console.log("   • Select 'FREE' tier (M0)")
console.log("   • Choose a cloud provider (AWS recommended)")
console.log("   • Select a region close to you")
console.log("   • Click 'Create Cluster'")

console.log("\n3. 👤 CREATE DATABASE USER")
console.log("   • Go to 'Database Access' in left sidebar")
console.log("   • Click 'Add New Database User'")
console.log("   • Choose 'Password' authentication")
console.log("   • Username: testuser")
console.log("   • Password: testpass123")
console.log("   • Database User Privileges: 'Atlas admin'")
console.log("   • Click 'Add User'")

console.log("\n4. 🌐 SETUP NETWORK ACCESS")
console.log("   • Go to 'Network Access' in left sidebar")
console.log("   • Click 'Add IP Address'")
console.log("   • Click 'Allow Access from Anywhere'")
console.log("   • This adds 0.0.0.0/0")
console.log("   • Click 'Confirm'")

console.log("\n5. 🔗 GET CONNECTION STRING")
console.log("   • Go to 'Database' in left sidebar")
console.log("   • Click 'Connect' on your cluster")
console.log("   • Choose 'Drivers'")
console.log("   • Select 'Node.js' and version '4.1 or later'")
console.log("   • Copy the connection string")
console.log(
  "   • It looks like: mongodb+srv://testuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority",
)

console.log("\n6. 📝 UPDATE .env.local")
console.log("   • Replace <password> with: testpass123")
console.log("   • Add database name: /financial_analytics")
console.log("   • Final format:")
console.log(
  "   MONGODB_URI=mongodb+srv://testuser:testpass123@cluster0.xxxxx.mongodb.net/financial_analytics?retryWrites=true&w=majority",
)

console.log("\n7. ✅ TEST CONNECTION")
console.log("   • Run: node scripts/fix-mongodb.js")
console.log("   • Should show 'MongoDB connection is working perfectly!'")

console.log("\n⚠️ IMPORTANT NOTES:")
console.log("   • Wait 2-3 minutes after creating user/network access")
console.log("   • Use simple passwords (no special characters)")
console.log("   • Keep your credentials secure")
console.log("   • Don't commit .env.local to version control")

console.log("\n🆘 IF STILL NOT WORKING:")
console.log("   • Try MongoDB Compass desktop app with same connection string")
console.log("   • Check MongoDB Atlas status page for outages")
console.log("   • Contact MongoDB Atlas support")
