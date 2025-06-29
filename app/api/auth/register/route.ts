import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  console.log("\n🚀 Registration API called")

  try {
    console.log("📥 Parsing request body...")
    const body = await request.json()
    const { email, password, name } = body

    console.log("📋 Registration data received:", {
      email,
      name,
      passwordLength: password?.length,
      hasEmail: !!email,
      hasPassword: !!password,
      hasName: !!name,
    })

    // Validate input
    if (!email || !password || !name) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { success: false, message: "Email, password, and name are required" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email)
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    if (password.length < 6) {
      console.log("❌ Password too short")
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    if (name.trim().length < 2) {
      console.log("❌ Name too short")
      return NextResponse.json(
        { success: false, message: "Name must be at least 2 characters long" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("✅ Input validation passed")

    // Create user
    console.log("👤 Calling createUser function...")
    const user = await createUser(email, password, name)
    console.log("✅ User created successfully:", { id: user._id, email: user.email })

    console.log("🎫 Generating JWT token...")
    const token = generateToken(user)
    console.log("✅ JWT token generated successfully")

    console.log("🎉 Registration completed successfully for:", email)

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        message: "Account created successfully! Welcome to Financial Analytics!",
      },
      { status: 201, headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    console.error("❌ Registration error:", error)
    console.error("Error stack:", error.stack)

    let message = "Registration failed"
    let status = 500

    if (error.message === "User already exists") {
      message = "An account with this email already exists. Please try logging in instead."
      status = 409
    } else if (error.message.includes("required") || error.message.includes("characters")) {
      message = error.message
      status = 400
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
