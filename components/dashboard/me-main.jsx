"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Trash2,
  Save,
  BookOpen,
  FileText,
  LinkIcon,
  ArrowUp,
  ArrowDown,
  Clock,
  X,
  Edit,
  Check,
  AlertCircle,
  CopyIcon,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ChatbotPage from "@/app/dashboard/chatbot/page"

import { fetchSchedule, saveSchedule } from "./schedule-service"
import { fetchTasks, saveTasks } from "./tasks-service"
import { fetchNotes, saveNotes } from "./notes-service"
import { fetchCoursesData, saveCoursesData } from "./courses-service"
import { fetchGpaData, saveGpaData } from "./gpa-service"

export default function MeMain({ selectedItem }) {
  switch (selectedItem) {
    case "my-courses":
      return <MyCourses />
    case "my-tasks":
      return <MyTasks />
    case "my-notes":
      return <MyNotes />
    case "gpa-calculator":
      return <GpaCalculator />
    case "my-schedule":
      return <MySchedule />
    case "chatbot":
      return <ChatbotPage />
    default:
      return <MyCourses />
  }
}

// LinkCard component definition
function LinkCard({ title, url, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="bg-primary/10 p-2 rounded-full">
          <LinkIcon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Visit Link
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

// MySchedule component with the requested changes
function MySchedule() {
  // Change days to Saturday-Thursday with short names
  const weekdays = [
    { full: "Saturday", short: "Sat" },
    { full: "Sunday", short: "Sun" },
    { full: "Monday", short: "Mon" },
    { full: "Tuesday", short: "Tue" },
    { full: "Wednesday", short: "Wed" },
    { full: "Thursday", short: "Thu" },
  ]

  // Updated periods
  const defaultPeriods = ["8:30 - 10:15", "10:30 - 12:15", "12:30 - 2:15", "2:30 - 4:15"]

  // Ramadan periods
  const ramadanPeriods = ["9:00 - 10:10", "10:20 - 11:30", "11:40 - 12:50", "1:00 - 2:10"]

  const [schedule, setSchedule] = useState({})
  const [periods, setPeriods] = useState([])
  const [isRamadanMode, setIsRamadanMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load my courses from the server/localStorage
  const [myCourses, setMyCourses] = useState([])
  useEffect(() => {
    async function loadCoursesData() {
      try {
        const data = await fetchCoursesData()
        const courseIds = data.myCourses || []

        // Get course details from the allCourses array
        const allCourses = [
          // General courses
          { id: "scientific-thinking", name: "Scientific Thinking", department: "general" },
          { id: "technical-reports", name: "Technical Reports", department: "general" },
          { id: "laws-ethics", name: "Laws and Ethics", department: "general" },

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

        const courses = allCourses.filter((course) => courseIds.includes(course.id))
        setMyCourses(courses)
      } catch (error) {
        console.error("Failed to load courses data:", error)
        // Try to load from localStorage as fallback
        const storedCourseIds = localStorage.getItem("myCourses")
        if (storedCourseIds) {
          const courseIds = JSON.parse(storedCourseIds)
          // Get course details from the allCourses array
          const allCourses = [
            { id: "math101", name: "Mathematics 101", department: "general" },
            { id: "comp201", name: "Computer Architecture", department: "computer-engineering" },
            { id: "comp202", name: "Data Structures", department: "computer-engineering" },
            { id: "phys101", name: "Physics 101", department: "general" },
            { id: "eng101", name: "English for Engineers", department: "general" },
            { id: "elec201", name: "Circuit Analysis", department: "electrical-power" },
            { id: "elec202", name: "Power Systems", department: "electrical-power" },
            { id: "comm201", name: "Signal Processing", department: "electronics-communications" },
          ]
          const courses = allCourses.filter((course) => courseIds.includes(course.id))
          setMyCourses(courses)
        }
      }
    }

    loadCoursesData()
  }, [])

  const [isEditing, setIsEditing] = useState(false)
  const [editingCell, setEditingCell] = useState(null)
  const [editFormData, setEditFormData] = useState({
    course: "",
    type: "lecture",
    location: "",
    isOnline: false,
  })

  // State for custom periods
  const [isAddingPeriod, setIsAddingPeriod] = useState(false)
  const [newPeriodStart, setNewPeriodStart] = useState("")
  const [newPeriodEnd, setNewPeriodEnd] = useState("")

  // State for alerts
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("success") // "success" or "error"

  // Effect to switch periods when Ramadan mode changes
  useEffect(() => {
    setPeriods(isRamadanMode ? ramadanPeriods : defaultPeriods)

    // Map existing schedule to new time periods
    if (Object.keys(schedule).length > 0) {
      const newSchedule = {}

      Object.keys(schedule).forEach((day) => {
        newSchedule[day] = {}

        // Map each entry to the corresponding period in the new schedule
        Object.entries(schedule[day]).forEach(([oldPeriod, data]) => {
          const oldIndex = isRamadanMode ? defaultPeriods.indexOf(oldPeriod) : ramadanPeriods.indexOf(oldPeriod)

          if (oldIndex !== -1) {
            const newPeriod = isRamadanMode ? ramadanPeriods[oldIndex] : defaultPeriods[oldIndex]

            newSchedule[day][newPeriod] = data
          }
        })
      })

      setSchedule(newSchedule)
    }
  }, [isRamadanMode])

  useEffect(() => {
    async function loadSchedule() {
      setIsLoading(true)
      try {
        const data = await fetchSchedule()
        setSchedule(data.schedule || {})
        setPeriods(data.periods || defaultPeriods)
        setIsRamadanMode(data.isRamadanMode || false)
      } catch (error) {
        console.error("Failed to load schedule:", error)
        // Use default values if loading fails
        setPeriods(defaultPeriods)
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedule()
  }, [])

  const handleCellClick = (day, period) => {
    if (!isEditing) return

    const existingData = schedule[day]?.[period]
    setEditingCell({ day, period })
    setEditFormData({
      course: existingData?.course || "",
      type: existingData?.type || "lecture",
      location: existingData?.location || "",
      isOnline: existingData?.isOnline || false,
    })
  }

  const handleSaveCell = async () => {
    if (!editingCell || !editFormData.course) return

    // If online, no location is needed
    if (editFormData.isOnline) {
      editFormData.location = "Online"
    } else if (!editFormData.location) {
      // Show error for missing location
      setAlertMessage("Location is required for in-person classes")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    const { day, period } = editingCell

    const updatedSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [period]: { ...editFormData },
      },
    }

    setSchedule(updatedSchedule)

    // Save to server
    try {
      await saveSchedule({
        schedule: updatedSchedule,
        periods,
        isRamadanMode,
      })

      // Show success message
      setAlertMessage("Schedule updated successfully")
      setAlertType("success")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error("Failed to save schedule:", error)
      setAlertMessage("Failed to save schedule to server")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }

    setEditingCell(null)
  }

  const handleClearCell = async () => {
    if (!editingCell) return

    const { day, period } = editingCell

    const updatedSchedule = { ...schedule }

    if (updatedSchedule[day]) {
      const newDay = { ...updatedSchedule[day] }
      delete newDay[period]

      if (Object.keys(newDay).length === 0) {
        delete updatedSchedule[day]
      } else {
        updatedSchedule[day] = newDay
      }
    }

    setSchedule(updatedSchedule)

    // Save to server
    try {
      await saveSchedule({
        schedule: updatedSchedule,
        periods,
        isRamadanMode,
      })

      // Show success message
      setAlertMessage("Schedule entry removed")
      setAlertType("success")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error("Failed to save schedule:", error)
      setAlertMessage("Failed to save changes to server")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }

    setEditingCell(null)
  }

  // Modify the handleInputChange function to remove suggestion-related code
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Modify the handleOnlineToggle function to remove suggestion-related code
  const handleOnlineToggle = (checked) => {
    setEditFormData((prev) => ({
      ...prev,
      isOnline: checked,
      location: checked ? "Online" : "",
    }))
  }

  const addCustomPeriod = async () => {
    if (!newPeriodStart || !newPeriodEnd) {
      // Show error for missing times
      setAlertMessage("Start and end times are required")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    const newPeriod = `${newPeriodStart} - ${newPeriodEnd}`
    if (!periods.includes(newPeriod)) {
      const updatedPeriods = [...periods, newPeriod]
      setPeriods(updatedPeriods)
      setNewPeriodStart("")
      setNewPeriodEnd("")
      setIsAddingPeriod(false)

      // Save to server
      try {
        await saveSchedule({
          schedule,
          periods: updatedPeriods,
          isRamadanMode,
        })

        // Show success message
        setAlertMessage("New period added successfully")
        setAlertType("success")
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      } catch (error) {
        console.error("Failed to save schedule:", error)
        setAlertMessage("Failed to save changes to server")
        setAlertType("error")
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    } else {
      // Show error for duplicate period
      setAlertMessage("This period already exists")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  // Function to copy a schedule entry to another day/time
  const [isCopying, setIsCopying] = useState(false)
  const [copySource, setCopySource] = useState(null)
  const [copyTarget, setCopyTarget] = useState({ day: "", period: "" })

  const startCopying = (day, period) => {
    if (!schedule[day]?.[period]) return

    setCopySource({ day, period, data: schedule[day][period] })
    setIsCopying(true)
  }

  const handleCopy = async () => {
    if (!copySource || !copyTarget.day || !copyTarget.period) {
      setAlertMessage("Please select a target day and period")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    const updatedSchedule = {
      ...schedule,
      [copyTarget.day]: {
        ...schedule[copyTarget.day],
        [copyTarget.period]: { ...copySource.data },
      },
    }

    setSchedule(updatedSchedule)

    // Save to server
    try {
      await saveSchedule({
        schedule: updatedSchedule,
        periods,
        isRamadanMode,
      })

      setAlertMessage("Schedule entry copied successfully")
      setAlertType("success")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error("Failed to save schedule:", error)
      setAlertMessage("Failed to save changes to server")
      setAlertType("error")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }

    setIsCopying(false)
    setCopySource(null)
    setCopyTarget({ day: "", period: "" })
  }

  useEffect(() => {
    // Only save if not in initial loading state
    if (!isLoading) {
      saveSchedule({
        schedule,
        periods,
        isRamadanMode,
      }).catch((error) => {
        console.error("Failed to save Ramadan mode change:", error)
      })
    }
  }, [isRamadanMode])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading schedule...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 mr-4">
            <Switch id="ramadan-mode" checked={isRamadanMode} onCheckedChange={setIsRamadanMode} />
            <Label htmlFor="ramadan-mode">Ramadan Mode</Label>
          </div>

          {!isAddingPeriod && (
            <Button variant="outline" onClick={() => setIsAddingPeriod(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Add Period
            </Button>
          )}

          <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Done Editing" : "Edit Schedule"}
          </Button>
        </div>
      </div>

      {showAlert && (
        <Alert
          className={`mb-4 ${
            alertType === "error"
              ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          }`}
        >
          {alertType === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <AlertDescription
            className={alertType === "error" ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}
          >
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      {isAddingPeriod && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Custom Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="space-y-2">
                <Label htmlFor="period-start">Start Time</Label>
                <Input
                  id="period-start"
                  type="time"
                  value={newPeriodStart}
                  onChange={(e) => setNewPeriodStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-end">End Time</Label>
                <Input
                  id="period-end"
                  type="time"
                  value={newPeriodEnd}
                  onChange={(e) => setNewPeriodEnd(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddingPeriod(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomPeriod}>Add Period</Button>
          </CardFooter>
        </Card>
      )}

      {isCopying && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle>Copy Schedule Entry</CardTitle>
            <CardDescription>
              Copying {copySource.data.course} ({copySource.data.type}) from {copySource.day}, {copySource.period}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="copy-day">Target Day</Label>
                <Select
                  value={copyTarget.day}
                  onValueChange={(value) => setCopyTarget((prev) => ({ ...prev, day: value }))}
                >
                  <SelectTrigger id="copy-day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map((day) => (
                      <SelectItem key={day.full} value={day.full}>
                        {day.full}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="copy-period">Target Period</Label>
                <Select
                  value={copyTarget.period}
                  onValueChange={(value) => setCopyTarget((prev) => ({ ...prev, period: value }))}
                >
                  <SelectTrigger id="copy-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCopying(false)
                setCopySource(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCopy}>Copy Entry</Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>{isRamadanMode ? "Ramadan Schedule" : "Regular Schedule"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 dark:bg-gray-800 w-24"></th>
                  {weekdays.map((day) => (
                    <th key={day.full} className="border p-2 bg-gray-50 dark:bg-gray-800">
                      <span className="hidden sm:inline">{day.full}</span>
                      <span className="sm:hidden">{day.short}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period}>
                    <td className="border p-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium">{period}</td>
                    {weekdays.map((day) => {
                      const cellData = schedule[day.full]?.[period]
                      const isCurrentlyEditing = editingCell?.day === day.full && editingCell?.period === period

                      return (
                        <td
                          key={`${day.full}-${period}`}
                          className={`border p-0 relative ${isEditing ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""} ${
                            cellData ? "bg-primary/5" : ""
                          } ${isCurrentlyEditing ? "bg-primary/10" : ""}`}
                          onClick={() => handleCellClick(day.full, period)}
                        >
                          {cellData && !isCurrentlyEditing ? (
                            <div className="p-2 relative group">
                              <div className="font-medium text-sm dark:text-white">{cellData.course}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                <span className="capitalize">{cellData.type}</span>
                                <span>{cellData.isOnline ? "Online" : cellData.location}</span>
                              </div>

                              {isEditing && (
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      startCopying(day.full, period)
                                    }}
                                  >
                                    <CopyIcon className="h-3 w-3 text-primary" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCellClick(day.full, period)
                                    }}
                                  >
                                    <Edit className="h-3 w-3 text-blue-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingCell({ day: day.full, period })
                                      handleClearCell()
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : isCurrentlyEditing ? (
                            <div className="p-2 space-y-2">
                              <div className="relative">
                                <Select
                                  value={editFormData.course}
                                  onValueChange={(value) => setEditFormData({ ...editFormData, course: value })}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select course" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {myCourses.map((course) => (
                                      <SelectItem key={course.id} value={course.name}>
                                        {course.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Select
                                  name="type"
                                  value={editFormData.type}
                                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lecture">Lecture</SelectItem>
                                    <SelectItem value="section">Section</SelectItem>
                                    <SelectItem value="lab">Lab</SelectItem>
                                  </SelectContent>
                                </Select>

                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="online-toggle"
                                    checked={editFormData.isOnline}
                                    onCheckedChange={handleOnlineToggle}
                                  />
                                  <Label htmlFor="online-toggle" className="text-xs">
                                    Online
                                  </Label>
                                </div>
                              </div>

                              {!editFormData.isOnline && (
                                <div className="relative">
                                  <Input
                                    name="location"
                                    value={editFormData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location manually"
                                    className="text-xs"
                                  />
                                </div>
                              )}

                              <div className="flex justify-between pt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 h-7 px-2"
                                  onClick={handleClearCell}
                                >
                                  Clear
                                </Button>
                                <Button size="sm" className="h-7 px-2" onClick={handleSaveCell}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-20"></div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isEditing ? "Click on any cell to add or edit a class" : "Click 'Edit Schedule' to make changes"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Update MyCourses component to load courses from localStorage and add remove functionality
function MyCourses() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [myCourseIds, setMyCourseIds] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hideCompleted, setHideCompleted] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Load myCourses and completedCourses from localStorage on component mount
  useEffect(() => {
    async function loadCoursesData() {
      setIsLoading(true)
      try {
        const data = await fetchCoursesData()
        setMyCourseIds(data.myCourses || [])
        setCompletedCourses(data.completedCourses || [])
      } catch (error) {
        console.error("Failed to load courses data:", error)
        // Try to load from localStorage as fallback
        const storedCourses = localStorage.getItem("myCourses")
        if (storedCourses) {
          setMyCourseIds(JSON.parse(storedCourses))
        }

        const storedCompletedCourses = localStorage.getItem("completedCourses")
        if (storedCompletedCourses) {
          setCompletedCourses(JSON.parse(storedCompletedCourses))
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadCoursesData()

    // Set up an event listener to detect changes to localStorage
    const handleStorageChange = (e) => {
      if (e.key === "myCourses") {
        const newMyCourses = e.newValue ? JSON.parse(e.newValue) : []
        setMyCourseIds(newMyCourses)
      } else if (e.key === "completedCourses") {
        const newCompletedCourses = e.newValue ? JSON.parse(e.newValue) : []
        setCompletedCourses(newCompletedCourses)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const allCourses = [
    // General courses
    { id: "scientific-thinking", name: "Scientific Thinking", department: "general" },
    { id: "technical-reports", name: "Technical Reports", department: "general" },
    { id: "laws-ethics", name: "Laws and Ethics", department: "general" },

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

  // Filter courses based on myCourseIds
  const myCourses = allCourses.filter((course) => myCourseIds.includes(course.id))

  // Sort courses to move completed ones to the bottom
  const sortedMyCourses = [...myCourses].sort((a, b) => {
    const aCompleted = completedCourses.includes(a.id)
    const bCompleted = completedCourses.includes(b.id)

    if (aCompleted && !bCompleted) return 1
    if (!aCompleted && bCompleted) return -1
    return 0
  })

  // Filter out completed courses if hideCompleted is true
  const displayedCourses = hideCompleted
    ? sortedMyCourses.filter((course) => !completedCourses.includes(course.id))
    : sortedMyCourses

  const [materialCategories, setMaterialCategories] = useState({})

  // Function to remove a course from My Courses
  const removeCourse = async (courseId) => {
    const updatedMyCourses = myCourseIds.filter((id) => id !== courseId)
    setMyCourseIds(updatedMyCourses)

    // Update localStorage as fallback
    localStorage.setItem("myCourses", JSON.stringify(updatedMyCourses))

    // Save to server
    try {
      await saveCoursesData({
        myCourses: updatedMyCourses,
        completedCourses,
      })

      // Show alert
      setAlertMessage("Course removed from My Courses")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error("Failed to save courses data:", error)
      setAlertMessage("Failed to save changes to server")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  // Function to toggle course completion
  const toggleCourseCompletion = async (courseId) => {
    let updatedCompletedCourses
    if (completedCourses.includes(courseId)) {
      // Remove from completed courses
      updatedCompletedCourses = completedCourses.filter((id) => id !== courseId)
    } else {
      // Add to completed courses
      updatedCompletedCourses = [...completedCourses, courseId]
    }

    setCompletedCourses(updatedCompletedCourses)

    // Store in localStorage as fallback
    localStorage.setItem("completedCourses", JSON.stringify(updatedCompletedCourses))

    // Save to server
    try {
      await saveCoursesData({
        myCourses: myCourseIds,
        completedCourses: updatedCompletedCourses,
      })
    } catch (error) {
      console.error("Failed to save courses data:", error)
      // Show error message
      setAlertMessage("Failed to save changes to server")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading courses...</span>
      </div>
    )
  }

  if (selectedCourse && !selectedCategory) {
    const categories = materialCategories[selectedCourse.id] || []

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="outline" onClick={() => setSelectedCourse(null)} className="mb-2">
              Back to My Courses
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCourse.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Department:{" "}
              {selectedCourse.department === "general"
                ? "General Course"
                : selectedCourse.department
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
            </p>
          </div>
        </div>

        <Tabs defaultValue="materials">
          <TabsList className="mb-4">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="links">Useful Links</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <div className="grid gap-4 md:grid-cols-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {category.icon || <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.files?.length || 0} files</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Files
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="md:col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No material categories yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Add categories to organize your course materials
                  </p>
                  <Button className="mt-4">Add Your First Category</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="links">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
                <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No links yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Add useful links related to this course</p>
                <Button className="mt-4">Add Your First Link</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (selectedCourse && selectedCategory) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setSelectedCategory(null)} className="flex items-center">
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>

        <h2 className="text-xl font-semibold mb-4 dark:text-white">{selectedCategory.title}</h2>
        <p className="text-gray-600 mb-6 dark:text-gray-400">{selectedCategory.description}</p>

        {selectedCategory.files && selectedCategory.files.length > 0 ? (
          <div className="space-y-3">
            {selectedCategory.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">{file.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{file.size}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No files in this category</h3>
            <Button className="mt-4">Add Your First File</Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setHideCompleted(!hideCompleted)}
          >
            {hideCompleted ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
            {hideCompleted ? "Show Completed" : "Hide Completed"}
          </Button>
        </div>
      </div>

      {showAlert && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-400">{alertMessage}</AlertDescription>
        </Alert>
      )}

      {displayedCourses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow relative group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className={completedCourses.includes(course.id) ? "line-through text-gray-500" : ""}>
                    {course.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => toggleCourseCompletion(course.id)}
                    >
                      {completedCourses.includes(course.id) ? (
                        <X className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => removeCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {course.department === "general"
                    ? "General Course"
                    : course.department
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {materialCategories[course.id]?.length || 0} material categories
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => setSelectedCourse(course)}
                  variant={completedCourses.includes(course.id) ? "outline" : "default"}
                >
                  View Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {hideCompleted
              ? "All your courses are marked as completed. Click 'Show Completed' to view them."
              : "Add courses from the Courses section to get started."}
          </p>
        </div>
      )}
    </div>
  )
}

function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium")
  const [sortBy, setSortBy] = useState("deadline") // "deadline", "priority", "added"
  const [sortDirection, setSortDirection] = useState("asc") // "asc" or "desc"
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true)
      try {
        const data = await fetchTasks()
        if (Array.isArray(data)) {
          setTasks(data)
        }
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  const addTask = async () => {
    if (newTask.trim()) {
      // Check if the deadline is in the past
      const deadlineDate = new Date(newTaskDeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (deadlineDate < today) {
        // Show error for overdue task
        toast({
          title: "Invalid Date",
          description: "Cannot add tasks with past dates",
          duration: 3000,
        })
        return
      }

      const newTaskObj = {
        id: Date.now(),
        text: newTask,
        completed: false,
        deadline: newTaskDeadline || format(new Date(), "yyyy-MM-dd"),
        priority: newTaskPriority,
      }

      const updatedTasks = [...tasks, newTaskObj]
      setTasks(updatedTasks)
      setNewTask("")
      setNewTaskDeadline("")
      setNewTaskPriority("medium")

      // Save to server
      try {
        await saveTasks(updatedTasks)
      } catch (error) {
        console.error("Failed to save tasks:", error)
        toast({
          title: "Error",
          description: "Failed to save task to server",
          duration: 3000,
        })
      }
    }
  }

  // Add toast function
  const toast = ({ title, description, duration }) => {
    // Create a toast element
    const toastEl = document.createElement("div")
    toastEl.className = "fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md shadow-md"
    toastEl.innerHTML = `
      <div class="font-medium">${title}</div>
      <div class="text-sm">${description}</div>
    `
    document.body.appendChild(toastEl)

    // Remove after duration
    setTimeout(() => {
      toastEl.remove()
    }, duration)
  }

  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)

    // Save to server
    try {
      await saveTasks(updatedTasks)
    } catch (error) {
      console.error("Failed to save tasks:", error)
      // Revert changes if save fails
      setTasks(tasks)
      toast({
        title: "Error",
        description: "Failed to update task on server",
        duration: 3000,
      })
    }
  }

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)

    // Save to server
    try {
      await saveTasks(updatedTasks)
    } catch (error) {
      console.error("Failed to save tasks:", error)
      // Revert changes if save fails
      setTasks(tasks)
      toast({
        title: "Error",
        description: "Failed to delete task on server",
        duration: 3000,
      })
    }
  }

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "deadline") {
      const dateA = new Date(a.deadline)
      const dateB = new Date(b.deadline)
      return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return sortDirection === "asc"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority]
    } else {
      // Sort by ID (order added)
      return sortDirection === "asc" ? a.id - b.id : b.id - a.id
    }
  })

  // Group tasks by deadline for better organization
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const groupedTasks = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  }

  sortedTasks.forEach((task) => {
    if (task.completed) {
      groupedTasks.completed.push(task)
    } else {
      const taskDate = new Date(task.deadline)
      taskDate.setHours(0, 0, 0, 0)

      if (taskDate < today) {
        groupedTasks.overdue.push(task)
      } else if (taskDate.getTime() === today.getTime()) {
        groupedTasks.today.push(task)
      } else {
        groupedTasks.upcoming.push(task)
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading tasks...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>To-Do List</CardTitle>
              <CardDescription>Manage your tasks and assignments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="added">Date Added</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={toggleSortDirection}>
                {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <Input
              type="date"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className="sm:w-40"
            />
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger className="sm:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Overdue Tasks */}
          {groupedTasks.overdue.length > 0 && (
            <div>
              <h3 className="font-medium text-red-600 mb-2 flex items-center">Overdue</h3>
              <div className="space-y-2 mb-4">
                {groupedTasks.overdue.map((task) => (
                  <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          {groupedTasks.today.length > 0 && (
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Today</h3>
              <div className="space-y-2 mb-4">
                {groupedTasks.today.map((task) => (
                  <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {groupedTasks.upcoming.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Upcoming</h3>
              <div className="space-y-2 mb-4">
                {groupedTasks.upcoming.map((task) => (
                  <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {groupedTasks.completed.length > 0 && (
            <div>
              <h3 className="font-medium text-green-600 mb-2">Completed</h3>
              <div className="space-y-2">
                {groupedTasks.completed.map((task) => (
                  <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && <p className="text-center text-gray-500 py-4">No tasks yet. Add one above!</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function TaskItem({ task, toggleTask, deleteTask }) {
  const priorityColors = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-red-100 text-red-700",
  }

  const deadlineDate = new Date(task.deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOverdue = !task.completed && deadlineDate < today

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md ${task.completed ? "bg-gray-50" : "bg-white border"}`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1">
          <label
            htmlFor={`task-${task.id}`}
            className={`text-sm ${task.completed ? "line-through text-gray-500" : isOverdue ? "text-red-600 font-medium" : "text-gray-900"}`}
          >
            {task.text}
          </label>
          <div className="flex items-center mt-1 sm:mt-0">
            <span className={`text-xs px-2 py-1 rounded-full mr-2 ${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className={`text-xs ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
              {format(new Date(task.deadline), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
        <Trash2 className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  )
}

function MyNotes() {
  const [notes, setNotes] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true)
      try {
        const data = await fetchNotes()
        if (Array.isArray(data)) {
          setNotes(data)
        }
      } catch (error) {
        console.error("Failed to load notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  const startNewNote = async () => {
    const newNote = { id: Date.now(), title: "New Note", content: "" }
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    setActiveNote(newNote)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)

    // Save to server
    try {
      await saveNotes(updatedNotes)
    } catch (error) {
      console.error("Failed to save notes:", error)
    }
  }

  const editNote = (note) => {
    setActiveNote(note)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const saveNote = async () => {
    if (activeNote) {
      const updatedNotes = notes.map((note) =>
        note.id === activeNote.id ? { ...note, title: editTitle, content: editContent } : note,
      )
      setNotes(updatedNotes)
      setActiveNote(null)

      // Save to server
      try {
        await saveNotes(updatedNotes)
      } catch (error) {
        console.error("Failed to save notes:", error)
        // Show error message
        const toastEl = document.createElement("div")
        toastEl.className =
          "fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md shadow-md"
        toastEl.innerHTML = `
          <div class="font-medium">Error</div>
          <div class="text-sm">Failed to save note to server</div>
        `
        document.body.appendChild(toastEl)
        setTimeout(() => toastEl.remove(), 3000)
      }
    }
  }

  const deleteNote = async (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id)
    setNotes(updatedNotes)
    if (activeNote?.id === id) {
      setActiveNote(null)
    }

    // Save to server
    try {
      await saveNotes(updatedNotes)
    } catch (error) {
      console.error("Failed to save notes:", error)
      // Show error message
      const toastEl = document.createElement("div")
      toastEl.className =
        "fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md shadow-md"
      toastEl.innerHTML = `
        <div class="font-medium">Error</div>
        <div class="text-sm">Failed to delete note on server</div>
      `
      document.body.appendChild(toastEl)
      setTimeout(() => toastEl.remove(), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading notes...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <Button onClick={startNewNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                        activeNote?.id === note.id ? "bg-primary/10" : "hover:bg-gray-100"
                      }`}
                      onClick={() => editNote(note)}
                    >
                      <div className="truncate">
                        <h3 className="font-medium text-sm">{note.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{note.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNote(note.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No notes yet. Create one to get started!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {activeNote ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-medium text-lg"
                  placeholder="Note title"
                />
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                  placeholder="Write your note here..."
                />
              </CardContent>
              <CardFooter>
                <Button onClick={saveNote}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Note Selected</h3>
                <p className="text-gray-500 mt-1">Select a note from the list or create a new one</p>
                <Button className="mt-4" onClick={startNewNote}>
                  Create New Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GpaCalculator() {
  const [courses, setCourses] = useState([])
  const [newCourse, setNewCourse] = useState({ name: "", creditHours: 3, grade: "A" })
  const [gpa, setGpa] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const gradePoints = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  }

  // Load GPA data on component mount
  useEffect(() => {
    async function loadGpaData() {
      setIsLoading(true)
      try {
        const data = await fetchGpaData()
        if (data && data.courses) {
          setCourses(data.courses)
        }
      } catch (error) {
        console.error("Failed to load GPA data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGpaData()
  }, [])

  // Calculate GPA whenever courses change
  useEffect(() => {
    if (courses.length === 0) {
      setGpa(0)
      return
    }

    let totalPoints = 0
    let totalCreditHours = 0

    courses.forEach((course) => {
      const points = gradePoints[course.grade] * course.creditHours
      totalPoints += points
      totalCreditHours += course.creditHours
    })

    const calculatedGpa = totalCreditHours > 0 ? (totalPoints / totalCreditHours).toFixed(2) : 0
    setGpa(calculatedGpa)

    // Save GPA data to server (but not during initial load)
    if (!isLoading && courses.length > 0) {
      saveGpaData({ courses, gpa: calculatedGpa })
        .then(() => {
          console.log("GPA data saved successfully")
        })
        .catch((error) => {
          console.error("Failed to save GPA data:", error)
        })
    }
  }, [courses, isLoading])

  const addCourse = () => {
    if (!newCourse.name.trim()) return

    const updatedCourses = [...courses, { ...newCourse, id: Date.now() }]
    setCourses(updatedCourses)
    setNewCourse({ name: "", creditHours: 3, grade: "A" })

    // Show success message
    setAlertMessage("Course added successfully")
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const deleteCourse = (id) => {
    const updatedCourses = courses.filter((course) => course.id !== id)
    setCourses(updatedCourses)

    // Show success message
    setAlertMessage("Course removed successfully")
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCourse({
      ...newCourse,
      [name]: value,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading GPA data...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">GPA Calculator</h1>
      </div>

      {showAlert && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-400">{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course List</CardTitle>
              <CardDescription>Add your courses and grades to calculate GPA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    name="name"
                    value={newCourse.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics 101"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="creditHours">Credit Hours</Label>
                  <Select
                    name="creditHours"
                    value={newCourse.creditHours.toString()}
                    onValueChange={(value) => setNewCourse({ ...newCourse, creditHours: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Credits" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="grade">Grade</Label>
                  <Select
                    name="grade"
                    value={newCourse.grade}
                    onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(gradePoints).map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex items-end">
                  <Button onClick={addCourse} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {courses.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{course.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                            {course.creditHours}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                            {course.grade}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                            {gradePoints[course.grade] * course.creditHours}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" onClick={() => deleteCourse(course.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed">
                  <p className="text-gray-500">No courses added yet. Add your first course above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>GPA Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-primary mb-2">{gpa}</div>
                <p className="text-gray-500">Cumulative GPA</p>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Courses:</span>
                    <span className="font-medium">{courses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Credit Hours:</span>
                    <span className="font-medium">{courses.reduce((sum, course) => sum + course.creditHours, 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Download Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
