// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { getDatabase } = require("../lib/mongodb")
const { ObjectId } = require("mongodb")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function addNewTransaction() {
  console.log("💰 Transaction Management Tool")
  console.log("=" * 35)

  try {
    const db = await getDatabase()
    const users = db.collection("users")
    const transactions = db.collection("transactions")

    // First, show available users
    console.log("\n👥 Available users:")
    const userList = await users.find({}).toArray()

    if (userList.length === 0) {
      console.log("❌ No users found. Please register a user first.")
      console.log("Run: node scripts/register-user.js")
      return
    }

    userList.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
    })

    // Get user selection
    const userIndex = await askQuestion(`\nSelect user (1-${userList.length}): `)
    const selectedUser = userList[Number.parseInt(userIndex) - 1]

    if (!selectedUser) {
      console.log("❌ Invalid user selection")
      return
    }

    console.log(`\n✅ Selected user: ${selectedUser.name}`)

    // Get transaction details
    console.log("\n💰 Transaction Details:")
    const type = await askQuestion("Type (income/expense): ")
    const amount = await askQuestion("Amount (₹): ")
    const category = await askQuestion("Category (Revenue/Expense/Food/Transport/etc): ")
    const description = await askQuestion("Description: ")
    const status = await askQuestion("Status (paid/pending): ")

    // Validate input
    if (!["income", "expense"].includes(type.toLowerCase())) {
      console.log("❌ Type must be 'income' or 'expense'")
      return
    }

    if (!["paid", "pending"].includes(status.toLowerCase())) {
      console.log("❌ Status must be 'paid' or 'pending'")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      console.log("❌ Amount must be a positive number")
      return
    }

    // Create transaction
    const transaction = {
      date: new Date().toISOString(),
      amount: type.toLowerCase() === "income" ? Math.abs(numAmount) : -Math.abs(numAmount),
      category: category.trim(),
      description: description.trim(),
      status: status.toLowerCase(),
      userId: selectedUser._id.toString(),
      type: type.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("\n⏳ Creating transaction...")
    const result = await transactions.insertOne(transaction)

    console.log("\n✅ Transaction created successfully!")
    console.log("🆔 Transaction ID:", result.insertedId)
    console.log("👤 User:", selectedUser.name)
    console.log("💰 Amount:", `${type === "income" ? "+" : "-"}₹${Math.abs(numAmount)}`)
    console.log("📂 Category:", category)
    console.log("📝 Description:", description)
    console.log("📊 Status:", status)
    console.log("📅 Date:", new Date().toLocaleDateString())

    // Ask if user wants to add another transaction
    const addAnother = await askQuestion("\nAdd another transaction? (y/n): ")
    if (addAnother.toLowerCase() === "y" || addAnother.toLowerCase() === "yes") {
      console.log("\n" + "=".repeat(35))
      await addNewTransaction()
    }
  } catch (error) {
    console.error("\n❌ Transaction creation failed:")
    console.error("Error:", error.message)
  } finally {
    rl.close()
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// Run the transaction tool
addNewTransaction()
