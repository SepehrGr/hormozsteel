import Link from 'next/link'
import Image from 'next/image'
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaTelegram,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
} from 'react-icons/fa'
import { Button } from '../ui/button'

export default function Footer() {
  return (
    <footer className='mt-10 border-t bg-background'>
      <div className='container px-4 py-12 mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-5'>
          {/* Company Info */}
          <div className='md:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <Image
                src='/Vector.svg'
                alt='آهن هرمز'
                width={40}
                height={40}
                className='dark:invert'
              />
              <h3 className='text-xl font-bold'>آهن هرمز</h3>
            </div>
            <p className='mb-4 text-sm text-muted-foreground'>
              فروش عمده و جزئی مقاطع فولادی | تضمین بهترین قیمت و کیفیت
            </p>
            <div className='flex gap-3'>
              <Link
                href='https://instagram.com/ahanhormoz'
                className='text-muted-foreground hover:text-primary'
              >
                <FaInstagram size={32} />
              </Link>
              <Link
                href='https://t.me/+989125858047'
                className='text-muted-foreground hover:text-primary'
              >
                <FaTelegram size={32} />
              </Link>
              <Link
                href='https://wa.me/+989125858047'
                className='text-muted-foreground hover:text-primary'
              >
                <FaWhatsapp size={32} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>دسترسی سریع</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/products'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  محصولات
                </Link>
              </li>
              <li>
                <Link
                  href='/moment-news'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  قیمت لحظه‌ای
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  درباره ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>محصولات</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/products/rebar'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  میلگرد
                </Link>
              </li>
              <li>
                <Link
                  href='/products/sheet'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  ورق
                </Link>
              </li>
              <li>
                <Link
                  href='/products/profile'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  پروفیل
                </Link>
              </li>
              <li>
                <Link
                  href='/products/beam'
                  className='text-sm text-muted-foreground hover:text-primary'
                >
                  تیرآهن
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>تماس با ما</h3>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                آدرس: بندرعباس، شهرک اندیشه، پشت کتابخانه ایت الله خامنه ای، بالای
                دفتر پیشخوان، شرکت بازرگانی و ساختمانی بتن پیام هرمز
              </p>
              <p className='text-sm text-muted-foreground'>
                <Link href='tel:09125858047' className='hover:text-primary'>
                  تلفن: 09125858047
                </Link>
              </p>
              <p className='text-sm text-muted-foreground'>
                ایمیل: info@ahanhormoz.ir
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className='pt-8 mt-8 text-center border-t'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} آهن هرمز. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  )
}
