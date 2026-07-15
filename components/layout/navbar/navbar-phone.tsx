import { Phone } from 'lucide-react'
import Link from 'next/link'

export default function NavbarPhone() {
  return (
    <div className='group flex items-center gap-3'>
      <div className='rounded-full border border-border bg-muted/50 p-2.5'>
        <Phone size={18} className='text-muted-foreground' />
      </div>
      <div className='flex flex-col'>
        <Link
          href='/contact'
          className='flex flex-col items-start transition-colors hover:text-primary'
        >
          <p className='text-xs font-medium text-muted-foreground'>Sales</p>
          <p className='text-sm font-semibold text-foreground'>Contact us</p>
        </Link>
      </div>
    </div>
  )
}
