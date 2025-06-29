import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing MongoDB connection from API route...")

    const db = await getDatabase()
    console.log("✅ Database connection successful")

    // Test ping
    await db.admin().ping()
    console.log("✅ Database ping successful")

    // Test collections
    const collections = await db.listCollections().toArray()
    console.log("📁 Collections found:", collections.length)

    // Test write operation
    const testCollection = db.collection("connection_test")
    const testDoc = { test: true, timestamp: new Date(), source: "api-test" }
    const result = await testCollection.insertOne(testDoc)
    console.log("✅ Write test successful")

    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId })
    console.log("🧹 Test cleanup successful")

    return NextResponse.json({
      success: true,
      message: "MongoDB connection is working perfectly!",
      collections: collections.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ MongoDB connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
