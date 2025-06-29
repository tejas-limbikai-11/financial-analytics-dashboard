import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-12345"

export interface User {
  _id?: string
  email: string
  password?: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    console.log("🔐 Hashing password with salt rounds:", saltRounds)
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error("❌ Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("❌ Password verification error:", error)
    return false
  }
}

export function generateToken(user: Omit<User, "password">): string {
  try {
    const payload = {
      userId: user._id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
    }

    console.log("🎫 Generating JWT token for user:", payload.email)

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "24h",
      algorithm: "HS256",
    })
  } catch (error) {
    console.error("❌ JWT generation error:", error)
    throw new Error("Failed to generate token")
  }
}

export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] })
    console.log("✅ Token verified successfully for user:", (decoded as any).email)
    return decoded
  } catch (error) {
    console.error("❌ JWT verification error:", error)
    return null
  }
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  try {
    console.log("👤 Creating user:", { email, name })

    // Get database connection
    console.log("📊 Getting database connection...")
    const db = await getDatabase()
    console.log("✅ Database connection established")

    const users = db.collection("users")
    console.log("📁 Using users collection")

    // Check if user already exists
    console.log("🔍 Checking if user exists:", email)
    const existingUser = await users.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      console.log("⚠️ User already exists:", email)
      throw new Error("User already exists")
    }
    console.log("✅ User does not exist, proceeding with creation")

    // Validate input
    if (!email || !password || !name) {
      throw new Error("Email, password, and name are required")
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await hashPassword(password)
    console.log("✅ Password hashed successfully")

    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("💾 Inserting user into database...")
    console.log("User data (without password):", {
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
    })

    const result = await users.insertOne(userData)
    console.log("✅ User inserted with ID:", result.insertedId)

    if (!result.insertedId) {
      throw new Error("Failed to create user in database")
    }

    // Verify the user was actually inserted
    const insertedUser = await users.findOne({ _id: result.insertedId })
    if (!insertedUser) {
      console.error("❌ User not found after insertion!")
      throw new Error("User creation verification failed")
    }
    console.log("✅ User creation verified in database")

    const { password: _, ...userWithoutPassword } = userData
    return {
      ...userWithoutPassword,
      _id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("❌ Create user error:", error)
    throw error
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log("🔐 Authenticating user:", email)

    const db = await getDatabase()
    const users = db.collection("users")

    console.log("🔍 Looking for user in database...")
    const user = await users.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log("❌ User not found:", email)
      return null
    }
    console.log("✅ User found in database")

    console.log("🔐 Verifying password...")
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      console.log("❌ Invalid password for user:", email)
      return null
    }
    console.log("✅ Password verified successfully")

    const { password: _, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    }
  } catch (error) {
    console.error("❌ Authentication error:", error)
    return null
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    console.log("🔍 Getting user by ID:", userId)

    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      console.log("❌ User not found by ID:", userId)
      return null
    }
    console.log("✅ User found by ID")

    const { password: _, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    }
  } catch (error) {
    console.error("❌ Get user by ID error:", error)
    return null
  }
}
