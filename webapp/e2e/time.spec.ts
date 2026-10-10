import { expect, test } from '@playwright/test'
import {
  addPanel,
  field,
  getPanel,
  openApp,
  stepperColumn,
  stepperValue,
} from './helpers'

const FIELDS = ['hours', 'minutes', 'seconds'] as const

test.describe('unix time', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Current unix time')
  })

  test('shows current unix seconds and millis', async ({ page }) => {
    const p = getPanel(page, 'Current unix time')
    const nowSec = Math.floor(Date.now() / 1000)
    const nowMs = Date.now()

    const seconds = Number(await field(p, 'seconds').inputValue())
    const millis = Number(await field(p, 'millis').inputValue())

    expect(Math.abs(seconds - nowSec)).toBeLessThanOrEqual(5)
    expect(Math.abs(millis - nowMs)).toBeLessThanOrEqual(5000)
  })

  test('millis tick forward', async ({ page }) => {
    const p = getPanel(page, 'Current unix time')
    const before = Number(await field(p, 'millis').inputValue())
    await expect
      .poll(async () => Number(await field(p, 'millis').inputValue()), {
        timeout: 5000,
      })
      .toBeGreaterThan(before)
  })
})

test.describe('clock', () => {
  test('shows today date and a time', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Clock')
    const p = getPanel(page, 'Clock')

    const today = await page.evaluate(() => new Date().toLocaleDateString())
    await expect(field(p, 'date')).toHaveValue(today)
    await expect(field(p, 'time')).toHaveValue(/\d{1,2}:\d{2}/)
  })
})

test.describe('countdown', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Countdown')
  })

  test('starts at 00:00:00 with stop and reset disabled', async ({ page }) => {
    const p = getPanel(page, 'Countdown')
    for (const f of FIELDS) {
      await expect(stepperValue(p, f)).toHaveText('00')
    }
    await expect(p.getByRole('button', { name: 'Stop' })).toBeDisabled()
    await expect(p.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  test('steppers increment and wrap around', async ({ page }) => {
    const p = getPanel(page, 'Countdown')
    const up = stepperColumn(p, 'seconds').getByRole('button', { name: '▲' })
    const down = stepperColumn(p, 'seconds').getByRole('button', {
      name: '▼',
    })

    await up.click()
    await up.click()
    await expect(stepperValue(p, 'seconds')).toHaveText('02')

    await down.click()
    await down.click()
    await expect(stepperValue(p, 'seconds')).toHaveText('00')

    // decrementing below zero wraps to 59
    await down.click()
    await expect(stepperValue(p, 'seconds')).toHaveText('59')
  })

  test('counts down, stops and resets', async ({ page }) => {
    const p = getPanel(page, 'Countdown')
    const start = p.getByRole('button', { name: 'Start' })
    const stop = p.getByRole('button', { name: 'Stop' })
    const reset = p.getByRole('button', { name: 'Reset' })

    await stepperColumn(p, 'seconds')
      .getByRole('button', { name: '▲' })
      .click()
    await stepperColumn(p, 'seconds')
      .getByRole('button', { name: '▲' })
      .click()
    await expect(stepperValue(p, 'seconds')).toHaveText('02')

    await start.click()
    await expect(start).toBeDisabled()
    await expect(stop).toBeEnabled()

    await expect(stepperValue(p, 'seconds')).toHaveText('01', { timeout: 3000 })

    await stop.click()
    await expect(start).toBeEnabled()
    await expect(stop).toBeDisabled()

    await reset.click()
    for (const f of FIELDS) {
      await expect(stepperValue(p, f)).toHaveText('00')
    }
    await expect(reset).toBeDisabled()
  })

  test('start is a no-op when the timer is all zeros', async ({ page }) => {
    const p = getPanel(page, 'Countdown')
    await p.getByRole('button', { name: 'Start' }).click()
    await expect(p.getByRole('button', { name: 'Stop' })).toBeDisabled()
    for (const f of FIELDS) {
      await expect(stepperValue(p, f)).toHaveText('00')
    }
  })

  test('auto stops when the countdown reaches zero', async ({ page }) => {
    const p = getPanel(page, 'Countdown')
    const start = p.getByRole('button', { name: 'Start' })
    const stop = p.getByRole('button', { name: 'Stop' })

    await stepperColumn(p, 'seconds')
      .getByRole('button', { name: '▲' })
      .click()
    await start.click()
    await expect(stop).toBeEnabled()

    await expect(stop).toBeDisabled({ timeout: 5000 })
    await expect(start).toBeEnabled()
    await expect(stepperValue(p, 'seconds')).toHaveText('00')
  })
})

test.describe('alarm', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Alarm')
  })

  test('start is disabled until a future target time is set', async ({
    page,
  }) => {
    const p = getPanel(page, 'Alarm')
    const start = p.getByRole('button', { name: 'Start' })
    await expect(start).toBeDisabled()

    const up = stepperColumn(p, 'hours').getByRole('button', { name: '▲' })
    await up.click()

    // if incrementing hours wrapped past midnight, wrap forward again
    if (await start.isDisabled()) {
      for (let i = 0; i < 23; i++) {
        await up.click()
      }
    }

    await expect(start).toBeEnabled()
  })

  test('running shows a countdown and stop clears it', async ({ page }) => {
    const p = getPanel(page, 'Alarm')
    const start = p.getByRole('button', { name: 'Start' })
    const stop = p.getByRole('button', { name: 'Stop' })
    const remaining = p.locator('[data-testid="remaining-time"]')

    const up = stepperColumn(p, 'hours').getByRole('button', { name: '▲' })
    await up.click()
    if (await start.isDisabled()) {
      for (let i = 0; i < 23; i++) {
        await up.click()
      }
    }

    await start.click()
    await expect(start).toBeDisabled()
    await expect(stop).toBeEnabled()
    await expect(remaining).toHaveText(/0[01]:\d{2}:\d{2}/)

    await stop.click()
    await expect(remaining).toBeHidden()
    await expect(stop).toBeDisabled()
  })
})
