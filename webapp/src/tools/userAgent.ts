export type UserAgentInfo = {
  browser: string
  browserVersion: string
  engine: string
  os: string
  device: string
}

/** Order matters: Edge and Opera both claim to be Chrome, Chrome claims Safari. */
const BROWSERS: [string, RegExp][] = [
  ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ['Opera', /(?:OPR|Opera)\/([\d.]+)/],
  ['Samsung Internet', /SamsungBrowser\/([\d.]+)/],
  ['Vivaldi', /Vivaldi\/([\d.]+)/],
  ['Brave', /Brave\/([\d.]+)/],
  ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
  ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
  ['Safari', /Version\/([\d.]+).*Safari/],
  ['Internet Explorer', /(?:MSIE |rv:)([\d.]+).*Trident/],
]

const BOTS = /bot|crawl|spider|slurp|bingpreview|headlesschrome|lighthouse|curl|wget|python-requests/i

const WINDOWS_NAMES: Record<string, string> = {
  '10.0': '10 or 11',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
}

function detectOs(ua: string): string {
  const windows = /Windows NT ([\d.]+)/.exec(ua)
  if (windows) return `Windows ${WINDOWS_NAMES[windows[1]] ?? windows[1]}`

  const iOs = /OS (\d+[_\d]*) like Mac OS X/.exec(ua)
  if (iOs) return `iOS ${iOs[1].replace(/_/g, '.')}`

  const mac = /Mac OS X (\d+[_.\d]*)/.exec(ua)
  if (mac) return `macOS ${mac[1].replace(/_/g, '.')}`

  const android = /Android ([\d.]+)/.exec(ua)
  if (android) return `Android ${android[1]}`

  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Linux/.test(ua)) return 'Linux'
  if (/Macintosh/.test(ua)) return 'macOS'
  return 'unknown'
}

function detectEngine(ua: string): string {
  if (/Gecko\/|Firefox/.test(ua) && !/like Gecko/.test(ua)) return 'Gecko'
  if (/Trident/.test(ua)) return 'Trident'
  if (/Edg(?:e)?\/\d/.test(ua) && /Chrome/.test(ua)) return 'Blink'
  if (/Chrome|Chromium|CriOS/.test(ua)) return 'Blink'
  if (/AppleWebKit/.test(ua)) return 'WebKit'
  return 'unknown'
}

function detectDevice(ua: string): string {
  if (BOTS.test(ua)) return 'bot or script'
  if (/iPad|Tablet|PlayBook|Silk/.test(ua)) return 'tablet'
  if (/Android(?!.*Mobile)/.test(ua)) return 'tablet'
  if (/Mobi|iPhone|iPod|Windows Phone/.test(ua)) return 'mobile'
  return 'desktop'
}

export function parseUserAgent(input: string): UserAgentInfo | null {
  const ua = input.trim()
  if (ua === '') return null

  let browser = 'unknown'
  let browserVersion = ''
  for (const [name, pattern] of BROWSERS) {
    const match = pattern.exec(ua)
    if (match) {
      browser = name
      browserVersion = match[1]
      break
    }
  }
  if (browser === 'unknown' && BOTS.test(ua)) browser = 'bot or script'

  return {
    browser,
    browserVersion,
    engine: detectEngine(ua),
    os: detectOs(ua),
    device: detectDevice(ua),
  }
}

/* ------------------------------------------------------------------ *
 * Ports
 * ------------------------------------------------------------------ */

export const WELL_KNOWN_PORTS: Record<number, string> = {
  20: 'ftp data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
  67: 'dhcp', 80: 'http', 110: 'pop3', 123: 'ntp', 143: 'imap', 161: 'snmp',
  389: 'ldap', 443: 'https', 445: 'smb', 465: 'smtps', 587: 'smtp submission',
  993: 'imaps', 995: 'pop3s', 1433: 'sql server', 1521: 'oracle',
  3000: 'node dev server', 3001: 'node dev server', 3306: 'mysql',
  3389: 'rdp', 4200: 'angular dev server', 5000: 'flask / airplay',
  5173: 'vite dev server', 5432: 'postgres', 5672: 'rabbitmq',
  6379: 'redis', 8000: 'http alt', 8080: 'http proxy', 8443: 'https alt',
  9000: 'php-fpm / sonarqube', 9200: 'elasticsearch', 11211: 'memcached',
  27017: 'mongodb',
}

export type PortRange = 'well known' | 'registered' | 'dynamic'

export function portRange(port: number): PortRange {
  if (port < 1024) return 'well known'
  if (port < 49152) return 'registered'
  return 'dynamic'
}

/** Picks from the dynamic range by default, which is safest for a local service. */
export function randomPort(from: number, to: number): number {
  const span = to - from + 1
  const bytes = crypto.getRandomValues(new Uint32Array(1))
  return from + (bytes[0] % span)
}
