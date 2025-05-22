import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request) {
  try {
    const { messages } = await request.json()

    // Extract the last user message
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    // Format conversation history for the AI
    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"), // You can change to a different model if needed
      prompt: conversationHistory,
      system:
        "You are a helpful AI assistant for engineering students. Provide clear, concise, and accurate information about engineering topics, study strategies, and academic advice. Keep responses friendly and educational.",
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process your request" }, { status: 500 })
  }
}
