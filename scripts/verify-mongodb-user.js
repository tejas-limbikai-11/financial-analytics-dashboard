// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function verifyMongoDBUser() {
  console.log("👤 Verifying MongoDB Atlas User Setup")
  console.log("=" * 50)

  const uri = process.env.MONGODB_URI

  console.log("🔍 Your connection details:")
  console.log("Username: tejassoftwareengineer")
  console.log("Password: tejasMongo11")
  console.log("Cluster: cluster0.lpkvav3.mongodb.net")
  console.log("Database: financial_analytics")

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  })

  try {
    console.log("\n⏳ Testing connection...")
    await client.connect()
    console.log("✅ Connection successful!")

    const db = client.db("financial_analytics")

    // Test admin commands to verify permissions
    console.log("🔐 Testing user permissions...")

    try {
      await db.admin().ping()
      console.log("✅ Admin ping successful - user has proper permissions")
    } catch (error) {
      console.log("⚠️ Admin ping failed:", error.message)
    }

    try {
      const stats = await db.stats()
      console.log("✅ Database stats accessible - user can read database info")
    } catch (error) {
      console.log("⚠️ Database stats failed:", error.message)
    }

    try {
      const collections = await db.listCollections().toArray()
      console.log("✅ Collections listing successful - user can list collections")
    } catch (error) {
      console.log("⚠️ Collections listing failed:", error.message)
    }

    console.log("\n🎉 User verification successful!")
    console.log("✅ Your MongoDB user is properly configured!")
  } catch (error) {
    console.error("\n❌ User verification failed:")
    console.error("Error:", error.message)

    console.log("\n💡 Steps to fix in MongoDB Atlas:")
    console.log("1. Go to https://cloud.mongodb.com")
    console.log("2. Navigate to Database Access")
    console.log("3. Check if user 'tejassoftwareengineer' exists")
    console.log("4. If not, create it with password 'tejasMongo11'")
    console.log("5. Give it 'Atlas admin' or 'Read and write to any database' role")
    console.log("6. Go to Network Access")
    console.log("7. Add your IP or 0.0.0.0/0 for testing")
    console.log("8. Wait 2-3 minutes for changes to take effect")
  } finally {
    await client.close()
  }
}

verifyMongoDBUser()
