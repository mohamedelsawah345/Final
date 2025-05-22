"use client"

import { cn } from "@/lib/utils"
import { BookOpen, CheckSquare, FileText, Calculator, Calendar, MessageSquare } from "lucide-react"

export default function MeSidebar({ selectedItem, setSelectedItem }) {
  const menuItems = [
    { id: "my-courses", label: "My Courses", icon: <BookOpen className="h-5 w-5" /> },
    { id: "my-tasks", label: "My Tasks", icon: <CheckSquare className="h-5 w-5" /> },
    { id: "my-notes", label: "My Notes", icon: <FileText className="h-5 w-5" /> },
    { id: "gpa-calculator", label: "GPA Calculator", icon: <Calculator className="h-5 w-5" /> },
    { id: "my-schedule", label: "My Schedule", icon: <Calendar className="h-5 w-5" /> },
    { id: "chatbot", label: "AI Assistant", icon: <MessageSquare className="h-5 w-5" /> },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Me</h2>

        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm rounded-md",
                  selectedItem === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => setSelectedItem(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
