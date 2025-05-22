// Add the missing fetchCoursesData and saveCoursesData functions

export const fetchCoursesData = async () => {
  try {
    // Try to fetch from server
    const response = await fetch("/api/user/courses")
    if (response.ok) {
      const data = await response.json()

      // Update localStorage with the latest data from server
      if (data.data) {
        localStorage.setItem("myCourses", JSON.stringify(data.data.myCourses || []))
        localStorage.setItem("completedCourses", JSON.stringify(data.data.completedCourses || []))
      }

      return data.data || { myCourses: [], completedCourses: [] }
    }
    throw new Error("Failed to fetch courses data from server")
  } catch (error) {
    console.error("Error fetching courses data:", error)

    // Fallback to localStorage
    const myCourses = localStorage.getItem("myCourses")
    const completedCourses = localStorage.getItem("completedCourses")

    return {
      myCourses: myCourses ? JSON.parse(myCourses) : [],
      completedCourses: completedCourses ? JSON.parse(completedCourses) : [],
    }
  }
}

export const saveCoursesData = async (data) => {
  try {
    // Update localStorage immediately for instant UI updates
    localStorage.setItem("myCourses", JSON.stringify(data.myCourses || []))
    localStorage.setItem("completedCourses", JSON.stringify(data.completedCourses || []))

    // Dispatch a storage event to notify other components
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "myCourses",
        newValue: JSON.stringify(data.myCourses || []),
      }),
    )

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "completedCourses",
        newValue: JSON.stringify(data.completedCourses || []),
      }),
    )

    // Try to save to server
    const response = await fetch("/api/user/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to save courses data to server")
    }

    return true
  } catch (error) {
    console.error("Error saving courses data:", error)
    return false
  }
}

export const fetchAvailableCourses = async () => {
  try {
    // Try to fetch from server
    const response = await fetch("/api/courses")
    if (response.ok) {
      const data = await response.json()
      return data.courses
    }
    throw new Error("Failed to fetch courses from server")
  } catch (error) {
    console.error("Error fetching courses:", error)

    // Fallback to mock data
    return [
      {
        id: "math101",
        title: "Engineering Mathematics I",
        description: "Fundamental mathematical concepts for engineering applications.",
        instructor: "Dr. Ahmed Hassan",
        type: "general",
        departments: [],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "phys101",
        title: "Engineering Physics",
        description: "Basic physics principles applied to engineering problems.",
        instructor: "Dr. Sara Ibrahim",
        type: "general",
        departments: [],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "comp101",
        title: "Introduction to Programming",
        description: "Fundamentals of programming using C++.",
        instructor: "Dr. Mohamed Ali",
        type: "general",
        departments: [],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "comp201",
        title: "Data Structures and Algorithms",
        description: "Advanced programming concepts and algorithm design.",
        instructor: "Dr. Laila Farouk",
        type: "specialized",
        departments: ["computer-engineering"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "elec201",
        title: "Circuit Analysis",
        description: "Analysis of electrical circuits and components.",
        instructor: "Dr. Khaled Nour",
        type: "specialized",
        departments: ["electrical-power", "electronics-communications"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "mech201",
        title: "Thermodynamics",
        description: "Principles of energy transfer and conversion.",
        instructor: "Dr. Hossam Mahmoud",
        type: "specialized",
        departments: ["mechanical-power"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "civil201",
        title: "Structural Analysis",
        description: "Analysis of structures under various loading conditions.",
        instructor: "Dr. Amira Samy",
        type: "specialized",
        departments: ["civil", "architectural"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "prod201",
        title: "Manufacturing Processes",
        description: "Modern manufacturing techniques and processes.",
        instructor: "Dr. Tarek Zaki",
        type: "specialized",
        departments: ["production"],
        image: "/placeholder.svg?height=100&width=200",
      },
    ]
  }
}
