import { Metadata } from 'next'
import { BlogPostCard, BlogPost } from '@/components/blog-post'
import { Factory } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'تولید کنندگان',
  description:
    'آخرین مطالب و اخبار در مورد صنعت فولاد و تولیدکنندگان فولاد ایران',
}

async function getManufacturers() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return manufacturers.map((manufacturer) => ({
      id: manufacturer.slug,
      title: manufacturer.name,
      excerpt: manufacturer.description?.substring(0, 150) + '...' || '',
      content: manufacturer.description || '',
      image: manufacturer.logo || '/images/blog/foolad-mobarakeh.png',
      date: new Date(manufacturer.createdAt).toLocaleDateString('fa-IR'),
      readTime: '۵ دقیقه',
      author: 'تیم آهن هرمز',
    }))
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    return []
  }
}

export default async function ManufacturersPage() {
  const posts: BlogPost[] = await getManufacturers()
  return (
    <main className="relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5"></div>

        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30">
              <Factory className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-2xl">
              تولیدکنندگان فولاد ایران
            </h1>
            <p className="max-w-3xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
              آشنایی با بزرگترین و معتبرترین تولیدکنندگان فولاد و محصولات فولادی
              در ایران
            </p>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container px-6 py-16 mx-auto">
        <div className="relative z-20 -mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
