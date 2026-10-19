import NextAuth from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const handler = NextAuth(authOptions)

type Context = { params: Promise<{ nextauth: string[] }> }

const forward = async (request: NextRequest, { params }: Context) =>
  handler(request as any, { params: await params } as any)

/** Rate-limits sign-in attempts; every other POST goes straight to NextAuth. */
export async function POST(request: NextRequest, context: Context) {
  const pathname = request.nextUrl.pathname

  // Only sign-in posts a form; the session update posts JSON
  if (
    !pathname.includes('/signin') &&
    !pathname.includes('/callback/credentials')
  ) {
    return forward(request, context)
  }

  // A clone, so NextAuth can still read the body
  const form = await request.clone().formData()

  if (form.get('email') && form.get('password')) {
    const rateLimit = checkRateLimit(getClientIP(request))

    if (rateLimit.isLimited) {
      // signIn() reads the error code from this url, as NextAuth sends it
      const url = new URL('/admin/login', request.url)

      url.searchParams.set(
        'error',
        `RateLimitExceeded:${rateLimit.remainingMinutes}`,
      )

      return NextResponse.json({ url: url.toString() }, { status: 429 })
    }
  }

  return forward(request, context)
}

export const GET = forward
