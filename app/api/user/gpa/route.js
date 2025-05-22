import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"

// Path to our "database" directory
const dataDir = path.join(process.cwd(), "data")
const usersDbPath = path.join(dataDir, "users.json")

// Ensure the data directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Get user by session ID
const getUserById = (sessionId) => {
  if (!fs.existsSync(usersDbPath)) {
    return null
  }

  const users = JSON.parse(fs.readFileSync(usersDbPath, "utf8"))
  return users.find((user) => user.id === sessionId)
}

// Get GPA data for a user
const getGpaData = (userId) => {
  const gpaPath = path.join(dataDir, "gpa", `${userId}.json`)

  if (!fs.existsSync(gpaPath)) {
    return {
      courses: [],
      gpa: 0,
    }
  }

  return JSON.parse(fs.readFileSync(gpaPath, "utf8"))
}

// Save GPA data for a user
const saveGpaData = (userId, data) => {
  ensureDirectoryExists(path.join(dataDir, "gpa"))
  const gpaPath = path.join(dataDir, "gpa", `${userId}.json`)
  fs.writeFileSync(gpaPath, JSON.stringify(data, null, 2))
}

// GET handler to retrieve GPA data
export async function GET(request) {
  try {
    // Get session cookie
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get user
    const user = getUserById(sessionId)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Get GPA data
    const gpaData = getGpaData(user.id)

    return NextResponse.json({
      success: true,
      data: gpaData,
    })
  } catch (error) {
    console.error("Error retrieving GPA data:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST handler to save GPA data
export async function POST(request) {
  try {
    // Get session cookie
    const sessionId = cookies().get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get user
    const user = getUserById(sessionId)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Get request body
    const data = await request.json()

    // Validate data
    if (!data || typeof data !== "object") {
      return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 })
    }

    // Save GPA data
    saveGpaData(user.id, data)

    return NextResponse.json({
      success: true,
      message: "GPA data saved successfully",
    })
  } catch (error) {
    console.error("Error saving GPA data:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
