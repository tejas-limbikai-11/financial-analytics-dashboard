// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function testFinalConnection() {
  console.log("🚀 Final MongoDB Connection Test")
  console.log("=" * 40)

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    return
  }

  console.log("🔗 Testing connection with URI:")
  console.log("URI (masked):", uri.replace(/\/\/.*@/, "//***:***@"))

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  })

  try {
    console.log("\n⏳ Connecting to MongoDB Atlas...")
    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")

    console.log("🏓 Testing database ping...")
    const db = client.db("financial_analytics")
    await db.admin().ping()
    console.log("✅ Database ping successful!")

    console.log("📁 Checking collections...")
    const collections = await db.listCollections().toArray()
    console.log(
      `✅ Found ${collections.length} collections:`,
      collections.map((c) => c.name),
    )

    console.log("✍️ Testing write operation...")
    const testCollection = db.collection("connection_test")
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: "Final connection test successful",
    }

    const insertResult = await testCollection.insertOne(testDoc)
    console.log("✅ Write test successful! Document ID:", insertResult.insertedId)

    console.log("📖 Testing read operation...")
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId })
    console.log("✅ Read test successful! Document:", readDoc ? "Found" : "Not found")

    console.log("🧹 Cleaning up test document...")
    await testCollection.deleteOne({ _id: insertResult.insertedId })
    console.log("✅ Cleanup successful!")

    console.log("\n🎉 ALL TESTS PASSED!")
    console.log("✅ Your MongoDB connection is working perfectly!")
    console.log("✅ You can now register users and store data!")

    // Test the auth functions
    console.log("\n👤 Testing authentication functions...")
    await testAuthFunctions()
  } catch (error) {
    console.error("\n❌ Connection test failed:")
    console.error("Error:", error.message)
    console.error("Code:", error.code)

    console.log("\n💡 Troubleshooting steps:")
    if (error.message.includes("authentication failed")) {
      console.log("🔑 Authentication issue:")
      console.log("  1. Check if you created the user 'testuser' with password 'testpass123'")
      console.log("  2. Verify the user has 'Atlas admin' privileges")
      console.log("  3. Wait 2-3 minutes after creating the user")
    } else if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("🌐 Network issue:")
      console.log("  1. Check if you added 0.0.0.0/0 to Network Access")
      console.log("  2. Wait 2-3 minutes after adding the IP address")
      console.log("  3. Check your internet connection")
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("🔍 Hostname issue:")
      console.log("  1. Check the cluster hostname in your connection string")
      console.log("  2. Get the exact connection string from MongoDB Atlas")
      console.log("  3. Make sure the cluster is running")
    }
  } finally {
    await client.close()
    console.log("🔌 Connection closed")
  }
}

async function testAuthFunctions() {
  try {
    const { createUser, authenticateUser } = require("../lib/auth")

    console.log("🧪 Testing user creation...")
    try {
      const testUser = await createUser("test@example.com", "testpass123", "Test User")
      console.log("✅ User creation successful:", testUser.email)
    } catch (error) {
      if (error.message === "User already exists") {
        console.log("✅ User creation function working (user already exists)")
      } else {
        console.log("❌ User creation failed:", error.message)
        return
      }
    }

    console.log("🔐 Testing user authentication...")
    const authUser = await authenticateUser("test@example.com", "testpass123")
    if (authUser) {
      console.log("✅ User authentication successful!")
      console.log("✅ Both registration and login should work in your app!")
    } else {
      console.log("❌ User authentication failed")
    }
  } catch (error) {
    console.log("❌ Auth function test failed:", error.message)
  }
}

testFinalConnection()
