import { Settings } from 'lucide-react'

import { PageHeader } from '@/components/admin/page-header'
import { ProfileForm } from '@/components/admin/settings/profile-form'
import { requireAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const session = await requireAuth()
  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true },
  })

  return (
    <div className='space-y-6'>
      <PageHeader
        description='Your name, sign-in email and password.'
        icon={Settings}
        title='Settings'
      />
      <ProfileForm profile={profile} />
    </div>
  )
}
