"use client"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BookOpen, User, UserCircle, Settings } from "lucide-react"

export default function Header({ activeSection, setActiveSection }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Website%20logo-2Ku3rMkYclPbOLLIgjyx15gQQ5PGrx.png"
              alt="Eng Hub Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex space-x-4 sm:space-x-8">
            <NavItem
              icon={<BookOpen className="h-5 w-5" />}
              label="Courses"
              isActive={activeSection === "courses"}
              onClick={() => setActiveSection("courses")}
            />
            <NavItem
              icon={<User className="h-5 w-5" />}
              label="Me"
              isActive={activeSection === "me"}
              onClick={() => setActiveSection("me")}
            />
            <NavItem
              icon={<UserCircle className="h-5 w-5" />}
              label="Account"
              isActive={activeSection === "account"}
              onClick={() => setActiveSection("account")}
            />
            <NavItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isActive={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
            />
          </nav>
        </div>
      </div>
    </header>
  )
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive ? "text-primary bg-primary/10" : "text-gray-600 hover:text-primary hover:bg-gray-100",
      )}
    >
      {icon}
      <span className="ml-2 hidden sm:inline">{label}</span>
    </button>
  )
}
