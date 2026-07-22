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
import { useState } from 'react'
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

const mobileNavLinkClass =
  'block w-full px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'

function MobileAccordion({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className='border-b border-border'>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? (
        <div className='border-t border-border bg-muted/30 pb-2'>
          {children}
        </div>
      ) : null}
    </div>
  )
}

function MobileCategoryBlock({
  title,
  href,
  items,
}: {
  title: string
  href: string
  items: Array<{ href: string; label: string }>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='flex w-full items-center justify-between px-3 py-2 text-left text-sm text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground'
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? (
        <div className='pb-1 pl-3'>
          <NextLink
            href={href}
            className='block px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted'
          >
            All {title}
          </NextLink>
          {items.map(item => (
            <NextLink
              key={item.href}
              href={item.href}
              className='block px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground'
            >
              {item.label}
            </NextLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const Navbar = () => {
  return (
    <HeroUINavbar
      maxWidth='2xl'
      position='sticky'
      isBordered={false}
      height='3.5rem'
      className='z-40 border-b border-border bg-background px-0 py-2'
      classNames={{
        wrapper: 'mx-auto w-full max-w-7xl gap-4 px-4 md:px-6',
        item: 'data-[active=true]:font-medium',
      }}
    >
      <NavbarContent className='basis-full' justify='start'>
        <NavbarBrand as='li' className='max-w-fit gap-0'>
          <NextLink
            href='/'
            className='flex items-center gap-2.5 text-foreground transition-opacity duration-200 ease-out hover:opacity-80'
          >
            <Logo className='h-8 w-8' />
            <span className='flex flex-col leading-none'>
              <span className='text-sm font-semibold tracking-tight sm:text-[1.15rem]'>
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
          className='h-8 w-8 min-w-8 border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted data-[open=true]:bg-muted'
          aria-label='Toggle menu'
        />
      </NavbarContent>

      <NavbarMenu className='z-50 border-t border-border bg-background px-0 pt-0'>
        <div className='mx-auto w-full max-w-7xl border-x border-border bg-card'>
          <NavbarMenuItem>
            <NextLink href='/' className={mobileNavLinkClass}>
              Home
            </NextLink>
          </NavbarMenuItem>

          <NavbarMenuItem className='p-0'>
            <MobileAccordion title='Products'>
              {PRODUCT_NAV.map(group => (
                <MobileCategoryBlock
                  key={group.name}
                  title={group.label}
                  href={group.href}
                  items={group.items}
                />
              ))}
            </MobileAccordion>
          </NavbarMenuItem>

          <NavbarMenuItem className='p-0'>
            <MobileAccordion title='Calculators'>
              {weightData.map(item => (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className='block px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground'
                >
                  {item.label}
                </NextLink>
              ))}
            </MobileAccordion>
          </NavbarMenuItem>

          {siteConfig.navMenuItems
            .filter(item => item.href !== '/')
            .map(item => (
              <NavbarMenuItem key={item.href}>
                <NextLink href={item.href} className={mobileNavLinkClass}>
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            ))}

          <div className='border-t border-border px-3 py-4'>
            <NextLink
              href='/contact'
              className='inline-flex w-full items-center justify-center bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            >
              Request a quote
            </NextLink>
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  )
}
