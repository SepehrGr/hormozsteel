import type { ReactNode } from 'react'

/** Every drawing shares this 480×450 viewBox, the shape sitting around (CX, CY). */
const CX = 240
const CY = 220
const CYCLE = 35

const f = (n: number) => n.toFixed(1)

const polar = (r: number, a: number) =>
  `${f(CX + r * Math.cos(a))} ${f(CY + r * Math.sin(a))}`

/** A horizontal dimension: extension lines down from `from`, the line at `y`, open arrowheads. */
const hDim = (x1: number, x2: number, y: number, from: number) =>
  `M${x1} ${from + 6} V${y + 8} M${x2} ${from + 6} V${y + 8} M${x1} ${y} H${x2} ` +
  `M${x1 + 9} ${y - 4} L${x1} ${y} L${x1 + 9} ${y + 4} M${x2 - 9} ${y - 4} L${x2} ${y} L${x2 - 9} ${y + 4}`

/** The vertical twin of hDim: extension lines left from `from`, the line at `x`. */
const vDim = (y1: number, y2: number, x: number, from: number) =>
  `M${from - 6} ${y1} H${x - 8} M${from - 6} ${y2} H${x - 8} M${x} ${y1} V${y2} ` +
  `M${x - 4} ${y1 + 9} L${x} ${y1} L${x + 4} ${y1 + 9} M${x - 4} ${y2 - 9} L${x} ${y2} L${x + 4} ${y2 - 9}`

/** Transverse ribs as short ticks round the core, skipping the two longitudinal ribs. */
const ribTicks = Array.from({ length: 28 }, (_, k) => (k * 2 * Math.PI) / 28)
  .filter(a => Math.abs(Math.sin(a)) > 0.3)
  .map(a => `M${polar(100, a)} L${polar(110, a)}`)
  .join(' ')

/** The coil's strip as one Archimedean spiral from the eye to the outer wrap. */
const coilSpiral = (() => {
  const turns = 11
  const steps = turns * 60
  let d = ''

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * 2 * Math.PI - Math.PI / 2

    d += `${i ? 'L' : 'M'}${polar(62 + 86 * t, a)} `
  }

  return d
})()

const IPE =
  'M165 70 H315 V80.7 H262 A15 15 0 0 0 247 95.7 V344.3 A15 15 0 0 0 262 359.3 H315 V370 ' +
  'H165 V359.3 H218 A15 15 0 0 0 233 344.3 V95.7 A15 15 0 0 0 218 80.7 H165 Z'

const ANGLE =
  'M110 90 H120 A16 16 0 0 1 136 106 V293 A31 31 0 0 0 167 324 H354 A16 16 0 0 1 370 340 V350 H110 Z'

const ring = (r: number) =>
  `M${CX - r} ${CY} A${r} ${r} 0 1 0 ${CX + r} ${CY} A${r} ${r} 0 1 0 ${CX - r} ${CY} Z`

function Label({
  x = CX,
  y,
  title,
  anchor = 'middle',
  children,
}: {
  x?: number
  y: number
  title?: boolean
  anchor?: 'start' | 'middle' | 'end'
  children: ReactNode
}) {
  return (
    <text
      className={title ? 'hero-label hero-title' : 'hero-label'}
      textAnchor={anchor}
      x={x}
      y={y}
    >
      {children}
    </text>
  )
}

