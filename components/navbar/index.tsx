'use client'

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from '@heroui/navbar'
import { Link } from '@heroui/link'
import { Input } from '@heroui/input'
import { link as linkStyles } from '@heroui/theme'
import NextLink from 'next/link'
import clsx from 'clsx'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { siteConfig } from '@/config/site'
import { ThemeSwitch } from '@/components/theme-switch'
import { SearchIcon, Logo } from '@/components/icons'
import { Divider } from '@heroui/divider'
import NavbarPhone from './navbarPhone'
import NavMenu from './navmenu'

// داده‌های محصولات برای منوی موبایل - کامل و مرتب شده
const mobileProductsData = [
  {
    title: 'قیمت میلگرد',
    icon: 'icon-rebar',
    items: [
      { href: '/products/rebar/milgerd-ajdar', label: 'قیمت میلگرد آجدار' },
      { href: '/products/rebar/milgerd-sade', label: 'قیمت میلگرد ساده' },
      { href: '/products/rebar/milgerd-kolaf', label: 'قیمت میلگرد کلاف' },
      { href: '/products/rebar/milgerd-harati', label: 'قیمت میلگرد حرارتی' },
      { href: '/products/rebar/milgerd-bastar', label: 'قیمت میلگرد بستر' },
      { href: '/products/rebar/milgerd-trans', label: 'قیمت میلگرد ترانس' },
      { href: '/products/rebar/milgerd-steel', label: 'قیمت میلگرد استیل' },
      { href: '/products/rebar', label: 'همه موارد' },
    ],
  },
  {
    title: 'قیمت تیرآهن',
    icon: 'icon-tirahan',
    items: [
      { href: '/products/beam/tirahan', label: 'تیرآهن' },
      { href: '/products/beam/hash', label: 'هاش' },
      { href: '/products/beam/lane-zanbori', label: 'لانه زنبوری' },
      { href: '/products/beam/rail', label: 'ریل' },
      { href: '/products/beam/tirahan-sangin', label: 'تیرآهن سنگین' },
      { href: '/products/beam/tirahan-sabk', label: 'تیرآهن سبک' },
      { href: '/products/beam', label: 'همه موارد' },
    ],
  },
  {
    title: 'قیمت شمش',
    icon: 'icon-bullion',
    items: [
      { href: '/products/shamsh/shamsh-folad', label: 'شمش فولاد' },
      { href: '/products/shamsh/shamsh-aliaazhi', label: 'شمش آلیاژی' },
      { href: '/products/shamsh', label: 'همه موارد' },
    ],
  },
  {
    title: 'قیمت ورق',
    icon: 'icon-varagh',
    items: [
      { href: '/products/sheet/varagh-siah', label: 'ورق سیاه (ST37)' },
      { href: '/products/sheet/varagh-garm', label: 'ورق گرم' },
      { href: '/products/sheet/varagh-sard', label: 'ورق سرد' },
      { href: '/products/sheet/varagh-galvanize', label: 'ورق گالوانیزه' },
      { href: '/products/sheet/varagh-rangi', label: 'ورق رنگی' },
      { href: '/products/sheet/varagh-steel', label: 'ورق استیل' },
      { href: '/products/sheet/varagh-aluminum', label: 'ورق آلومینیوم' },
      { href: '/products/sheet/varagh-mes', label: 'ورق مس' },
      { href: '/products/sheet', label: 'همه موارد' },
    ],
  },
  {
    title: 'قیمت لوله',
    icon: 'icon-lole',
    items: [
      { href: '/products/pipe/lole-darzdar', label: 'لوله درزدار' },
      {
        href: '/products/pipe/lole-bedone-darz',
        label: 'لوله بدون درز (مانیسمان)',
      },
      { href: '/products/pipe/lole-galvanize', label: 'لوله گالوانیزه (گازی)' },
      { href: '/products/pipe/lole-steel', label: 'لوله استیل' },
      { href: '/products/pipe/lole-mes', label: 'لوله مس' },
      { href: '/products/pipe/lole-aluminum', label: 'لوله آلومینیوم' },
      { href: '/products/pipe', label: 'همه موارد' },
    ],
  },
  {
    title: 'قیمت قوطی و پروفیل',
    icon: 'icon-profil',
    items: [
      { href: '/products/profile/qooti-sanate', label: 'قوطی صنعتی' },
      { href: '/products/profile/qooti-sotoni', label: 'قوطی ستونی' },
      { href: '/products/profile/profile-z', label: 'پروفیل Z (زد)' },
      { href: '/products/profile/profile-sakhtmani', label: 'پروفیل ساختمانی' },
      { href: '/products/profile/profile-kongre', label: 'پروفیل کنگره' },
      { href: '/products/profile/profile-ipe', label: 'پروفیل IPE' },
      { href: '/products/profile/profile-upe', label: 'پروفیل UPE' },
      { href: '/products/profile/profile-hea', label: 'پروفیل HEA' },
      { href: '/products/profile/profile-heb', label: 'پروفیل HEB' },
      { href: '/products/profile', label: 'همه موارد' },
    ],
  },
  {
    title: 'قیمت نبشی و ناودانی',
    icon: 'icon-nabshi',
    items: [
      { href: '/products/angle/nabshi', label: 'نبشی' },
      { href: '/products/angle/navodani', label: 'ناودانی' },
      { href: '/products/angle/separi', label: 'سپری' },
      { href: '/products/angle/nabshi-galvanize', label: 'نبشی گالوانیزه' },
      { href: '/products/angle', label: 'همه موارد' },
    ],
  },
  {
    title: 'محصولات مفتولی',
    icon: 'icon-wire',
    items: [
      { href: '/products/maftoli/sim-maftooli-siah', label: 'سیم مفتولی سیاه' },
      {
        href: '/products/maftoli/sim-maftooli-galvanize',
        label: 'سیم مفتولی گالوانیزه',
      },
      { href: '/products/maftoli/toori-hesari', label: 'توری حصاری' },
      { href: '/products/maftoli/mesh-ajdar', label: 'مش آجدار' },
      { href: '/products/maftoli', label: 'همه موارد' },
    ],
  },
  {
    title: 'مواد اولیه',
    icon: 'icon-stainless-steel',
    items: [
      {
        href: '/products/raw-materials/ahan-esfonji',
        label: 'قیمت آهن اسفنجی',
      },
      { href: '/products/raw-materials/foro-aliazh', label: 'قیمت فروآلیاژ' },
      { href: '/products/raw-materials', label: 'همه موارد' },
    ],
  },
]

