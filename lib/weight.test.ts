import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  angleKg,
  billetKg,
  flangedSectionKg,
  hollowSectionKg,
  linePrice,
  pipeKg,
  rebarKg,
  sheetKg,
} from './weight'

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  )

// Expected values are 1 m of section at ρ 7.85, checked against steel tables
test('section weights match steel tables', () => {
  near(rebarKg(16, 1, 7.85), 1.578) // tables: 1.58 kg/m
  near(rebarKg(12, 12, 7.85), 10.65) // a 12 m bar of Ø12
  near(pipeKg(60.3, 3.9, 1, 7.85), 5.42) // 2" sch 40: 5.44 kg/m
  near(hollowSectionKg(40, 40, 2, 1, 7.85), 2.386) // SHS 40×40×2: 2.31 (rounded corners)
  near(angleKg(50, 50, 5, 1, 7.85), 3.729) // L50×50×5: 3.77 (root fillet)
  near(flangedSectionKg(200, 5.6, 100, 8.5, 1, 7.85), 22.14) // IPE 200: 22.4
  near(billetKg(150, 150, 6, 7.85), 1059.75)
})

test('sheet allowances', () => {
  near(sheetKg('black', 2, 1, 3, 7.85), 47.1)
  near(sheetKg('chequered', 2, 1, 3, 7.85), 51.81) // t + 0.3
  near(sheetKg('chequered', 2, 1, 5, 7.85), 84.78) // t + 0.4
  near(sheetKg('aluminum', 2, 1, 3, 7.85), 16.38) // ρ forced to 2.73
})

test('line price', () => {
  assert.equal(linePrice(250, 2, 'kg'), 500)
  assert.equal(linePrice(250, 800, 'ton'), 200)
  assert.equal(linePrice(250, 5, 'piece'), null)
  assert.equal(linePrice(0, 2, 'kg'), null)
})
