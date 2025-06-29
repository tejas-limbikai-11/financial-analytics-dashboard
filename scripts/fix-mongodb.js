// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")
const fs = require("fs")
const path = require("path")

async function fixMongoDB() {
  console.log("🔧 MongoDB Connection Fixer")
  console.log("=" * 50)

  // Step 1: Check .env.local file
  console.log("📄 Step 1: Checking .env.local file...")
  const envPath = path.join(process.cwd(), ".env.local")

  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!")
    console.log("💡 Creating .env.local template...")

    const template = `# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financial_analytics?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-123456789

# Environment
NODE_ENV=development`

    fs.writeFileSync(envPath, template)
    console.log("✅ .env.local template created. Please update with your actual credentials.")
    return
  }

  const envContent = fs.readFileSync(envPath, "utf8")
  console.log("✅ .env.local file found")

  // Check for placeholder values
  if (envContent.includes("username:password") || envContent.includes("YOUR_ACTUAL")) {
    console.log("❌ .env.local still contains placeholder values!")
    console.log("💡 You need to replace placeholders with actual MongoDB credentials")
    return
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log("❌ MONGODB_URI not loaded from .env.local")
    return
  }

  console.log("✅ MONGODB_URI loaded successfully")
  console.log("URI (masked):", uri.replace(/\/\/.*@/, "//***:***@"))

  // Step 2: Test different connection approaches
  console.log("\n🧪 Step 2: Testing MongoDB connection...")

  let error = null // Declare error variable

  // Test 1: Basic connection
  console.log("\nTest 1: Basic connection with long timeout...")
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    })

    await client.connect()
    console.log("✅ Basic connection successful!")

    const db = client.db("financial_analytics")
    await db.admin().ping()
    console.log("✅ Database ping successful!")

    // Test write operation
    const testCollection = db.collection("connection_test")
    const testDoc = { test: true, timestamp: new Date() }
    const result = await testCollection.insertOne(testDoc)
    console.log("✅ Write test successful:", result.insertedId)

    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId })
    await client.close()
    console.log("✅ MongoDB connection is working perfectly!")

    // Step 3: Test the application's auth functions
    console.log("\n👤 Step 3: Testing authentication functions...")
    await testAuthFunctions()

    return
  } catch (err) {
    error = err // Assign error to variable
    console.log("❌ Basic connection failed:", error.message)
  }

  // Test 2: Alternative connection string format
  console.log("\nTest 2: Trying alternative connection format...")
  try {
    // Remove database name from URI and add it separately
    const uriWithoutDb = uri.replace(/\/[^/?]+\?/, "/?")
    const client = new MongoClient(uriWithoutDb, {
      serverSelectionTimeoutMS: 30000,
    })

    await client.connect()
    console.log("✅ Alternative format connection successful!")
    await client.close()
  } catch (err) {
    error = err // Assign error to variable
    console.log("❌ Alternative format failed:", error.message)
  }

  // Step 4: Provide specific solutions
  console.log("\n💡 Step 4: Troubleshooting Solutions...")

  if (error && error.message.includes("authentication failed")) {
    console.log("🔑 AUTHENTICATION ISSUE - Try these fixes:")
    console.log("1. Go to MongoDB Atlas → Database Access")
    console.log("2. Delete your current user")
    console.log("3. Create a new user with:")
    console.log("   - Username: testuser")
    console.log("   - Password: testpass123 (no special characters)")
    console.log("   - Role: Atlas admin")
    console.log("4. Update your .env.local with the new credentials")
  } else if (error && (error.message.includes("network") || error.message.includes("timeout"))) {
    console.log("🌐 NETWORK ISSUE - Try these fixes:")
    console.log("1. Go to MongoDB Atlas → Network Access")
    console.log("2. Delete all existing IP addresses")
    console.log("3. Add new entry: 0.0.0.0/0 (Allow access from anywhere)")
    console.log("4. Wait 2-3 minutes for changes to take effect")
  } else if (error && error.message.includes("ENOTFOUND")) {
    console.log("🔍 HOSTNAME ISSUE - Try these fixes:")
    console.log("1. Go to MongoDB Atlas → Clusters")
    console.log("2. Click 'Connect' on your cluster")
    console.log("3. Choose 'Connect your application'")
    console.log("4. Copy the EXACT connection string")
    console.log("5. Replace <password> with your actual password")
    console.log("6. Add '/financial_analytics' before the '?' in the URI")
  }

  // Generate a working connection string template
  console.log("\n🔧 Step 5: Connection String Template")
  console.log("Your connection string should look like this:")
  console.log(
    "mongodb+srv://USERNAME:PASSWORD@CLUSTER.XXXXX.mongodb.net/financial_analytics?retryWrites=true&w=majority",
  )
  console.log("\nReplace:")
  console.log("- USERNAME: Your MongoDB Atlas username")
  console.log("- PASSWORD: Your MongoDB Atlas password (no special characters)")
  console.log("- CLUSTER.XXXXX: Your actual cluster hostname")
}

async function testAuthFunctions() {
  try {
    // Test the auth functions
    const { createUser, authenticateUser } = require("../lib/auth")

    console.log("🧪 Testing user creation...")

    // Try to create a test user
    try {
      const testUser = await createUser("test@example.com", "testpass123", "Test User")
      console.log("✅ User creation successful:", testUser.email)

      // Try to authenticate the user
      const authUser = await authenticateUser("test@example.com", "testpass123")
      if (authUser) {
        console.log("✅ User authentication successful")
      } else {
        console.log("❌ User authentication failed")
      }
    } catch (error) {
      if (error.message === "User already exists") {
        console.log("✅ User creation function working (user already exists)")

        // Test authentication with existing user
        const authUser = await authenticateUser("test@example.com", "testpass123")
        if (authUser) {
          console.log("✅ User authentication successful")
        } else {
          console.log("❌ User authentication failed")
        }
      } else {
        console.log("❌ User creation failed:", error.message)
      }
    }
  } catch (error) {
    console.log("❌ Auth function test failed:", error.message)
  }
}

fixMongoDB()
