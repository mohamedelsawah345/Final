"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Plus, Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { saveCoursesData } from "./courses-service"

export default function CoursesSidebar({ selectedCourse, setSelectedCourse }) {
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    specialized: true,
  })
  const { toast } = useToast()
  const [myCourses, setMyCourses] = useState([
    "math101", // IDs of courses added to My Courses
  ])
  const [completedCourses, setCompletedCourses] = useState([])
  const [hideCompleted, setHideCompleted] = useState(false)
  const { user } = useAuth()

  // Update the generalCourses array with the new general courses
  const generalCourses = [
    { id: "scientific-thinking", name: "Scientific Thinking", department: "general" },
    { id: "technical-reports", name: "Technical Reports", department: "general" },
    { id: "laws-ethics", name: "Laws and Ethics", department: "general" },
  ]

  // Update the specializedCourses array with the new specialized courses
  const specializedCourses = [
    // Computer Engineering courses
    { id: "data-structures", name: "Data Structures", department: "computer-engineering" },
    { id: "databases", name: "Databases", department: "computer-engineering" },
    { id: "software-engineering", name: "Software Engineering", department: "computer-engineering" },
    { id: "artificial-intelligence", name: "Artificial Intelligence", department: "computer-engineering" },

    // Electrical Power Engineering courses
    { id: "power-electronics", name: "Power Electronics", department: "electrical-power" },
    { id: "electrical-circuits", name: "Electrical Circuits", department: "electrical-power" },

    // Physics and Mathematics courses
    { id: "physics-1", name: "Physics 1", department: "physics-mathematics" },
    { id: "math-1", name: "Math 1", department: "physics-mathematics" },
    { id: "drawing-1", name: "Drawing 1", department: "physics-mathematics" },
  ]

  // Filter specialized courses based on user department
  const filteredSpecializedCourses = specializedCourses.filter((course) => {
    // If no user or no department, show all courses
    if (!user || !user.department) return true

    // Show courses from the user's department
    if (course.department === user.department) return true

    // Show courses that are relevant to multiple departments
    if (course.relevantDepartments && Array.isArray(course.relevantDepartments)) {
      return course.relevantDepartments.includes(user.department)
    }

    // Hide courses from other departments
    return false
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
  }

  const addToMyCourses = (courseId, e) => {
    e.stopPropagation() // Prevent triggering the course selection

    if (myCourses.includes(courseId)) {
      // Already in My Courses, show a message
      toast({
        title: "Already Added",
        description: "This course is already in your courses",
        duration: 3000,
      })
      return
    }

    // Add to My Courses
    const updatedMyCourses = [...myCourses, courseId]
    setMyCourses(updatedMyCourses)

    // Store in localStorage to share with MeMain component
    localStorage.setItem("myCourses", JSON.stringify(updatedMyCourses))

    // Also update the courses data through the service
    const currentCompletedCourses = localStorage.getItem("completedCourses")
      ? JSON.parse(localStorage.getItem("completedCourses"))
      : []

    saveCoursesData({
      myCourses: updatedMyCourses,
      completedCourses: currentCompletedCourses,
    }).catch((error) => {
      console.error("Failed to save course to server:", error)
    })

    toast({
      title: "Course Added",
      description: "Course has been added to My Courses",
      duration: 3000,
    })
  }

  // Add useEffect to load myCourses and completedCourses from localStorage on component mount
  useEffect(() => {
    const storedCourses = localStorage.getItem("myCourses")
    if (storedCourses) {
      setMyCourses(JSON.parse(storedCourses))
    }

    const storedCompletedCourses = localStorage.getItem("completedCourses")
    if (storedCompletedCourses) {
      setCompletedCourses(JSON.parse(storedCompletedCourses))
    }
  }, [])

  const toggleCourseCompletion = (courseId, e) => {
    e.stopPropagation() // Prevent triggering the course selection

    let updatedCompletedCourses
    if (completedCourses.includes(courseId)) {
      // Remove from completed courses
      updatedCompletedCourses = completedCourses.filter((id) => id !== courseId)
    } else {
      // Add to completed courses
      updatedCompletedCourses = [...completedCourses, courseId]
    }

    setCompletedCourses(updatedCompletedCourses)

    // Store in localStorage
    localStorage.setItem("completedCourses", JSON.stringify(updatedCompletedCourses))
  }

  // Sort courses to move completed ones to the bottom
  const sortCourses = (courses) => {
    return [...courses].sort((a, b) => {
      const aCompleted = completedCourses.includes(a.id)
      const bCompleted = completedCourses.includes(b.id)

      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1
      return 0
    })
  }

  const sortedGeneralCourses = sortCourses(generalCourses)
  const sortedSpecializedCourses = sortCourses(filteredSpecializedCourses)

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Courses</h2>

        <div className="mb-4 flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-xs w-full"
            onClick={() => setHideCompleted(!hideCompleted)}
          >
            {hideCompleted ? <Eye className="h-3.5 w-3.5 mr-2" /> : <EyeOff className="h-3.5 w-3.5 mr-2" />}
            {hideCompleted ? "Show Completed" : "Hide Completed"}
          </Button>
        </div>

        {/* General Courses Section */}
        <div className="mb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2 dark:text-white"
            onClick={() => toggleSection("general")}
          >
            <span>General Courses</span>
            {expandedSections.general ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {expandedSections.general && (
            <ul className="space-y-1 pl-2">
              {sortedGeneralCourses
                .filter((course) => !hideCompleted || !completedCourses.includes(course.id))
                .map((course) => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    isSelected={selectedCourse?.id === course.id}
                    isInMyCourses={myCourses.includes(course.id)}
                    isCompleted={completedCourses.includes(course.id)}
                    onClick={() => handleCourseSelect(course)}
                    onAddToMyCourses={(e) => addToMyCourses(course.id, e)}
                    onToggleCompletion={(e) => toggleCourseCompletion(course.id, e)}
                  />
                ))}
            </ul>
          )}
        </div>

        {/* Specialized Courses Section */}
        <div className="mb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2 dark:text-white"
            onClick={() => toggleSection("specialized")}
          >
            <span>Specialized Courses</span>
            {expandedSections.specialized ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {expandedSections.specialized && (
            <ul className="space-y-1 pl-2">
              {sortedSpecializedCourses
                .filter((course) => !hideCompleted || !completedCourses.includes(course.id))
                .map((course) => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    isSelected={selectedCourse?.id === course.id}
                    isInMyCourses={myCourses.includes(course.id)}
                    isCompleted={completedCourses.includes(course.id)}
                    onClick={() => handleCourseSelect(course)}
                    onAddToMyCourses={(e) => addToMyCourses(course.id, e)}
                    onToggleCompletion={(e) => toggleCourseCompletion(course.id, e)}
                  />
                ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}

function CourseItem({ course, isSelected, isInMyCourses, isCompleted, onClick, onAddToMyCourses, onToggleCompletion }) {
  return (
    <li className="group relative">
      <button
        className={cn(
          "flex items-center w-full px-2 py-1.5 text-sm rounded-md",
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
          isCompleted ? "line-through text-gray-500 dark:text-gray-500" : "",
        )}
        onClick={onClick}
      >
        <span className="truncate">{course.name}</span>
      </button>

      <div className="absolute right-1 top-1.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onAddToMyCourses}>
                <Plus className={cn("h-3.5 w-3.5", isInMyCourses ? "text-primary" : "")} />
                <span className="sr-only">Add to My Courses</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isInMyCourses ? "Already in My Courses" : "Add to My Courses"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onToggleCompletion}>
                <div
                  className={cn(
                    "h-3.5 w-3.5 border rounded-sm flex items-center justify-center",
                    isCompleted ? "bg-primary border-primary" : "border-gray-400 dark:border-gray-600",
                  )}
                >
                  {isCompleted && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="sr-only">Mark as Completed</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCompleted ? "Mark as Incomplete" : "Mark as Completed"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </li>
  )
}
