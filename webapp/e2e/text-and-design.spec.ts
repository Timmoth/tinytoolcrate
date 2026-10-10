import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('contrast checker', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Contrast checker')
  })

  test('black on white is the maximum ratio and passes everything', async ({
    page,
  }) => {
    const p = getPanel(page, 'Contrast checker')
    await field(p, 'foreground').fill('#000000')
    await field(p, 'background').fill('#ffffff')

    await expect(p.locator('[data-testid="contrast-ratio"]')).toHaveText('21.00')
    await expect(
      p.locator('[data-testid="contrast-check"][data-passes="false"]')
    ).toHaveCount(0)
  })

  test('a mid grey passes AA but fails AAA', async ({ page }) => {
    const p = getPanel(page, 'Contrast checker')
    await field(p, 'foreground').fill('#767676')
    await field(p, 'background').fill('#ffffff')

    await expect(
      p.locator('[data-check="AA normal text"]')
    ).toHaveAttribute('data-passes', 'true')
    await expect(
      p.locator('[data-check="AAA normal text"]')
    ).toHaveAttribute('data-passes', 'false')
  })

  test('accepts colour names and rgb', async ({ page }) => {
    const p = getPanel(page, 'Contrast checker')
    await field(p, 'foreground').fill('rebeccapurple')
    await field(p, 'background').fill('rgb(255, 255, 255)')

    await expect(p.locator('[data-testid="contrast-ratio"]')).toHaveText('8.41')
  })

  test('explains a colour it cannot read', async ({ page }) => {
    const p = getPanel(page, 'Contrast checker')
    await field(p, 'foreground').fill('not-a-colour')

    await expect(p.getByText('Foreground is not a colour we can read')).toBeVisible()
    await expect(p.locator('[data-testid="contrast-ratio"]')).toHaveCount(0)
  })
})

test.describe('px rem converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'CSS unit converter')
  })

  test('converts px to the other units', async ({ page }) => {
    const p = getPanel(page, 'CSS unit converter')

    await expect(field(p, 'rem')).toHaveValue('1.5')
    await expect(field(p, 'pt')).toHaveValue('18')
  })

  test('respects a changed root font size', async ({ page }) => {
    const p = getPanel(page, 'CSS unit converter')
    await field(p, 'root font size (px)').fill('10')

    await expect(field(p, 'rem')).toHaveValue('2.4')
  })

  test('converts from rem back to px', async ({ page }) => {
    const p = getPanel(page, 'CSS unit converter')
    await p.getByLabel('Unit', { exact: true }).selectOption('rem')
    await field(p, 'value').fill('2')

    await expect(field(p, 'px')).toHaveValue('32')
  })

  test('shortcut buttons set a common size', async ({ page }) => {
    const p = getPanel(page, 'CSS unit converter')
    await p.getByRole('button', { name: '32px', exact: true }).click()

    await expect(field(p, 'value')).toHaveValue('32')
    await expect(field(p, 'rem')).toHaveValue('2')
  })
})

test.describe('lorem ipsum', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Lorem ipsum')
  })

  test('generates paragraphs starting with the classic opening', async ({
    page,
  }) => {
    const p = getPanel(page, 'Lorem ipsum')
    await expect(field(p, 'lorem ipsum')).toHaveValue(/^Lorem ipsum dolor sit amet/)

    const text = await field(p, 'lorem ipsum').inputValue()
    expect(text.split('\n\n')).toHaveLength(3)
  })

  test('counts words when the unit is words', async ({ page }) => {
    const p = getPanel(page, 'Lorem ipsum')
    await p.getByLabel('Unit', { exact: true }).selectOption('words')
    await p.getByLabel('Amount', { exact: true }).fill('7')

    // Retrying assertion: the regenerate runs after a react render.
    await expect(field(p, 'lorem ipsum')).toHaveValue(/^\S+(?: \S+){6}$/)
  })

  test('regenerate produces different text', async ({ page }) => {
    const p = getPanel(page, 'Lorem ipsum')
    const before = await field(p, 'lorem ipsum').inputValue()

    await p.getByRole('button', { name: 'Regenerate' }).click()
    await expect(field(p, 'lorem ipsum')).not.toHaveValue(before)
  })

  test('the classic opening can be turned off', async ({ page }) => {
    const p = getPanel(page, 'Lorem ipsum')
    await p.getByText('start with').click()

    await expect(field(p, 'lorem ipsum')).not.toHaveValue(
      /^Lorem ipsum dolor sit amet/
    )
  })
})

