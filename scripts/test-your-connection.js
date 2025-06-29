// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function testYourConnection() {
  console.log("🚀 Testing Your MongoDB Connection")
  console.log("=" * 50)

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    return
  }

  console.log("🔗 Connection Details:")
  console.log("URI (masked):", uri.replace(/\/\/.*@/, "//***:***@"))
  console.log("Database:", uri.includes("/financial_analytics") ? "financial_analytics ✅" : "❌ Missing database name")

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  })

  try {
    console.log("\n⏳ Connecting to your MongoDB Atlas cluster...")
    await client.connect()
    console.log("✅ Connected successfully!")

    console.log("🏓 Testing database ping...")
    const db = client.db("financial_analytics")
    await db.admin().ping()
    console.log("✅ Database ping successful!")

    console.log("📊 Checking database stats...")
    const stats = await db.stats()
    console.log(`✅ Database size: ${(stats.dataSize / 1024).toFixed(2)} KB`)
    console.log(`✅ Collections: ${stats.collections}`)

    console.log("📁 Listing collections...")
    const collections = await db.listCollections().toArray()
    if (collections.length > 0) {
      console.log(
        `✅ Found ${collections.length} collections:`,
        collections.map((c) => c.name),
      )
    } else {
      console.log("📝 No collections yet (this is normal for a new database)")
    }

    console.log("✍️ Testing write operation...")
    const testCollection = db.collection("connection_test")
    const testDoc = {
      test: true,
      timestamp: new Date(),
      user: "tejassoftwareengineer",
      message: "Connection test successful!",
    }

    const insertResult = await testCollection.insertOne(testDoc)
    console.log("✅ Write test successful! Document ID:", insertResult.insertedId)

    console.log("📖 Testing read operation...")
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId })
    console.log("✅ Read test successful!")
    console.log("📄 Document content:", readDoc)

    console.log("🧹 Cleaning up test document...")
    await testCollection.deleteOne({ _id: insertResult.insertedId })
    console.log("✅ Cleanup successful!")

    console.log("\n🎉 ALL TESTS PASSED!")
    console.log("✅ Your MongoDB connection is working perfectly!")
    console.log("✅ Database: financial_analytics")
    console.log("✅ User: tejassoftwareengineer")
    console.log("✅ Ready for user registration and transactions!")

    // Test the authentication functions
    console.log("\n👤 Testing authentication functions...")
    await testAuthFunctions()

    console.log("\n🚀 NEXT STEPS:")
    console.log("1. Start your app: npm run dev")
    console.log("2. Go to: http://localhost:3000")
    console.log("3. Try registering a new user")
    console.log("4. Click 'Seed DB' to add sample data")
  } catch (error) {
    console.error("\n❌ Connection test failed:")
    console.error("Error:", error.message)
    console.error("Code:", error.code)

    console.log("\n💡 Troubleshooting for your specific setup:")

    if (error.message.includes("authentication failed") || error.message.includes("bad auth")) {
      console.log("🔑 Authentication issue:")
      console.log("  • Username: tejassoftwareengineer")
      console.log("  • Password: tejasMongo11")
      console.log("  • Check if this user exists in MongoDB Atlas Database Access")
      console.log("  • Verify the password is correct (case-sensitive)")
      console.log("  • Make sure the user has proper permissions")
    } else if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("🌐 Network issue:")
      console.log("  • Check Network Access in MongoDB Atlas")
      console.log("  • Make sure your IP is whitelisted")
      console.log("  • Try adding 0.0.0.0/0 temporarily")
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("🔍 Hostname issue:")
      console.log("  • Cluster: cluster0.lpkvav3.mongodb.net")
      console.log("  • Check if this cluster exists and is running")
      console.log("  • Verify the cluster hostname is correct")
    }

    console.log("\n🔧 Quick fixes to try:")
    console.log("1. Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0")
    console.log("2. Go to MongoDB Atlas → Database Access → Check user permissions")
    console.log("3. Wait 2-3 minutes after making changes")
    console.log("4. Try the connection test again")
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
      const testUser = await createUser("tejas@example.com", "password123", "Tejas Software Engineer")
      console.log("✅ User creation successful:", testUser.email)
      console.log("✅ User ID:", testUser._id)
    } catch (error) {
      if (error.message === "User already exists") {
        console.log("✅ User creation function working (user already exists)")
      } else {
        console.log("❌ User creation failed:", error.message)
        return
      }
    }

    console.log("🔐 Testing user authentication...")
    const authUser = await authenticateUser("tejas@example.com", "password123")
    if (authUser) {
      console.log("✅ User authentication successful!")
      console.log("✅ Authenticated user:", authUser.email)
      console.log("✅ Registration and login will work in your app!")
    } else {
      console.log("❌ User authentication failed")
    }
  } catch (error) {
    console.log("❌ Auth function test failed:", error.message)
  }
}

testYourConnection()
