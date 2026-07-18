import * as React from 'react'

import { IconSvgProps } from '@/types'

export const Logo: React.FC<IconSvgProps> = ({
  size = 36,
  width,
  height,
  ...props
}) => (
  <svg
    width='50'
    height='50'
    viewBox='0 0 996 911'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M20.5 890.5V20.5H190.5V116V291V890.5H20.5Z'
      stroke='#FE9A00'
      strokeWidth='41'
    />
    <path
      d='M805.5 20.5H975.5V890.5H805.5V291V116V20.5Z'
      stroke='#FE9A00'
      strokeWidth='41'
    />
    <path
      d='M786.5 292.5L455.5 292.5M208.5 122.5L786.5 122.5'
      stroke='#FE9A00'
      strokeWidth='41'
    />
    <path
      d='M191.502 261.898L509.101 579.498L523 564M804.502 634.894L617.835 448.227L469.106 299.498'
      stroke='#FE9A00'
      strokeWidth='41'
    />
    <path
      d='M786.5 598L786.5 770.5L201 768L201 598L538.5 598'
      stroke='#FE9A00'
      strokeWidth='41'
    />
  </svg>
)

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden='true'
    focusable='false'
    height={size || height}
    role='presentation'
    viewBox='0 0 24 24'
    width={size || width}
    {...props}
  >
    <path
      d='M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z'
      fill='currentColor'
    />
  </svg>
)

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden='true'
    focusable='false'
    height={size || height}
    role='presentation'
    viewBox='0 0 24 24'
    width={size || width}
    {...props}
  >
    <g fill='currentColor'>
      <path d='M19 12a7 7 0 11-7-7 7 7 0 017 7z' />
      <path d='M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z' />
    </g>
  </svg>
)

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
    />
    <path
      d='M22 22L20 20'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
    />
  </svg>
)

export const ShamshIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <rect
      x='4'
      y='6'
      width='16'
      height='12'
      rx='2'
      stroke='currentColor'
      strokeWidth='2'
      fill='currentColor'
      fillOpacity='0.1'
    />
    <rect
      x='6'
      y='8'
      width='12'
      height='2'
      fill='currentColor'
      fillOpacity='0.3'
    />
    <rect
      x='6'
      y='11'
      width='12'
      height='2'
      fill='currentColor'
      fillOpacity='0.3'
    />
    <rect
      x='6'
      y='14'
      width='12'
      height='2'
      fill='currentColor'
      fillOpacity='0.3'
    />
  </svg>
)

export const QootiIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='2'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
    />
    <rect
      x='5'
      y='5'
      width='14'
      height='14'
      stroke='currentColor'
      strokeWidth='1.5'
      fill='currentColor'
      fillOpacity='0.1'
    />
  </svg>
)

export const WireIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='M3 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z'
      stroke='currentColor'
      strokeWidth='2'
      fill='currentColor'
      fillOpacity='0.2'
    />
    <path
      d='M15 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z'
      stroke='currentColor'
      strokeWidth='2'
      fill='currentColor'
      fillOpacity='0.2'
    />
    <path
      d='M9 12h6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <path
      d='M6 8l12 8'
      stroke='currentColor'
      strokeWidth='1'
      strokeLinecap='round'
      opacity='0.5'
    />
    <path
      d='M6 16l12-8'
      stroke='currentColor'
      strokeWidth='1'
      strokeLinecap='round'
      opacity='0.5'
    />
  </svg>
)

export const MeshIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <g stroke='currentColor' strokeWidth='1.5'>
      <path d='M3 8h18M3 12h18M3 16h18' />
      <path d='M8 3v18M12 3v18M16 3v18' />
    </g>
    <circle cx='8' cy='8' r='1' fill='currentColor' />
    <circle cx='12' cy='8' r='1' fill='currentColor' />
    <circle cx='16' cy='8' r='1' fill='currentColor' />
    <circle cx='8' cy='12' r='1' fill='currentColor' />
    <circle cx='12' cy='12' r='1' fill='currentColor' />
    <circle cx='16' cy='12' r='1' fill='currentColor' />
    <circle cx='8' cy='16' r='1' fill='currentColor' />
    <circle cx='12' cy='16' r='1' fill='currentColor' />
    <circle cx='16' cy='16' r='1' fill='currentColor' />
  </svg>
)

export const RawMaterialIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <circle
      cx='12'
      cy='12'
      r='8'
      stroke='currentColor'
      strokeWidth='2'
      fill='currentColor'
      fillOpacity='0.1'
    />
    <circle cx='8' cy='10' r='1.5' fill='currentColor' fillOpacity='0.7' />
    <circle cx='16' cy='8' r='1' fill='currentColor' fillOpacity='0.5' />
    <circle cx='14' cy='14' r='1.5' fill='currentColor' fillOpacity='0.8' />
    <circle cx='9' cy='16' r='1' fill='currentColor' fillOpacity='0.6' />
    <circle cx='12' cy='12' r='0.8' fill='currentColor' />
  </svg>
)
