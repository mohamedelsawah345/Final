// Service for handling schedule data with server API

// Function to fetch schedule data from the server
export async function fetchSchedule() {
  try {
    const response = await fetch("/api/user/schedule")

    if (!response.ok) {
      throw new Error("Failed to fetch schedule")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch schedule")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching schedule:", error)
    // Return default schedule data if fetch fails
    return {
      schedule: {},
      periods: ["8:30 - 10:15", "10:30 - 12:15", "12:30 - 2:15", "2:30 - 4:15"],
      isRamadanMode: false,
    }
  }
}

// Function to save schedule data to the server
export async function saveSchedule(scheduleData) {
  try {
    const response = await fetch("/api/user/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    })

    if (!response.ok) {
      throw new Error("Failed to save schedule")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to save schedule")
    }

    return true
  } catch (error) {
    console.error("Error saving schedule:", error)
    return false
  }
}
