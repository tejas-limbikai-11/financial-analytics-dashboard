import { type NextRequest, NextResponse } from "next/server"
import { verifyUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  console.log("\n🔐 Login API called")

  try {
    console.log("📥 Parsing request body...")
    const body = await request.json()
    const { email, password } = body

    console.log("📋 Login data received:", {
      email,
      passwordLength: password?.length,
      hasEmail: !!email,
      hasPassword: !!password,
    })

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("✅ Input validation passed")

    // Verify user credentials
    console.log("🔍 Verifying user credentials...")
    const user = await verifyUser(email, password)
    console.log("✅ User verified successfully:", { id: user._id, email: user.email })

    console.log("🎫 Generating JWT token...")
    const token = generateToken(user)
    console.log("✅ JWT token generated successfully")

    console.log("🎉 Login completed successfully for:", email)

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        message: "Login successful! Welcome back!",
      },
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    console.error("❌ Login error:", error)
    console.error("Error stack:", error.stack)

    let message = "Login failed"
    let status = 500

    if (error.message === "Invalid email or password") {
      message = "Invalid email or password. Please check your credentials and try again."
      status = 401
    } else if (error.message === "User not found") {
      message = "No account found with this email. Please register first."
      status = 404
    } else if (error.message.includes("MongoDB") || error.message.includes("database")) {
      message = "Database connection error. Please try again later."
      status = 503
    } else if (error.message.includes("connect")) {
      message = "Unable to connect to database. Please check your connection."
      status = 503
    }

    console.log("📤 Sending error response:", { message, status })

    return NextResponse.json(
      { success: false, message, error: process.env.NODE_ENV === "development" ? error.message : undefined },
      { status, headers: { "Content-Type": "application/json" } },
    )
  }
}
