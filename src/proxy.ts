import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/profile", "/sessions", "/admin", "/onboarding"]
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/two-factor"]
const adminRoutes = ["/admin"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Unauthenticated → login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated on auth pages → dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Non-admin on admin routes → dashboard
  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Onboarding check — skip if already on /onboarding
  if (session?.user?.id && isProtected && !pathname.startsWith("/onboarding")) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingDone: true },
    })
    if (user && !user.onboardingDone) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)" ],
}
