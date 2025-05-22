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

// Save users to our "database"
const saveUsers = (users) => {
  const dirPath = path.dirname(dbPath)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2))
}

export async function POST(request) {
  try {
    // Get session cookie
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Basic validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 },
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    // Get users
    const users = getUsers()

    // Find user by session ID
    const userIndex = users.findIndex((user) => user.id === sessionId)

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Verify current password (in a real app, you would compare hashed passwords)
    if (users[userIndex].password !== currentPassword) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
    }

    // Update user's password
    users[userIndex] = {
      ...users[userIndex],
      password: newPassword, // In a real app, you would hash this password
      updatedAt: new Date().toISOString(),
    }

    // Save updated users
    saveUsers(users)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
