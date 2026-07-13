import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  User,
  Search,
  MapPin,
  Mail,
  Phone,
  Globe,
  Factory,
} from 'lucide-react'
import NextLink from 'next/link'
import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Input } from '@heroui/input'
import { prisma } from '@/lib/prisma'

async function getManufacturer(slug: string) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { slug },
    })
    return manufacturer
  } catch (error) {
    console.error('Error fetching manufacturer:', error)
    return null
  }
}

async function getRelatedManufacturers(currentSlug: string, limit = 3) {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      where: {
        slug: {
          not: currentSlug,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
    return manufacturers
  } catch (error) {
    console.error('Error fetching related manufacturers:', error)
    return []
  }
}

async function getAllManufacturers() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        slug: true,
        name: true,
      },
    })
    return manufacturers
  } catch (error) {
    console.error('Error fetching all manufacturers:', error)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.postId)
  const manufacturer = await getManufacturer(decodedSlug)

  if (!manufacturer) {
    return {
      title: 'تولیدکننده یافت نشد | آهن هرمز',
    }
  }

  return {
    title: `${manufacturer.name} | آهن هرمز`,
    description:
      manufacturer.description?.substring(0, 160) ||
      `اطلاعات کامل درباره ${manufacturer.name}`,
  }
}

export default async function ManufacturerDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.postId)
  const manufacturer = await getManufacturer(decodedSlug)

  if (!manufacturer) {
    notFound()
  }

  const relatedManufacturers = await getRelatedManufacturers(manufacturer.slug)
  const allManufacturers = await getAllManufacturers()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative py-12 overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative px-6 mx-auto">
          <Button
            as={NextLink}
            href="/manufacturers"
            variant="light"
            startContent={<ArrowRight className="w-4 h-4" />}
            className="mb-6 text-white"
          >
            بازگشت به تولیدکنندگان
          </Button>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {manufacturer.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>{formatDate(manufacturer.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 size={16} />
              <span>۵ دقیقه مطالعه</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>تیم آهن هرمز</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Article */}
          <article className="lg:col-span-8">
            <Card className="overflow-hidden shadow-lg">
              {/* Featured Image */}
              {manufacturer.logo && (
                <div className="relative h-[400px] w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <Image
                    src={manufacturer.logo}
                    alt={manufacturer.name}
                    fill
                    className="object-contain p-8"
                  />
                </div>
              )}

              <CardBody className="p-8 space-y-8">
                {/* About Section */}
                <section>
                  <h2 className="flex items-center gap-3 mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    <Factory className="w-6 h-6 text-blue-600" />
                    درباره {manufacturer.name}
                  </h2>
                  <div
                    className="prose prose-lg text-right dark:prose-invert max-w-none"
                    dir="rtl"
                  >
                    {manufacturer.description ? (
                      manufacturer.description
                        .split('\n\n')
                        .map((paragraph: string, i: number) => (
                          <p
                            key={i}
                            className="leading-relaxed text-right text-gray-700 dark:text-gray-300"
                          >
                            {paragraph.trim()}
                          </p>
                        ))
                    ) : (
                      <p className="text-right text-gray-600 dark:text-gray-400">
                        اطلاعات تکمیلی در حال بروزرسانی است.
                      </p>
                    )}
                  </div>
                </section>

                {/* Contact Information */}
                {(manufacturer.website ||
                  manufacturer.email ||
                  manufacturer.phone ||
                  manufacturer.address) && (
                  <section className="mt-8">
                    <h3 className="mb-6 text-2xl font-bold text-right text-gray-900 dark:text-white">
                      اطلاعات تماس
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {manufacturer.website && (
                        <a
                          href={manufacturer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative p-6 overflow-hidden transition-transform duration-300 border shadow-md bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-2xl backdrop-blur-md hover:scale-102"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-md w-14 h-14 dark:bg-slate-900 hover:border-blue-400 hover:shadow-xl group shrink-0">
                              <Globe className="text-black transition-colors duration-300 w-7 h-7 dark:text-white group-hover:text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                                وبسایت
                              </h4>
                              <p className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                                {manufacturer.website.replace(
                                  /^https?:\/\//,
                                  ''
                                )}
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                      {manufacturer.email && (
                        <a
                          href={`mailto:${manufacturer.email}`}
                          className="relative p-6 overflow-hidden transition-transform duration-300 border shadow-md bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-2xl backdrop-blur-md hover:scale-102 "
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-md w-14 h-14 dark:bg-slate-900 hover:border-blue-400 hover:shadow-xl group shrink-0">
                              <Mail className="text-black transition-colors duration-300 w-7 h-7 dark:text-white group-hover:text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                                ایمیل
                              </h4>
                              <p className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                                {manufacturer.email}
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                      {manufacturer.phone && (
                        <a
                          href={`tel:${manufacturer.phone}`}
                          className="relative p-6 overflow-hidden transition-transform duration-300 border shadow-md bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-2xl backdrop-blur-md hover:scale-102"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-md w-14 h-14 dark:bg-slate-900 hover:border-blue-400 hover:shadow-xl group shrink-0">
                              <Phone className="text-black transition-colors duration-300 w-7 h-7 dark:text-white group-hover:text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                                تلفن تماس
                              </h4>
                              <p
                                className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                dir="ltr"
                              >
                                {manufacturer.phone}
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                      {manufacturer.address && (
                        <div className="relative p-6 overflow-hidden transition-transform duration-300 border shadow-md bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-2xl backdrop-blur-md md:col-span-2 hover:scale-102">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-md w-14 h-14 dark:bg-slate-900 hover:border-blue-400 hover:shadow-xl group shrink-0">
                              <MapPin className="text-black transition-colors duration-300 w-7 h-7 dark:text-white group-hover:text-blue-500" />
                            </div>
                            <div className="flex-1 text-right">
                              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                                آدرس
                              </h4>
                              <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-200">
                                {manufacturer.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </CardBody>
            </Card>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            {/* All Manufacturers List */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-bold">سایر تولیدکنندگان</h3>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700 ">
                  {allManufacturers.map((m) => (
                    <NextLink
                      key={m.slug}
                      href={`/manufacturers/${encodeURIComponent(m.slug)}`}
                      className={`block px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        m.slug === manufacturer.slug
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {m.name}
                    </NextLink>
                  ))}
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>

        {/* Related Posts Section */}
        {relatedManufacturers.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
              تولیدکنندگان مرتبط
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedManufacturers.map((related) => (
                <NextLink
                  key={related.slug}
                  href={`/manufacturers/${encodeURIComponent(related.slug)}`}
                >
                  <Card className="h-full transition-transform hover:scale-105 hover:shadow-xl">
                    {related.logo && (
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                        <Image
                          src={related.logo}
                          alt={related.name}
                          fill
                          className="object-contain p-6"
                        />
                      </div>
                    )}
                    <CardBody>
                      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {related.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {related.description?.substring(0, 120) ||
                          'اطلاعات بیشتر...'}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-sm text-blue-600 dark:text-blue-400">
                        <span>مشاهده جزئیات</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardBody>
                  </Card>
                </NextLink>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
