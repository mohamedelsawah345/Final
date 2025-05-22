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

// Get notes for a user
const getUserNotes = (userId) => {
  const notesPath = path.join(dataDir, "notes", `${userId}.json`)

  if (!fs.existsSync(notesPath)) {
    return []
  }

  return JSON.parse(fs.readFileSync(notesPath, "utf8"))
}

// Save notes for a user
const saveUserNotes = (userId, notes) => {
  ensureDirectoryExists(path.join(dataDir, "notes"))
  const notesPath = path.join(dataDir, "notes", `${userId}.json`)
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2))
}

// GET handler to retrieve notes
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

    // Get notes
    const notes = getUserNotes(user.id)

    return NextResponse.json({
      success: true,
      notes,
    })
  } catch (error) {
    console.error("Error retrieving notes:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST handler to save notes
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
    const { notes } = await request.json()

    // Validate notes
    if (!Array.isArray(notes)) {
      return NextResponse.json({ success: false, message: "Invalid notes format" }, { status: 400 })
    }

    // Save notes
    saveUserNotes(user.id, notes)

    return NextResponse.json({
      success: true,
      message: "Notes saved successfully",
    })
  } catch (error) {
    console.error("Error saving notes:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
