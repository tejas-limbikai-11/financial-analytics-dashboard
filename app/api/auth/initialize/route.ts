import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import { verifyToken } from "@/lib/auth"
import transactionsData from "@/data/transactions.json"

export async function POST(request: NextRequest) {
  console.log("🔄 Initializing user data...")

  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const transactions = db.collection("transactions")
    const users = db.collection("users")

    // Check if user already has transactions
    const existingTransactions = await transactions.countDocuments({ userId: user.userId })

    if (existingTransactions > 0) {
      console.log(`✅ User ${user.email} already has ${existingTransactions} transactions`)
      return NextResponse.json({
        success: true,
        message: "Data already initialized",
        transactionsCount: existingTransactions,
      })
    }

    console.log(`🌱 Initializing data for user: ${user.email}`)

    // Create demo users if they don't exist
    const demoUsers = [
      { user_id: "user_001", name: "John Smith", email: "john@example.com", password: "password123" },
      { user_id: "user_002", name: "Sarah Johnson", email: "sarah@example.com", password: "password123" },
      { user_id: "user_003", name: "Mike Davis", email: "mike@example.com", password: "password123" },
      { user_id: "user_004", name: "Emily Brown", email: "emily@example.com", password: "password123" },
    ]

    const userMap = new Map()
    userMap.set("user_001", user.userId) // Assign current user as user_001

    // Create other demo users if they don't exist
    for (let i = 1; i < demoUsers.length; i++) {
      const userData = demoUsers[i]
      const existingUser = await users.findOne({ email: userData.email })

      if (!existingUser) {
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
        console.log(`✅ Created demo user: ${userData.name}`)
      } else {
        userMap.set(userData.user_id, existingUser._id.toString())
        console.log(`✅ Using existing demo user: ${userData.name}`)
      }
    }

    // Transform and insert transaction data
    const transactionDocs = transactionsData.map((transaction) => {
      const userId = userMap.get(transaction.user_id) || user.userId

      return {
        date: transaction.date,
        amount: transaction.category === "Revenue" ? Math.abs(transaction.amount) : -Math.abs(transaction.amount),
        category: transaction.category,
        description: `${transaction.category} Transaction #${transaction.id}`,
        status: transaction.status.toLowerCase(),
        userId: userId,
        type: transaction.category === "Revenue" ? "income" : "expense",
        createdAt: new Date(transaction.date),
        updatedAt: new Date(),
      }
    })

    await transactions.insertMany(transactionDocs)
    console.log(`✅ Created ${transactionDocs.length} transactions for user`)

    return NextResponse.json({
      success: true,
      message: "Data initialized successfully!",
      transactionsCreated: transactionDocs.length,
    })
  } catch (error) {
    console.error("❌ Initialization error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initialize data", error: error.message },
      { status: 500 },
    )
  }
}
