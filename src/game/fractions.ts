export type Rational = {
  num: number
  den: number
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const next = x % y
    x = y
    y = next
  }
  return x === 0 ? 1 : x
}

export function reduce(num: number, den: number): [number, number] {
  let n = num
  let d = den
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return [n / g, d / g]
}

export function formatFraction(num: number, den: number): string {
  const [n, d] = reduce(num, den)
  if (d === 1) return String(n)
  return `${n}/${d}`
}

export function parseRational(raw: string): Rational | null {
  const s = raw.trim()
  if (s === '') return null

  const frac = s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/)
  if (frac) {
    const num = Number(frac[1])
    const den = Number(frac[2])
    if (den === 0 || !Number.isFinite(num) || !Number.isFinite(den)) return null
    return { num, den }
  }

  if (/^-?\d+$/.test(s)) {
    return { num: Number(s), den: 1 }
  }

  const dec = s.match(/^(-?)(\d+)\.(\d+)$/)
  if (dec) {
    const sign = dec[1] === '-' ? -1 : 1
    const whole = dec[2]
    const fracPart = dec[3]
    const den = 10 ** fracPart.length
    const num = sign * (Number(whole) * den + Number(fracPart))
    if (!Number.isFinite(num) || !Number.isFinite(den)) return null
    return { num, den }
  }

  const leadDot = s.match(/^(-?)\.(\d+)$/)
  if (leadDot) {
    const sign = leadDot[1] === '-' ? -1 : 1
    const fracPart = leadDot[2]
    const den = 10 ** fracPart.length
    return { num: sign * Number(fracPart), den }
  }

  return null
}

export function rationalsEqual(a: Rational, b: Rational): boolean {
  return a.num * b.den === b.num * a.den
}
