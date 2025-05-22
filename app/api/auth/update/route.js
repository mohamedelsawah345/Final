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

export async function PUT(request) {
  try {
    // Get session cookie
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const { username, firstName, lastName, department } = await request.json()

    // Basic validation
    if (!username) {
      return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
    }

    // Get users
    const users = getUsers()

    // Find user by session ID
    const userIndex = users.findIndex((user) => user.id === sessionId)

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if username is already taken by another user
    if (users.some((user, index) => user.username === username && index !== userIndex)) {
      return NextResponse.json({ success: false, message: "Username already taken" }, { status: 400 })
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      username,
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      department: department || users[userIndex].department,
      updatedAt: new Date().toISOString(),
    }

    // Save updated users
    saveUsers(users)

    // Return updated user without password
    const { password, ...userWithoutPassword } = users[userIndex]
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
