// Service for handling GPA data with server API

// Function to fetch GPA data from the server
export async function fetchGpaData() {
  try {
    const response = await fetch("/api/user/gpa")

    if (!response.ok) {
      throw new Error("Failed to fetch GPA data")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch GPA data")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching GPA data:", error)
    // Return default GPA data if fetch fails
    return {
      courses: [],
      gpa: 0,
    }
  }
}

// Function to save GPA data to the server
export async function saveGpaData(gpaData) {
  try {
    const response = await fetch("/api/user/gpa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gpaData),
    })

    if (!response.ok) {
      throw new Error("Failed to save GPA data")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to save GPA data")
    }

    return true
  } catch (error) {
    console.error("Error saving GPA data:", error)
    return false
  }
}
