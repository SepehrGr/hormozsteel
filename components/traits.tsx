import TraitItem from './traitItem'
import { traitItems } from '@/config/traitItems'

export default function Traits() {
  return (
    <section className="relative w-full py-5 overflow-hidden">
      {/* bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"> */}
      {/* Background decorative elements */}
      {/* <div className="absolute top-0 left-0 w-40 h-40 -translate-x-20 -translate-y-20 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 dark:from-blue-900/20 dark:to-purple-900/20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 translate-x-16 translate-y-16 rounded-full bg-gradient-to-br from-green-100/30 to-blue-100/30 dark:from-green-900/20 dark:to-blue-900/20"></div> */}

      <div className="container relative z-10 px-4 mx-auto">
        {/* Modern header with gradient text */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span className="text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 bg-clip-text">
              تجربه‌ای راحت و مطمئن
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            با اعتماد و اطمینان خاطر، بهترین محصولات آهن‌آلات را با کیفیت تضمینی
            تهیه کنید
          </p>
        </div>
        {/* <div className='flex justify-center'>
          <div className='inline-flex items-center gap-4 mb-6'>
            <div className='w-16 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent'></div>
            <div className='w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500'></div>
            <div className='w-16 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent'></div>
          </div>
        </div> */}
        {/* Grid with enhanced spacing and responsiveness */}
        <div className="grid items-stretch grid-cols-1 gap-8 mx-auto md:grid-cols-2 xl:grid-cols-4 max-w-7xl">
          {traitItems.map((item, index) => (
            <div
              key={item.id}
              className="flex opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <TraitItem
                title={item.title}
                iconName={item.icon}
                description={item.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
