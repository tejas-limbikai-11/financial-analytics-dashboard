const fs = require("fs")
const path = require("path")

function checkEnvironment() {
  console.log("🔍 Environment Variables Diagnostic")
  console.log("=" * 50)

  // Check current working directory
  console.log("📁 Current directory:", process.cwd())
  console.log("📁 Script location:", __dirname)

  // List files in current directory
  console.log("\n📂 Files in current directory:")
  try {
    const files = fs.readdirSync(process.cwd())
    files.forEach((file) => {
      if (file.startsWith(".env") || file === "package.json") {
        console.log(`  ✅ ${file}`)
      }
    })
  } catch (error) {
    console.log("  ❌ Error reading directory:", error.message)
  }

  // Check for .env files
  const envFiles = [".env.local", ".env", ".env.development", ".env.production"]
  console.log("\n📄 Environment files check:")

  envFiles.forEach((filename) => {
    const filePath = path.join(process.cwd(), filename)
    const exists = fs.existsSync(filePath)
    console.log(`  ${filename}: ${exists ? "✅ Found" : "❌ Not found"}`)

    if (exists) {
      try {
        const content = fs.readFileSync(filePath, "utf8")
        console.log(`    - Size: ${content.length} characters`)
        console.log(`    - Lines: ${content.split("\n").length}`)

        // Check for our variables
        const hasMongoUri = content.includes("MONGODB_URI")
        const hasJwtSecret = content.includes("JWT_SECRET")
        console.log(`    - Contains MONGODB_URI: ${hasMongoUri ? "✅" : "❌"}`)
        console.log(`    - Contains JWT_SECRET: ${hasJwtSecret ? "✅" : "❌"}`)

        // Show content (masked)
        console.log(`    - Content preview:`)
        content
          .split("\n")
          .slice(0, 10)
          .forEach((line, i) => {
            if (line.trim()) {
              const maskedLine =
                line.includes("MONGODB_URI") || line.includes("JWT_SECRET")
                  ? line.split("=")[0] + "=***MASKED***"
                  : line
              console.log(`      ${i + 1}. ${maskedLine}`)
            }
          })
      } catch (error) {
        console.log(`    - ❌ Error reading file: ${error.message}`)
      }
    }
  })

  // Try loading dotenv manually
  console.log("\n🔄 Attempting to load environment variables:")

  try {
    // Try different approaches
    console.log("  Method 1: require('dotenv').config()")
    require("dotenv").config()
    console.log("  ✅ dotenv.config() executed")
  } catch (error) {
    console.log("  ❌ dotenv.config() failed:", error.message)
  }

  try {
    console.log("  Method 2: require('dotenv').config({ path: '.env.local' })")
    require("dotenv").config({ path: ".env.local" })
    console.log("  ✅ dotenv.config with .env.local executed")
  } catch (error) {
    console.log("  ❌ dotenv.config with .env.local failed:", error.message)
  }

  // Check process.env after loading
  console.log("\n🔑 Environment Variables in process.env:")
  const allEnvVars = Object.keys(process.env)
  console.log(`  Total environment variables: ${allEnvVars.length}`)

  // Look for our specific variables
  const ourVars = ["MONGODB_URI", "JWT_SECRET", "NODE_ENV"]
  ourVars.forEach((varName) => {
    const value = process.env[varName]
    if (value) {
      if (varName === "MONGODB_URI") {
        console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...***MASKED*** (${value.length} chars)`)
      } else if (varName === "JWT_SECRET") {
        console.log(`  ✅ ${varName}: ***MASKED*** (${value.length} chars)`)
      } else {
        console.log(`  ✅ ${varName}: ${value}`)
      }
    } else {
      console.log(`  ❌ ${varName}: Not found`)
    }
  })

  // Look for any MongoDB or JWT related variables
  const relevantVars = allEnvVars.filter(
    (key) => key.includes("MONGO") || key.includes("JWT") || key.includes("DATABASE") || key.startsWith("NEXT_"),
  )

  if (relevantVars.length > 0) {
    console.log("\n🔍 Related environment variables found:")
    relevantVars.forEach((key) => {
      const value = process.env[key]
      console.log(
        `  ${key}: ${value ? (key.includes("SECRET") || key.includes("URI") ? "***MASKED***" : value) : "undefined"}`,
      )
    })
  }

  // Provide solutions
  console.log("\n💡 Solutions:")
  if (!fs.existsSync(".env.local")) {
    console.log("  1. Create .env.local file in project root")
    console.log("  2. Add your MongoDB URI and JWT secret")
  } else {
    console.log("  1. Check .env.local file syntax (no spaces around =)")
    console.log("  2. Restart your development server")
    console.log("  3. Try running: npm install dotenv")
  }
}

checkEnvironment()
