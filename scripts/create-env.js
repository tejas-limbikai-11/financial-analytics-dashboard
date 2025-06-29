const fs = require("fs")
const path = require("path")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function createEnvFile() {
  console.log("🚀 Environment File Creator")
  console.log("=" * 30)

  const envPath = path.join(process.cwd(), ".env.local")

  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env.local file already exists!")
    rl.question("Do you want to overwrite it? (y/N): ", (answer) => {
      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        promptForValues()
      } else {
        console.log("❌ Cancelled")
        rl.close()
      }
    })
  } else {
    promptForValues()
  }

  function promptForValues() {
    console.log("\n📝 Please provide your MongoDB connection details:")

    rl.question("MongoDB URI (mongodb+srv://...): ", (mongoUri) => {
      if (!mongoUri.startsWith("mongodb")) {
        console.log("❌ Invalid MongoDB URI format")
        rl.close()
        return
      }

      rl.question("JWT Secret (or press Enter for auto-generated): ", (jwtSecret) => {
        if (!jwtSecret) {
          // Generate a random JWT secret
          jwtSecret = require("crypto").randomBytes(64).toString("hex")
          console.log("🔑 Generated JWT secret automatically")
        }

        const envContent = `# MongoDB Connection String
MONGODB_URI=${mongoUri}

# JWT Secret Key
JWT_SECRET=${jwtSecret}

# Environment
NODE_ENV=development
`

        try {
          fs.writeFileSync(envPath, envContent)
          console.log("✅ .env.local file created successfully!")
          console.log("📁 Location:", envPath)
          console.log("\n🔄 Now run: npm run check-env")
        } catch (error) {
          console.log("❌ Error creating file:", error.message)
        }

        rl.close()
      })
    })
  }
}

createEnvFile()
