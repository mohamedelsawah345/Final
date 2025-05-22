import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Eng Hub - Engineering Learning Platform",
  description: "A platform for engineering students and professionals",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="eng-hub-theme"
        >
          <AuthProvider>
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
