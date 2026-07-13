import Image from 'next/image'
import Link from 'next/link'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { CalendarDays, Clock3, ArrowRight, ArrowLeft } from 'lucide-react'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  readTime: string
  author: string
}

interface BlogPostCardProps {
  post: BlogPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 border border-gray-200/60 dark:border-gray-700/50 shadow-2xl rounded-3xl backdrop-blur-md group flex flex-col h-full transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
      {/* المان‌های تزئینی */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-12 translate-x-12 dark:from-blue-900/20"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-cyan-100/30 to-transparent rounded-full translate-y-10 -translate-x-10 dark:from-cyan-900/20"></div>

      <div className="relative h-52 w-full overflow-hidden rounded-t-3xl">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="relative p-6 flex flex-col flex-1">
        {/* بج اطلاعات */}
        <div className="flex items-center gap-3 mb-4 justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-full text-xs">
            <span className="text-gray-700 dark:text-gray-300">
              {post.readTime}
            </span>
            <Clock3 size={14} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-full text-xs">
            <span className="text-gray-700 dark:text-gray-300">
              {post.date}
            </span>
            <CalendarDays
              size={14}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-right">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed text-right">
            {post.excerpt}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end">
          <Link
            href={`/manufacturers/${encodeURIComponent(post.id)}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 hover:from-blue-600 hover:to-cyan-600"
          >
            <span>ادامه مطلب</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* خط تزئینی پایین */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </div>
  )
}
