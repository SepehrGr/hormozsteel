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
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import NavbarPhone from './navbar-phone'
import NavMenu from './nav-menu'

import { siteConfig } from '@/config/site'
import { PRODUCT_NAV } from '@/types/products'
import { ThemeSwitch } from '@/components/layout/theme-switch'
import { Logo } from '@/components/icons'

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

const mobileLinkClass =
  'block w-full pl-8 py-3 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground'

const mobileTopLinkClass =
  'block w-full px-4 py-3.5 font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted'

function MobileAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className=''>
      <button
        aria-expanded={open}
        className='flex border-b sticky top-0 bg-background w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted'
        type='button'
        onClick={() => setOpen(v => !v)}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className='bg-muted/50 pb-1'>{children}</div>}
    </div>
  )
}

export const Navbar = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <HeroUINavbar
      className='z-40 border-b border-border bg-background px-0 py-2'
      classNames={{
        wrapper: 'mx-auto w-full max-w-7xl gap-4 px-4 md:px-6',
        item: 'data-[active=true]:font-medium',
        menu: 'z-50 border-t border-border bg-background px-0 pt-0',
      }}
      height='3.5rem'
      isBordered={false}
      isMenuOpen={isMenuOpen}
      maxWidth='2xl'
      position='sticky'
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className='basis-full' justify='start'>
        <NavbarBrand as='li' className='max-w-fit gap-0'>
          <NextLink
            className='flex items-center gap-2.5 text-foreground transition-opacity duration-200 ease-out hover:opacity-80'
            href='/'
            onClick={closeMenu}
          >
            <Logo className='w-10 md:w-11 h-10 md:h-11' />
            <span className='flex flex-col leading-none'>
              <span className='hidden md:block font-semibold tracking-tight sm:text-[1.15rem]'>
                {siteConfig.name}
              </span>
            </span>
          </NextLink>
        </NavbarBrand>

        <ul className='ml-2 hidden items-center gap-0.5 border-l border-border pl-3 lg:flex'>
          <NavMenu />
          {siteConfig.navItems.map(item => (
            <NavbarItem key={item.href}>
              <NextLink
                className='px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className='hidden basis-auto lg:flex' justify='end'>
        <NavbarItem className='flex items-center gap-3'>
          <NavbarPhone />
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className='basis-auto lg:hidden' justify='end'>
        <ThemeSwitch />
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='h-8 w-8 min-w-8 cursor-pointer rounded-none border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted'
        />
      </NavbarContent>

      <NavbarMenu className='mt-4'>
        <div className='mx-auto w-full max-w-7xl overflow-y-auto bg-background'>
          <NavbarMenuItem className='list-none p-0'>
            <MobileAccordion title='Products'>
              <NextLink
                className='block w-full border-b border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted'
                href='/products'
                onClick={closeMenu}
              >
                Full catalog
              </NextLink>
              {PRODUCT_NAV.map(group => (
                <div
                  key={group.name}
                  className='border-b border-border/60 last:border-b-0'
                >
                  <NextLink
                    className='block px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted'
                    href={group.href}
                    onClick={closeMenu}
                  >
                    All {group.label}
                  </NextLink>
                  <div className='pb-1'>
                    {group.items.map(item => (
                      <NextLink
                        key={item.href}
                        className={mobileLinkClass}
                        href={item.href}
                        onClick={closeMenu}
                      >
                        {item.label}
                      </NextLink>
                    ))}
                  </div>
                </div>
              ))}
            </MobileAccordion>
          </NavbarMenuItem>

          <NavbarMenuItem className='list-none p-0'>
            <MobileAccordion title='Calculators'>
              {weightData.map(item => (
                <NextLink
                  key={item.href}
                  className={mobileLinkClass}
                  href={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </NextLink>
              ))}
            </MobileAccordion>
          </NavbarMenuItem>

          {siteConfig.navMenuItems
            .filter(item => item.href !== '/')
            .map(item => (
              <NavbarMenuItem
                key={item.href}
                className='list-none border-b border-border p-0'
              >
                <NextLink
                  className={mobileTopLinkClass}
                  href={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            ))}

          <div className='px-4 py-4'>
            <NextLink
              className='inline-flex w-full cursor-pointer items-center justify-center bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
              href='/contact'
              onClick={closeMenu}
            >
              Request a quote
            </NextLink>
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  )
}
