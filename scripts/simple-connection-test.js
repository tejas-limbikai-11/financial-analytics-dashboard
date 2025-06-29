// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function simpleConnectionTest() {
  console.log("🚀 Simple MongoDB Connection Test")
  console.log("=" * 40)

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI not found")
    console.log("💡 Make sure your .env.local file contains:")
    console.log(
      "MONGODB_URI=mongodb+srv://tejassoftwareengineer:tejasMongo11@cluster0.lpkvav3.mongodb.net/financial_analytics?retryWrites=true&w=majority&appName=Cluster0",
    )
    return
  }

  console.log("🔗 Testing connection to MongoDB Atlas...")
  console.log("Username: tejassoftwareengineer")
  console.log("Cluster: cluster0.lpkvav3.mongodb.net")
  console.log("Database: financial_analytics")

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  })

  try {
    console.log("\n⏳ Connecting...")
    await client.connect()
    console.log("✅ Connected successfully!")

    console.log("🏓 Testing ping...")
    const db = client.db("financial_analytics")
    await db.admin().ping()
    console.log("✅ Ping successful!")

    console.log("📊 Getting database info...")
    const collections = await db.listCollections().toArray()
    console.log(`✅ Database accessible, found ${collections.length} collections`)

    console.log("✍️ Testing write operation...")
    const testCollection = db.collection("test")
    const result = await testCollection.insertOne({ test: true, timestamp: new Date() })
    console.log("✅ Write successful!")

    console.log("🧹 Cleaning up...")
    await testCollection.deleteOne({ _id: result.insertedId })
    console.log("✅ Cleanup done!")

    console.log("\n🎉 SUCCESS! Your MongoDB connection is working!")
    console.log("✅ You can now start your app and register users!")

    return true
  } catch (error) {
    console.error("\n❌ Connection failed!")
    console.error("Error:", error.message)

    console.log("\n💡 Common solutions:")

    if (error.message.includes("authentication failed")) {
      console.log("🔑 Authentication Error:")
      console.log("  1. Go to MongoDB Atlas → Database Access")
      console.log("  2. Check if user 'tejassoftwareengineer' exists")
      console.log("  3. Verify password is 'tejasMongo11'")
      console.log("  4. Make sure user has 'Atlas admin' role")
    }

    if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("🌐 Network Error:")
      console.log("  1. Go to MongoDB Atlas → Network Access")
      console.log("  2. Add your current IP address")
      console.log("  3. Or add 0.0.0.0/0 for testing")
      console.log("  4. Wait 2-3 minutes for changes to apply")
    }

    if (error.message.includes("ENOTFOUND")) {
      console.log("🔍 Hostname Error:")
      console.log("  1. Check if cluster 'cluster0' exists in your Atlas account")
      console.log("  2. Verify the cluster is running (not paused)")
      console.log("  3. Get the exact connection string from Atlas")
    }

    return false
  } finally {
    await client.close()
    console.log("🔌 Connection closed")
  }
}

simpleConnectionTest()
