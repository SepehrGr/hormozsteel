'use client'

import React, { useState } from 'react'
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

export default function NavMenu() {
  const [activeSlug, setActiveSlug] = useState<string>(PRODUCT_NAV[0]?.name ?? 'rebar')
  const activeGroup =
    PRODUCT_NAV.find(g => g.name === activeSlug) ?? PRODUCT_NAV[0]

  return (
    <div className='flex items-center gap-1'>
      <Menu as='div' className='relative'>
        <MenuButton className='inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-primary/15 hover:text-primary xl:px-4'>
          Products
          <ChevronDown className='h-4 w-4' />
        </MenuButton>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <MenuItems className='absolute left-0 z-50 mt-2 flex w-[520px] origin-top-left overflow-hidden rounded-xl border border-border bg-background shadow-lg focus:outline-none'>
            <div className='w-44 border-r border-border bg-muted/40 py-2'>
              {PRODUCT_NAV.map(group => (
                <button
                  key={group.name}
                  type='button'
                  onMouseEnter={() => setActiveSlug(group.name)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    activeSlug === group.name
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {group.label}
                  <ChevronRight className='h-3.5 w-3.5 opacity-50' />
                </button>
              ))}
            </div>
            <div className='max-h-80 flex-1 overflow-y-auto p-3'>
              <Link
                href={activeGroup.href}
                className='mb-2 block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-muted'
              >
                All {activeGroup.label}
              </Link>
              {activeGroup.items.map(item => (
                <MenuItem key={item.href}>
                  {({ focus }) => (
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-sm ${
                        focus ? 'bg-muted text-foreground' : 'text-muted-foreground'
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
        <MenuButton className='inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-primary/15 hover:text-primary xl:px-4'>
          Calculators
          <ChevronDown className='h-4 w-4' />
        </MenuButton>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <MenuItems className='absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-xl border border-border bg-background py-2 shadow-lg focus:outline-none'>
            {weightData.map(item => (
              <MenuItem key={item.href}>
                {({ focus }) => (
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 text-sm ${
                      focus ? 'bg-muted text-foreground' : 'text-muted-foreground'
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
