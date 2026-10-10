import { expect, test } from '@playwright/test'
import { addPanel, CATEGORIES, getPanel, openApp } from './helpers'

const ALL_TOOLS = Object.values(CATEGORIES).flat()

test.describe('panel info', () => {
  test('every panel has an info button that describes it', async ({ page }) => {
    test.slow()

    const query = ALL_TOOLS.map(
      (tool) => `panels=${encodeURIComponent(tool)}`
    ).join('&')
    await page.goto(`/?${query}`)

    await expect(page.locator('[data-testid="panel"]')).toHaveCount(
      ALL_TOOLS.length
    )
    await expect(page.locator('[data-testid="info-button"]')).toHaveCount(
      ALL_TOOLS.length
    )

    for (const tool of ALL_TOOLS) {
      await expect(
        getPanel(page, tool).getByRole('button', { name: `About ${tool}` })
      ).toBeVisible()
    }
  })

  test('the info popover explains the tool', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JWT decoder')
    const p = getPanel(page, 'JWT decoder')

    const info = p.getByRole('button', { name: 'About JWT decoder' })
    await expect(info).toHaveAttribute('aria-expanded', 'false')
    await expect(p.locator('[data-testid="info-popover"]')).toBeHidden()

    await info.click()

    const popover = p.locator('[data-testid="info-popover"]')
    await expect(popover).toBeVisible()
    await expect(popover).toContainText('JWT decoder')
    await expect(popover).toContainText('does not verify the signature')
    await expect(info).toHaveAttribute('aria-expanded', 'true')
  })

  test('escape closes the popover', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    await p.getByRole('button', { name: 'About UUID generator' }).click()
    await expect(p.locator('[data-testid="info-popover"]')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(p.locator('[data-testid="info-popover"]')).toBeHidden()
  })

  test('clicking outside closes the popover', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    await p.getByRole('button', { name: 'About UUID generator' }).click()
    await expect(p.locator('[data-testid="info-popover"]')).toBeVisible()

    await page.mouse.click(10, 500)
    await expect(p.locator('[data-testid="info-popover"]')).toBeHidden()
  })

  test('two panels keep separate popovers', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    await addPanel(page, 'time', 'Clock')

    await getPanel(page, 'Clock')
      .getByRole('button', { name: 'About Clock' })
      .click()

    await expect(
      getPanel(page, 'Clock').locator('[data-testid="info-popover"]')
    ).toBeVisible()
    await expect(
      getPanel(page, 'UUID generator').locator('[data-testid="info-popover"]')
    ).toBeHidden()
  })

  test('the info button does not interfere with removing a panel', async ({
    page,
  }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')

    await getPanel(page, 'UUID generator')
      .getByRole('button', { name: 'Remove' })
      .click()

    await expect(getPanel(page, 'UUID generator')).toBeHidden()
  })
})
