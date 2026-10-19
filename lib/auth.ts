import type { User } from '@prisma/client'

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const MAX_FAILED_ATTEMPTS = 5

/** Cost 12, as the old API used; each hash stores its own cost, so login checks any. */
export const hashPassword = (password: string) => bcrypt.hash(password, 12)

/**
 * Compare `password` with the account's hash and keep the lockout count: a
 * wrong one counts toward the lock, a right one resets it. Login and the
 * settings re-auth both use it, so guesses on either share one limit.
 */
export async function checkPassword(
  user: Pick<User, 'id' | 'password' | 'failedLoginAttempts' | 'lockedUntil'>,
  password: string,
): Promise<{ status: 'ok' | 'wrong' } | { status: 'locked'; minutes: number }> {
  const now = Date.now()
  const lockedUntil = user.lockedUntil?.getTime()

  if (lockedUntil && lockedUntil > now) {
    return {
      status: 'locked',
      minutes: Math.ceil((lockedUntil - now) / 60_000),
    }
  }

  // An expired lock starts the count again
  const failed = lockedUntil ? 0 : user.failedLoginAttempts

  // Global client, not a caller's transaction: a wrong guess must stick even
  // when the caller rolls back
  if (!(await bcrypt.compare(password, user.password))) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failed + 1,
        lockedUntil:
          failed + 1 >= MAX_FAILED_ATTEMPTS
            ? new Date(now + LOCKOUT_DURATION_MS)
            : null,
      },
    })

    return { status: 'wrong' }
  }

  if (user.failedLoginAttempts || lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
  }

  return { status: 'ok' }
}

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

          const check = await checkPassword(user, credentials.password)

          // Encode minutes in error message (NextAuth will pass this through)
          if (check.status === 'locked') {
            throw new Error(`AccountLocked:${check.minutes}`)
          }
          if (check.status === 'wrong') throw new Error('WRONG_PASSWORD')

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
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
        token.role = user.role

        return token
      }

      const account = token.sub
        ? await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, isActive: true },
          })
        : null

      if (!account?.isActive) {
        throw new Error('Account deleted or deactivated')
      }

      token.role = account.role

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
