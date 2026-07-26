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
import { siteConfig } from '@/config/site'
import { PRODUCT_NAV } from '@/types/products'
import { ThemeSwitch } from '@/components/layout/theme-switch'
import { Logo } from '@/components/icons'
import NavbarPhone from './navbar-phone'
import NavMenu from './nav-menu'

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
        type='button'
        onClick={() => setOpen(v => !v)}
        className='flex border-b sticky top-0 bg-background w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted'
        aria-expanded={open}
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
      maxWidth='2xl'
      position='sticky'
      isBordered={false}
      height='3.5rem'
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className='z-40 border-b border-border bg-background px-0 py-2'
      classNames={{
        wrapper: 'mx-auto w-full max-w-7xl gap-4 px-4 md:px-6',
        item: 'data-[active=true]:font-medium',
        menu: 'z-50 border-t border-border bg-background px-0 pt-0',
      }}
    >
      <NavbarContent className='basis-full' justify='start'>
        <NavbarBrand as='li' className='max-w-fit gap-0'>
          <NextLink
            href='/'
            onClick={closeMenu}
            className='flex items-center gap-2.5 text-foreground transition-opacity duration-200 ease-out hover:opacity-80'
          >
            <Logo className='h-8 w-8' />
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
                href={item.href}
                className='px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
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
          className='h-8 w-8 min-w-8 cursor-pointer rounded-none border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted'
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        />
      </NavbarContent>

      <NavbarMenu className='mt-4'>
        <div className='mx-auto w-full max-w-7xl overflow-y-auto bg-background'>
          <NavbarMenuItem className='list-none p-0'>
            <MobileAccordion title='Products'>
              {PRODUCT_NAV.map(group => (
                <div
                  key={group.name}
                  className='border-b border-border/60 last:border-b-0'
                >
                  <NextLink
                    href={group.href}
                    onClick={closeMenu}
                    className='block px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted'
                  >
                    All {group.label}
                  </NextLink>
                  <div className='pb-1'>
                    {group.items.map(item => (
                      <NextLink
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={mobileLinkClass}
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
                  href={item.href}
                  onClick={closeMenu}
                  className={mobileLinkClass}
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
                  href={item.href}
                  onClick={closeMenu}
                  className={mobileTopLinkClass}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            ))}

          <div className='px-4 py-4'>
            <NextLink
              href='/contact'
              onClick={closeMenu}
              className='inline-flex w-full cursor-pointer items-center justify-center bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            >
              Request a quote
            </NextLink>
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  )
}
