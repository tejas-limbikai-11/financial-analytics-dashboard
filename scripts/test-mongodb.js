// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function testMongoDBConnection() {
  const uri = process.env.MONGODB_URI

  console.log("🔍 Environment check:")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("MONGODB_URI exists:", !!uri)
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set")
    console.log("💡 Make sure you have a .env.local file with MONGODB_URI")
    return
  }

  console.log("🔗 Testing MongoDB connection...")
  console.log("URI (masked):", uri.replace(/\/\/.*@/, "//***:***@"))

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })

  try {
    // Connect to MongoDB
    console.log("⏳ Connecting to MongoDB...")
    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")

    // Test database access
    const db = client.db("financial_analytics")
    console.log("📊 Database name: financial_analytics")

    // Test ping
    await db.admin().ping()
    console.log("🏓 Database ping successful!")

    // List collections
    const collections = await db.listCollections().toArray()
    console.log("📁 Existing collections:", collections.length > 0 ? collections.map((c) => c.name) : "None")

    // Test users collection
    const users = db.collection("users")
    const userCount = await users.countDocuments()
    console.log("👥 Users count:", userCount)

    // Test transactions collection
    const transactions = db.collection("transactions")
    const transactionCount = await transactions.countDocuments()
    console.log("💰 Transactions count:", transactionCount)

    // Test write operation
    console.log("✍️ Testing write operation...")
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: "Connection test successful",
    }

    const testCollection = db.collection("connection_test")
    const insertResult = await testCollection.insertOne(testDoc)
    console.log("✅ Test document inserted with ID:", insertResult.insertedId)

    // Read the test document back
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId })
    console.log("📖 Test document read back:", readDoc ? "Success" : "Failed")

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId })
    console.log("🧹 Test document cleaned up")

    console.log("\n🎉 MongoDB connection test completed successfully!")
    console.log("✅ Your database is ready for the application!")
  } catch (error) {
    console.error("\n❌ MongoDB connection test failed:")
    console.error("Error type:", error.constructor.name)
    console.error("Error message:", error.message)

    if (error.code) {
      console.error("Error code:", error.code)
    }

    if (error.codeName) {
      console.error("Error code name:", error.codeName)
    }

    // Provide specific solutions based on error type
    console.log("\n💡 Troubleshooting:")
    if (error.message.includes("authentication failed") || error.message.includes("bad auth")) {
      console.log("  - Check your username and password in the MongoDB URI")
      console.log("  - Ensure the database user exists in MongoDB Atlas")
      console.log("  - Verify the password doesn't contain special characters that need encoding")
    } else if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("  - Check your internet connection")
      console.log("  - Verify your IP address is whitelisted in MongoDB Atlas Network Access")
      console.log("  - Try adding 0.0.0.0/0 to Network Access for testing")
    } else if (error.message.includes("not authorized") || error.message.includes("unauthorized")) {
      console.log("  - Check database user permissions in MongoDB Atlas")
      console.log("  - Ensure the user has read/write access to the database")
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.log("  - Check the cluster name in your MongoDB URI")
      console.log("  - Verify the cluster is running and accessible")
    }
  } finally {
    await client.close()
    console.log("🔌 MongoDB connection closed")
  }
}

// Run the test
testMongoDBConnection()
