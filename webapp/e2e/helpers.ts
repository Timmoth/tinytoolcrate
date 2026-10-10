import { expect, Locator, Page } from '@playwright/test'

export const CATEGORIES: Record<string, string[]> = {
  text: [
    'Base64 encode',
    'Base64 decode',
    'URL encode',
    'URL decode',
    'Word count',
    'Find and replace',
    'Count occurrences',
    'Escape string',
    'Unescape string',
    'Case converter',
    'HTML entities',
    'Text diff',
    'Sort and dedupe lines',
    'Lorem ipsum',
    'Slug generator',
    'Binary and hex converter',
    'ASCII table',
    'Compare lists',
    'Emoji picker',
  ],
  json: [
    'JWT decoder',
    'JSON formatter',
    'JSON minifier',
    'CSV and JSON converter',
    'JWT encoder',
  ],
  file: [
    'Create zip',
    'Unzip',
    'Gzip',
    'Image converter',
    'EXIF viewer',
    'File checksum',
    'File size converter',
    'Chmod calculator',
    'File to base64',
    'Base64 to image',
  ],
  time: [
    'Current unix time',
    'Clock',
    'Countdown',
    'Alarm',
    'Timestamp converter',
    'Date difference',
    'Stopwatch',
  ],
  code: [
    'Markdown editor',
    'Regex tester',
    'Hash generator',
    'Number base converter',
    'Cron explainer',
    'URL parser',
  ],
  net: [
    'Subnet calculator',
    'HTTP status codes',
    'MIME types',
    'SAML decoder',
    'Basic auth header',
    'IP address converter',
    'User agent parser',
    'Random port',
  ],
  crypto: [
    'AES encryption',
    'RSA key pair',
    'RSA encryption',
    'Classic ciphers',
  ],
  misc: [
    'UUID generator',
    'Public IP address',
    'QR code generator',
    'Function plotter',
    'Calculator',
    'Color picker',
    'Password generator',
    'TOTP generator',
    'Contrast checker',
    'CSS unit converter',
    'Unit converter',
    'Color converter',
    'Percentage calculator',
    'Roman numerals',
    'ULID generator',
    'Keyboard codes',
  ],
}

export async function openApp(page: Page) {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'tinytoolcrate' })
  ).toBeVisible()
}

export async function addPanel(page: Page, category: string, panelName: string) {
  const categoryButton = page.getByRole('button', { name: category, exact: true })
  const menuItem = page.getByRole('button', { name: panelName, exact: true })

  await expect(async () => {
    await page.keyboard.press('Escape')
    await categoryButton.click()
    await menuItem.click({ timeout: 2000 })
  }).toPass()

  await expect(getPanel(page, panelName).first()).toBeVisible()
}

export function getPanel(page: Page, panelName: string): Locator {
  return page.locator(
    `[data-testid="panel"][data-panel-type="${panelName}"]`
  )
}

export function field(scope: Page | Locator, label: string): Locator {
  return scope.locator(
    `[data-testid="field"][data-field-label="${label}"] [data-testid="field-input"]`
  )
}

/** The textarea inside a CodeEditor panel. */
export function codeInput(scope: Page | Locator): Locator {
  return scope.locator('[data-testid="code-input"]')
}

export function copyButton(scope: Page | Locator, label: string): Locator {
  return scope
    .locator(`[data-testid="field"][data-field-label="${label}"]`)
    .getByRole('button', { name: 'Copy to clipboard' })
}

export function stepperColumn(
  scope: Page | Locator,
  name: 'hours' | 'minutes' | 'seconds'
): Locator {
  return scope.locator(`[data-testid="stepper"][data-stepper="${name}"]`)
}

export function stepperValue(
  scope: Page | Locator,
  name: 'hours' | 'minutes' | 'seconds'
): Locator {
  return stepperColumn(scope, name).locator('[data-testid="stepper-value"]')
}
