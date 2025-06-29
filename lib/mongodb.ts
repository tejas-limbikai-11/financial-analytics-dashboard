import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('❌ Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: "majority",
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Log connection attempt (mask sensitive info)
console.log("🔗 MongoDB URI configured:", uri.replace(/\/\/.*@/, "//***:***@"))

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log("🆕 Creating new MongoDB client for development")
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  } else {
    console.log("♻️ Reusing existing MongoDB client for development")
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  console.log("🏭 Creating MongoDB client for production")
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  try {
    console.log("⏳ Attempting to connect to MongoDB...")
    const client = await clientPromise
    console.log("✅ MongoDB client connected successfully")

    const db = client.db("financial_analytics")
    console.log("📊 Using database: financial_analytics")

    // Test the connection by running a simple command
    await db.admin().ping()
    console.log("🏓 MongoDB ping successful")

    return db
  } catch (error) {
    console.error("❌ MongoDB connection failed:")
    console.error("Error type:", error.constructor.name)
    console.error("Error message:", error.message)

    if (error.code) {
      console.error("Error code:", error.code)
    }

    throw new Error(`Failed to connect to MongoDB: ${error.message}`)
  }
}

export default clientPromise
