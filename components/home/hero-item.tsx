import Link from 'next/link';

export default function HeroItem({
  label,
  icon,
  categoryId,
}: {
  label: string;
  icon: string;
  categoryId: string;
}) {
  // Map category IDs to category pages
  const getCategoryLink = (id: string) => {
    const links: { [key: string]: string } = {
      rebar: '/products/rebar',
      profile: '/products/profile',
      sheet: '/products/sheet',
      angle: '/products/angle',
      beam: '/products/beam',
      pipe: '/products/pipe',
      wire: '/products/wire',
      mesh: '/products/mesh',
    };
    return links[id] || '/products';
  };

  return (
    <Link
      href={getCategoryLink(categoryId)}
      className="block transition-all duration-300 transform group hover:-translate-y-1"
    >
      <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-all duration-500 h-[180px] w-[160px] sm:h-[220px] sm:w-[220px] overflow-hidden">
        {/* Icon container with enhanced styling */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-4 transition-all duration-500 shadow-lg sm:w-24 sm:h-24 sm:mb-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl group-hover:shadow-blue-500/50 dark:group-hover:shadow-blue-400/30 group-hover:scale-105 ">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
          <i
            className={`${icon} text-4xl sm:text-[3.5rem] text-white relative z-10 group-hover:scale-105 transition-transform duration-300`}
          ></i>
        </div>

        {/* Title with enhanced typography */}
        <h3 className="relative text-sm font-bold leading-tight text-center transition-all duration-300 sm:text-base text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {label}
        </h3>

        {/* Subtle bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 origin-left transform scale-x-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-x-100"></div>
      </div>
    </Link>
  );
}
