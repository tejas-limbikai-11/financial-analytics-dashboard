import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login request received")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Authenticate user
    console.log("Authenticating user...")
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("Authentication failed for:", email)
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    // Generate token
    console.log("Generating token for authenticated user...")
    const token = generateToken(user)

    console.log("Login successful for:", email)

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        message: "Login successful!",
      },
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
