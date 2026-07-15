import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className='mt-10 border-t border-border bg-background'>
      <div className='container mx-auto max-w-7xl px-4 py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          <div className='md:col-span-1'>
            <div className='mb-4 flex items-center gap-2'>
              <Image
                src='/Vector.svg'
                alt='Hormoz Steel'
                width={40}
                height={40}
                className='dark:invert'
              />
              <h3 className='text-lg font-semibold tracking-tight'>
                Hormoz Steel
              </h3>
            </div>
            <p className='mb-4 text-sm leading-relaxed text-muted-foreground'>
              English portfolio demo of a B2B steel pricing catalog — products,
              live-style prices, and admin tools.
            </p>
          </div>

          <div>
            <h3 className='mb-4 text-sm font-semibold tracking-tight'>
              Quick links
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/products'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-sm font-semibold tracking-tight'>
              Categories
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/products/rebar'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  Rebar
                </Link>
              </li>
              <li>
                <Link
                  href='/products/sheet'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  Sheets
                </Link>
              </li>
              <li>
                <Link
                  href='/products/profile'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  Profiles
                </Link>
              </li>
              <li>
                <Link
                  href='/products/beam'
                  className='text-sm text-muted-foreground transition hover:text-foreground'
                >
                  Beams
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-sm font-semibold tracking-tight'>Demo</h3>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Portfolio showcase by Sepehr Gorgini. Not the live client site.
            </p>
            <p className='mt-3 text-sm text-muted-foreground'>
              <Link
                href='https://sepehrgr.dev'
                className='underline-offset-4 hover:text-foreground hover:underline'
              >
                sepehrgr.dev
              </Link>
            </p>
          </div>
        </div>

        <div className='mt-8 border-t border-border pt-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} Hormoz Steel demo. Portfolio use only.
          </p>
        </div>
      </div>
    </footer>
  )
}
