export type SubnetInfo = {
  version: 4 | 6
  /** Ordered label/value pairs, ready to render. */
  rows: [string, string][]
}

/* ------------------------------------------------------------------ *
 * IPv4
 * ------------------------------------------------------------------ */

export function parseIpv4(text: string): number | null {
  const parts = text.trim().split('.')
  if (parts.length !== 4) return null

  let value = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    value = value * 256 + octet
  }
  return value >>> 0
}

export function formatIpv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.')
}

function maskForPrefix(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
}

/** A dotted netmask is only valid if its one bits are contiguous. */
function prefixForMask(mask: number): number | null {
  const inverted = ~mask >>> 0
  if (((inverted + 1) & inverted) !== 0) return null
  let prefix = 0
  for (let bit = 31; bit >= 0; bit--) {
    if ((mask >>> bit) & 1) prefix++
    else break
  }
  return prefix
}

function binaryMask(mask: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((mask >>> shift) & 255).toString(2).padStart(8, '0'))
    .join('.')
}

function ipv4Scope(address: number): string {
  const octet = (shift: number) => (address >>> shift) & 255
  const first = octet(24)
  const second = octet(16)

  if (first === 0) return 'this network (0.0.0.0/8)'
  if (first === 10) return 'private (10.0.0.0/8)'
  if (first === 127) return 'loopback (127.0.0.0/8)'
  if (first === 169 && second === 254) return 'link-local (169.254.0.0/16)'
  if (first === 172 && second >= 16 && second <= 31) return 'private (172.16.0.0/12)'
  if (first === 192 && second === 168) return 'private (192.168.0.0/16)'
  if (first === 100 && second >= 64 && second <= 127) {
    return 'carrier-grade nat (100.64.0.0/10)'
  }
  if (first === 192 && second === 0) return 'special use (192.0.0.0/16)'
  if (first >= 224 && first <= 239) return 'multicast (224.0.0.0/4)'
  if (first >= 240) return 'reserved (240.0.0.0/4)'
  return 'public'
}

