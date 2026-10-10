export type Rgb = { r: number; g: number; b: number }

let probe: CanvasRenderingContext2D | null | undefined

function context(): CanvasRenderingContext2D | null {
  if (probe === undefined) {
    probe = document.createElement('canvas').getContext('2d')
  }
  return probe
}

/**
 * Normalises any css colour — names, hex, rgb(), hsl(), colour functions — by
 * letting canvas do the parsing. Two different sentinels tell a rejected value
 * apart from one that genuinely is the sentinel.
 */
export function parseColor(text: string): Rgb | null {
  const input = text.trim()
  if (input === '') return null

  const ctx = context()
  if (!ctx) return null

  ctx.fillStyle = '#000000'
  ctx.fillStyle = input
  const first = String(ctx.fillStyle)

  ctx.fillStyle = '#ffffff'
  ctx.fillStyle = input
  const second = String(ctx.fillStyle)

  if (first !== second) return null

  const hex = /^#([0-9a-f]{6})$/i.exec(first)
  if (hex) {
    const value = parseInt(hex[1], 16)
    return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(first)
  if (rgb) {
    return {
      r: Math.round(Number(rgb[1])),
      g: Math.round(Number(rgb[2])),
      b: Math.round(Number(rgb[3])),
    }
  }

  return null
}

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export function toRgbString({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`
}

function channel(value: number): number {
  const ratio = value / 255
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastCheck = {
  label: string
  threshold: number
  passes: boolean
}

export function contrastChecks(ratio: number): ContrastCheck[] {
  const rounded = Math.round(ratio * 100) / 100
  return [
    { label: 'AA normal text', threshold: 4.5, passes: rounded >= 4.5 },
    { label: 'AA large text', threshold: 3, passes: rounded >= 3 },
    { label: 'AAA normal text', threshold: 7, passes: rounded >= 7 },
    { label: 'AAA large text', threshold: 4.5, passes: rounded >= 4.5 },
    { label: 'UI components', threshold: 3, passes: rounded >= 3 },
  ]
}

/* ------------------------------------------------------------------ *
 * Other colour spaces
 * ------------------------------------------------------------------ */

export type Hsl = { h: number; s: number; l: number }

export function toHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const span = max - min
  const lightness = (max + min) / 2

  if (span === 0) return { h: 0, s: 0, l: lightness * 100 }

  const saturation = span / (1 - Math.abs(2 * lightness - 1))
  let hue: number
  if (max === red) hue = ((green - blue) / span) % 6
  else if (max === green) hue = (blue - red) / span + 2
  else hue = (red - green) / span + 4

  return {
    h: ((hue * 60) % 360 + 360) % 360,
    s: saturation * 100,
    l: lightness * 100,
  }
}

/** Hue-whiteness-blackness, which css accepts as hwb(). */
export function toHwb({ r, g, b }: Rgb): { h: number; w: number; b: number } {
  const { h } = toHsl({ r, g, b })
  return {
    h,
    w: (Math.min(r, g, b) / 255) * 100,
    b: (1 - Math.max(r, g, b) / 255) * 100,
  }
}

export function toCmyk({ r, g, b }: Rgb): {
  c: number
  m: number
  y: number
  k: number
} {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const k = 1 - Math.max(red, green, blue)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }

  return {
    c: ((1 - red - k) / (1 - k)) * 100,
    m: ((1 - green - k) / (1 - k)) * 100,
    y: ((1 - blue - k) / (1 - k)) * 100,
    k: k * 100,
  }
}

export function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.replace('#', ''), 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

/** Nearest css colour name, by straight rgb distance. */
export function nearestName(
  rgb: Rgb,
  names: [string, string][]
): { name: string; exact: boolean } {
  let best = names[0]
  let bestDistance = Infinity

  for (const entry of names) {
    const candidate = hexToRgb(entry[1])
    const distance =
      (candidate.r - rgb.r) ** 2 +
      (candidate.g - rgb.g) ** 2 +
      (candidate.b - rgb.b) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = entry
    }
  }

  return { name: best[0], exact: bestDistance === 0 }
}
