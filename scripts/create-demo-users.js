// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

const { createUser } = require("../lib/auth")

async function createDemoUsers() {
  console.log("👥 Creating Demo Users")
  console.log("=" * 25)

  const demoUsers = [
    {
      email: "admin@financialapp.com",
      password: "admin123",
      name: "Admin User",
    },
    {
      email: "john.doe@example.com",
      password: "password123",
      name: "John Doe",
    },
    {
      email: "jane.smith@example.com",
      password: "password123",
      name: "Jane Smith",
    },
    {
      email: "tejas@example.com",
      password: "tejas123",
      name: "Tejas Software Engineer",
    },
    {
      email: "demo@financialapp.com",
      password: "demo123",
      name: "Demo User",
    },
  ]

  console.log(`\n⏳ Creating ${demoUsers.length} demo users...`)

  const results = []

  for (const userData of demoUsers) {
    try {
      console.log(`\n👤 Creating user: ${userData.email}`)
      const user = await createUser(userData.email, userData.password, userData.name)
      console.log(`✅ Success: ${user.name} (ID: ${user._id})`)
      results.push({ success: true, user: userData, id: user._id })
    } catch (error) {
      if (error.message === "User already exists") {
        console.log(`⚠️ Already exists: ${userData.email}`)
        results.push({ success: false, user: userData, reason: "already_exists" })
      } else {
        console.log(`❌ Failed: ${userData.email} - ${error.message}`)
        results.push({ success: false, user: userData, reason: error.message })
      }
    }
  }

  // Summary
  console.log("\n📊 Summary:")
  const successful = results.filter((r) => r.success).length
  const alreadyExists = results.filter((r) => r.reason === "already_exists").length
  const failed = results.filter((r) => !r.success && r.reason !== "already_exists").length

  console.log(`✅ Successfully created: ${successful}`)
  console.log(`⚠️ Already existed: ${alreadyExists}`)
  console.log(`❌ Failed: ${failed}`)

  if (successful > 0 || alreadyExists > 0) {
    console.log("\n🎉 Demo users are ready!")
    console.log("\n📋 Login credentials:")
    demoUsers.forEach((user) => {
      console.log(`📧 ${user.email} | 🔑 ${user.password}`)
    })
  }
}

createDemoUsers()
