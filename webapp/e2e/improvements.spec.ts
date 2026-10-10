import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('tool improvements', () => {
  test('text stats shows char count', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Word count')
    const p = getPanel(page, 'Word count')
    await field(p, 'enter text').fill('hello world')
    await expect(field(p, 'chars')).toHaveValue('11')
  })

  test('find and replace shows replacement count', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Find and replace')
    const p = getPanel(page, 'Find and replace')
    await field(p, 'input text').fill('a1b22c333')
    await field(p, 'find').fill('\\d+')
    await expect(field(p, 'replacements')).toHaveValue('3')
  })

  test('text diff shows a summary', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Text diff')
    const p = getPanel(page, 'Text diff')
    await field(p, 'original').fill('a\nb\nc')
    await field(p, 'changed').fill('a\nx\ny\nc')
    await expect(field(p, 'summary')).toHaveValue('+2 −1')
  })

  test('jwt shows header and validity', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JWT decoder')
    const p = getPanel(page, 'JWT decoder')
    await expect(field(p, 'decoded header')).toHaveValue(/"alg": "HS256"/)
    await expect(field(p, 'validity')).toHaveValue(/issued:/)
  })

  test('jwt flags an expired token', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JWT decoder')
    const p = getPanel(page, 'JWT decoder')
    const payload = btoa(JSON.stringify({ exp: 1000000 }))
    await field(p, 'Encoded jwt').fill(`h.${payload}.s`)
    await expect(field(p, 'validity')).toHaveValue(/expires:/)
  })

  test('sha checksum shows file metadata', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'File checksum')
    const p = getPanel(page, 'File checksum')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'hello.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hello'),
    })
    await expect(field(p, 'file')).toHaveValue('hello.txt (5 B)')
  })

  test('base64 file shows file metadata', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'File to base64')
    const p = getPanel(page, 'File to base64')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'hi.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hi'),
    })
    await expect(field(p, 'file')).toHaveValue('hi.txt (2 bytes)')
  })

  test('image viewer shows dimensions', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Base64 to image')
    const p = getPanel(page, 'Base64 to image')
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    await field(p, 'base64 encoded image').fill(dataUrl)
    await expect(field(p, 'dimensions')).toHaveValue('1 × 1')
  })

  test('clock can show UTC', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Clock')
    const p = getPanel(page, 'Clock')
    const local = await field(p, 'time').inputValue()
    await p.getByRole('checkbox', { name: 'show UTC' }).check()
    const utc = await field(p, 'time').inputValue()
    expect(utc).not.toBe(local)
  })

  test('timestamp shows relative time', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Timestamp converter')
    const p = getPanel(page, 'Timestamp converter')
    const recent = Math.floor(Date.now() / 1000) - 7200
    await field(p, 'unix time (s or ms)').fill(String(recent))
    await expect(field(p, 'relative')).toHaveValue(/ago/)
  })

  test('countdown presets set the timer', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Countdown')
    const p = getPanel(page, 'Countdown')
    await p.getByTestId('preset-25').click()
    await expect(
      p.locator('[data-testid="stepper"][data-stepper="minutes"] [data-testid="stepper-value"]')
    ).toHaveText('25')
  })

  test('regex shows replacement result', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Regex tester')
    const p = getPanel(page, 'Regex tester')
    await field(p, 'pattern').fill('(\\w+)\\s(\\w+)')
    await field(p, 'test string').fill('hello world')
    await field(p, 'replacement').fill('$2 $1')
    await expect(field(p, 'result')).toHaveValue('world hello')
  })

  test('hash generator computes HMAC with key', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Hash generator')
    const p = getPanel(page, 'Hash generator')
    await field(p, 'enter text').fill('hello')
    await field(p, 'hmac key').fill('secret')
    await expect(field(p, 'HMAC-SHA-256 Hash')).toHaveValue(
      '88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b'
    )
  })

  test('cron preset fills the expression', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Cron explainer')
    const p = getPanel(page, 'Cron explainer')
    await p.getByLabel('Cron preset').selectOption('0 9 * * 1-5')
    await expect(field(p, 'cron expression')).toHaveValue('0 9 * * 1-5')
    await expect(field(p, 'description')).toHaveValue(
      'At 09:00, on Mon, Tue, Wed, Thu, Fri'
    )
  })

  test('guid bulk generation produces many guids', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')
    await p.getByTestId('guid-increase').click()
    await p.getByTestId('guid-increase').click()
    await expect(p.getByTestId('guid-quantity')).toHaveText('3')
    const lines = (await field(p, 'uuids v4').inputValue()).split('\n')
    expect(lines).toHaveLength(3)
    for (const line of lines) {
      expect(line).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    }
  })

  test('public ip has a refresh button', async ({ page }) => {
    await page.route(/api\.ipify\.org/, (route) =>
      route.fulfill({ json: { ip: '203.0.113.42' } })
    )
    await openApp(page)
    await addPanel(page, 'misc', 'Public IP address')
    const p = getPanel(page, 'Public IP address')
    await expect(p.getByRole('button', { name: 'Refresh' })).toBeVisible()
  })

  test('qr size selector changes the svg', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'QR code generator')
    const p = getPanel(page, 'QR code generator')
    await p.getByLabel('QR code size').selectOption('512')
    await expect(p.locator('[data-testid="qr-code"] svg')).toHaveAttribute(
      'width',
      '512'
    )
  })

  test('calculator clears history', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Calculator')
    const p = getPanel(page, 'Calculator')
    await field(p, 'input').fill('2 + 2')
    await field(p, 'input').press('Enter')
    await expect(p.locator('[data-testid="calc-history"]')).toContainText('= 4')
    await p.getByRole('button', { name: 'Clear history' }).click()
    await expect(p.locator('[data-testid="calc-history"]')).toHaveText('')
  })

  test('color picker shows hex, rgb and hsl', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Color picker')
    const p = getPanel(page, 'Color picker')
    await p.locator('[data-testid="color-picker"] input').first().fill('#ff0000')
    await expect(field(p, 'hex')).toHaveValue('#ff0000')
    await expect(field(p, 'rgb')).toHaveValue('rgb(255, 0, 0)')
    await expect(field(p, 'hsl')).toHaveValue('hsl(0, 100%, 50%)')
  })

  test('password shows entropy', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Password generator')
    const p = getPanel(page, 'Password generator')
    await expect(field(p, 'entropy')).toHaveValue('129 bits')
  })
})
