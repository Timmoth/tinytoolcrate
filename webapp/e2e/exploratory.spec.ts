import { expect, test } from '@playwright/test'
import { CATEGORIES, field, getPanel, openApp } from './helpers'

const ALL_PANELS = Object.values(CATEGORIES).flat()

test.describe('exploratory regressions', () => {
  test('hostile panels param is rendered as text, not executed', async ({
    page,
  }) => {
    let dialog = false
    page.on('dialog', (d) => {
      dialog = true
      void d.dismiss()
    })

    await page.goto('/?panels=%3Cscript%3Ealert(1)%3C%2Fscript%3E')
    await expect(
      page.getByRole('heading', { level: 2, name: '<script>alert(1)</script>' })
    ).toBeVisible()
    expect(dialog).toBe(false)
  })

  test('calculator blocks prototype-chain escapes', async ({ page }) => {
    await page.goto('/?panels=Calculator')
    const input = field(page, 'input')
    await input.fill('x = 1; x.constructor("return globalThis")()')
    await input.press('Enter')
    await expect(
      page.locator('[data-testid="calc-history"]')
    ).toContainText('= error')
  })

  test('catastrophic regex is killed by timeout, page stays responsive', async ({
    page,
  }) => {
    await page.goto('/?panels=Regex%20tester')
    const p = getPanel(page, 'Regex tester')

    await field(p, 'pattern').fill('(a+)+$')
    await field(p, 'test string').fill('a'.repeat(30) + 'b')

    await expect(p.getByText('Regex timed out (too complex)')).toBeVisible({
      timeout: 3000,
    })

    // page must still respond afterwards
    await field(p, 'pattern').fill('a')
    await expect(field(p, 'matches')).toHaveValue('30', { timeout: 3000 })
  })

  test('password generator keeps at least one charset enabled', async ({
    page,
  }) => {
    await page.goto('/?panels=Password%20generator')
    const p = getPanel(page, 'Password generator')

    for (const name of ['lowercase', 'uppercase', 'digits', 'symbols']) {
      await p.getByRole('checkbox', { name }).click()
    }

    const checked = await p
      .getByRole('checkbox')
      .evaluateAll((boxes) => boxes.filter((b) => (b as HTMLInputElement).checked).length)
    expect(checked).toBe(1)
    await expect(field(p, 'password')).not.toHaveValue('')
  })

  test('alarm fires when the target time is reached', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-06-01T10:00:00') })
    await page.goto('/?panels=Alarm')
    const p = getPanel(page, 'Alarm')

    await p
      .locator('[data-testid="stepper"][data-stepper="seconds"]')
      .getByRole('button', { name: '▲' })
      .click()

    await p.getByRole('button', { name: 'Start' }).click()
    await page.clock.fastForward('00:03')

    await expect(p.locator('[data-testid="remaining-time"]')).toBeHidden()
    await expect(p.getByRole('button', { name: 'Stop' })).toBeDisabled()
  })

  test('every utility can be open at once', async ({ page }) => {
    const url = '/?' + ALL_PANELS.map((p) => `panels=${encodeURIComponent(p)}`).join('&')
    await page.goto(url)
    await expect(page.locator('[data-testid="panel"]')).toHaveCount(
      ALL_PANELS.length
    )
    await expect(
      page.getByRole('heading', { level: 1, name: 'tinytoolcrate' })
    ).toBeVisible()
  })

  test('dragging a panel onto itself keeps the order', async ({ page }) => {
    await page.goto('/?panels=Clock&panels=Guid%20generator')
    await page.dragAndDrop(
      '[data-panel-type="Clock"] [data-testid="drag-handle"]',
      '[data-panel-type="Clock"]'
    )
    const order = await page
      .locator('[data-testid="panel"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-panel-type')))
    expect(order).toEqual(['Clock', 'UUID generator'])
  })

  test.describe('mobile', () => {
    test.use({ viewport: { width: 375, height: 700 } })

    test('no horizontal overflow with a panel open', async ({ page }) => {
      await openApp(page)
      await page.goto('/?panels=Calculator')
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
      expect(overflow).toBeLessThanOrEqual(1)
    })
  })
})
