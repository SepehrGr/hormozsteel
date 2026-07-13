import { Coins, Banknote, ShieldCheck, PhoneCall } from 'lucide-react'

const iconMap = {
  Coins,
  Banknote,
  ShieldCheck,
  PhoneCall,
}

// Icon color mapping for variety
const iconColors = {
  Coins: 'from-amber-500 to-orange-500',
  Banknote: 'from-green-500 to-emerald-500',
  ShieldCheck: 'from-blue-500 to-indigo-500',
  PhoneCall: 'from-purple-500 to-pink-500',
}

interface TraitItemProps {
  iconName: keyof typeof iconMap
  title: string
  description: string
}

export default function TraitItem({ title, iconName, description }: TraitItemProps) {
  const IconComponent = iconMap[iconName]
  const iconGradient = iconColors[iconName]

  return (
    <div className='relative h-full group'>
      <div className='relative flex flex-col h-full md:min-h-[290px] p-6 transition-all duration-500 bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-400/5 hover:-translate-y-1 overflow-hidden'>
        {/* Icon container */}
        <div className='relative z-10 flex-shrink-0 mb-6'>
          <div
            className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${iconGradient} rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}
          >
            <div className='absolute inset-0 rounded-2xl'></div>
            <IconComponent
              className='relative z-10 text-white transition-transform duration-300 group-hover:scale-110'
              size={28}
            />
          </div>
        </div>

        {/* Content */}
        <div className='relative z-10 flex flex-col flex-1 space-y-4'>
          <h3 className='text-lg font-bold leading-tight transition-colors duration-300 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
            {title}
          </h3>

          <p className='flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
            {description}
          </p>
        </div>

        {/* Subtle bottom accent - fixed to stay within card */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${iconGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl`}
        ></div>
      </div>
    </div>
  )
}
