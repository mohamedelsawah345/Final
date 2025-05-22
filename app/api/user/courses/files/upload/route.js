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

// Save file metadata to database
const saveFileMetadata = (userId, courseId, categoryId, fileData) => {
  // Get existing materials
  const materialsDir = path.join(dataDir, "materials", userId)
  const materialsPath = path.join(materialsDir, `${courseId}.json`)

  let materials = []
  if (fs.existsSync(materialsPath)) {
    materials = JSON.parse(fs.readFileSync(materialsPath, "utf8"))
  }

  // Find the category
  const categoryIndex = materials.findIndex((category) => category.id === categoryId)

  if (categoryIndex === -1) {
    // Category doesn't exist, create it
    materials.push({
      id: categoryId,
      title: "New Category",
      description: "Automatically created category",
      files: [fileData],
    })
  } else {
    // Add file to existing category
    materials[categoryIndex].files = materials[categoryIndex].files || []
    materials[categoryIndex].files.push(fileData)
  }

  // Save updated materials
  ensureDirectoryExists(materialsDir)
  fs.writeFileSync(materialsPath, JSON.stringify(materials, null, 2))
}

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

    // Process the form data
    const formData = await request.formData()
    const file = formData.get("file")
    const courseId = formData.get("courseId")
    const categoryId = formData.get("categoryId")
    const fileName = formData.get("fileName") || file.name

    if (!file || !courseId || !categoryId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create directories if they don't exist
    const filesDir = path.join(dataDir, "files", user.id, courseId, categoryId)
    ensureDirectoryExists(filesDir)

    // Generate a unique file name to avoid collisions
    const uniqueFileName = `${Date.now()}-${fileName}`
    const filePath = path.join(filesDir, uniqueFileName)

    // Convert file to buffer and save it
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, fileBuffer)

    // Create file metadata
    const fileData = {
      id: `file-${Date.now()}`,
      name: fileName,
      size: formatFileSize(file.size),
      type: file.type,
      path: `/api/user/courses/files/download?courseId=${courseId}&categoryId=${categoryId}&fileName=${uniqueFileName}`,
      uploadedAt: new Date().toISOString(),
    }

    // Save file metadata
    saveFileMetadata(user.id, courseId, categoryId, fileData)

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: fileData,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
