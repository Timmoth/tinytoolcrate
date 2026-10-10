import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

const GUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

test.describe('guid generator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
  })

  test('shows a valid v4 guid', async ({ page }) => {
    const p = getPanel(page, 'UUID generator')
    await expect(field(p, 'uuid v4')).toHaveValue(GUID_V4)
  })

  test('new button regenerates the guid', async ({ page }) => {
    const p = getPanel(page, 'UUID generator')
    const first = await field(p, 'uuid v4').inputValue()
    await p.getByRole('button', { name: 'New' }).click()
    const second = await field(p, 'uuid v4').inputValue()

    expect(second).toMatch(GUID_V4)
    expect(second).not.toBe(first)
  })

  test('two panels generate different guids', async ({ page }) => {
    await addPanel(page, 'misc', 'UUID generator')
    const a = await field(getPanel(page, 'UUID generator').first(), 'uuid v4')
      .inputValue()
    const b = await field(getPanel(page, 'UUID generator').last(), 'uuid v4')
      .inputValue()
    expect(a).not.toBe(b)
  })
})

test.describe('public ip', () => {
  test('displays the ip from the api', async ({ page }) => {
    await page.route(/api\.ipify\.org/, (route) =>
      route.fulfill({ json: { ip: '203.0.113.42' } })
    )
    await openApp(page)
    await addPanel(page, 'misc', 'Public IP address')
    const p = getPanel(page, 'Public IP address')

    await expect(field(p, 'public ip')).toHaveValue('203.0.113.42')
  })

  test('shows an error when the api fails', async ({ page }) => {
    await page.route(/api\.ipify\.org/, (route) => route.abort())
    await openApp(page)
    await addPanel(page, 'misc', 'Public IP address')
    const p = getPanel(page, 'Public IP address')

    await expect(field(p, 'public ip')).toHaveValue('Failed to load public ip')
  })
})

test.describe('qr code', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'QR code generator')
  })

  test('renders a qr svg for the default content', async ({ page }) => {
    const p = getPanel(page, 'QR code generator')
    const qr = p.locator('[data-testid="qr-code"] svg')
    await expect(field(p, 'Content')).toHaveValue('https://tinytoolcrate.com/')
    await expect(qr).toBeVisible()
    await expect(qr.locator('path')).not.toHaveCount(0)
  })

  test('svg updates when content changes', async ({ page }) => {
    const p = getPanel(page, 'QR code generator')
    const qr = p.locator('[data-testid="qr-code"] svg')
    const before = await qr.innerHTML()
    await field(p, 'Content').fill('totally different payload')
    await expect
      .poll(async () => p.locator('[data-testid="qr-code"] svg').innerHTML(), {
        timeout: 5000,
      })
      .not.toBe(before)
  })

  test('download button downloads a png', async ({ page }) => {
    const p = getPanel(page, 'QR code generator')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      p.getByRole('button', { name: 'Download' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^QRCode(\.png)?$/)
  })
})

test.describe('calculator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Calculator')
  })

  test('evaluates an expression on enter', async ({ page }) => {
    const p = getPanel(page, 'Calculator')
    await field(p, 'input').fill('2 + 3')
    await field(p, 'input').press('Enter')

    const history = p.locator('[data-testid="calc-history"]')
    await expect(history).toContainText('2 + 3')
    await expect(history).toContainText('= 5')
    await expect(field(p, 'input')).toHaveValue('')
  })

  test('supports variables across expressions', async ({ page }) => {
    const p = getPanel(page, 'Calculator')
    await field(p, 'input').fill('x = 7')
    await field(p, 'input').press('Enter')
    await field(p, 'input').fill('x * 2')
    await field(p, 'input').press('Enter')

    await expect(p.locator('[data-testid="calc-history"]')).toContainText(
      '= 14'
    )
  })

  test('invalid expression records an error', async ({ page }) => {
    const p = getPanel(page, 'Calculator')
    await field(p, 'input').fill('2 +')
    await field(p, 'input').press('Enter')

    await expect(p.locator('[data-testid="calc-history"]')).toContainText(
      '2 + = error'
    )
  })
})

test.describe('color picker', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Color picker')
  })

  test('renders the sketch picker', async ({ page }) => {
    const p = getPanel(page, 'Color picker')
    await expect(p.locator('[data-testid="color-picker"]')).toBeVisible()
  })

  test('hex input updates the picker', async ({ page }) => {
    const p = getPanel(page, 'Color picker')
    const hex = p.locator('[data-testid="color-picker"] input').last()
    await hex.fill('#ff0000')
    await expect(hex).toHaveValue('#ff0000')
  })
})

test.describe('plot graph', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Function plotter')
  })

  test('renders the default x^2 plot', async ({ page }) => {
    const p = getPanel(page, 'Function plotter')
    await expect(field(p, 'y=')).toHaveValue('x^2')
    await expect(p.locator('[data-testid="plot"]')).toBeVisible()
    await expect(p.locator('[data-testid="plot"]')).toContainText(
      'Plot of f(x)'
    )
  })

  test('changing the expression re-renders the plot', async ({ page }) => {
    const p = getPanel(page, 'Function plotter')
    await field(p, 'y=').fill('sin(x)')
    await expect(p.locator('[data-testid="plot"]')).toBeVisible()
    await expect(p.getByText('Error in expression')).toBeHidden()
  })

  test('invalid expression shows an error', async ({ page }) => {
    const p = getPanel(page, 'Function plotter')
    await field(p, 'y=').fill('x^')
    await expect(p.getByText('Error in expression')).toBeVisible()
  })

  test('changing the x range keeps the plot visible', async ({ page }) => {
    const p = getPanel(page, 'Function plotter')
    await field(p, 'min-x').fill('0')
    await field(p, 'max-x').fill('5')
    await expect(p.locator('[data-testid="plot"]')).toBeVisible()
  })
})
