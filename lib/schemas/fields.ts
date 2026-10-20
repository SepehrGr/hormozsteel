import { z } from 'zod'

/** Blank, or a value in `format`; surrounding spaces are ignored. */
export const blankOr = (format: z.ZodType<string, string>) =>
  z
    .string()
    .trim()
    .pipe(z.union([z.literal(''), format]))

/** A phone number as people type it: digits, spaces, dashes, brackets, a leading +. */
export const phone = () =>
  z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number')
