// Service for handling notes data with server API

// Function to fetch notes from the server
export async function fetchNotes() {
  try {
    const response = await fetch("/api/user/notes")

    if (!response.ok) {
      throw new Error("Failed to fetch notes")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch notes")
    }

    return data.notes
  } catch (error) {
    console.error("Error fetching notes:", error)
    // Return default notes if fetch fails
    return []
  }
}

// Function to save notes to the server
export async function saveNotes(notes) {
  try {
    const response = await fetch("/api/user/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    })

    if (!response.ok) {
      throw new Error("Failed to save notes")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to save notes")
    }

    return true
  } catch (error) {
    console.error("Error saving notes:", error)
    return false
  }
}
