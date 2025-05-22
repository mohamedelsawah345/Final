import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"

// Path to our "database" file
const dbPath = path.join(process.cwd(), "data", "users.json")

// Ensure the data directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Get all users from our "database"
const getUsers = () => {
  ensureDirectoryExists(path.dirname(dbPath))

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]))
    return []
  }

  const data = fs.readFileSync(dbPath, "utf8")
  return JSON.parse(data)
}

// Save users to our "database"
const saveUsers = (users) => {
  ensureDirectoryExists(path.dirname(dbPath))
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2))
}

export async function POST(request) {
  try {
    const { email, username, password, confirmPassword, department, firstName, lastName } = await request.json()

    // Basic validation
    if (!email || !username || !password || !department) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^UG.*@f-eng\.tanta\.edu\.eg$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Email must start with 'UG' and end with '@f-eng.tanta.edu.eg'",
        },
        { status: 400 },
      )
    }

    // Get existing users
    const users = getUsers()

    // Check if email or username already exists
    if (users.some((user) => user.email === email)) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 })
    }

    if (users.some((user) => user.username === username)) {
      return NextResponse.json({ success: false, message: "Username already taken" }, { status: 400 })
    }

    // Create new user (in a real app, you would hash the password)
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password, // In a real app, NEVER store plain text passwords
      department,
      firstName: firstName || "",
      lastName: lastName || "",
      createdAt: new Date().toISOString(),
    }

    // Add user to our "database"
    users.push(newUser)
    saveUsers(users)

    // Set a session cookie
    const sessionId = newUser.id
    cookies().set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return success without sensitive data
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
