// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

function validateConnectionString() {
  console.log("🔍 MongoDB Connection String Validator")
  console.log("=" * 50)

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local")
    return false
  }

  console.log("📋 Analyzing your connection string...")
  console.log("URI (masked):", uri.replace(/\/\/.*@/, "//***:***@"))

  // Parse the connection string
  const checks = [
    {
      test: uri.startsWith("mongodb+srv://"),
      message: "✅ Starts with mongodb+srv://",
      error: "❌ Should start with mongodb+srv://",
    },
    {
      test: uri.includes("tejassoftwareengineer"),
      message: "✅ Contains username: tejassoftwareengineer",
      error: "❌ Missing username",
    },
    {
      test: uri.includes("tejasMongo11"),
      message: "✅ Contains password: tejasMongo11",
      error: "❌ Missing password",
    },
    {
      test: uri.includes("cluster0.lpkvav3.mongodb.net"),
      message: "✅ Contains cluster: cluster0.lpkvav3.mongodb.net",
      error: "❌ Missing or wrong cluster hostname",
    },
    {
      test: uri.includes("/financial_analytics"),
      message: "✅ Contains database: financial_analytics",
      error: "❌ Missing database name",
    },
    {
      test: uri.includes("retryWrites=true"),
      message: "✅ Contains retryWrites=true",
      error: "❌ Missing retryWrites parameter",
    },
    {
      test: uri.includes("w=majority"),
      message: "✅ Contains w=majority",
      error: "❌ Missing w=majority parameter",
    },
  ]

  let allPassed = true

  console.log("\n🔍 Connection String Validation:")
  checks.forEach((check) => {
    if (check.test) {
      console.log(check.message)
    } else {
      console.log(check.error)
      allPassed = false
    }
  })

  if (allPassed) {
    console.log("\n🎉 Connection string validation passed!")
    console.log("✅ Your connection string looks correct!")
  } else {
    console.log("\n❌ Connection string has issues!")
    console.log("💡 Expected format:")
    console.log(
      "mongodb+srv://tejassoftwareengineer:tejasMongo11@cluster0.lpkvav3.mongodb.net/financial_analytics?retryWrites=true&w=majority&appName=Cluster0",
    )
  }

  return allPassed
}

// Run validation
const isValid = validateConnectionString()

if (isValid) {
  console.log("\n🚀 Ready to test connection!")
  console.log("Run: node scripts/test-your-connection.js")
} else {
  console.log("\n🔧 Fix your .env.local file first!")
}
