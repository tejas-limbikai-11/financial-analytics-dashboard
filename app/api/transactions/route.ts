import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

interface Transaction {
  _id?: string
  date: string
  amount: number
  category: string
  description: string
  status: string
  userId: string
  type: "income" | "expense"
  createdAt: Date
  updatedAt: Date
}

function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuthToken(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    const db = await getDatabase()
    const transactions = db.collection("transactions")

    // Get all transactions for the authenticated user
    const userTransactions = await transactions.find({ userId: user.userId }).sort({ date: -1 }).toArray()

    // Transform data to match frontend interface
    const formattedTransactions = userTransactions.map((transaction) => ({
      _id: transaction._id.toString(),
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      status: transaction.status,
      user: transaction.userId,
      type: transaction.type,
    }))

    return NextResponse.json(formattedTransactions, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Transactions GET error:", error)
    return NextResponse.json(
      { success: false, message: "Server error occurred" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuthToken(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    const { amount, category, description, status, type } = await request.json()

    // Validate input
    if (!amount || !category || !description || !status || !type) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Type must be either 'income' or 'expense'" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    if (!["paid", "pending"].includes(status.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Status must be either 'paid' or 'pending'" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const db = await getDatabase()
    const transactions = db.collection("transactions")

    const newTransaction: Omit<Transaction, "_id"> = {
      date: new Date().toISOString(),
      amount: type === "income" ? Math.abs(amount) : -Math.abs(amount),
      category,
      description,
      status: status.toLowerCase(),
      userId: user.userId,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await transactions.insertOne(newTransaction)

    const createdTransaction = {
      _id: result.insertedId.toString(),
      ...newTransaction,
      user: user.userId,
    }

    return NextResponse.json(
      { success: true, transaction: createdTransaction },
      { status: 201, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create transaction" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
