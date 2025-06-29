// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" })

async function testRegistration() {
  console.log("👤 Testing User Registration Flow")
  console.log("=" * 40)

  try {
    // Test the registration API endpoint
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      console.log("✅ Registration API test successful!")
      console.log("✅ User created:", data.user.email)
      console.log("✅ JWT token generated")
    } else {
      console.log("❌ Registration API test failed:")
      console.log("Status:", response.status)
      console.log("Message:", data.message)
    }
  } catch (error) {
    console.log("❌ Registration test failed:", error.message)
    console.log("💡 Make sure your app is running: npm run dev")
  }
}

// Only run if the app is running
console.log("🚀 Make sure your app is running (npm run dev) before running this test")
console.log("📝 This will test the registration API endpoint")
console.log("⏳ Starting test in 3 seconds...")

setTimeout(testRegistration, 3000)
