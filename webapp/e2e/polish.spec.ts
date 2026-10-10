import { expect, test } from '@playwright/test'
import { addPanel, getPanel, openApp } from './helpers'

test.describe('theme', () => {
  test('defaults to dark and toggles to light', async ({ page }) => {
    await openApp(page)
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('theme choice persists across reloads', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})

test.describe('drag to reorder', () => {
  test('panels can be reordered by dragging the handle', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    await addPanel(page, 'time', 'Clock')

    await expect(
      page.locator('[data-testid="panel"]').first()
    ).toHaveAttribute('data-panel-type', 'UUID generator')

    await page.dragAndDrop(
      '[data-testid="panel"][data-panel-type="Clock"] [data-testid="drag-handle"]',
      '[data-testid="panel"][data-panel-type="UUID generator"]'
    )

    const order = await page
      .locator('[data-testid="panel"]')
      .evaluateAll((panels) =>
        panels.map((p) => p.getAttribute('data-panel-type'))
      )
    expect(order).toEqual(['Clock', 'UUID generator'])
  })

  test('drag handle exists on every panel', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    await expect(
      getPanel(page, 'UUID generator').locator('[data-testid="drag-handle"]')
    ).toBeVisible()
  })
})

test.describe('pwa', () => {
  test('manifest is linked', async ({ page }) => {
    await openApp(page)
    await expect(
      page.locator('link[rel="manifest"]')
    ).toHaveAttribute('href', /manifest\.webmanifest/)
  })

  test('service worker registers in production builds', async ({ page }) => {
    // only served from the built app; dev runs skip registration
    await page.goto('http://localhost:4173/')
    const registered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      const registration = await navigator.serviceWorker.ready
      return !!registration.active
    })
    expect(registered).toBe(true)
  })
})
