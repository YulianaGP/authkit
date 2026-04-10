import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Discord({ allowDangerousEmailAccountLinking: true }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        // Block unverified emails from logging in with credentials
        if (!user.emailVerified) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const dbUser = user as unknown as { role: string; twoFactorEnabled: boolean }
        token.role = dbUser.role
        token.twoFactorEnabled = dbUser.twoFactorEnabled ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id ?? token.sub) as string
        session.user.role = token.role as import("@prisma/client").Role
        session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false
      }
      return session
    },
  },

  events: {
    async signIn({ user, account }) {
      // Only log OAuth logins here — credentials login is logged in the action
      if (!user.id || account?.type === "credentials") return
      try {
        const headersList = await headers()
        await createAuditLog({
          userId: user.id,
          action: "LOGIN",
          headers: headersList,
        })
      } catch {
        // Never let audit logging break the auth flow
      }
    },
  },
})
