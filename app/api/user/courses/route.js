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

// Get courses data for a user
const getUserCourses = (userId) => {
  const coursesPath = path.join(dataDir, "courses", `${userId}.json`)

  if (!fs.existsSync(coursesPath)) {
    return {
      myCourses: [],
      completedCourses: [],
    }
  }

  return JSON.parse(fs.readFileSync(coursesPath, "utf8"))
}

// Save courses data for a user
const saveUserCourses = (userId, data) => {
  ensureDirectoryExists(path.join(dataDir, "courses"))
  const coursesPath = path.join(dataDir, "courses", `${userId}.json`)
  fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2))
}

// GET handler to retrieve courses
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

    // Get courses data
    const coursesData = getUserCourses(user.id)

    return NextResponse.json({
      success: true,
      data: coursesData,
    })
  } catch (error) {
    console.error("Error retrieving courses:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST handler to save courses
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

    // Save courses data
    saveUserCourses(user.id, data)

    return NextResponse.json({
      success: true,
      message: "Courses data saved successfully",
    })
  } catch (error) {
    console.error("Error saving courses:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
