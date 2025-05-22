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

// Get schedule data for a user
const getScheduleData = (userId) => {
  const schedulePath = path.join(dataDir, "schedules", `${userId}.json`)

  if (!fs.existsSync(schedulePath)) {
    return {
      schedule: {},
      periods: ["8:30 - 10:15", "10:30 - 12:15", "12:30 - 2:15", "2:30 - 4:15"],
      isRamadanMode: false,
    }
  }

  return JSON.parse(fs.readFileSync(schedulePath, "utf8"))
}

// Save schedule data for a user
const saveScheduleData = (userId, data) => {
  ensureDirectoryExists(path.join(dataDir, "schedules"))
  const schedulePath = path.join(dataDir, "schedules", `${userId}.json`)
  fs.writeFileSync(schedulePath, JSON.stringify(data, null, 2))
}

// GET handler to retrieve schedule
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

    // Get schedule data
    const scheduleData = getScheduleData(user.id)

    return NextResponse.json({
      success: true,
      data: scheduleData,
    })
  } catch (error) {
    console.error("Error retrieving schedule:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST handler to save schedule
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

    // Save schedule data
    saveScheduleData(user.id, data)

    return NextResponse.json({
      success: true,
      message: "Schedule saved successfully",
    })
  } catch (error) {
    console.error("Error saving schedule:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
