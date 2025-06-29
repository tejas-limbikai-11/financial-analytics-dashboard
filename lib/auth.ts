import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  _id?: string
  email: string
  password: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user._id!,
    email: user.email,
    name: user.name,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  console.log("🔨 Creating user:", { email, name })

  try {
    const db = await getDatabase()
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      console.log("❌ User already exists:", email)
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user document
    const userDoc: Omit<User, "_id"> = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert user
    const result = await users.insertOne(userDoc)
    console.log("✅ User created with ID:", result.insertedId)

    return {
      _id: result.insertedId.toString(),
      ...userDoc,
    }
  } catch (error) {
    console.error("❌ Error creating user:", error)
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

export async function verifyUser(email: string, password: string): Promise<User> {
  console.log("🔍 Verifying user:", { email })

  try {
    const db = await getDatabase()
    const users = db.collection("users")

    // Find user by email
    const user = await users.findOne({ email })
    if (!user) {
      console.log("❌ User not found:", email)
      throw new Error("User not found")
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log("❌ Invalid password for user:", email)
      throw new Error("Invalid email or password")
    }

    console.log("✅ User verified successfully:", email)

    return {
      _id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (error) {
    console.error("❌ Error verifying user:", error)
    throw error
  }
}
