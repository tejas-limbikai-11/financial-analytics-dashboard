// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const fs = require("fs")
const path = require("path")

function checkSetup() {
  console.log("🔍 Complete Setup Checker")
  console.log("=" * 40)

  // Check 1: .env.local file
  console.log("\n📄 1. Checking .env.local file...")
  const envPath = path.join(process.cwd(), ".env.local")

  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!")
    return false
  }

  console.log("✅ .env.local file exists")

  const envContent = fs.readFileSync(envPath, "utf8")
  console.log(`✅ File size: ${envContent.length} characters`)

  // Check 2: Environment variables
  console.log("\n🔑 2. Checking environment variables...")

  const mongoUri = process.env.MONGODB_URI
  const jwtSecret = process.env.JWT_SECRET

  if (!mongoUri) {
    console.log("❌ MONGODB_URI not loaded")
    return false
  }

  if (!jwtSecret) {
    console.log("❌ JWT_SECRET not loaded")
    return false
  }

  console.log("✅ MONGODB_URI loaded")
  console.log("✅ JWT_SECRET loaded")

  // Check 3: MongoDB URI format
  console.log("\n🔗 3. Checking MongoDB URI format...")

  const uriChecks = [
    { test: mongoUri.startsWith("mongodb+srv://"), name: "Protocol" },
    { test: mongoUri.includes("tejassoftwareengineer"), name: "Username" },
    { test: mongoUri.includes("tejasMongo11"), name: "Password" },
    { test: mongoUri.includes("cluster0.lpkvav3.mongodb.net"), name: "Cluster" },
    { test: mongoUri.includes("/financial_analytics"), name: "Database" },
    { test: mongoUri.includes("retryWrites=true"), name: "RetryWrites" },
  ]

  let uriValid = true
  uriChecks.forEach((check) => {
    if (check.test) {
      console.log(`✅ ${check.name} correct`)
    } else {
      console.log(`❌ ${check.name} missing or incorrect`)
      uriValid = false
    }
  })

  // Check 4: Dependencies
  console.log("\n📦 4. Checking dependencies...")

  try {
    require("mongodb")
    console.log("✅ mongodb package available")
  } catch (error) {
    console.log("❌ mongodb package missing - run: npm install mongodb")
    return false
  }

  try {
    require("bcryptjs")
    console.log("✅ bcryptjs package available")
  } catch (error) {
    console.log("❌ bcryptjs package missing - run: npm install bcryptjs")
    return false
  }

  // Summary
  console.log("\n📋 Setup Summary:")

  if (uriValid) {
    console.log("✅ All checks passed!")
    console.log("🚀 Ready to test MongoDB connection!")
    console.log("\nNext steps:")
    console.log("1. Run: node scripts/simple-connection-test.js")
    console.log("2. If successful, run: npm run dev")
    console.log("3. Try registering a user at http://localhost:3000")
    return true
  } else {
    console.log("❌ Setup has issues!")
    console.log("\n🔧 Your .env.local should contain:")
    console.log(
      "MONGODB_URI=mongodb+srv://tejassoftwareengineer:tejasMongo11@cluster0.lpkvav3.mongodb.net/financial_analytics?retryWrites=true&w=majority&appName=Cluster0",
    )
    console.log("JWT_SECRET=your-jwt-secret-here")
    return false
  }
}

checkSetup()
