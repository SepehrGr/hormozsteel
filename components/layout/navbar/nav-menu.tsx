'use client'

import { useState } from 'react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'
import { PRODUCT_NAV } from '@/types/products'

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

const triggerClass =
  'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'

/**
 * Desktop product + calculator menus — board chrome, theme tokens.
 */
export default function NavMenu() {
  const [activeSlug, setActiveSlug] = useState<string>(
    PRODUCT_NAV[0]?.name ?? 'rebar',
  )
  const activeGroup =
    PRODUCT_NAV.find(g => g.name === activeSlug) ?? PRODUCT_NAV[0]

  return (
    <div className='flex items-center gap-0.5'>
      <Menu as='div' className='relative'>
        <MenuButton className={triggerClass}>
          Products
          <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
        </MenuButton>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-150'
          enterFrom='opacity-0 translate-y-1'
          enterTo='opacity-100 translate-y-0'
          leave='transition ease-in duration-100'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-1'
        >
          <MenuItems className='absolute left-0 z-50 mt-1 flex w-[min(34rem,calc(100vw-2rem))] origin-top-left border border-border bg-border shadow-sm focus:outline-none dark:shadow-none'>
            <div className='w-44 shrink-0 bg-muted/50'>
              {PRODUCT_NAV.map(group => (
                <button
                  key={group.name}
                  type='button'
                  onMouseEnter={() => setActiveSlug(group.name)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors duration-200 ease-out ${
                    activeSlug === group.name
                      ? 'bg-card font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
                  }`}
                >
                  {group.label}
                  <ChevronRight className='h-3.5 w-3.5 opacity-40' />
                </button>
              ))}
            </div>
            <div className='max-h-80 flex-1 overflow-y-auto bg-card p-2'>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href={activeGroup.href}
                    className={`mb-1 block px-3 py-2 text-sm font-medium ${
                      focus ? 'bg-muted text-foreground' : 'text-foreground'
                    }`}
                  >
                    All {activeGroup.label}
                  </Link>
                )}
              </MenuItem>
              {activeGroup.items.map(item => (
                <MenuItem key={item.href}>
                  {({ focus }) => (
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                        focus
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>

      <Menu as='div' className='relative'>
        <MenuButton className={triggerClass}>
          Calculators
          <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
        </MenuButton>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-150'
          enterFrom='opacity-0 translate-y-1'
          enterTo='opacity-100 translate-y-0'
          leave='transition ease-in duration-100'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-1'
        >
          <MenuItems className='absolute left-0 z-50 mt-1 w-56 origin-top-left border border-border bg-card py-1 shadow-sm focus:outline-none dark:shadow-none'>
            {weightData.map(item => (
              <MenuItem key={item.href}>
                {({ focus }) => (
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                      focus
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  )
}
