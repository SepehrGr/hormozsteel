import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const MAX_FAILED_ATTEMPTS = 5

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('INVALID_CREDENTIALS')
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user) {
            throw new Error('USER_NOT_FOUND')
          }

          if (!user.isActive) {
            throw new Error('USER_INACTIVE')
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingMs = user.lockedUntil.getTime() - Date.now()
            const remainingMinutes = Math.ceil(remainingMs / (60 * 1000))
            // Encode minutes in error message (NextAuth will pass this through)
            throw new Error(`AccountLocked:${remainingMinutes}`)
          }

          // If lockout period has passed, reset the lockout and get fresh user data
          let currentFailedAttempts = user.failedLoginAttempts || 0
          if (user.lockedUntil && user.lockedUntil <= new Date()) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                lockedUntil: null,
                failedLoginAttempts: 0,
              },
            })
            // Reset counter after unlocking
            currentFailedAttempts = 0
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          )

          if (!isPasswordValid) {
            // Increment failed login attempts using the current (possibly reset) value
            const newFailedAttempts = currentFailedAttempts + 1
            const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newFailedAttempts,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + LOCKOUT_DURATION_MS)
                  : user.lockedUntil,
              },
            })

            throw new Error('WRONG_PASSWORD')
          }

          // Password is valid - reset failed attempts and update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date(),
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            lastLogin: user.lastLogin,
          }
        } catch (error: any) {
          // Re-throw our custom errors
          if (error.message?.startsWith('AccountLocked:')) {
            throw error
          }
          if (
            error.message === 'INVALID_CREDENTIALS' ||
            error.message === 'USER_NOT_FOUND' ||
            error.message === 'USER_INACTIVE' ||
            error.message === 'WRONG_PASSWORD'
          ) {
            throw error
          }
          console.error('Auth error:', error)
          throw new Error('INVALID_CREDENTIALS')
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 6 * 60 * 60, // 6 hours
  },
  jwt: {
    maxAge: 6 * 60 * 60, // 6 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as 'ADMIN' | 'SUPER_ADMIN'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Only allow redirects to the same origin
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
