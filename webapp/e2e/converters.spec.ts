import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('unit converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Unit converter')
  })

  test('converts length across metric and imperial', async ({ page }) => {
    const p = getPanel(page, 'Unit converter')

    await expect(field(p, 'cm — centimetre')).toHaveValue('100')
    await expect(field(p, 'ft — foot')).toHaveValue('3.28084')
    await expect(field(p, 'in — inch')).toHaveValue('39.370079')
  })

  test('converts from inches back to centimetres', async ({ page }) => {
    const p = getPanel(page, 'Unit converter')
    await p.getByLabel('Unit', { exact: true }).selectOption('in')
    await field(p, 'value').fill('12')

    await expect(field(p, 'cm — centimetre')).toHaveValue('30.48')
    await expect(field(p, 'ft — foot')).toHaveValue('1')
  })

  test('mass converts kilograms to pounds and stone', async ({ page }) => {
    const p = getPanel(page, 'Unit converter')
    await p.getByLabel('Category', { exact: true }).selectOption('mass')
    await field(p, 'value').fill('70')

    await expect(field(p, 'lb — pound')).toHaveValue('154.3236')
    await expect(field(p, 'g — gram')).toHaveValue('70000')
  })

  test('temperature uses the right offsets, not a multiplier', async ({ page }) => {
    const p = getPanel(page, 'Unit converter')
    await p.getByLabel('Category', { exact: true }).selectOption('temperature')
    await p.getByLabel('Unit', { exact: true }).selectOption('°C')

    await field(p, 'value').fill('100')
    await expect(field(p, '°F — fahrenheit')).toHaveValue('212')
    await expect(field(p, 'K — kelvin')).toHaveValue('373.15')

    await field(p, 'value').fill('0')
    await expect(field(p, '°F — fahrenheit')).toHaveValue('32')

    await field(p, 'value').fill('-40')
    await expect(field(p, '°F — fahrenheit')).toHaveValue('-40')
  })

  test('speed converts mph to km/h', async ({ page }) => {
    const p = getPanel(page, 'Unit converter')
    await p.getByLabel('Category', { exact: true }).selectOption('speed')
    await p.getByLabel('Unit', { exact: true }).selectOption('mph')
    await field(p, 'value').fill('60')

    await expect(field(p, 'km/h — kilometres per hour')).toHaveValue('96.56064')
  })

  test('rejects text', async ({ page }) => {
    const p = getPanel(page, 'Unit converter')
    await field(p, 'value').fill('abc')
    await expect(p.getByText('Enter a number')).toBeVisible()
  })
})

test.describe('emoji picker', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Emoji picker')
  })

  test('searches by unicode name', async ({ page }) => {
    const p = getPanel(page, 'Emoji picker')
    await p.getByRole('searchbox').fill('rocket')

    await expect(p.getByTestId('emoji').first()).toHaveText('🚀')
  })

  test('searches by the words people actually use', async ({ page }) => {
    const p = getPanel(page, 'Emoji picker')
    await p.getByRole('searchbox').fill('lol')

    await expect(p.getByTestId('emoji').first()).toHaveText('😂')
  })

  test('filters by group', async ({ page }) => {
    const p = getPanel(page, 'Emoji picker')
    const all = await p.getByTestId('emoji').count()

    await p.getByRole('button', { name: 'Food', exact: true }).click()
    const food = await p.getByTestId('emoji').count()

    expect(food).toBeGreaterThan(0)
    expect(food).toBeLessThan(all)
  })

  test('selecting one shows its escape sequences', async ({ page }) => {
    const p = getPanel(page, 'Emoji picker')
    await p.getByRole('searchbox').fill('rocket')
    await p.getByTestId('emoji').first().click()

    await expect(p.getByTestId('emoji-selected')).toHaveText('🚀')
    await expect(field(p, 'code point')).toHaveValue('U+1F680')
    await expect(field(p, 'html')).toHaveValue('&#128640;')
    await expect(field(p, 'css')).toHaveValue('\\1F680')
    await expect(field(p, 'javascript')).toHaveValue('\\u{1F680}')
  })

  test('shows an empty state', async ({ page }) => {
    const p = getPanel(page, 'Emoji picker')
    await p.getByRole('searchbox').fill('zzzzzz')

    await expect(p.getByText('No emoji found')).toBeVisible()
    await expect(p.getByTestId('emoji-count')).toContainText('0 of')
  })
})
