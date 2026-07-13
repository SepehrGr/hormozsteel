import { Headset, Phone } from 'lucide-react'
import Link from 'next/link'

export default function NavbarPhone() {
  return (
    <div className='flex items-center gap-3 group'>
      <div className='relative'>
        <div className='absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 blur-lg bg-primary/20 group-hover:opacity-100'></div>
        <div className='relative bg-gradient-to-br from-primary/10 to-primary/5 p-2.5 rounded-full border border-primary/20'>
          <Headset size={20} className='text-primary' />
        </div>
      </div>
      <div className='flex flex-col'>
        <Link
          href='tel:+989125858047'
          className='flex flex-col items-start transition-all duration-300 group/link'
        >
          <p className='text-xs font-medium transition-colors duration-300 text-default-500 group-hover/link:text-primary'>
            مشاوره و خرید
          </p>
          <div className='flex items-center gap-1'>
            <Phone
              size={12}
              className='transition-colors duration-300 text-primary/60 group-hover/link:text-primary'
            />
            <p className='text-sm font-bold transition-colors duration-300 text-foreground group-hover/link:text-primary'>
              <span className='text-base'>09125858047</span>
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
