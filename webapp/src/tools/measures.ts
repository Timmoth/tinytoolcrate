export type Measure = {
  id: string
  label: string
  /** Multiplier to the category's base unit. */
  factor?: number
  toBase?: (value: number) => number
  fromBase?: (value: number) => number
}

export type MeasureCategory = {
  id: string
  label: string
  units: Measure[]
}

export const MEASURE_CATEGORIES: MeasureCategory[] = [
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'mm', label: 'millimetre', factor: 0.001 },
      { id: 'cm', label: 'centimetre', factor: 0.01 },
      { id: 'm', label: 'metre', factor: 1 },
      { id: 'km', label: 'kilometre', factor: 1000 },
      { id: 'in', label: 'inch', factor: 0.0254 },
      { id: 'ft', label: 'foot', factor: 0.3048 },
      { id: 'yd', label: 'yard', factor: 0.9144 },
      { id: 'mi', label: 'mile', factor: 1609.344 },
      { id: 'nmi', label: 'nautical mile', factor: 1852 },
    ],
  },
  {
    id: 'mass',
    label: 'Mass',
    units: [
      { id: 'mg', label: 'milligram', factor: 1e-6 },
      { id: 'g', label: 'gram', factor: 0.001 },
      { id: 'kg', label: 'kilogram', factor: 1 },
      { id: 't', label: 'tonne', factor: 1000 },
      { id: 'oz', label: 'ounce', factor: 0.028349523125 },
      { id: 'lb', label: 'pound', factor: 0.45359237 },
      { id: 'st', label: 'stone', factor: 6.35029318 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      {
        id: '°C',
        label: 'celsius',
        toBase: (value) => value + 273.15,
        fromBase: (value) => value - 273.15,
      },
      {
        id: '°F',
        label: 'fahrenheit',
        toBase: (value) => ((value - 32) * 5) / 9 + 273.15,
        fromBase: (value) => ((value - 273.15) * 9) / 5 + 32,
      },
      { id: 'K', label: 'kelvin', factor: 1 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    units: [
      { id: 'ml', label: 'millilitre', factor: 0.001 },
      { id: 'l', label: 'litre', factor: 1 },
      { id: 'm³', label: 'cubic metre', factor: 1000 },
      { id: 'tsp', label: 'teaspoon (US)', factor: 0.00492892159375 },
      { id: 'tbsp', label: 'tablespoon (US)', factor: 0.01478676478125 },
      { id: 'fl oz', label: 'fluid ounce (US)', factor: 0.0295735295625 },
      { id: 'cup', label: 'cup (US)', factor: 0.2365882365 },
      { id: 'pt', label: 'pint (US)', factor: 0.473176473 },
      { id: 'qt', label: 'quart (US)', factor: 0.946352946 },
      { id: 'gal', label: 'gallon (US)', factor: 3.785411784 },
      { id: 'gal UK', label: 'gallon (imperial)', factor: 4.54609 },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    units: [
      { id: 'mm²', label: 'square millimetre', factor: 1e-6 },
      { id: 'cm²', label: 'square centimetre', factor: 1e-4 },
      { id: 'm²', label: 'square metre', factor: 1 },
      { id: 'km²', label: 'square kilometre', factor: 1e6 },
      { id: 'in²', label: 'square inch', factor: 0.00064516 },
      { id: 'ft²', label: 'square foot', factor: 0.09290304 },
      { id: 'ac', label: 'acre', factor: 4046.8564224 },
      { id: 'ha', label: 'hectare', factor: 10000 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    units: [
      { id: 'm/s', label: 'metres per second', factor: 1 },
      { id: 'km/h', label: 'kilometres per hour', factor: 1 / 3.6 },
      { id: 'mph', label: 'miles per hour', factor: 0.44704 },
      { id: 'kn', label: 'knot', factor: 0.514444444444 },
      { id: 'ft/s', label: 'feet per second', factor: 0.3048 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    units: [
      { id: 'ms', label: 'millisecond', factor: 0.001 },
      { id: 's', label: 'second', factor: 1 },
      { id: 'min', label: 'minute', factor: 60 },
      { id: 'h', label: 'hour', factor: 3600 },
      { id: 'd', label: 'day', factor: 86400 },
      { id: 'wk', label: 'week', factor: 604800 },
      { id: 'yr', label: 'year (365d)', factor: 31536000 },
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure',
    units: [
      { id: 'Pa', label: 'pascal', factor: 1 },
      { id: 'kPa', label: 'kilopascal', factor: 1000 },
      { id: 'bar', label: 'bar', factor: 100000 },
      { id: 'psi', label: 'pound per square inch', factor: 6894.757293168 },
      { id: 'atm', label: 'atmosphere', factor: 101325 },
      { id: 'mmHg', label: 'millimetre of mercury', factor: 133.322387415 },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    units: [
      { id: 'J', label: 'joule', factor: 1 },
      { id: 'kJ', label: 'kilojoule', factor: 1000 },
      { id: 'cal', label: 'calorie', factor: 4.184 },
      { id: 'kcal', label: 'kilocalorie', factor: 4184 },
      { id: 'Wh', label: 'watt hour', factor: 3600 },
      { id: 'kWh', label: 'kilowatt hour', factor: 3600000 },
    ],
  },
  {
    id: 'angle',
    label: 'Angle',
    units: [
      { id: '°', label: 'degree', factor: 1 },
      { id: 'rad', label: 'radian', factor: 180 / Math.PI },
      { id: 'grad', label: 'gradian', factor: 0.9 },
      { id: 'turn', label: 'turn', factor: 360 },
    ],
  },
]

function toBase(unit: Measure, value: number): number {
  return unit.toBase ? unit.toBase(value) : value * (unit.factor ?? 1)
}

function fromBase(unit: Measure, value: number): number {
  return unit.fromBase ? unit.fromBase(value) : value / (unit.factor ?? 1)
}

export function convertMeasure(value: number, from: Measure, to: Measure): number {
  return fromBase(to, toBase(from, value))
}

/** Keeps small and huge results readable without losing precision that matters. */
export function formatMeasure(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'

  const magnitude = Math.abs(value)
  if (magnitude >= 1e15 || magnitude < 1e-6) return value.toExponential(6)

  const decimals = magnitude >= 100 ? 4 : magnitude >= 1 ? 6 : 8
  return String(Number(value.toFixed(decimals)))
}
