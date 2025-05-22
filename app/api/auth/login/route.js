import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"

// Path to our "database" file
const dbPath = path.join(process.cwd(), "data", "users.json")

// Get all users from our "database"
const getUsers = () => {
  if (!fs.existsSync(dbPath)) {
    return []
  }

  const data = fs.readFileSync(dbPath, "utf8")
  return JSON.parse(data)
}

export async function POST(request) {
  try {
    const { emailOrUsername, password } = await request.json()

    // Basic validation
    if (!emailOrUsername || !password) {
      return NextResponse.json({ success: false, message: "Email/username and password are required" }, { status: 400 })
    }

    // Get users
    const users = getUsers()

    // Find user by email or username
    const user = users.find((user) => user.email === emailOrUsername || user.username === emailOrUsername)

    // Check if user exists
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check password (in a real app, you would compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Set a session cookie
    const sessionId = user.id
    cookies().set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return success without sensitive data
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
