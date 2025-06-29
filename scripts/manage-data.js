// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { getDatabase } = require("../lib/mongodb")
const { createUser } = require("../lib/auth")

async function manageData() {
  console.log("🗄️ Data Management Tool")
  console.log("=" * 25)

  try {
    const db = await getDatabase()

    console.log("\nSelect an option:")
    console.log("1. View all users")
    console.log("2. View all transactions")
    console.log("3. Create sample data")
    console.log("4. Clear all data")
    console.log("5. Database statistics")

    // For demo purposes, let's run option 3 (create sample data)
    await createSampleData(db)
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
}

async function createSampleData(db) {
  console.log("\n📊 Creating Sample Data...")

  // Create sample users
  const sampleUsers = [
    { email: "alice@example.com", password: "password123", name: "Alice Johnson" },
    { email: "bob@example.com", password: "password123", name: "Bob Wilson" },
    { email: "carol@example.com", password: "password123", name: "Carol Davis" },
  ]

  const userIds = []

  console.log("\n👥 Creating users...")
  for (const userData of sampleUsers) {
    try {
      const user = await createUser(userData.email, userData.password, userData.name)
      console.log(`✅ Created: ${user.name}`)
      userIds.push(user._id)
    } catch (error) {
      if (error.message === "User already exists") {
        console.log(`⚠️ Already exists: ${userData.email}`)
        // Get existing user ID
        const users = db.collection("users")
        const existingUser = await users.findOne({ email: userData.email })
        if (existingUser) {
          userIds.push(existingUser._id.toString())
        }
      }
    }
  }

  // Create sample transactions
  console.log("\n💰 Creating transactions...")
  const transactions = db.collection("transactions")

  const sampleTransactions = [
    {
      amount: 5000,
      category: "Revenue",
      description: "Freelance project payment",
      type: "income",
      status: "paid",
    },
    {
      amount: -1200,
      category: "Expense",
      description: "Office rent",
      type: "expense",
      status: "paid",
    },
    {
      amount: 3000,
      category: "Revenue",
      description: "Consulting fees",
      type: "income",
      status: "paid",
    },
    {
      amount: -800,
      category: "Expense",
      description: "Software subscriptions",
      type: "expense",
      status: "paid",
    },
    {
      amount: 2500,
      category: "Revenue",
      description: "Product sales",
      type: "income",
      status: "pending",
    },
  ]

  for (let i = 0; i < sampleTransactions.length; i++) {
    const transaction = sampleTransactions[i]
    const userId = userIds[i % userIds.length] // Distribute transactions among users

    const transactionDoc = {
      ...transaction,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await transactions.insertOne(transactionDoc)
    console.log(`✅ Transaction: ${transaction.description} (₹${Math.abs(transaction.amount)})`)
  }

  console.log("\n🎉 Sample data created successfully!")
  console.log("🚀 You can now start your app and see the data!")
}

manageData()
