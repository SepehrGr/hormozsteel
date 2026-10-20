/**
 * Steel weight formulas, in kg. Section sizes are in mm, lengths in m, and
 * density ρ in g/cm³ (the same number as t/m³).
 *
 * The section ones share a unit trick: area (mm²) × length (m) × ρ gives grams,
 * because 1 mm² × 1 m = 1 cm³. Hence the ÷ 1000.
 */

const kg = (areaMm2: number, lengthM: number, density: number) =>
  (areaMm2 * lengthM * density) / 1000

/** Round bar: area π·d²/4. */
export const rebarKg = (diameterMm: number, lengthM: number, density: number) =>
  kg((Math.PI * diameterMm ** 2) / 4, lengthM, density)

/** Round pipe, by mean diameter: area π·(OD − t)·t. */
export const pipeKg = (
  outsideMm: number,
  wallMm: number,
  lengthM: number,
  density: number,
) => kg(Math.PI * (outsideMm - wallMm) * wallMm, lengthM, density)

/** Square / rectangular hollow section: perimeter less the 4 corners counted twice. */
export const hollowSectionKg = (
  widthMm: number,
  heightMm: number,
  wallMm: number,
  lengthM: number,
  density: number,
) => kg((2 * (widthMm + heightMm) - 4 * wallMm) * wallMm, lengthM, density)

/** Angle, equal or unequal legs: the corner square is counted once. */
export const angleKg = (
  legAMm: number,
  legBMm: number,
  thicknessMm: number,
  lengthM: number,
  density: number,
) => kg((legAMm + legBMm - thicknessMm) * thicknessMm, lengthM, density)

/**
 * I-beam or channel from its plates: web (full height) + two flanges. The
 * web/flange overlap roughly stands in for the root fillets this ignores.
 */
export const flangedSectionKg = (
  heightMm: number,
  webMm: number,
  flangeWidthMm: number,
  flangeMm: number,
  lengthM: number,
  density: number,
) => kg(heightMm * webMm + 2 * flangeWidthMm * flangeMm, lengthM, density)

/** Square or rectangular billet. */
export const billetKg = (
  widthMm: number,
  heightMm: number,
  lengthM: number,
  density: number,
) => kg(widthMm * heightMm, lengthM, density)

export type SheetType =
  | 'black'
  | 'galvanized'
  | 'color'
  | 'cold'
  | 'pickled'
  | 'aluminum'
  | 'chequered'
  | 'hardox'

/**
 * Flat sheet: 1 m² × 1 mm is 1 L, so L × W × t × ρ is already kg. Chequered and
 * abrasion plate add a pattern allowance to t; aluminum always uses ρ 2.73.
 */
export function sheetKg(
  type: SheetType,
  lengthM: number,
  widthM: number,
  thicknessMm: number,
  density: number,
) {
  let allowance = 0

  if (type === 'chequered') allowance = thicknessMm <= 3 ? 0.3 : 0.4
  if (type === 'hardox') allowance = 0.3

  const rho = type === 'aluminum' ? 2.73 : density

  return lengthM * widthM * (thicknessMm + allowance) * rho
}

/** Indicative value of `weightKg` at a per-kg or per-ton price; null when it can't be priced. */
export function linePrice(
  weightKg: number,
  price: number | undefined,
  unit: 'kg' | 'ton' | 'piece',
) {
  if (!price || weightKg <= 0 || unit === 'piece') return null

  return unit === 'ton' ? (weightKg / 1000) * price : weightKg * price
}
