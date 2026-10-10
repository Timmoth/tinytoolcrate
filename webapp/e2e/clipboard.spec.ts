import { expect, test } from '@playwright/test'
import { addPanel, copyButton, field, getPanel, openApp } from './helpers'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test.describe('copy to clipboard', () => {
  test('copies the generated guid', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    const guid = await field(p, 'uuid v4').inputValue()
    await copyButton(p, 'uuid v4').click()

    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(guid)
  })

  test('copies the base64 encoded output', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Base64 encode')
    const p = getPanel(page, 'Base64 encode')

    await field(p, 'enter text').fill('copy me')
    await copyButton(p, 'encoded').click()

    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('Y29weSBtZQ==')
  })

  test('copying shows a toast', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'UUID generator')
    const p = getPanel(page, 'UUID generator')

    await copyButton(p, 'uuid v4').click()
    await expect(
      page.locator('[data-testid="toaster"]')
    ).toContainText('Copied to clipboard')
  })
})
