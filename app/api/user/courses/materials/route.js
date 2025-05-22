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

// Get course materials for a user
const getCourseMaterials = (userId, courseId) => {
  const materialsDir = path.join(dataDir, "materials", userId)
  const materialsPath = path.join(materialsDir, `${courseId}.json`)

  if (!fs.existsSync(materialsPath)) {
    return []
  }

  return JSON.parse(fs.readFileSync(materialsPath, "utf8"))
}

// Save course materials for a user
const saveCourseMaterials = (userId, courseId, materials) => {
  const materialsDir = path.join(dataDir, "materials", userId)
  ensureDirectoryExists(materialsDir)

  const materialsPath = path.join(materialsDir, `${courseId}.json`)
  fs.writeFileSync(materialsPath, JSON.stringify(materials, null, 2))
}

// GET handler to retrieve course materials
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

    // Get courseId from query params
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 })
    }

    // Get course materials
    const materials = getCourseMaterials(user.id, courseId)

    return NextResponse.json({
      success: true,
      materials,
    })
  } catch (error) {
    console.error("Error retrieving course materials:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST handler to save course materials
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
    const { courseId, materials } = await request.json()

    // Validate data
    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 })
    }

    if (!Array.isArray(materials)) {
      return NextResponse.json({ success: false, message: "Invalid materials format" }, { status: 400 })
    }

    // Save course materials
    saveCourseMaterials(user.id, courseId, materials)

    return NextResponse.json({
      success: true,
      message: "Course materials saved successfully",
    })
  } catch (error) {
    console.error("Error saving course materials:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
