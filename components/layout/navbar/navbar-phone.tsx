import Link from 'next/link'

export default function NavbarPhone() {
  return (
    <Link
      className='hidden items-center gap-3 border-r border-border pr-4 transition-colors duration-200 ease-out hover:text-foreground xl:flex'
      href='/contact'
    >
      <span className='flex flex-col items-start leading-tight'>
        <span className='font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
          Sales
        </span>
        <span className='text-sm font-medium text-foreground'>
          Request a quote
        </span>
      </span>
    </Link>
  )
}
