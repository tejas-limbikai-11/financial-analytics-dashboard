const jwt = require("jsonwebtoken")

// Test JWT token generation
function generateTestToken() {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-12345"

  const payload = {
    userId: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    iat: Math.floor(Date.now() / 1000),
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "24h",
      algorithm: "HS256",
    })

    console.log("Generated JWT Token:", token)

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("Decoded Token:", decoded)

    return token
  } catch (error) {
    console.error("JWT Error:", error)
  }
}

// Run the test
generateTestToken()
