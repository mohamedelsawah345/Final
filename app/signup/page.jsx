"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AlertCircle, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/context/auth-context"

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    department: "",
    firstName: "",
    lastName: "",
  })

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasCapital: false,
    hasSmall: false,
    hasNumber: false,
    hasSpecial: false,
    isMinLength: false,
    matchesConfirm: false,
  })

  // Email validation state
  const [isValidEmail, setIsValidEmail] = useState(true)

  // Password strength label and color
  const getStrengthLabel = (score) => {
    if (score === 0) return { label: "", color: "bg-gray-200" }
    if (score === 1) return { label: "Weak", color: "bg-red-500" }
    if (score === 2) return { label: "Normal", color: "bg-yellow-500" }
    if (score === 3) return { label: "Strong", color: "bg-blue-500" }
    return { label: "Very Strong", color: "bg-green-500" }
  }

  // Validate email format
  const validateEmail = (email) => {
    if (!email) return true // Don't show error for empty field
    const emailRegex = /^UG.*@f-eng\.tanta\.edu\.eg$/
    return emailRegex.test(email)
  }

  const strengthInfo = getStrengthLabel(passwordStrength.score)

  // Check password strength whenever password changes
  useEffect(() => {
    const checkPasswordStrength = () => {
      const { password } = formData
      const { confirmPassword } = formData

      // Check criteria
      const hasCapital = /[A-Z]/.test(password)
      const hasSmall = /[a-z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecial = /[^A-Za-z0-9]/.test(password)
      const isMinLength = password.length >= 8
      const matchesConfirm = password === confirmPassword && password !== ""

      // Calculate score (how many criteria are met)
      let criteriaCount = 0
      if (hasCapital) criteriaCount++
      if (hasSmall) criteriaCount++
      if (hasNumber) criteriaCount++
      if (hasSpecial) criteriaCount++

      setPasswordStrength({
        score: criteriaCount,
        hasCapital,
        hasSmall,
        hasNumber,
        hasSpecial,
        isMinLength,
        matchesConfirm,
      })
    }

    checkPasswordStrength()
  }, [formData]) // Updated to use formData as a dependency

  // Check email format whenever email changes
  useEffect(() => {
    setIsValidEmail(validateEmail(formData.email))
  }, [formData.email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value) => {
    setFormData((prev) => ({ ...prev, department: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate email
    if (!validateEmail(formData.email)) {
      setError("Email must start with 'UG' and end with '@f-eng.tanta.edu.eg'")
      return
    }

    // Validate password
    if (!passwordStrength.isMinLength) {
      setError("Password must be at least 8 characters long")
      return
    }

    // Validate passwords match
    if (!passwordStrength.matchesConfirm) {
      setError("Passwords do not match")
      return
    }

    try {
      const result = await signup(formData)

      if (result.success) {
        router.push("/dashboard")
      } else {
        // Display the specific error message from the server
        // This will show "Email already registered" or "Username already taken" messages
        setError(result.error || "Failed to create account. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold text-primary">Eng Hub</h1>
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="UGxxxxxxxx@f-eng.tanta.edu.eg"
                  className={formData.email && !isValidEmail ? "border-red-500" : ""}
                />
                {formData.email && !isValidEmail && (
                  <p className="text-sm text-red-500 mt-1">
                    Email must start with "UG" and end with "@f-eng.tanta.edu.eg"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={formData.password && !passwordStrength.isMinLength ? "border-red-500" : ""}
                />

                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Password strength:</span>
                      <span
                        className={`text-sm font-medium ${
                          passwordStrength.score === 1
                            ? "text-red-500"
                            : passwordStrength.score === 2
                              ? "text-yellow-500"
                              : passwordStrength.score === 3
                                ? "text-blue-500"
                                : passwordStrength.score === 4
                                  ? "text-green-500"
                                  : ""
                        }`}
                      >
                        {strengthInfo.label}
                      </span>
                    </div>
                    <Progress value={passwordStrength.score * 25} className={strengthInfo.color} />

                    <ul className="space-y-1 text-sm mt-2">
                      <li className="flex items-center gap-2">
                        {passwordStrength.isMinLength ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordStrength.isMinLength ? "text-green-700" : "text-red-700"}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        {passwordStrength.hasCapital ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordStrength.hasCapital ? "text-green-700" : "text-red-700"}>
                          Contains uppercase letters
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        {passwordStrength.hasSmall ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordStrength.hasSmall ? "text-green-700" : "text-red-700"}>
                          Contains lowercase letters
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        {passwordStrength.hasNumber ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordStrength.hasNumber ? "text-green-700" : "text-red-700"}>
                          Contains numbers
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        {passwordStrength.hasSpecial ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordStrength.hasSpecial ? "text-green-700" : "text-red-700"}>
                          Contains special characters
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={formData.confirmPassword && !passwordStrength.matchesConfirm ? "border-red-500" : ""}
                />
                {formData.confirmPassword && !passwordStrength.matchesConfirm && (
                  <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && passwordStrength.matchesConfirm && (
                  <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Passwords match
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={handleDepartmentChange} value={formData.department}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-engineering">Computer Engineering and Automatic Control</SelectItem>
                    <SelectItem value="electrical-power">Electrical Power Engineering</SelectItem>
                    <SelectItem value="electronics-communications">
                      Electronics and Electrical Communications Engineering
                    </SelectItem>
                    <SelectItem value="mechanical-power">Mechanical Power Engineering</SelectItem>
                    <SelectItem value="production">Production Engineering</SelectItem>
                    <SelectItem value="architectural">Architectural Engineering</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                    <SelectItem value="physics-mathematics">Physics and Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  !passwordStrength.isMinLength ||
                  !passwordStrength.matchesConfirm ||
                  (formData.email && !isValidEmail)
                }
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="font-medium text-primary hover:text-primary/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-primary hover:text-primary/80">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
