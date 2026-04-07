import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/sessions", "/admin"]

// Routes only accessible when NOT authenticated (two-factor is the exception:
// it needs userId in searchParams and is visited before the session exists)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/two-factor"]

// Routes only accessible by ADMIN
const adminRoutes = ["/admin"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth()

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Unauthenticated user trying to access a protected route → redirect to login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access auth pages → redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Non-admin trying to access admin routes → redirect to dashboard
  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
