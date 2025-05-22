"use client"

import { useState } from "react"
import Header from "@/components/dashboard/header"
import CoursesSidebar from "@/components/dashboard/courses-sidebar"
import CoursesMain from "@/components/dashboard/courses-main"
import MeSidebar from "@/components/dashboard/me-sidebar"
import MeMain from "@/components/dashboard/me-main"
import AccountSection from "@/components/dashboard/account-section"
import SettingsSection from "@/components/dashboard/settings-section"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("courses")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedMeItem, setSelectedMeItem] = useState("my-courses")

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex flex-1 overflow-hidden">
        {/* Conditional sidebar based on active section */}
        {activeSection === "courses" && (
          <CoursesSidebar selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
        )}

        {activeSection === "me" && <MeSidebar selectedItem={selectedMeItem} setSelectedItem={setSelectedMeItem} />}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "courses" && <CoursesMain selectedCourse={selectedCourse} />}

          {activeSection === "me" && <MeMain selectedItem={selectedMeItem} />}

          {activeSection === "account" && <AccountSection />}

          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  )
}
