// Service for handling tasks data with server API

// Function to fetch tasks from the server
export async function fetchTasks() {
  try {
    const response = await fetch("/api/user/tasks")

    if (!response.ok) {
      throw new Error("Failed to fetch tasks")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch tasks")
    }

    return data.tasks
  } catch (error) {
    console.error("Error fetching tasks:", error)
    // Return default tasks if fetch fails
    return []
  }
}

// Function to save tasks to the server
export async function saveTasks(tasks) {
  try {
    const response = await fetch("/api/user/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })

    if (!response.ok) {
      throw new Error("Failed to save tasks")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to save tasks")
    }

    return true
  } catch (error) {
    console.error("Error saving tasks:", error)
    return false
  }
}
