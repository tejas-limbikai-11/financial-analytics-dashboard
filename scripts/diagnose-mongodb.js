// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")
const dns = require("dns")
const { promisify } = require("util")

const dnsLookup = promisify(dns.lookup)

async function diagnoseMongoDB() {
  console.log("🔍 MongoDB Connection Diagnostic")
  console.log("=" * 50)

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    return
  }

  console.log("📋 Connection String Analysis:")
  console.log("Full URI (masked):", uri.replace(/\/\/.*@/, "//***:***@"))

  // Parse the URI
  try {
    const url = new URL(uri)
    console.log("Protocol:", url.protocol)
    console.log("Hostname:", url.hostname)
    console.log("Port:", url.port || "default")
    console.log("Database:", url.pathname.substring(1) || "not specified")
    console.log("Search params:", url.search)

    // Extract cluster info
    const hostParts = url.hostname.split(".")
    if (hostParts.length > 2) {
      console.log("Cluster name:", hostParts[0])
      console.log("Region info:", hostParts.slice(1).join("."))
    }
  } catch (error) {
    console.error("❌ Invalid URI format:", error.message)
    return
  }

  // Test DNS resolution
  console.log("\n🌐 DNS Resolution Test:")
  try {
    const url = new URL(uri)
    const address = await dnsLookup(url.hostname)
    console.log("✅ DNS resolution successful:", address.address)
  } catch (error) {
    console.error("❌ DNS resolution failed:", error.message)
    console.log("💡 This might indicate:")
    console.log("  - Incorrect cluster name in URI")
    console.log("  - Network connectivity issues")
    console.log("  - Firewall blocking DNS queries")
  }

  // Test different connection timeouts
  console.log("\n⏱️ Connection Tests with Different Timeouts:")

  const timeouts = [5000, 10000, 30000]

  for (const timeout of timeouts) {
    console.log(`\nTesting with ${timeout}ms timeout...`)

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: timeout,
      connectTimeoutMS: timeout,
      socketTimeoutMS: timeout,
    })

    try {
      await client.connect()
      console.log(`✅ Connected successfully with ${timeout}ms timeout`)

      // Test basic operations
      const db = client.db("financial_analytics")
      await db.admin().ping()
      console.log("✅ Database ping successful")

      await client.close()
      console.log("✅ Connection closed cleanly")
      break // Success, no need to test longer timeouts
    } catch (error) {
      console.log(`❌ Failed with ${timeout}ms timeout:`, error.message)

      if (error.message.includes("authentication failed")) {
        console.log("🔑 Authentication issue detected")
        break // No point testing longer timeouts for auth issues
      }
    }
  }

  // Test with minimal options
  console.log("\n🔧 Testing with Minimal Configuration:")
  const minimalClient = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
  })

  try {
    await minimalClient.connect()
    console.log("✅ Minimal configuration connection successful")

    const db = minimalClient.db("financial_analytics")
    await db.admin().ping()
    console.log("✅ Database operations working")

    // Test collections access
    const collections = await db.listCollections().toArray()
    console.log("📁 Collections accessible:", collections.length)

    await minimalClient.close()
  } catch (error) {
    console.error("❌ Minimal configuration failed:", error.message)
    console.error("Error code:", error.code)
    console.error("Error name:", error.name)

    // Detailed error analysis
    console.log("\n🔍 Error Analysis:")
    if (error.message.includes("authentication failed") || error.message.includes("bad auth")) {
      console.log("🔑 AUTHENTICATION ISSUE:")
      console.log("  - Check username and password in MongoDB URI")
      console.log("  - Verify database user exists in MongoDB Atlas")
      console.log("  - Check if password contains special characters (%, @, :, etc.)")
      console.log("  - Try creating a new database user with a simple password")
    } else if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("🌐 NETWORK ISSUE:")
      console.log("  - Check internet connection")
      console.log("  - Verify IP whitelist in MongoDB Atlas Network Access")
      console.log("  - Try adding 0.0.0.0/0 to Network Access temporarily")
      console.log("  - Check if corporate firewall blocks MongoDB ports")
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.log("🔍 DNS/HOSTNAME ISSUE:")
      console.log("  - Check cluster name in MongoDB URI")
      console.log("  - Verify cluster is running in MongoDB Atlas")
      console.log("  - Check for typos in the hostname")
    } else if (error.message.includes("not authorized")) {
      console.log("🚫 AUTHORIZATION ISSUE:")
      console.log("  - Check database user permissions")
      console.log("  - Ensure user has 'readWrite' role on the database")
      console.log("  - Try granting 'Atlas admin' role temporarily")
    }
  }

  // Connection string validation
  console.log("\n✅ Connection String Validation:")
  const requiredParts = [
    { check: uri.startsWith("mongodb+srv://"), message: "Should start with mongodb+srv://" },
    { check: uri.includes("@"), message: "Should contain @ symbol" },
    { check: uri.includes(".mongodb.net"), message: "Should contain .mongodb.net" },
    { check: uri.includes("retryWrites=true"), message: "Should include retryWrites=true" },
  ]

  requiredParts.forEach(({ check, message }) => {
    console.log(`${check ? "✅" : "❌"} ${message}`)
  })

  console.log("\n💡 Next Steps:")
  console.log("1. Check MongoDB Atlas dashboard - is your cluster running?")
  console.log("2. Verify Network Access settings in MongoDB Atlas")
  console.log("3. Check Database Access - does your user exist and have permissions?")
  console.log("4. Try connecting from MongoDB Compass with the same URI")
}

diagnoseMongoDB()
