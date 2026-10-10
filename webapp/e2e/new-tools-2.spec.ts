import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('url parser', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'URL parser')
  })

  test('breaks a url into parts', async ({ page }) => {
    const p = getPanel(page, 'URL parser')
    await field(p, 'url').fill(
      'https://example.com:8443/a/b?x=1&y=hello%20world#frag'
    )
    await expect(field(p, 'protocol')).toHaveValue('https:')
    await expect(field(p, 'hostname')).toHaveValue('example.com')
    await expect(field(p, 'port')).toHaveValue('8443')
    await expect(field(p, 'path')).toHaveValue('/a/b')
    await expect(field(p, 'hash')).toHaveValue('#frag')
    await expect(field(p, 'query params')).toHaveValue('x = 1\ny = hello world')
  })

  test('invalid url shows an error', async ({ page }) => {
    const p = getPanel(page, 'URL parser')
    await field(p, 'url').fill('not a url')
    await expect(p.getByText('Invalid URL')).toBeVisible()
  })

  test('protocol-less url shows an error', async ({ page }) => {
    const p = getPanel(page, 'URL parser')
    await field(p, 'url').fill('example.com/path')
    await expect(p.getByText('Invalid URL')).toBeVisible()
  })
})

test.describe('csv / json', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'CSV and JSON converter')
  })

  test('csv to json with quoted fields', async ({ page }) => {
    const p = getPanel(page, 'CSV and JSON converter')
    await field(p, 'csv or json').fill('name,age\nTim,30\n"Smith, John",25')
    await expect(p.getByText('csv → json')).toBeVisible()
    await expect(field(p, 'converted')).toHaveValue(
      '[\n  {\n    "name": "Tim",\n    "age": "30"\n  },\n  {\n    "name": "Smith, John",\n    "age": "25"\n  }\n]'
    )
  })

  test('json to csv', async ({ page }) => {
    const p = getPanel(page, 'CSV and JSON converter')
    await field(p, 'csv or json').fill('[{"a":1,"b":"x,y"},{"a":2,"b":"z"}]')
    await expect(p.getByText('json → csv')).toBeVisible()
    await expect(field(p, 'converted')).toHaveValue('a,b\n1,"x,y"\n2,z')
  })

  test('handles crlf line endings', async ({ page }) => {
    const p = getPanel(page, 'CSV and JSON converter')
    await field(p, 'csv or json').fill('a,b\r\n1,2\r\n')
    await expect(field(p, 'converted')).toHaveValue(
      '[\n  {\n    "a": "1",\n    "b": "2"\n  }\n]'
    )
  })

  test('single json object converts to csv', async ({ page }) => {
    const p = getPanel(page, 'CSV and JSON converter')
    await field(p, 'csv or json').fill('{"a":1,"b":"two"}')
    await expect(field(p, 'converted')).toHaveValue('a,b\n1,two')
  })
})

test.describe('jwt encode', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JWT encoder')
  })

  test('signs an hs256 token', async ({ page }) => {
    const p = getPanel(page, 'JWT encoder')
    await field(p, 'secret').fill('secret')
    const token = await field(p, 'signed jwt (hs256)').inputValue()
    expect(token.split('.')).toHaveLength(3)
    expect(token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.')).toBe(true)
  })

  test('round trips through jwt decode', async ({ page }) => {
    const p = getPanel(page, 'JWT encoder')
    await field(p, 'payload json').fill('{"sub":"42"}')
    await field(p, 'secret').fill('k')
    const token = await field(p, 'signed jwt (hs256)').inputValue()

    await addPanel(page, 'json', 'JWT decoder')
    const dec = getPanel(page, 'JWT decoder')
    await field(dec, 'Encoded jwt').fill(token)
    await expect(field(dec, 'decoded jwt')).toHaveValue(
      '{\n  "sub": "42"\n}'
    )
  })

  test('invalid payload shows an error', async ({ page }) => {
    const p = getPanel(page, 'JWT encoder')
    await field(p, 'payload json').fill('{oops')
    await expect(p.getByText('Invalid JSON payload')).toBeVisible()
  })
})

