import { pluralize } from '@/lib/format'

/**
 * The sign-in form's text for an error code: what `authorize()` throws
 * (`AccountLocked:<minutes>`, `USER_INACTIVE`, …), the route's
 * `RateLimitExceeded:<minutes>`, or one of NextAuth's own.
 * An unknown email reads the same as a wrong password, so the form can't be
 * used to find out who has an account.
 */
export function loginErrorMessage(code?: string | null) {
  if (!code) return 'Sign-in failed. Check your connection and try again.'

  const [kind, minutes] = code.split(':')
  const wait = pluralize(Number(minutes) || 15, 'minute')

  switch (kind) {
    case 'WRONG_PASSWORD':
    case 'USER_NOT_FOUND':
    case 'INVALID_CREDENTIALS':
    case 'CredentialsSignin':
      return 'Wrong email or password.'
    case 'AccountLocked':
      return `Too many wrong passwords. This account is locked for ${wait}.`
    case 'RateLimitExceeded':
      return `Too many sign-in attempts. Try again in ${wait}.`
    case 'USER_INACTIVE':
      return 'This account is deactivated. Ask a super admin to turn it back on.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}
