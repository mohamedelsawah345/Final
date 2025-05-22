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

// Get tasks for a user
const getUserTasks = (userId) => {
  const tasksPath = path.join(dataDir, "tasks", `${userId}.json`)

  if (!fs.existsSync(tasksPath)) {
    return []
  }

  return JSON.parse(fs.readFileSync(tasksPath, "utf8"))
}

// Save tasks for a user
const saveUserTasks = (userId, tasks) => {
  ensureDirectoryExists(path.join(dataDir, "tasks"))
  const tasksPath = path.join(dataDir, "tasks", `${userId}.json`)
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2))
}

// GET handler to retrieve tasks
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

    // Get tasks
    const tasks = getUserTasks(user.id)

    return NextResponse.json({
      success: true,
      tasks,
    })
  } catch (error) {
    console.error("Error retrieving tasks:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST handler to save tasks
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
    const { tasks } = await request.json()

    // Validate tasks
    if (!Array.isArray(tasks)) {
      return NextResponse.json({ success: false, message: "Invalid tasks format" }, { status: 400 })
    }

    // Save tasks
    saveUserTasks(user.id, tasks)

    return NextResponse.json({
      success: true,
      message: "Tasks saved successfully",
    })
  } catch (error) {
    console.error("Error saving tasks:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