test.describe('slug generator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Slug generator')
  })

  test('folds accents and strips punctuation', async ({ page }) => {
    const p = getPanel(page, 'Slug generator')
    await field(p, 'text').fill("Héllo, Wörld! — it's 2024")

    await expect(field(p, 'slug')).toHaveValue('hello-world-its-2024')
  })

  test('separator and case are configurable', async ({ page }) => {
    const p = getPanel(page, 'Slug generator')
    await field(p, 'text').fill('Keep The Case')

    await p.getByRole('button', { name: 'Underscore' }).click()
    await expect(field(p, 'slug')).toHaveValue('keep_the_case')

    await p.getByText('lowercase').click()
    await expect(field(p, 'slug')).toHaveValue('Keep_The_Case')
  })
})

test.describe('char codes', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Binary and hex converter')
  })

  test('encodes text to hex and binary', async ({ page }) => {
    const p = getPanel(page, 'Binary and hex converter')
    await field(p, 'text').fill('hi')

    await expect(field(p, 'hex codes')).toHaveValue('68 69')

    await p.getByLabel('Base', { exact: true }).selectOption('binary')
    await expect(field(p, 'binary codes')).toHaveValue('01101000 01101001')
  })

  test('decodes codes back to text', async ({ page }) => {
    const p = getPanel(page, 'Binary and hex converter')
    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'hex codes').fill('48 65 6c 6c 6f')

    await expect(field(p, 'text')).toHaveValue('Hello')
  })

  test('uses utf-8 bytes for non-ascii', async ({ page }) => {
    const p = getPanel(page, 'Binary and hex converter')
    await field(p, 'text').fill('é')

    await expect(field(p, 'hex codes')).toHaveValue('c3 a9')
  })

  test('rejects input that is not a valid byte', async ({ page }) => {
    const p = getPanel(page, 'Binary and hex converter')
    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'hex codes').fill('zz')

    await expect(p.getByText('is not a valid hex byte')).toBeVisible()
  })
})

test.describe('ascii table', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'ASCII table')
  })

  test('lists all 128 characters', async ({ page }) => {
    const p = getPanel(page, 'ASCII table')
    await expect(p.locator('[data-testid="reference-count"]')).toContainText(
      '128 of 128'
    )
  })

  test('finds a character by name', async ({ page }) => {
    const p = getPanel(page, 'ASCII table')
    await p.getByRole('searchbox').fill('carriage return')

    const rows = p.locator('[data-testid="reference-row"]')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('0D')
  })

  test('shows every base for a character', async ({ page }) => {
    const p = getPanel(page, 'ASCII table')
    await p.getByRole('searchbox').fill('uppercase A')

    const row = p.locator('[data-testid="reference-row"]').first()
    await expect(row).toContainText('65')
    await expect(row).toContainText('41')
    await expect(row).toContainText('101')
    await expect(row).toContainText('01000001')
  })
})

test.describe('date difference', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Date difference')
  })

  test('counts days, weekdays and the calendar breakdown', async ({ page }) => {
    const p = getPanel(page, 'Date difference')
    await p.getByLabel('From date', { exact: true }).fill('2024-01-01')
    await p.getByLabel('To date', { exact: true }).fill('2024-01-31')

    await expect(field(p, 'total days')).toHaveValue('30')
    await expect(field(p, 'weeks and days')).toHaveValue('4 weeks, 2 days')
    await expect(field(p, 'calendar')).toHaveValue('30 days')
    await expect(field(p, 'weekdays')).toHaveValue('22')
    await expect(field(p, 'weekend days')).toHaveValue('8')
    await expect(field(p, 'hours')).toHaveValue('720')
  })

  test('spans months and years', async ({ page }) => {
    const p = getPanel(page, 'Date difference')
    await p.getByLabel('From date', { exact: true }).fill('2020-02-29')
    await p.getByLabel('To date', { exact: true }).fill('2024-05-15')

    await expect(field(p, 'calendar')).toHaveValue('4 years, 2 months, 16 days')
    await expect(field(p, 'total days')).toHaveValue('1537')
  })

  test('reports a negative total when the dates are the other way round', async ({
    page,
  }) => {
    const p = getPanel(page, 'Date difference')
    await p.getByLabel('From date', { exact: true }).fill('2024-03-01')
    await p.getByLabel('To date', { exact: true }).fill('2024-02-01')

    await expect(field(p, 'total days')).toHaveValue('-29')
    await expect(field(p, 'calendar')).toHaveValue('1 month')
  })

  test('swap reverses the two dates', async ({ page }) => {
    const p = getPanel(page, 'Date difference')
    await p.getByLabel('From date', { exact: true }).fill('2024-01-01')
    await p.getByLabel('To date', { exact: true }).fill('2024-01-11')
    await expect(field(p, 'total days')).toHaveValue('10')

    await p.getByRole('button', { name: 'swap' }).click()
    await expect(field(p, 'total days')).toHaveValue('-10')
  })
})
