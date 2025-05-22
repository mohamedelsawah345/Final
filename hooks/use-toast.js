"use client"

// Simplified toast hook for the demo
export function useToast() {
  return {
    toast: ({ title, description, duration }) => {
      console.log(`Toast: ${title} - ${description}`)
      // In a real app, this would show a toast notification
    },
  }
}
