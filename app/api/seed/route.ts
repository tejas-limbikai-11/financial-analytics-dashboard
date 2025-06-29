import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import transactionsData from "@/data/transactions.json"

export async function POST(request: NextRequest) {
  console.log("🌱 Starting database seeding process...")

  try {
    const db = await getDatabase()
    console.log("✅ Database connection established")

    // Create demo users based on the transaction data
    const users = db.collection("users")
    const transactions = db.collection("transactions")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await users.deleteMany({})
    await transactions.deleteMany({})

    // Create users based on unique user_ids from transactions
    const uniqueUserIds = [...new Set(transactionsData.map((t) => t.user_id))]
    console.log(`👥 Creating ${uniqueUserIds.length} users...`)

    const userMap = new Map()
    const demoUsers = [
      { user_id: "user_001", name: "John Smith", email: "john@example.com", password: "password123" },
      { user_id: "user_002", name: "Sarah Johnson", email: "sarah@example.com", password: "password123" },
      { user_id: "user_003", name: "Mike Davis", email: "mike@example.com", password: "password123" },
      { user_id: "user_004", name: "Emily Brown", email: "emily@example.com", password: "password123" },
    ]

    // Add demo user for easy login
    demoUsers.push({
      user_id: "demo_user",
      name: "Demo User",
      email: "demo@example.com",
      password: "demo123",
    })

    for (const userData of demoUsers) {
      const hashedPassword = await hashPassword(userData.password)
      const userDoc = {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await users.insertOne(userDoc)
      userMap.set(userData.user_id, result.insertedId.toString())
      console.log(`✅ Created user: ${userData.name} (${userData.email})`)
    }

    // Insert transactions with proper user references
    console.log(`💰 Creating ${transactionsData.length} transactions...`)

    const transactionDocs = transactionsData.map((transaction) => {
      const userId = userMap.get(transaction.user_id)

      return {
        date: transaction.date,
        amount: transaction.category === "Revenue" ? Math.abs(transaction.amount) : -Math.abs(transaction.amount),
        category: transaction.category,
        description: `Transaction #${transaction.id} - ${transaction.category}`,
        status: transaction.status.toLowerCase(),
        userId: userId,
        type: transaction.category === "Revenue" ? "income" : "expense",
        createdAt: new Date(transaction.date),
        updatedAt: new Date(),
      }
    })

    await transactions.insertMany(transactionDocs)
    console.log(`✅ Created ${transactionDocs.length} transactions`)

    console.log("🎉 Database seeding completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      usersCreated: demoUsers.length,
      transactionsCreated: transactionDocs.length,
      demoCredentials: {
        email: "demo@example.com",
        password: "demo123",
      },
    })
  } catch (error) {
    console.error("❌ Seeding error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: error.message },
      { status: 500 },
    )
  }
}
