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

export async function GET() {
  try {
    // Get session cookie
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get users
    const users = getUsers()

    // Find user by session ID
    const user = users.find((user) => user.id === sessionId)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user
    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
