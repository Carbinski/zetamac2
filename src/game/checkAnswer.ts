import { parseRational, rationalsEqual } from './fractions.ts'

export function checkAnswer(input: string, expected: string): boolean {
  const got = parseRational(input)
  const want = parseRational(expected)
  if (!got || !want) return false
  return rationalsEqual(got, want)
}
