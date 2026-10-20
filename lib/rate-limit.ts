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
const submitRateLimitMap = new Map<string, RateLimitEntry>()

// Rate limit configurations
const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const API_MAX_ATTEMPTS = 1000 // More lenient for API endpoints
const API_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Public form posts count apart from API reads, so browsing can't use them up
const SUBMIT_MAX_ATTEMPTS = 20
const SUBMIT_WINDOW_MS = 15 * 60 * 1000

/**
 * Clean up expired entries periodically
 */
setInterval(
  () => {
    const now = Date.now()

    for (const map of [
      loginRateLimitMap,
      apiRateLimitMap,
      submitRateLimitMap,
    ]) {
      for (const [ip, entry] of Array.from(map.entries())) {
        if (entry.resetTime < now) map.delete(ip)
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
 * Client IP from proxy headers. Takes a Request (route handlers) or the
 * Headers from `headers()` (Server Actions).
 */
export function getClientIP(source: Request | Headers): string {
  const headers = source instanceof Headers ? source : source.headers
  const forwarded = headers.get('x-forwarded-for')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')

  if (realIP) {
    return realIP
  }

  // Fallback (in serverless environments, this might not be available)
  return 'unknown'
}

/** The 429 response for a limited request, or null to carry on. */
function tooManyRequests(rateLimit: {
  isLimited: boolean
  remainingMinutes: number
}): Response | null {
  if (!rateLimit.isLimited) return null

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

/**
 * Rate-limit guard for API routes: a 429 response, or null to carry on.
 * `maxAttempts` is checked against the one counter all API calls share.
 */
export function checkApiRateLimitAndRespond(
  request: Request,
  maxAttempts: number = API_MAX_ATTEMPTS,
  windowMs: number = API_WINDOW_MS,
): Response | null {
  return tooManyRequests(
    checkApiRateLimit(getClientIP(request), maxAttempts, windowMs),
  )
}

/** Public form submissions, on their own tighter counter. */
export function checkSubmitRateLimit(ip: string) {
  return checkRateLimitWithConfig(
    ip,
    submitRateLimitMap,
    SUBMIT_MAX_ATTEMPTS,
    SUBMIT_WINDOW_MS,
  )
}
