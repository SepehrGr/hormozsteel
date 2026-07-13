/**
 * Script to unlock a user account by resetting failed login attempts
 * Usage: 
 *   npx tsx scripts/unlock-account.ts <email>
 *   npx tsx scripts/unlock-account.ts --all (unlock all locked accounts)
 */

import { prisma } from '../lib/prisma'

async function unlockAccount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    await prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })

    console.log(`✅ Account unlocked successfully for ${email}`)
    console.log(`   Failed attempts reset to 0`)
    console.log(`   Lockout removed`)
  } catch (error) {
    console.error('Error unlocking account:', error)
    process.exit(1)
  }
}

async function unlockAllAccounts() {
  try {
    const lockedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { lockedUntil: { not: null } },
          { failedLoginAttempts: { gt: 0 } },
        ],
      },
    })

    if (lockedUsers.length === 0) {
      console.log('No locked accounts found')
      return
    }

    console.log(`Found ${lockedUsers.length} locked account(s):`)
    for (const user of lockedUsers) {
      console.log(`  - ${user.email} (${user.failedLoginAttempts} failed attempts)`)
    }

    await prisma.user.updateMany({
      where: {
        OR: [
          { lockedUntil: { not: null } },
          { failedLoginAttempts: { gt: 0 } },
        ],
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })

    console.log(`\n✅ Unlocked ${lockedUsers.length} account(s)`)
  } catch (error) {
    console.error('Error unlocking accounts:', error)
    process.exit(1)
  }
}

async function main() {
  const arg = process.argv[2]

  if (!arg) {
    console.error('Usage: npx tsx scripts/unlock-account.ts <email>')
    console.error('   Or: npx tsx scripts/unlock-account.ts --all (to unlock all accounts)')
    process.exit(1)
  }

  if (arg === '--all') {
    await unlockAllAccounts()
  } else {
    await unlockAccount(arg)
  }

  await prisma.$disconnect()
}

main()
