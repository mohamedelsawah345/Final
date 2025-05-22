"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState, useRef, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  FileText,
  LinkIcon,
  Video,
  Download,
  Plus,
  ArrowLeft,
  Upload,
  Trash2,
  MoreVertical,
  Edit,
  Check,
  File,
  ExternalLink,
  Eye,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CoursesMain = ({ selectedCourse }) => {
  const [courses, setCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [materialCategories, setMaterialCategories] = useState({})
  const [links, setLinks] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // For links
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newLinkDescription, setNewLinkDescription] = useState("")
  const [isAddingLink, setIsAddingLink] = useState(false)

  // Refs for dialogs
  const addCategoryDialogRef = useRef(null)
  const addLinkDialogRef = useRef(null)

  // Add state for dialog control
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  useEffect(() => {
    // Mock course data (replace with actual API call)
    const mockCourses = [
      {
        id: "cs101",
        title: "Introduction to Computer Science",
        description: "Learn the basics of computer science and programming.",
        instructor: "Dr. Smith",
        type: "general", // "general" for all departments, "specialized" for specific departments
        departments: [], // Empty for general courses, or list of department codes for specialized courses
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "math201",
        title: "Calculus II",
        description: "Advanced calculus concepts.",
        instructor: "Prof. Johnson",
        type: "specialized",
        departments: ["math"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "eng101",
        title: "Freshman English",
        description: "Introduction to college-level writing and rhetoric.",
        instructor: "Dr. Brown",
        type: "specialized",
        departments: ["english"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "phy101",
        title: "Introduction to Physics",
        description: "Learn the basics of physics.",
        instructor: "Dr. Lee",
        type: "specialized",
        departments: ["physics"],
        image: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "chem101",
        title: "Introduction to Chemistry",
        description: "Learn the basics of chemistry.",
        instructor: "Dr. Wilson",
        type: "specialized",
        departments: ["chemistry"],
        image: "/placeholder.svg?height=100&width=200",
      },
    ]

    setCourses(mockCourses)

    // Mock enrolled courses (replace with actual API call)
    const mockEnrolledCourses = []
    setEnrolledCourses(mockEnrolledCourses)
  }, [])

  // Load materials and links from localStorage when course changes
  useEffect(() => {
    if (selectedCourse) {
      const storedMaterials = localStorage.getItem(`materials-${selectedCourse.id}`)
      if (storedMaterials) {
        setMaterialCategories(JSON.parse(storedMaterials))
      } else {
        setMaterialCategories({})
      }

      const storedLinks = localStorage.getItem(`links-${selectedCourse.id}`)
      if (storedLinks) {
        setLinks(JSON.parse(storedLinks))
      } else {
        setLinks({})
      }
    }
  }, [selectedCourse])

  // Save materials to localStorage when they change
  useEffect(() => {
    if (selectedCourse && Object.keys(materialCategories).length > 0) {
      localStorage.setItem(`materials-${selectedCourse.id}`, JSON.stringify(materialCategories))
    }
  }, [materialCategories, selectedCourse])

  // Save links to localStorage when they change
  useEffect(() => {
    if (selectedCourse && Object.keys(links).length > 0) {
      localStorage.setItem(`links-${selectedCourse.id}`, JSON.stringify(links))
    }
  }, [links, selectedCourse])

  const handleEnrollCourse = (course) => {
    // Mock enrollment logic (replace with actual API call)
    setEnrolledCourses([...enrolledCourses, course])
    toast({
      title: "Enrollment Successful",
      description: `You have successfully enrolled in ${course.title}.`,
    })
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory = {
      id: `category-${Date.now()}`,
      title: newCategoryName,
      description: newCategoryDescription || "No description provided",
      icon: <FileText className="h-5 w-5" />,
      files: [],
    }

    setMaterialCategories((prev) => ({
      ...prev,
      [newCategory.id]: newCategory,
    }))

    setNewCategoryName("")
    setNewCategoryDescription("")

    // Close the dialog
    setIsAddingCategory(false)

    setSuccessMessage("Category added successfully!")
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const handleDeleteCategory = (categoryId) => {
    setMaterialCategories((prev) => {
      const newCategories = { ...prev }
      delete newCategories[categoryId]
      return newCategories
    })

    setSuccessMessage("Category deleted successfully!")
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFile(file)
      setNewFileName(file.name)

      // For text files, read the content as text for better preview
      if (file.type.startsWith("text/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          file.textContent = event.target.result
        }
        reader.readAsText(file)
      }
    }
  }

  const handleAddFile = () => {
    if (!newFileName.trim() || !selectedCategory || !uploadedFile) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const fileData = event.target.result

      const newFile = {
        id: `file-${Date.now()}`,
        name: newFileName,
        size: formatFileSize(uploadedFile.size),
        type: uploadedFile.type,
        data: fileData,
        uploadedAt: new Date().toISOString(),
      }

      setMaterialCategories((prev) => {
        const updatedCategory = { ...prev[selectedCategory.id] }
        updatedCategory.files = [...updatedCategory.files, newFile]

        return {
          ...prev,
          [selectedCategory.id]: updatedCategory,
        }
      })

      setNewFileName("")
      setUploadedFile(null)
      setIsAddingFile(false)
      setSuccessMessage("File added successfully!")
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 3000)
    }

    reader.readAsDataURL(uploadedFile)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeleteFile = (fileId) => {
    setMaterialCategories((prev) => {
      const updatedCategory = { ...prev[selectedCategory.id] }
      updatedCategory.files = updatedCategory.files.filter((file) => file.id !== fileId)

      return {
        ...prev,
        [selectedCategory.id]: updatedCategory,
      }
    })

    setSuccessMessage("File deleted successfully!")
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return

    const newLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl.startsWith("http") ? newLinkUrl : `https://${newLinkUrl}`,
      description: newLinkDescription || "No description provided",
    }

    setLinks((prev) => ({
      ...prev,
      [newLink.id]: newLink,
    }))

    setNewLinkTitle("")
    setNewLinkUrl("")
    setNewLinkDescription("")

    // Close the dialog
    setIsAddingLink(false)

    setSuccessMessage("Link added successfully!")
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const handleDeleteLink = (linkId) => {
    setLinks((prev) => {
      const newLinks = { ...prev }
      delete newLinks[linkId]
      return newLinks
    })

    setSuccessMessage("Link deleted successfully!")
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  const viewFile = (file) => {
    // Open file in a new tab
    const newWindow = window.open("", "_blank")
    if (!newWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to view files",
        duration: 3000,
      })
      return
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>${file.name}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .container { max-width: 1000px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .content { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            img { max-width: 100%; height: auto; }
            .error-message { padding: 20px; text-align: center; color: #e53e3e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${file.name}</h1>
              <button onclick="window.close()">Close</button>
            </div>
            <div class="content">
    `)

    try {
      // Handle different file types
      if (file.type.startsWith("image/")) {
        newWindow.document.write(`<img src="${file.data}" alt="${file.name}" />`)
      } else if (file.type === "application/pdf") {
        newWindow.document.write(`
          <embed src="${file.data}" type="application/pdf" width="100%" height="800px" />
        `)
      } else if (file.type.startsWith("text/")) {
        // For text files, create a simple viewer
        newWindow.document.write(`
          <pre style="padding: 20px; white-space: pre-wrap; word-wrap: break-word;">${
            file.textContent || "Text content not available"
          }</pre>
        `)
      } else if (file.type.startsWith("video/")) {
        newWindow.document.write(`
          <video controls style="width: 100%; max-height: 80vh;">
            <source src="${file.data}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
        `)
      } else if (file.type.startsWith("audio/")) {
        newWindow.document.write(`
          <audio controls style="width: 100%;">
            <source src="${file.data}" type="${file.type}">
            Your browser does not support the audio tag.
          </audio>
        `)
      } else {
        // For other file types, provide a download link
        newWindow.document.write(`
          <div style="padding: 20px; text-align: center;">
            <p>This file type (${file.type}) cannot be previewed directly.</p>
            <a href="${file.data}" download="${file.name}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">Download File</a>
          </div>
        `)
      }
    } catch (error) {
      console.error("Error displaying file:", error)
      newWindow.document.write(`
        <div class="error-message">
          <p>Error displaying file: ${error.message}</p>
          <p>Please try downloading the file instead.</p>
          <a href="${file.data}" download="${file.name}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">Download File</a>
        </div>
      `)
    }

    newWindow.document.write(`
            </div>
          </div>
        </body>
      </html>
    `)

    newWindow.document.close()
  }

  const downloadFile = (file) => {
    const link = document.createElement("a")
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <img className="h-5 w-5" />
    if (fileType === "application/pdf") return <FileText className="h-5 w-5" />
    if (fileType.startsWith("video/")) return <Video className="h-5 w-5" />
    if (fileType.startsWith("text/")) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  // Check if the course is relevant to the user's department
  const isCourseRelevantToUser = () => {
    if (!user || !user.department || !selectedCourse) return true

    // General courses are relevant to all departments
    if (selectedCourse.department === "general") return true

    // If the course is from the user's department, it's relevant
    if (selectedCourse.department === user.department) return true

    // For courses that are relevant to multiple departments
    if (selectedCourse.relevantDepartments && Array.isArray(selectedCourse.relevantDepartments)) {
      return selectedCourse.relevantDepartments.includes(user.department)
    }

    return false
  }

  // Filter courses based on user's department
  const filterCoursesByDepartment = (courses) => {
    if (!user || !user.department) return courses

    return courses.filter((course) => {
      // If the course is general (for all departments), include it
      if (course.type === "general") return true

      // If the course is specialized, check if it matches the user's department
      if (course.type === "specialized") {
        return course.departments.includes(user.department)
      }

      return false
    })
  }

  if (!selectedCourse) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Course</h2>
          <p className="text-gray-600 dark:text-gray-400">Choose a course from the sidebar to view its content</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCourse.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">Instructor: {selectedCourse.instructor}</p>

        {!isCourseRelevantToUser() && (
          <Alert className="mt-2 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              This course is not specifically designed for your department, but you can still access it.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-2 flex items-center">
          <Checkbox id="completed" className="mr-2" />
          <Label htmlFor="completed">Mark course as completed</Label>
        </div>
      </div>

      {showSuccessAlert && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-400">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="materials">
        <TabsList className="mb-4">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="links">Useful Links</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          {selectedCategory ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={() => setSelectedCategory(null)} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
                <Button onClick={() => setIsAddingFile(true)} className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Add File
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
                        <div className="bg-primary/10 p-2 rounded-full mr-3">{getFileIcon(file.type)}</div>
                        <div>
                          <h3 className="font-medium dark:text-white">{file.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => viewFile(file)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No files yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Add files to this category to get started</p>
                  <Button className="mt-4" onClick={() => setIsAddingFile(true)}>
                    Add Your First File
                  </Button>
                </div>
              )}

              {/* Add File Dialog */}
              <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New File</DialogTitle>
                    <DialogDescription>Upload a file to {selectedCategory.title}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fileName">File Name</Label>
                      <Input
                        id="fileName"
                        placeholder="Enter file name with extension (e.g., lecture.pdf)"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fileUpload">Upload File</Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center dark:border-gray-600 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {uploadedFile ? uploadedFile.name : "Drag and drop your file here, or click to select a file"}
                        </p>
                        {uploadedFile && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatFileSize(uploadedFile.size)}
                          </p>
                        )}
                        <input
                          ref={fileInputRef}
                          id="fileUpload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                        >
                          Select File
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingFile(false)
                        setNewFileName("")
                        setUploadedFile(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddFile} disabled={!uploadedFile}>
                      Add File
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold dark:text-white">Material Categories</h2>
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center" onClick={() => setIsAddingCategory(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Create a new material category for this course</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          placeholder="e.g., Practical Problems"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryDescription">Description (Optional)</Label>
                        <Input
                          id="categoryDescription"
                          placeholder="Brief description of this category"
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory}>Add Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.values(materialCategories).length > 0 ? (
                  Object.values(materialCategories).map((category) => (
                    <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow relative group">
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>

                        {/* Category Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category.files ? category.files.length : 0} files
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedCategory(category)}>
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
                      Create categories to organize your course materials
                    </p>
                    <Button className="mt-4" onClick={() => setIsAddingCategory(true)}>
                      Add Your First Category
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="links">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Useful Links</h2>
            <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
              <DialogTrigger asChild>
                <Button className="flex items-center" onClick={() => setIsAddingLink(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Link</DialogTitle>
                  <DialogDescription>Add a useful link for this course</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkTitle">Link Title</Label>
                    <Input
                      id="linkTitle"
                      placeholder="e.g., Course Website"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">URL</Label>
                    <Input
                      id="linkUrl"
                      placeholder="e.g., https://example.com"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkDescription">Description (Optional)</Label>
                    <Input
                      id="linkDescription"
                      placeholder="Brief description of this link"
                      value={newLinkDescription}
                      onChange={(e) => setNewLinkDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLink}>Add Link</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(links).length > 0 ? (
              Object.values(links).map((link) => (
                <Card key={link.id} className="relative group">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </div>

                    {/* Link Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Link
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="md:col-span-2 text-center py-12 bg-gray-50 rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
                <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No links yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Add useful links related to this course</p>
                <Button className="mt-4" onClick={() => setIsAddingLink(true)}>
                  Add Your First Link
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CoursesMain
