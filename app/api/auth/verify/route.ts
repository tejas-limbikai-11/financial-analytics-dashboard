import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    return NextResponse.json(
      { success: true, user: decoded },
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