const PROFILES: ReactNode[] = [
  <>
    <path className='hero-hatch' d={ring(100)} />
    <circle className='hero-ink' cx={CX} cy={CY} pathLength='1' r='100' />
    <path
      className='hero-fine'
      d={`${ribTicks} M${CX + 100} ${CY - 14} Q${CX + 124} ${CY} ${CX + 100} ${CY + 14} M${CX - 100} ${CY - 14} Q${CX - 124} ${CY} ${CX - 100} ${CY + 14}`}
      pathLength='1'
    />
    <path className='hero-dim' d={hDim(140, 340, 392, CY)} pathLength='1' />
    <Label title y={44}>
      REBAR A3 · RIBBED
    </Label>
    <Label y={422}>d 18</Label>
  </>,
  <>
    <path className='hero-hatch' d={IPE} />
    <path className='hero-ink' d={IPE} pathLength='1' />
    <path className='hero-fine' d='M247 150 H300' pathLength='1' />
    <path className='hero-dim' d={vDim(70, 370, 126, 165)} pathLength='1' />
    <path className='hero-dim' d={hDim(165, 315, 400, 370)} pathLength='1' />
    <Label title y={44}>
      IPE 300 · S235
    </Label>
    <Label anchor='start' x={306} y={154}>
      tw 7.1
    </Label>
    <Label anchor='end' x={114} y={224}>
      h 300
    </Label>
    <Label y={430}>b 150</Label>
  </>,
  <>
    <path className='hero-ink' d={`${ring(150)} ${ring(60)}`} pathLength='1' />
    <path className='hero-fine' d={coilSpiral} pathLength='1' />
    <path
      className='hero-fine'
      d={`M${polar(60, -1.95)} L${polar(150, -1.95)} M${polar(60, -1.85)} L${polar(150, -1.85)} M${polar(60, 1.19)} L${polar(150, 1.19)} M${polar(60, 1.29)} L${polar(150, 1.29)}`}
      pathLength='1'
    />
    <path
      className='hero-dim'
      d={`${hDim(90, 390, 404, CY)} M${polar(60, -0.6)} L338 112 H376`}
      pathLength='1'
    />
    <Label title y={44}>
      HRC COIL · 1250 WIDE
    </Label>
    <Label anchor='start' x={342} y={104}>
      ID 610
    </Label>
    <Label y={434}>OD 1800</Label>
  </>,
  <>
    <path className='hero-hatch' d={`${ring(142)} ${ring(134)}`} />
    <path className='hero-ink' d={`${ring(142)} ${ring(134)}`} pathLength='1' />
    <path
      className='hero-fine'
      d={`M${CX - 5} ${CY - 145} L${CX} ${CY - 138} L${CX + 5} ${CY - 145}`}
      pathLength='1'
    />
    <path
      className='hero-dim'
      d={`${hDim(98, 382, 400, CY)} M${polar(138, -0.62)} L392 104 H424`}
      pathLength='1'
    />
    <Label title y={44}>
      ERW PIPE · 14&quot;
    </Label>
    <Label anchor='start' x={396} y={96}>
      t 10.0
    </Label>
    <Label y={430}>Ø 355.6</Label>
  </>,
  <>
    <g transform='translate(14 0)'>
      <path className='hero-hatch' d={ANGLE} />
      <path className='hero-ink' d={ANGLE} pathLength='1' />
      <path className='hero-fine' d='M136 200 H176' pathLength='1' />
      <path className='hero-dim' d={hDim(110, 370, 392, 350)} pathLength='1' />
      <path className='hero-dim' d={vDim(90, 350, 78, 110)} pathLength='1' />
      <Label anchor='start' x={182} y={204}>
        t 10
      </Label>
      <Label anchor='end' x={66} y={224}>
        100
      </Label>
      <Label x={240} y={422}>
        100
      </Label>
    </g>
    <Label title y={44}>
      ANGLE 100 × 100 × 10
    </Label>
  </>,
]

/** Five section drawings on a shared 35 s cycle, one 7 s slot each; the timing lives in globals.css. */
export default function HeroDrawings() {
  return (
    <div
      aria-hidden
      className='hero-stage relative aspect-[48/45] w-full text-foreground lg:absolute lg:inset-x-0 lg:top-0 lg:bottom-32 lg:aspect-auto'
    >
      {PROFILES.map((profile, i) => (
        <svg
          key={i}
          data-profile
          className='absolute inset-0 h-full w-full overflow-visible'
          // each drawing owns a 7 s slot; its strokes inherit --hero-slot as their delay
          style={
            {
              '--hero-slot': `${-(CYCLE - (CYCLE / PROFILES.length) * i)}s`,
            } as React.CSSProperties
          }
          viewBox='0 0 480 450'
        >
          {profile}
        </svg>
      ))}
      <svg className='absolute h-0 w-0'>
        <defs>
          <pattern
            height='7'
            id='hero-hatch'
            patternTransform='rotate(45)'
            patternUnits='userSpaceOnUse'
            width='7'
          >
            <path d='M0 0V7' stroke='currentColor' strokeWidth='0.8' />
          </pattern>
        </defs>
      </svg>
    </div>
  )
}
