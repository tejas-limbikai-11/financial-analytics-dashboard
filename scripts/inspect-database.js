// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function inspectDatabase() {
  const uri = process.env.MONGODB_URI

  console.log("🔍 Environment check:")
  console.log("MONGODB_URI exists:", !!uri)
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set")
    console.log("💡 Make sure you have a .env.local file with MONGODB_URI")
    console.log("💡 Current working directory:", process.cwd())
    console.log("💡 Looking for .env.local file...")

    const fs = require("fs")
    const path = require("path")

    try {
      const envPath = path.join(process.cwd(), ".env.local")
      const envExists = fs.existsSync(envPath)
      console.log("💡 .env.local file exists:", envExists)

      if (envExists) {
        const envContent = fs.readFileSync(envPath, "utf8")
        const hasMongoUri = envContent.includes("MONGODB_URI")
        console.log("💡 .env.local contains MONGODB_URI:", hasMongoUri)

        if (!hasMongoUri) {
          console.log("💡 Add this line to your .env.local file:")
          console.log("MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_analytics")
        }
      } else {
        console.log("💡 Create a .env.local file in your project root with:")
        console.log("MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_analytics")
        console.log("JWT_SECRET=your-secret-key-here")
      }
    } catch (error) {
      console.log("💡 Error checking .env.local file:", error.message)
    }

    return
  }

  console.log("🔍 Inspecting MongoDB database...")

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("financial_analytics")

    // List all collections
    const collections = await db.listCollections().toArray()
    console.log("\n📁 Collections in database:")
    if (collections.length === 0) {
      console.log("  No collections found - database is empty")
    } else {
      collections.forEach((collection) => {
        console.log(`  - ${collection.name}`)
      })
    }

    // Inspect users collection
    console.log("\n👥 Users Collection:")
    const users = db.collection("users")
    const userCount = await users.countDocuments()
    console.log(`  Total users: ${userCount}`)

    if (userCount > 0) {
      const sampleUsers = await users.find({}).limit(3).toArray()
      console.log("  Sample users:")
      sampleUsers.forEach((user, index) => {
        console.log(`    ${index + 1}. Email: ${user.email}, Name: ${user.name}, Created: ${user.createdAt}`)
      })
    } else {
      console.log("  No users found in database")
    }

    // Inspect transactions collection
    console.log("\n💰 Transactions Collection:")
    const transactions = db.collection("transactions")
    const transactionCount = await transactions.countDocuments()
    console.log(`  Total transactions: ${transactionCount}`)

    if (transactionCount > 0) {
      const sampleTransactions = await transactions.find({}).limit(3).toArray()
      console.log("  Sample transactions:")
      sampleTransactions.forEach((transaction, index) => {
        console.log(
          `    ${index + 1}. Amount: ${transaction.amount}, Category: ${transaction.category}, User: ${transaction.userId}`,
        )
      })
    } else {
      console.log("  No transactions found in database")
    }

    // Check database stats
    console.log("\n📊 Database Statistics:")
    const stats = await db.stats()
    console.log(`  Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Collections: ${stats.collections}`)
    console.log(`  Objects: ${stats.objects}`)
    console.log(`  Indexes: ${stats.indexes}`)
  } catch (error) {
    console.error("❌ Database inspection failed:", error)
    console.error("Error details:", error.message)
  } finally {
    await client.close()
    console.log("🔌 Connection closed")
  }
}

inspectDatabase()
