import type { ReactNode } from 'react'

/**
 * Hairline cross-sections of the families we quote — the same shapes a buyer
 * reads off a mill section chart. Drawn rather than photographed so the
 * coverage grid stays on the board grid instead of turning into a gallery.
 */
export type SteelProfile = 'rebar' | 'coil' | 'beam' | 'pipe' | 'angle' | 'mesh'

/** Radial rib ticks around the bar, as marked on a ribbed-section drawing. */
const RIBS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i * Math.PI) / 8
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  return {
    id: i,
    x1: 24 + 9.5 * cos,
    y1: 24 + 9.5 * sin,
    x2: 24 + 13 * cos,
    y2: 24 + 13 * sin,
  }
})

/** Archimedean spiral, r = 1.9 + 0.72θ over 2.5 turns — coil seen end-on. */
const COIL_PATH =
  'M 25.9 24.0 L 26.0 24.5 L 26.0 25.1 L 25.7 25.7 L 25.3 26.3 L 24.7 26.7 L 24.0 27.0 L 23.2 27.1 L 22.3 27.0 L 21.5 26.5 L 20.7 25.9 L 20.2 25.0 L 19.8 24.0 L 19.8 22.9 L 20.1 21.7 L 20.7 20.7 L 21.5 19.7 L 22.7 19.1 L 24.0 18.7 L 25.4 18.7 L 26.8 19.1 L 28.1 19.9 L 29.2 21.0 L 30.0 22.4 L 30.4 24.0 L 30.4 25.7 L 29.9 27.4 L 28.9 28.9 L 27.6 30.2 L 25.9 31.1 L 24.0 31.6 L 22.0 31.5 L 20.0 30.9 L 18.3 29.7 L 16.8 28.2 L 15.8 26.2 L 15.3 24.0 L 15.4 21.7 L 16.2 19.5 L 17.5 17.5 L 19.3 15.8 L 21.5 14.7 L 24.0 14.2 L 26.6 14.3 L 29.1 15.2 L 31.3 16.7 L 33.2 18.7 L 34.4 21.2 L 34.9 24.0 L 34.8 26.9 L 33.8 29.7 L 32.1 32.1 L 29.9 34.1 L 27.1 35.5 L 24.0 36.1 L 20.8 35.8 L 17.8 34.8 L 15.1 32.9 L 12.9 30.4 L 11.4 27.4 L 10.8 24.0'

/** I-section: 28 mm across the flanges, 5 mm web. */
const BEAM_PATH =
  'M 10 10 H 38 V 15 H 26.5 V 33 H 38 V 38 H 10 V 33 H 21.5 V 15 H 10 Z'

/** Equal angle, 5 mm legs. */
const ANGLE_PATH = 'M 12 10 H 17 V 33 H 36 V 38 H 12 Z'

const SHAPES: Record<SteelProfile, ReactNode> = {
  rebar: (
    <>
      <circle cx={24} cy={24} r={9.5} />
      {RIBS.map(rib => (
        <line key={rib.id} x1={rib.x1} x2={rib.x2} y1={rib.y1} y2={rib.y2} />
      ))}
    </>
  ),
  coil: <path d={COIL_PATH} />,
  beam: <path d={BEAM_PATH} />,
  pipe: (
    <>
      <circle cx={24} cy={24} r={13} />
      <circle cx={24} cy={24} r={10.5} />
    </>
  ),
  angle: <path d={ANGLE_PATH} />,
  mesh: (
    <>
      <path d='M 10 10 H 38 V 38 H 10 Z' />
      <path d='M 19.3 10 V 38 M 28.7 10 V 38 M 10 19.3 H 38 M 10 28.7 H 38' />
    </>
  ),
}

interface SteelProfileMarkProps {
  className?: string
  profile: SteelProfile
}

/** Decorative section drawing — the adjacent product name carries the meaning. */
export function SteelProfileMark({
  className,
  profile,
}: SteelProfileMarkProps) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      viewBox='0 0 48 48'
    >
      {SHAPES[profile]}
    </svg>
  )
}