// داده‌های وزن آهن آلات
const weightData = [
  { href: '/weight/beam', label: 'وزن تیرآهن' },
  { href: '/weight/rebar', label: 'وزن میلگرد' },
  { href: '/weight/billet', label: 'وزن شمش فولادی' },
  { href: '/weight/pipe', label: 'وزن لوله فولادی' },
  { href: '/weight/stud', label: 'وزن ناودانی' },
  { href: '/weight/angle', label: 'وزن نبشی' },
  { href: '/weight/square-tube', label: 'وزن قوطی' },
  { href: '/weight/sheet', label: 'وزن ورق' },
]

// کامپوننت منوی محصولات موبایل
const MobileProductsMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='w-full'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground font-semibold'
      >
        <span className='flex items-center gap-3 text-base'>قیمت محصولات</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 text-primary ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='mt-1 space-y-0.5 bg-default-50/50 rounded-xl p-2'>
          {mobileProductsData.map((category, index) => (
            <MobileCategoryAccordion key={index} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}

// کامپوننت منوی وزن موبایل
const MobileWeightMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='w-full'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground font-semibold'
      >
        <span className='flex items-center gap-3 text-base'>
          محاسبه وزن آهن آلات
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 text-primary ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='p-2 mt-1 space-y-1 bg-default-50/50 rounded-xl'>
          {weightData.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className='flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-300 hover:bg-primary/10 hover:text-primary text-default-700'
            >
              <span className='w-1.5 h-1.5 rounded-full bg-primary/50'></span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// کامپوننت دسته‌بندی محصولات با Accordion
const MobileCategoryAccordion = ({
  category,
}: {
  category: {
    title: string
    icon: string
    items: Array<{ href: string; label: string }>
  }
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='w-full'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-300 hover:bg-default-100 text-foreground font-medium'
      >
        <span className='flex gap-2.5 items-center'>
          <i className={`text-lg ${category.icon} text-primary/80`}></i>
          {category.title}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 text-primary/70 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='mt-1 mr-7 space-y-0.5'>
          {category.items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className='block px-3 py-2 text-sm transition-all duration-300 rounded-lg hover:bg-primary/5 hover:text-primary text-default-600'
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label='Search'
      classNames={{
        inputWrapper: 'bg-default-100/50 backdrop-blur-sm border-0 shadow-sm',
        input: 'text-sm placeholder:text-default-400',
      }}
      labelPlacement='outside'
      startContent={
        <SearchIcon className='flex-shrink-0 text-base pointer-events-none text-default-400' />
      }
      type='search'
      placeholder='جستجو در محصولات...'
    />
  )

  return (
    <HeroUINavbar
      maxWidth='2xl'
      position='sticky'
      isBordered
      className='z-40 px-2 py-2 border-b shadow-sm backdrop-blur-md sm:py-3 sm:px-4 bg-background/80 border-divider/50'
    >
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='gap-4 max-w-fit'>
          <NextLink
            className='flex items-center justify-start gap-3 transition-all duration-300 group'
            href='/'
          >
            <div className='relative'>
              <Logo className='w-12 h-12 transition-all duration-300 lg:w-16 lg:h-16 group-hover:drop-shadow-lg' />
              <div className='absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-br blur-xl from-primary/20 to-primary/5 group-hover:opacity-100'></div>
            </div>
            <div className='flex flex-col'>
              <p className='text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r sm:text-xl lg:text-2xl from-foreground to-foreground/80'>
                آهن هرمز
              </p>
              <p className='hidden text-xs font-medium text-default-500 sm:block'>
                قیمت روز آهن آلات
              </p>
            </div>
          </NextLink>
        </NavbarBrand>

        <Divider orientation='vertical' className='hidden h-16 mx-2 lg:block' />

        <ul className='items-center hidden gap-1 xl:flex'>
          <NavMenu />
          {siteConfig.navItems.map(item => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  'relative px-3 xl:px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300',
                  'hover:bg-primary/15 hover:text-primary',
                  'focus:outline-none',
                  'group overflow-hidden',
                )}
                href={item.href}
              >
                <span className='relative z-10'>{item.label}</span>
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className='hidden lg:flex basis-1/5 sm:basis-full'
        justify='end'
      >
        <NavbarItem className='items-center hidden gap-4 xl:gap-6 lg:flex'>
          <NavbarPhone />
          <div className='w-px h-8 bg-divider'></div>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className='lg:hidden basis-1' justify='end'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <ThemeSwitch />
          <NavbarMenuToggle
            className='min-w-0 p-2 transition-colors rounded-lg text-default-600 hover:text-primary focus:outline-none'
            aria-label='منوی موبایل'
            data-testid='mobile-menu-toggle'
          />
        </div>
      </NavbarContent>

      <NavbarMenu className='z-50 border-t backdrop-blur-xl bg-background/95 border-divider/50 max-h-[calc(100vh-64px)] overflow-y-auto pb-safe'>
        <div className='flex flex-col gap-1 px-2 pb-6 mt-3'>
          {/* لینک صفحه اصلی */}
          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/'
              size='lg'
              className='block px-4 py-3.5 w-full rounded-xl transition-all duration-300 hover:bg-primary/10 font-semibold text-base'
            >
              صفحه اصلی
            </Link>
          </NavbarMenuItem>

          {/* منوی محصولات با Accordion */}
          <NavbarMenuItem>
            <MobileProductsMenu />
          </NavbarMenuItem>

          {/* منوی وزن آهن آلات */}
          <NavbarMenuItem>
            <MobileWeightMenu />
          </NavbarMenuItem>

          <div className='h-px my-2 bg-divider/30'></div>

          {/* قیمت لحظه‌ای */}
          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/moment-news'
              size='lg'
              className='block px-4 py-3.5 w-full rounded-xl transition-all duration-300 hover:bg-primary/10 font-semibold text-base'
            >
              قیمت لحظه‌ای
            </Link>
          </NavbarMenuItem>

          <div className='h-px my-2 bg-divider/30'></div>

          {/* درباره ما */}
          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/about'
              size='lg'
              className='block px-4 py-3.5 w-full rounded-xl transition-all duration-300 hover:bg-primary/10 font-semibold text-base'
            >
              درباره ما
            </Link>
          </NavbarMenuItem>

          {/* تماس با ما */}
          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/contact'
              size='lg'
              className='block px-4 py-3.5 w-full rounded-xl transition-all duration-300 hover:bg-primary/10 font-semibold text-base'
            >
              تماس با ما
            </Link>
          </NavbarMenuItem>

          {/* اطلاعات تماس */}
          <div className='pt-4 mt-4 border-t border-divider/30'>
            <div className='px-2'>
              <p className='px-2 mb-3 text-xs font-medium text-default-500'>
                تماس با ما
              </p>
              <NavbarPhone />
            </div>
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  )
}
