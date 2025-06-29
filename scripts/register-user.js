// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { createUser } = require("../lib/auth")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function registerNewUser() {
  console.log("👤 User Registration Tool")
  console.log("=" * 30)

  try {
    // Get user input
    const email = await askQuestion("Enter email address: ")
    const password = await askQuestion("Enter password (min 6 chars): ")
    const name = await askQuestion("Enter full name: ")

    console.log("\n⏳ Creating user...")

    // Create the user
    const user = await createUser(email, password, name)

    console.log("\n✅ User created successfully!")
    console.log("📧 Email:", user.email)
    console.log("👤 Name:", user.name)
    console.log("🆔 User ID:", user._id)
    console.log("📅 Created:", user.createdAt)

    console.log("\n🎉 User can now login to the application!")
  } catch (error) {
    console.error("\n❌ User registration failed:")
    console.error("Error:", error.message)

    if (error.message === "User already exists") {
      console.log("💡 This email is already registered. Try logging in instead.")
    } else if (error.message.includes("MongoDB") || error.message.includes("database")) {
      console.log("💡 Database connection issue. Make sure MongoDB is configured correctly.")
    }
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

// Run the registration tool
registerNewUser()