function describeIpv4(address: number, prefix: number): SubnetInfo {
  const mask = maskForPrefix(prefix)
  const network = (address & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = 2n ** BigInt(32 - prefix)

  // /31 is a point-to-point link and /32 a single host, so neither loses an
  // address to the network and broadcast pair.
  const usable = prefix >= 31 ? total : total - 2n
  const firstHost = prefix >= 31 ? network : network + 1
  const lastHost = prefix >= 31 ? broadcast : broadcast - 1

  return {
    version: 4,
    rows: [
      ['network', `${formatIpv4(network)}/${prefix}`],
      ['netmask', formatIpv4(mask)],
      ['wildcard', formatIpv4(~mask >>> 0)],
      ['broadcast', formatIpv4(broadcast)],
      ['first host', formatIpv4(firstHost >>> 0)],
      ['last host', formatIpv4(lastHost >>> 0)],
      ['usable hosts', usable.toString()],
      ['total addresses', total.toString()],
      ['netmask binary', binaryMask(mask)],
      ['scope', ipv4Scope(network)],
    ],
  }
}

/* ------------------------------------------------------------------ *
 * IPv6
 * ------------------------------------------------------------------ */

export function parseIpv6(text: string): bigint | null {
  let input = text.trim().toLowerCase()
  if (input === '') return null

  // An embedded IPv4 tail becomes the final two hextets.
  const embedded = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(input)
  if (embedded) {
    const v4 = parseIpv4(embedded[1])
    if (v4 === null) return null
    const high = ((v4 >>> 16) & 0xffff).toString(16)
    const low = (v4 & 0xffff).toString(16)
    input = `${input.slice(0, embedded.index)}${high}:${low}`
  }

  const halves = input.split('::')
  if (halves.length > 2) return null

  const toHextets = (part: string) =>
    part === '' ? [] : part.split(':').map((hextet) => hextet)

  const head = toHextets(halves[0])
  const tail = halves.length === 2 ? toHextets(halves[1]) : []

  if (halves.length === 1 && head.length !== 8) return null
  if (head.length + tail.length > 8) return null

  const middle = new Array(8 - head.length - tail.length).fill('0')
  const hextets = halves.length === 2 ? [...head, ...middle, ...tail] : head

  let value = 0n
  for (const hextet of hextets) {
    if (!/^[0-9a-f]{1,4}$/.test(hextet)) return null
    value = (value << 16n) | BigInt(parseInt(hextet, 16))
  }
  return value
}

export function formatIpv6(value: bigint): string {
  const hextets: string[] = []
  for (let i = 7; i >= 0; i--) {
    hextets.push(((value >> BigInt(i * 16)) & 0xffffn).toString(16))
  }

  let bestStart = -1
  let bestLength = 0
  let runStart = -1
  for (let i = 0; i <= hextets.length; i++) {
    if (i < hextets.length && hextets[i] === '0') {
      if (runStart === -1) runStart = i
    } else if (runStart !== -1) {
      const length = i - runStart
      if (length > bestLength) {
        bestLength = length
        bestStart = runStart
      }
      runStart = -1
    }
  }

  if (bestLength < 2) return hextets.join(':')
  return `${hextets.slice(0, bestStart).join(':')}::${hextets
    .slice(bestStart + bestLength)
    .join(':')}`
}

function ipv6Scope(address: bigint): string {
  if (address === 1n) return 'loopback (::1)'
  if (address === 0n) return 'unspecified (::)'
  const top = address >> 112n
  if ((top & 0xffc0n) === 0xfe80n) return 'link-local (fe80::/10)'
  if ((top & 0xfe00n) === 0xfc00n) return 'unique local (fc00::/7)'
  if ((top & 0xff00n) === 0xff00n) return 'multicast (ff00::/8)'
  if ((top & 0xe000n) === 0x2000n) return 'global unicast (2000::/3)'
  return 'reserved'
}

function describeIpv6(address: bigint, prefix: number): SubnetInfo {
  const hostBits = BigInt(128 - prefix)
  const mask = ((1n << BigInt(prefix)) - 1n) << hostBits
  const network = address & mask
  const last = network | ((1n << hostBits) - 1n)

  return {
    version: 6,
    rows: [
      ['network', `${formatIpv6(network)}/${prefix}`],
      ['first address', formatIpv6(network)],
      ['last address', formatIpv6(last)],
      ['total addresses', (2n ** hostBits).toString()],
      ['prefix length', `${prefix}`],
      ['expanded', formatIpv6Full(address)],
      ['scope', ipv6Scope(network)],
    ],
  }
}

export function formatIpv6Full(value: bigint): string {
  const hextets: string[] = []
  for (let i = 7; i >= 0; i--) {
    hextets.push(
      ((value >> BigInt(i * 16)) & 0xffffn).toString(16).padStart(4, '0')
    )
  }
  return hextets.join(':')
}

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

export type SubnetResult =
  | { ok: true; info: SubnetInfo }
  | { ok: false; error: string }

/** Accepts "10.0.0.1/8", "10.0.0.1 255.0.0.0", "10.0.0.1" or an IPv6 prefix. */
export function describeSubnet(input: string): SubnetResult {
  const text = input.trim()
  if (text === '') return { ok: false, error: '' }

  const [addressPart, maskPart] = text.split(/[/\s]+/, 2)

  if (addressPart.includes(':')) {
    const address = parseIpv6(addressPart)
    if (address === null) return { ok: false, error: 'Not a valid IPv6 address' }

    let prefix = 128
    if (maskPart !== undefined) {
      if (!/^\d{1,3}$/.test(maskPart) || Number(maskPart) > 128) {
        return { ok: false, error: 'IPv6 prefix must be between 0 and 128' }
      }
      prefix = Number(maskPart)
    }
    return { ok: true, info: describeIpv6(address, prefix) }
  }

  const address = parseIpv4(addressPart)
  if (address === null) return { ok: false, error: 'Not a valid IPv4 address' }

  let prefix = 32
  if (maskPart !== undefined) {
    if (/^\d{1,2}$/.test(maskPart)) {
      if (Number(maskPart) > 32) {
        return { ok: false, error: 'IPv4 prefix must be between 0 and 32' }
      }
      prefix = Number(maskPart)
    } else {
      const mask = parseIpv4(maskPart)
      if (mask === null) return { ok: false, error: 'Not a valid netmask' }
      const derived = prefixForMask(mask)
      if (derived === null) {
        return { ok: false, error: 'Netmask bits must be contiguous' }
      }
      prefix = derived
    }
  }

  return { ok: true, info: describeIpv4(address, prefix) }
}
