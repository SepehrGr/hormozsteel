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

const productsData: Record<
  string,
  Array<{ href: string; label: string }>
> = {
  Rebar: [
    { href: '/products/rebar/milgerd-ajdar', label: 'Ribbed rebar' },
    { href: '/products/rebar/milgerd-sade', label: 'Plain rebar' },
    { href: '/products/rebar/milgerd-kolaf', label: 'Coil rebar' },
    { href: '/products/rebar/milgerd-harati', label: 'Thermal rebar' },
    { href: '/products/rebar/milgerd-bastar', label: 'Bed rebar' },
    { href: '/products/rebar/milgerd-trans', label: 'Trans rebar' },
    { href: '/products/rebar/milgerd-steel', label: 'Stainless rebar' },
  ],
  Profiles: [
    { href: '/products/profile/profile-sakhtmani', label: 'Structural' },
    { href: '/products/profile/profile-kongre', label: 'Corrugated' },
    { href: '/products/profile/profile-sanati', label: 'Industrial' },
    { href: '/products/profile/profile-z', label: 'Z profile' },
    { href: '/products/profile/profile-galvanize', label: 'Galvanized' },
    { href: '/products/profile/profile-sabk', label: 'Light' },
    { href: '/products/profile/profile-steel', label: 'Stainless' },
    { href: '/products/profile/profile-aluminum', label: 'Aluminum' },
    { href: '/products/profile/profile-upe', label: 'UPE' },
    { href: '/products/profile/profile-ipe', label: 'IPE' },
    { href: '/products/profile/profile-hea', label: 'HEA' },
    { href: '/products/profile/profile-heb', label: 'HEB' },
  ],
  Sheets: [
    { href: '/products/sheet/varagh-garm', label: 'Hot-rolled' },
    { href: '/products/sheet/varagh-siah', label: 'Black sheet' },
    { href: '/products/sheet/varagh-sard', label: 'Cold-rolled' },
    { href: '/products/sheet/varagh-galvanize', label: 'Galvanized' },
    { href: '/products/sheet/varagh-rangi', label: 'Color-coated' },
    { href: '/products/sheet/varagh-steel', label: 'Stainless' },
    { href: '/products/sheet/varagh-aluminum', label: 'Aluminum' },
    { href: '/products/sheet/varagh-mes', label: 'Copper' },
  ],
  'Angles & channels': [
    { href: '/products/angle/nabshi', label: 'Angle bar' },
    { href: '/products/angle/navodani', label: 'Channel' },
    { href: '/products/angle/separi', label: 'T-bar' },
    { href: '/products/angle/nabshi-galvanize', label: 'Galvanized angle' },
  ],
  Beams: [
    { href: '/products/beam/tirahan', label: 'I-beam' },
    { href: '/products/beam/hash', label: 'H-beam' },
    { href: '/products/beam/lane-zanbori', label: 'Castellated' },
    { href: '/products/beam/rail', label: 'Rail' },
    { href: '/products/beam/tirahan-sangin', label: 'Heavy beam' },
    { href: '/products/beam/tirahan-sabk', label: 'Light beam' },
  ],
  Pipes: [
    { href: '/products/pipe/lole-darzdar', label: 'Seamed' },
    { href: '/products/pipe/lole-bedone-darz', label: 'Seamless' },
    { href: '/products/pipe/lole-galvanize', label: 'Galvanized' },
    { href: '/products/pipe/lole-steel', label: 'Stainless' },
    { href: '/products/pipe/lole-mes', label: 'Copper' },
    { href: '/products/pipe/lole-aluminum', label: 'Aluminum' },
    { href: '/products/pipe/lole-polyethylene', label: 'PE' },
    { href: '/products/pipe/lole-pvc', label: 'PVC' },
  ],
  Wire: [
    { href: '/products/wire/sim-siah', label: 'Black wire' },
    { href: '/products/wire/sim-galvanize', label: 'Galvanized' },
    { href: '/products/wire/sim-khardar', label: 'Barbed wire' },
    { href: '/products/wire/kabel', label: 'Cable' },
  ],
  Mesh: [
    { href: '/products/mesh/tori-hesari', label: 'Fence mesh' },
    { href: '/products/mesh/tori-joshi', label: 'Welded mesh' },
    { href: '/products/mesh/tori-galvanize', label: 'Galvanized' },
    { href: '/products/mesh/tori-plastic', label: 'Plastic mesh' },
  ],
  Billets: [
    { href: '/products/shamsh/shamsh-folad', label: 'Steel billet' },
    { href: '/products/shamsh/shamsh-aliaazhi', label: 'Alloy billet' },
  ],
}

export default function NavMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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
              {Object.keys(productsData).map(category => (
                <button
                  key={category}
                  type='button'
                  onMouseEnter={() => setActiveCategory(category)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    activeCategory === category
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                  <ChevronRight className='h-3.5 w-3.5 opacity-50' />
                </button>
              ))}
            </div>
            <div className='max-h-80 flex-1 overflow-y-auto p-3'>
              {(productsData[activeCategory ?? Object.keys(productsData)[0]] ??
                []
              ).map(item => (
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
