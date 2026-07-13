import * as React from 'react';

import { IconSvgProps } from '@/types';

export const Logo: React.FC<IconSvgProps> = ({
  size = 36,
  width,
  height,
  ...props
}) => (
  <svg
    width="896"
    height="615"
    viewBox="0 0 896 615"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M223.323 7.62402C225.05 3.03917 229.436 0.00390625 234.335 0.00390625H309.964C318.188 0.00390625 323.875 8.22505 320.976 15.9217L98.4199 606.781C96.6929 611.366 92.3065 614.401 87.4076 614.401H11.7784C3.55466 614.401 -2.1329 606.18 0.766159 598.483L223.323 7.62402Z"
      fill="url(#paint0_linear_5_3)"
    />
    <path
      d="M347.324 7.62337C345.597 3.03885 341.211 0.00390625 336.312 0.00390625H260.666C252.442 0.00390625 246.754 8.22558 249.654 15.9223L472.25 606.782C473.977 611.366 478.363 614.401 483.262 614.401H558.908C567.132 614.401 572.82 606.179 569.92 598.483L347.324 7.62337Z"
      fill="url(#paint1_linear_5_3)"
    />
    <path
      d="M343.609 354.28C341.883 349.694 337.496 346.658 332.596 346.658H256.954C248.732 346.658 243.044 354.877 245.941 362.573L337.871 606.779C339.597 611.365 343.984 614.401 348.884 614.401H424.526C432.749 614.401 438.436 606.182 435.539 598.485L343.609 354.28Z"
      fill="url(#paint2_linear_5_3)"
    />
    <path
      d="M259.614 503.746C257.888 499.16 253.501 496.123 248.601 496.123H172.991C164.768 496.123 159.081 504.342 161.977 512.038L197.633 606.778C199.359 611.364 203.747 614.401 208.647 614.401H284.257C292.479 614.401 298.166 606.182 295.27 598.486L259.614 503.746Z"
      fill="url(#paint3_linear_5_3)"
    />
    <path
      d="M672.917 9.33698C671.192 4.74776 666.804 1.7085 661.902 1.7085H586.268C578.048 1.7085 572.361 9.92263 575.253 17.6179L796.656 606.771C798.38 611.36 802.769 614.399 807.671 614.399H883.305C891.525 614.399 897.212 606.185 894.32 598.49L672.917 9.33698Z"
      fill="url(#paint4_linear_5_3)"
    />
    <path
      d="M416 261.494C416 254.995 421.269 249.725 427.768 249.725H735.257C741.756 249.725 747.025 254.995 747.025 261.494V331.285C747.025 337.785 741.756 343.054 735.257 343.054H427.768C421.269 343.054 416 337.785 416 331.285V261.494Z"
      fill="url(#paint5_linear_5_3)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_5_3"
        x1="448"
        y1="-2.65106e-09"
        x2="448.06"
        y2="614"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5EA2EF" />
        <stop offset="1" stopColor="#0072F5" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_5_3"
        x1="448"
        y1="-2.65106e-09"
        x2="448.06"
        y2="614"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5EA2EF" />
        <stop offset="1" stopColor="#0072F5" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_5_3"
        x1="448"
        y1="-2.65106e-09"
        x2="448.06"
        y2="614"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5EA2EF" />
        <stop offset="1" stopColor="#0072F5" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_5_3"
        x1="448"
        y1="-2.65106e-09"
        x2="448.06"
        y2="614"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5EA2EF" />
        <stop offset="1" stopColor="#0072F5" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_5_3"
        x1="448"
        y1="-2.65106e-09"
        x2="448.06"
        y2="614"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5EA2EF" />
        <stop offset="1" stopColor="#0072F5" />
      </linearGradient>
      <linearGradient
        id="paint5_linear_5_3"
        x1="448"
        y1="-2.65106e-09"
        x2="448.06"
        y2="614"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5EA2EF" />
        <stop offset="1" stopColor="#0072F5" />
      </linearGradient>
    </defs>
  </svg>
);

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const ShamshIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <rect
      x="4"
      y="6"
      width="16"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <rect
      x="6"
      y="8"
      width="12"
      height="2"
      fill="currentColor"
      fillOpacity="0.3"
    />
    <rect
      x="6"
      y="11"
      width="12"
      height="2"
      fill="currentColor"
      fillOpacity="0.3"
    />
    <rect
      x="6"
      y="14"
      width="12"
      height="2"
      fill="currentColor"
      fillOpacity="0.3"
    />
  </svg>
);

export const QootiIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
);

export const WireIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M3 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M15 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M9 12h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 8l12 8"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M6 16l12-8"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export const MeshIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <g stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h18M3 12h18M3 16h18" />
      <path d="M8 3v18M12 3v18M16 3v18" />
    </g>
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
    <circle cx="16" cy="8" r="1" fill="currentColor" />
    <circle cx="8" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="16" cy="12" r="1" fill="currentColor" />
    <circle cx="8" cy="16" r="1" fill="currentColor" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
    <circle cx="16" cy="16" r="1" fill="currentColor" />
  </svg>
);

export const RawMaterialIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" fillOpacity="0.7" />
    <circle cx="16" cy="8" r="1" fill="currentColor" fillOpacity="0.5" />
    <circle cx="14" cy="14" r="1.5" fill="currentColor" fillOpacity="0.8" />
    <circle cx="9" cy="16" r="1" fill="currentColor" fillOpacity="0.6" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);
