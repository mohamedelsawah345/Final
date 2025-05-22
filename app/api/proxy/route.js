import { NextResponse } from "next/server"

// The target API URL
const API_URL = "https://ed84-41-65-227-203.ngrok-free.app/ask"

export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json()

    console.log("Proxy received request:", body)

    // Forward the request to the target API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Proxy received response status:", response.status)

    // If the response is not OK, throw an error
    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`)
      return NextResponse.json({ error: `API returned status ${response.status}` }, { status: response.status })
    }

    // Get the response data
    const data = await response.json()
    console.log("Proxy received response data:", data)

    // Return the response data
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)

    // Return an error response
    return NextResponse.json({ error: "Failed to proxy request to API", details: error.message }, { status: 500 })
  }
}
