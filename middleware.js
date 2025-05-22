import { NextResponse } from "next/server"

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Get session cookie
  const sessionCookie = request.cookies.get("session_id")?.value

  // Check if user is authenticated
  const isAuthenticated = !!sessionCookie

  // Define protected routes
  const protectedRoutes = ["/dashboard"]

  // Define authentication routes
  const authRoutes = ["/login", "/signup", "/forgot-password"]

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Redirect unauthenticated users trying to access protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect authenticated users trying to access auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