test.describe('totp generator', () => {
  test('matches the RFC 6238 test vector', async ({ page }) => {
    await page.clock.setFixedTime(new Date(59000))
    await openApp(page)
    await addPanel(page, 'misc', 'TOTP generator')
    const p = getPanel(page, 'TOTP generator')

    await field(p, 'base32 secret').fill('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ')
    await expect(p.locator('[data-testid="totp-code"]')).toHaveText('287082')
  })

  test('invalid secret shows an error', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'TOTP generator')
    const p = getPanel(page, 'TOTP generator')
    await field(p, 'base32 secret').fill('not-valid-base32!')
    await expect(p.getByText('Invalid base32 secret')).toBeVisible()
  })

  test('code changes when the 30 second window rolls', async ({ page }) => {
    await page.clock.setFixedTime(new Date(59000))
    await openApp(page)
    await addPanel(page, 'misc', 'TOTP generator')
    const p = getPanel(page, 'TOTP generator')

    await field(p, 'base32 secret').fill('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ')
    await expect(p.locator('[data-testid="totp-code"]')).toHaveText('287082')

    await page.clock.setFixedTime(new Date(61000))
    await page.clock.runFor(1100)
    const code = p.locator('[data-testid="totp-code"]')
    await expect(code).not.toHaveText('287082')
    await expect(code).toHaveText(/^\d{6}$/)
  })
})

test.describe('line tools', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Sort and dedupe lines')
  })

  test('sorts lines', async ({ page }) => {
    const p = getPanel(page, 'Sort and dedupe lines')
    await field(p, 'lines').fill('b\na\nc\na')
    await p.getByRole('button', { name: 'Sort', exact: true }).click()
    await expect(field(p, 'result')).toHaveValue('a\na\nb\nc')
  })

  test('unique and remove blanks', async ({ page }) => {
    const p = getPanel(page, 'Sort and dedupe lines')
    await field(p, 'lines').fill('b\na\nb\n\na')
    await p.getByRole('button', { name: 'Unique' }).click()
    await expect(field(p, 'result')).toHaveValue('b\na\n')
    await p.getByRole('button', { name: 'Remove blanks' }).click()
    await expect(field(p, 'result')).toHaveValue('b\na')
  })

  test('trim removes surrounding whitespace', async ({ page }) => {
    const p = getPanel(page, 'Sort and dedupe lines')
    await field(p, 'lines').fill('  a  \n\t b')
    await p.getByRole('button', { name: 'Trim' }).click()
    await expect(field(p, 'result')).toHaveValue('a\nb')
  })

  test('shuffle preserves the set of lines', async ({ page }) => {
    const p = getPanel(page, 'Sort and dedupe lines')
    await field(p, 'lines').fill('a\nb\nc\nd\ne')
    await p.getByRole('button', { name: 'Shuffle' }).click()
    const shuffled = (await field(p, 'result').inputValue()).split('\n')
    expect(shuffled.sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

test.describe('uuid v7', () => {
  test('version selector produces v7 uuids', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    await p.getByLabel('UUID version').selectOption('7')
    await expect(field(p, 'uuid v7')).toHaveValue(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
  })

  test('v7 uuids carry a non-decreasing timestamp prefix', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    await p.getByLabel('UUID version').selectOption('7')
    await p.getByTestId('guid-increase').click()
    await p.getByTestId('guid-increase').click()

    const lines = (await field(p, 'uuids v7').inputValue()).split('\n')
    expect(lines).toHaveLength(3)

    const timestamps = lines.map((line) =>
      parseInt(line.slice(0, 8) + line.slice(9, 13), 16)
    )
    const now = Date.now()
    for (const ts of timestamps) {
      expect(Math.abs(ts - now)).toBeLessThan(5000)
    }
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
    }
  })

  test('bulk generation produces unique ids', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    for (let i = 0; i < 9; i++) {
      await p.getByTestId('guid-increase').click()
    }

    const lines = (await field(p, 'uuids v4').inputValue()).split('\n')
    expect(lines).toHaveLength(10)
    expect(new Set(lines).size).toBe(10)
  })
})
