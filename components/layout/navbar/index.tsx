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
import { PRODUCT_NAV } from '@/types/products'
import { ThemeSwitch } from '@/components/layout/theme-switch'
import { SearchIcon, Logo } from '@/components/icons'
import { Divider } from '@heroui/divider'
import NavbarPhone from './navbar-phone'
import NavMenu from './nav-menu'

/** Mobile products menu — same slugs as PRODUCT_NAV / catalog. */
const mobileProductsData = PRODUCT_NAV.map(group => ({
  title: group.label,
  icon: group.icon,
  items: [
    ...group.items.map(item => ({ href: item.href, label: item.label })),
    { href: group.href, label: 'View all' },
  ],
}))

const weightData = [
  { href: '/weight/beam', label: 'Beam weight' },
  { href: '/weight/rebar', label: 'Rebar weight' },
  { href: '/weight/billet', label: 'Billet weight' },
  { href: '/weight/pipe', label: 'Pipe weight' },
  { href: '/weight/stud', label: 'Channel weight' },
  { href: '/weight/angle', label: 'Angle weight' },
  { href: '/weight/square-tube', label: 'Square tube weight' },
  { href: '/weight/sheet', label: 'Sheet weight' },
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
        <span className='flex items-center gap-3 text-base'>Products</span>
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
          Weight calculators
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
        <div className='mt-1 ml-7 space-y-0.5'>
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
      placeholder='Search products...'
    />
  )

  return (
    <HeroUINavbar
      maxWidth='2xl'
      position='sticky'
      isBordered
      className='z-40 border-b border-border/60 bg-background/80 px-2 py-2 shadow-sm backdrop-blur-md sm:px-4 sm:py-3'
    >
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='max-w-fit gap-4'>
          <NextLink
            className='group flex items-center justify-start gap-3 transition-all duration-300'
            href='/'
          >
            <div className='relative'>
              <Logo className='h-10 w-10 transition-all duration-300 lg:h-12 lg:w-12' />
            </div>
            <div className='flex flex-col'>
              <p className='text-lg font-semibold tracking-tight text-foreground sm:text-xl'>
                Hormoz Steel
              </p>
              <p className='hidden text-xs font-medium text-default-500 sm:block'>
                Steel pricing catalog
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
            aria-label='Open menu'
            data-testid='mobile-menu-toggle'
          />
        </div>
      </NavbarContent>

      <NavbarMenu className='z-50 border-t backdrop-blur-xl bg-background/95 border-divider/50 max-h-[calc(100vh-64px)] overflow-y-auto pb-safe'>
        <div className='flex flex-col gap-1 px-2 pb-6 mt-3'>
          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/'
              size='lg'
              className='block w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-300 hover:bg-primary/10'
            >
              Home
            </Link>
          </NavbarMenuItem>

          <NavbarMenuItem>
            <MobileProductsMenu />
          </NavbarMenuItem>

          <NavbarMenuItem>
            <MobileWeightMenu />
          </NavbarMenuItem>

          <div className='my-2 h-px bg-divider/30'></div>

          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/moment-news'
              size='lg'
              className='block px-4 py-3.5 w-full rounded-xl transition-all duration-300 hover:bg-primary/10 font-semibold text-base'
            >
              Live prices
            </Link>
          </NavbarMenuItem>

          <div className='my-2 h-px bg-divider/30'></div>

          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/about'
              size='lg'
              className='block w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-300 hover:bg-primary/10'
            >
              About
            </Link>
          </NavbarMenuItem>

          <NavbarMenuItem>
            <Link
              color={'foreground'}
              href='/contact'
              size='lg'
              className='block w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-300 hover:bg-primary/10'
            >
              Contact
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  )
}
