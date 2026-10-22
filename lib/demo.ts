import type { Role } from '@prisma/client'

/**
 * The published demo logins: seeded by prisma/seed.ts, offered on the login
 * page, and locked by the user actions, since every visitor shares them.
 */
export const DEMO_LOGINS: {
  name: string
  role: Role
  email: string
  password: string
}[] = [
  {
    name: 'Demo Admin',
    role: 'ADMIN',
    email: 'admin@hormozsteel.demo',
    password: 'admin123',
  },
  {
    name: 'Demo Super Admin',
    role: 'SUPER_ADMIN',
    email: 'superadmin@hormozsteel.demo',
    password: 'superadmin123',
  },
]

export const isDemoAccount = (email: string) =>
  DEMO_LOGINS.some(login => login.email === email)

export const DEMO_ACCOUNT_LOCKED =
  'The demo logins stay as they are so every visitor can sign in. Try this on a user you create.'
