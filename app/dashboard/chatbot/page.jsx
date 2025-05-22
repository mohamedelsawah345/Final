"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, RefreshCw, X, Moon, Sun, Save, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Add CSS for typing indicator
const typingIndicatorStyles = `
.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 1px;
  background-color: #888;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.4;
}

.typing-indicator span:nth-child(1) {
  animation: bounce 1s infinite 0.1s;
}
.typing-indicator span:nth-child(2) {
  animation: bounce 1s infinite 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation: bounce 1s infinite 0.3s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
`

export default function ChatbotPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState("unknown") // Changed from "checking" to "unknown"
  const [useProxy, setUseProxy] = useState(true) // Set to true by default to use proxy
  const [streamResponse, setStreamResponse] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.")
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { theme, setTheme } = useTheme()

  // API endpoint - using the exact URL provided by the user
  const API_URL = "https://ed84-41-65-227-203.ngrok-free.app/ask"

  // Load messages from localStorage on initial load
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(messagesWithDates)
      } catch (e) {
        console.error("Failed to parse saved messages:", e)
      }
    }

    // Load settings
    const savedSystemPrompt = localStorage.getItem("systemPrompt")
    if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt)

    const savedUseProxy = localStorage.getItem("useProxy")
    if (savedUseProxy !== null) setUseProxy(savedUseProxy === "true")

    const savedStreamResponse = localStorage.getItem("streamResponse")
    if (savedStreamResponse !== null) setStreamResponse(savedStreamResponse === "true")

    // Add a welcome message if no messages exist
    if (!savedMessages) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }
  }, [messages])

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("systemPrompt", systemPrompt)
  }, [systemPrompt])

  useEffect(() => {
    localStorage.setItem("useProxy", String(useProxy))
  }, [useProxy])

  useEffect(() => {
    localStorage.setItem("streamResponse", String(streamResponse))
  }, [streamResponse])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Add typing indicator styles
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = typingIndicatorStyles
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const checkApiConnection = async () => {
    setApiStatus("checking")
    setError(null)

    try {
      // Determine endpoint based on proxy setting
      const endpoint = useProxy ? "/api/proxy" : API_URL

      console.log("Testing connection to:", endpoint)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      // Use a real question instead of just "ping"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "Hello, can you respond with a short greeting?",
          system_prompt: "You are a test assistant. Keep responses under 10 words.",
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      console.log("Connection test response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Connection test response data:", data)

        if (data && (data.answer || data.response)) {
          setApiStatus("connected")
          setError(null)
          return true
        } else {
          setApiStatus("error")
          setError("API responded but with unexpected format")
          return false
        }
      } else {
        setApiStatus("error")
        setError(`API returned error status: ${response.status}`)
        return false
      }
    } catch (err) {
      console.error("API connection error:", err)
      setApiStatus("error")

      if (err.name === "AbortError") {
        setError("Connection timed out. The API might be temporarily unavailable.")
      } else {
        setError("Could not connect to the chatbot API. Try enabling the proxy option in settings.")
      }
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Clear any previous errors
    setError(null)

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Store the question and clear input
    const userQuestion = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      // Determine endpoint based on proxy setting
      const endpoint = useProxy ? "/api/proxy" : API_URL

      console.log("Sending request to:", endpoint)

      // Send request to the chatbot API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          system_prompt: systemPrompt,
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      // Add assistant message to chat
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.answer || data.response || "I processed your request, but I'm not sure how to respond.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setApiStatus("connected")
    } catch (error) {
      console.error("Error:", error)

      // If this is the first error and we're not using proxy, suggest using proxy
      if (apiStatus !== "error" && !useProxy) {
        setError("Connection failed. Try enabling the proxy option in settings.")
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(`Failed to get response: ${errorMessage}`)
      }

      setApiStatus("error")
    } finally {
      setIsLoading(false)
      // Focus back on input after response
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared. How can I help you today?",
        timestamp: new Date(),
      },
    ])
    setError(null)
    inputRef.current?.focus()
  }

  const saveChat = () => {
    const chatData = JSON.stringify(messages, null, 2)
    const blob = new Blob([chatData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadChat = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result
        const parsedMessages = JSON.parse(content)
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(messagesWithDates)
      } catch (error) {
        setError("Failed to parse chat file")
      }
    }
    reader.readAsText(file)
    // Reset the input so the same file can be loaded again
    event.target.value = ""
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Assistant</h1>

      <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">AI Chatbot</CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={checkApiConnection}
                      disabled={apiStatus === "checking"}
                    >
                      <RefreshCw className={`h-4 w-4 ${apiStatus === "checking" ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check API connection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={clearChat}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={saveChat} disabled={messages.length === 0}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label htmlFor="load-chat" className="cursor-pointer">
                      <Button variant="ghost" size="icon" type="button" tabIndex={-1}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <input id="load-chat" type="file" accept=".json" className="hidden" onChange={loadChat} />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Load chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div
                className={`h-2 w-2 rounded-full ${
                  apiStatus === "connected"
                    ? "bg-green-500"
                    : apiStatus === "error"
                      ? "bg-red-500"
                      : apiStatus === "checking"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                }`}
              />
            </div>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="max-w-sm space-y-2">
                    <h3 className="text-lg font-medium">Welcome to the Chatbot</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask me anything and I'll try to help you. This chatbot is connected to an external API.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-start gap-2 max-w-[80%] group">
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                          <span className="text-xs">AI</span>
                        </Avatar>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="mt-1 text-xs opacity-50 text-right">{formatTime(message.timestamp)}</div>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 bg-gray-300">
                          <span className="text-xs">You</span>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <span className="text-xs">AI</span>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted flex items-center">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="ml-2 sr-only sm:not-sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">System Prompt</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This prompt helps set the behavior of the AI assistant.
                </p>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connection Settings</h3>

                <div className="flex items-center space-x-2">
                  <Switch id="use-proxy" checked={useProxy} onCheckedChange={setUseProxy} />
                  <Label htmlFor="use-proxy">Use API Proxy</Label>
                  <p className="text-sm text-muted-foreground ml-2">(Recommended to avoid CORS issues)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="stream-response"
                    checked={streamResponse}
                    onCheckedChange={setStreamResponse}
                    disabled={true}
                  />
                  <Label htmlFor="stream-response">Stream Responses</Label>
                  <p className="text-sm text-muted-foreground ml-2">(Coming soon - API must support streaming)</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">API Information</h3>
                <p className="text-sm mb-1">
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      apiStatus === "connected"
                        ? "text-green-500"
                        : apiStatus === "error"
                          ? "text-red-500"
                          : apiStatus === "checking"
                            ? "text-yellow-500"
                            : "text-gray-500"
                    }
                  >
                    {apiStatus === "connected"
                      ? "Connected"
                      : apiStatus === "error"
                        ? "Error"
                        : apiStatus === "checking"
                          ? "Checking"
                          : "Unknown"}
                  </span>
                </p>
                <p className="text-sm mb-1">
                  <strong>Endpoint:</strong> {useProxy ? "/api/proxy" : API_URL}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkApiConnection}
                  disabled={apiStatus === "checking"}
                  className="mt-2"
                >
                  {apiStatus === "checking" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Connection
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
