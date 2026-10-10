export type Permission = { read: boolean; write: boolean; execute: boolean }
export type PermissionSet = {
  owner: Permission
  group: Permission
  other: Permission
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

export const EMPTY_PERMISSIONS: PermissionSet = {
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  other: { read: false, write: false, execute: false },
  setuid: false,
  setgid: false,
  sticky: false,
}

function digit(permission: Permission): number {
  return (permission.read ? 4 : 0) + (permission.write ? 2 : 0) + (permission.execute ? 1 : 0)
}

function fromDigit(value: number): Permission {
  return {
    read: (value & 4) !== 0,
    write: (value & 2) !== 0,
    execute: (value & 1) !== 0,
  }
}

export function toOctal(permissions: PermissionSet): string {
  const special =
    (permissions.setuid ? 4 : 0) +
    (permissions.setgid ? 2 : 0) +
    (permissions.sticky ? 1 : 0)
  const base = `${digit(permissions.owner)}${digit(permissions.group)}${digit(permissions.other)}`
  return special === 0 ? base : `${special}${base}`
}

export function parseOctal(text: string): PermissionSet | null {
  const clean = text.trim()
  if (!/^[0-7]{3,4}$/.test(clean)) return null

  const padded = clean.length === 3 ? `0${clean}` : clean
  const special = Number(padded[0])

  return {
    setuid: (special & 4) !== 0,
    setgid: (special & 2) !== 0,
    sticky: (special & 1) !== 0,
    owner: fromDigit(Number(padded[1])),
    group: fromDigit(Number(padded[2])),
    other: fromDigit(Number(padded[3])),
  }
}

/** The ls style string, with setuid and sticky bits folded into the x slots. */
export function toSymbolic(permissions: PermissionSet): string {
  const triple = (
    permission: Permission,
    special: boolean,
    specialChar: string
  ) => {
    const execute = permission.execute
      ? special
        ? specialChar.toLowerCase()
        : 'x'
      : special
        ? specialChar.toUpperCase()
        : '-'
    return `${permission.read ? 'r' : '-'}${permission.write ? 'w' : '-'}${execute}`
  }

  return (
    triple(permissions.owner, permissions.setuid, 's') +
    triple(permissions.group, permissions.setgid, 's') +
    triple(permissions.other, permissions.sticky, 't')
  )
}

export function parseSymbolic(text: string): PermissionSet | null {
  const clean = text.trim().replace(/^[-dlbcps]/, '')
  if (!/^[rwxsStT-]{9}$/.test(clean)) return null

  const slot = (offset: number, specialChar: string): [Permission, boolean] => {
    const executeChar = clean[offset + 2]
    const special = specialChar.includes(executeChar)
    return [
      {
        read: clean[offset] === 'r',
        write: clean[offset + 1] === 'w',
        execute: executeChar === 'x' || executeChar === specialChar[0],
      },
      special,
    ]
  }

  const [owner, setuid] = slot(0, 'sS')
  const [group, setgid] = slot(3, 'sS')
  const [other, sticky] = slot(6, 'tT')

  return { owner, group, other, setuid, setgid, sticky }
}

export function chmodCommand(permissions: PermissionSet): string {
  return `chmod ${toOctal(permissions)} <file>`
}

/* ------------------------------------------------------------------ *
 * File sizes
 * ------------------------------------------------------------------ */

export const SIZE_UNITS = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'PB',
  'KiB',
  'MiB',
  'GiB',
  'TiB',
  'PiB',
] as const

export type SizeUnit = (typeof SIZE_UNITS)[number]

const FACTORS: Record<SizeUnit, number> = {
  B: 1,
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  PB: 1e15,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
  PiB: 1024 ** 5,
}

export function sizeToBytes(value: number, unit: SizeUnit): number {
  return value * FACTORS[unit]
}

export function bytesToSize(bytes: number, unit: SizeUnit): number {
  return bytes / FACTORS[unit]
}

export function formatSize(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value !== 0 && Math.abs(value) < 0.0001) return value.toExponential(4)
  const rounded = Math.round(value * 10000) / 10000
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 4,
    useGrouping: false,
  })
}
