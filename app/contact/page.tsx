import ContactForm from '@/components/content/contact-form'
import Map from '@/components/content/map'

const officeHours = [
  { day: 'Saturday – Wednesday', hours: '08:00 – 17:00' },
  { day: 'Thursday', hours: '08:00 – 12:30' },
  { day: 'Friday', hours: 'Closed' },
]

const channels = [
  {
    label: 'Sales desk',
    value: '+98 910 123 4567',
    href: 'tel:+989101234567',
    note: 'Mrs. Hosseini',
  },
  {
    label: 'Sales desk',
    value: '+98 912 111 0000',
    href: 'tel:+989121110000',
    note: 'Mr. Rahmani',
  },
  {
    label: 'Instagram',
    value: '@ahanhormoz',
    href: 'https://instagram.com/ahanhormoz',
    note: '',
  },
]

export default function ContactPage() {
  return (
    <div className='w-full '>
      {/* Header strip */}
      <header className='border-b border-border'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-0 md:py-14'>
          <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Sales &amp; procurement
          </p>
          <div className='grid gap-8 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-7'>
              <h1 className='max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                Request a quote or speak with sales
              </h1>
              <p className='mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
                Share tonnage, grade, and delivery window. We reply with firm
                pricing against the catalog board — rebar, sheet, sections,
                pipe, and billets.
              </p>
            </div>
            <dl className='grid grid-cols-2 gap-3 lg:col-span-5 lg:border-l lg:border-border lg:pl-8'>
              <div className='border border-border bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Response
                </dt>
                <dd className='text-sm font-medium text-foreground'>
                  Next business day
                </dd>
              </div>
              <div className='border border-border bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Quote basis
                </dt>
                <dd className='text-sm font-medium text-foreground'>
                  USD · ex-works
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div className=' lg:my-20'>
        <div className='mx-auto grid gap-px max-w-7xl overflow-hidden border border-border lg:grid-cols-12'>
          {/* Desk info */}
          <aside className='lg:col-span-5'>
            <div className='border-b border-border px-5 py-3 md:px-6'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Desk details
              </h2>
            </div>

            <div className='divide-y divide-border'>
              <section className='px-5 py-5 md:px-6'>
                <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Hours (local)
                </h3>
                <ul className='mt-3 space-y-2'>
                  {officeHours.map(row => (
                    <li
                      key={row.day}
                      className='flex items-baseline justify-between gap-4 text-sm'
                    >
                      <span className='text-muted-foreground'>{row.day}</span>
                      <span className='font-mono tabular-nums text-foreground'>
                        {row.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className='px-5 py-5 md:px-6'>
                <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Channels
                </h3>
                <ul className='mt-3 space-y-3'>
                  {channels.map(ch => (
                    <li key={ch.value + ch.note}>
                      <a
                        className='group flex flex-col gap-0.5 transition-colors duration-200 ease-out hover:text-foreground'
                        href={ch.href}
                        rel={
                          ch.href.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        target={
                          ch.href.startsWith('http') ? '_blank' : undefined
                        }
                      >
                        <span className='text-xs text-muted-foreground'>
                          {ch.label}
                        </span>
                        <span className='flex items-center justify-between'>
                          <span className='text-sm font-medium text-foreground group-hover:underline group-hover:underline-offset-4'>
                            {ch.value}
                          </span>
                          <span className='font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>
                            {ch.note}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className='px-5 py-5 md:px-6'>
                <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Address
                </h3>
                <p className='mt-3 text-sm leading-relaxed text-foreground'>
                  Bandar Abbas, Andisheh Township — behind Ayatollah Khamenei
                  Library, above the public services office. Beton Payam Hormoz
                  Trading &amp; Construction Co.
                </p>
                <div className='mt-4 border border-border'>
                  <Map />
                </div>
              </section>
            </div>
          </aside>

          {/* Form board */}
          <div className='lg:col-span-7 lg:border-l'>
            <div className='flex items-center justify-between border-b border-border px-5 py-3 md:px-6'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Quote request
              </h2>
              <span className='text-xs text-muted-foreground'>
                * Required fields
              </span>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
