/**
 * In-memory rate limiter for API endpoints
 * Supports different rate limits for different endpoints
 */

interface RateLimitEntry {
  attempts: number
  resetTime: number
}

// Separate maps for different endpoint types
const loginRateLimitMap = new Map<string, RateLimitEntry>()
const apiRateLimitMap = new Map<string, RateLimitEntry>()

// Rate limit configurations
const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const API_MAX_ATTEMPTS = 1000 // More lenient for API endpoints
const API_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Clean up expired entries periodically
 */
const cleanupInterval = setInterval(
  () => {
    const now = Date.now()

    // Clean up login rate limit map
    const loginEntries = Array.from(loginRateLimitMap.entries())
    for (const [ip, entry] of loginEntries) {
      if (entry.resetTime < now) {
        loginRateLimitMap.delete(ip)
      }
    }

    // Clean up API rate limit map
    const apiEntries = Array.from(apiRateLimitMap.entries())
    for (const [ip, entry] of apiEntries) {
      if (entry.resetTime < now) {
        apiRateLimitMap.delete(ip)
      }
    }
  },
  5 * 60 * 1000,
) // Clean up every 5 minutes

/**
 * Check if an IP address has exceeded the rate limit for login
 * @param ip - The IP address to check
 * @returns Object with isLimited (boolean) and remainingMinutes (number)
 */
export function checkRateLimit(ip: string): {
  isLimited: boolean
  remainingMinutes: number
} {
  return checkRateLimitWithConfig(
    ip,
    loginRateLimitMap,
    LOGIN_MAX_ATTEMPTS,
    LOGIN_WINDOW_MS,
  )
}

/**
 * Check if an IP address has exceeded the rate limit for API endpoints
 * @param ip - The IP address to check
 * @param maxAttempts - Maximum attempts allowed (default: API_MAX_ATTEMPTS)
 * @param windowMs - Time window in milliseconds (default: API_WINDOW_MS)
 * @returns Object with isLimited (boolean) and remainingMinutes (number)
 */
export function checkApiRateLimit(
  ip: string,
  maxAttempts: number = API_MAX_ATTEMPTS,
  windowMs: number = API_WINDOW_MS,
): {
  isLimited: boolean
  remainingMinutes: number
} {
  return checkRateLimitWithConfig(ip, apiRateLimitMap, maxAttempts, windowMs)
}

/**
 * Generic rate limit checker with configurable parameters
 * @param ip - The IP address to check
 * @param rateLimitMap - The map to use for tracking
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with isLimited (boolean) and remainingMinutes (number)
 */
function checkRateLimitWithConfig(
  ip: string,
  rateLimitMap: Map<string, RateLimitEntry>,
  maxAttempts: number,
  windowMs: number,
): {
  isLimited: boolean
  remainingMinutes: number
} {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  // No entry exists, create a new one
  if (!entry) {
    rateLimitMap.set(ip, {
      attempts: 1,
      resetTime: now + windowMs,
    })
    return { isLimited: false, remainingMinutes: 0 }
  }

  // Entry exists but window has expired
  if (entry.resetTime < now) {
    rateLimitMap.set(ip, {
      attempts: 1,
      resetTime: now + windowMs,
    })
    return { isLimited: false, remainingMinutes: 0 }
  }

  // Entry exists and window is still active
  if (entry.attempts >= maxAttempts) {
    const remainingMs = entry.resetTime - now
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000))
    return { isLimited: true, remainingMinutes }
  }

  // Increment attempts
  entry.attempts++
  rateLimitMap.set(ip, entry)
  return { isLimited: false, remainingMinutes: 0 }
}

/**
 * Get the client IP address from a request
 * @param request - The request object
 * @returns The IP address string
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback (in serverless environments, this might not be available)
  return 'unknown'
}

/**
 * Reset rate limit for an IP (useful for testing or manual resets)
 * @param ip - The IP address to reset
 * @param type - Type of rate limit to reset ('login' | 'api' | 'all')
 */
export function resetRateLimit(
  ip: string,
  type: 'login' | 'api' | 'all' = 'all',
): void {
  if (type === 'login' || type === 'all') {
    loginRateLimitMap.delete(ip)
  }
  if (type === 'api' || type === 'all') {
    apiRateLimitMap.delete(ip)
  }
}

/**
 * Helper function to check API rate limit and return error response if exceeded
 * @param request - The NextRequest object
 * @param maxAttempts - Maximum attempts allowed (default: API_MAX_ATTEMPTS)
 * @param windowMs - Time window in milliseconds (default: API_WINDOW_MS)
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export function checkApiRateLimitAndRespond(
  request: Request,
  maxAttempts: number = API_MAX_ATTEMPTS,
  windowMs: number = API_WINDOW_MS,
): Response | null {
  const ip = getClientIP(request)
  const rateLimit = checkApiRateLimit(ip, maxAttempts, windowMs)

  if (rateLimit.isLimited) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${rateLimit.remainingMinutes} minutes.`,
        remainingMinutes: rateLimit.remainingMinutes,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.remainingMinutes * 60),
        },
      },
    )
  }

  return null
}
