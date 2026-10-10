import { expect, test } from '@playwright/test'
import { addPanel, CATEGORIES, field, getPanel, openApp } from './helpers'

test.describe('app shell', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test('shows header, nav categories and github link', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'tinytoolcrate' })
    ).toBeVisible()

    for (const category of Object.keys(CATEGORIES)) {
      await expect(
        page.getByRole('button', { name: category, exact: true })
      ).toBeVisible()
    }

    const ghLink = page.getByRole('link', { name: 'GitHub repository' })
    await expect(ghLink).toHaveAttribute(
      'href',
      'https://github.com/Timmoth/tinytoolcrate'
    )
    await expect(ghLink).toHaveAttribute('target', '_blank')
  })

  test('starts with no panels', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0)
  })

  test('every category exposes its utilities in the dropdown', async ({
    page,
  }) => {
    for (const [category, items] of Object.entries(CATEGORIES)) {
      await page
        .getByRole('button', { name: category, exact: true })
        .click()
      for (const item of items) {
        await expect(
          page.getByRole('button', { name: item, exact: true })
        ).toBeVisible()
      }
      await page.keyboard.press('Escape')
    }
  })

  test('menus are keyboard accessible', async ({ page }) => {
    const misc = page.getByRole('button', { name: 'misc', exact: true })
    await expect(misc).toHaveAttribute('aria-expanded', 'false')
    await misc.click()
    await expect(misc).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(misc).toHaveAttribute('aria-expanded', 'false')
  })

  test('search finds utilities across categories', async ({ page }) => {
    await page.getByLabel('Search utilities').fill('base64')

    const results = page.locator('[data-testid="search-results"]')
    await expect(results).toBeVisible()
    await expect(
      results.getByRole('button', { name: 'Base64 encode', exact: true })
    ).toBeVisible()
    await expect(
      results.getByRole('button', { name: 'Base64 decode', exact: true })
    ).toBeVisible()
    await expect(
      results.getByRole('button', { name: 'File checksum', exact: true })
    ).toBeHidden()

    await results
      .getByRole('button', { name: 'Base64 encode', exact: true })
      .click()
    await expect(getPanel(page, 'Base64 encode')).toBeVisible()
    await expect(page.getByLabel('Search utilities')).toHaveValue('')
  })

  test('search with enter adds the first match', async ({ page }) => {
    await page.getByLabel('Search utilities').fill('guid')
    await page.getByLabel('Search utilities').press('Enter')
    await expect(getPanel(page, 'UUID generator')).toBeVisible()
  })

  test('search with no matches shows a hint', async ({ page }) => {
    await page.getByLabel('Search utilities').fill('zzzz')
    await expect(page.getByText('No utilities found')).toBeVisible()
  })

  test('search matches functional keywords, not just names', async ({ page }) => {
    const results = page.locator('[data-testid="search-results"]')

    await page.getByLabel('Search utilities').fill('shuffle')
    await expect(
      results.getByRole('button', { name: 'Sort and dedupe lines', exact: true })
    ).toBeVisible()

    await page.getByLabel('Search utilities').fill('dedupe')
    await expect(
      results.getByRole('button', { name: 'Sort and dedupe lines', exact: true })
    ).toBeVisible()

    await page.getByLabel('Search utilities').fill('2fa')
    await expect(
      results.getByRole('button', { name: 'TOTP generator', exact: true })
    ).toBeVisible()

    await page.getByLabel('Search utilities').fill('pretty print')
    await expect(
      results.getByRole('button', { name: 'JSON formatter', exact: true })
    ).toBeVisible()
  })

  test('search tolerates typos', async ({ page }) => {
    const results = page.locator('[data-testid="search-results"]')

    await page.getByLabel('Search utilities').fill('pasword')
    await expect(
      results.getByRole('button', { name: 'Password generator', exact: true })
    ).toBeVisible()

    await page.getByLabel('Search utilities').fill('timstamp')
    await expect(
      results.getByRole('button', { name: 'Timestamp converter', exact: true })
    ).toBeVisible()
  })

  test('search results show a description', async ({ page }) => {
    await page.getByLabel('Search utilities').fill('sort lines')
    await expect(
      page.getByText('Sort, shuffle, dedupe, trim, and clean up lines of text')
    ).toBeVisible()
  })

  test('multi word search requires all words', async ({ page }) => {
    await page.getByLabel('Search utilities').fill('base64 file')
    const results = page.locator('[data-testid="search-results"]')
    await expect(
      results.getByRole('button', { name: 'File to base64', exact: true })
    ).toBeVisible()
    await expect(
      results.getByRole('button', { name: 'Base64 encode', exact: true })
    ).toBeHidden()
  })

  test('search survives special characters', async ({ page }) => {
    await page
      .getByLabel('Search utilities')
      .fill('<script>alert(1)</script>')
    await expect(page.getByText('No utilities found')).toBeVisible()
    await expect(page.getByText('alert(1)')).toHaveCount(0)
    await expect(page.getByLabel('Search utilities')).toHaveValue(
      '<script>alert(1)</script>'
    )
  })

  test('footer links back to timmoth.com', async ({ page }) => {
    const link = page.getByRole('link', { name: 'built by timmoth' })
    await expect(link).toHaveAttribute('href', 'https://timmoth.com')
  })

  test('document title reflects open panels', async ({ page }) => {
    await expect(page).toHaveTitle(/tinytoolcrate/)
    await addPanel(page, 'misc', 'UUID generator')
    await expect(page).toHaveTitle('UUID generator — tinytoolcrate')
  })

  test('seo meta tags are present', async ({ page }) => {
    await expect(
      page.locator('link[rel="canonical"]')
    ).toHaveAttribute('href', 'https://tinytoolcrate.com/')
    await expect(
      page.locator('meta[name="description"]')
    ).toHaveAttribute('content', /75 free developer tools/)
    await expect(
      page.locator('meta[property="og:image"]')
    ).toHaveAttribute('content', 'https://tinytoolcrate.com/og.png')
    const ldJson = await page
      .locator('script[type="application/ld+json"]')
      .textContent()
    expect(ldJson).toContain('WebApplication')
  })

  test('adding a panel shows it and updates the url', async ({ page }) => {
    await addPanel(page, 'misc', 'UUID generator')

    await expect(
      page.getByRole('heading', { level: 2, name: 'UUID generator' })
    ).toBeVisible()
    await expect(page).toHaveURL(/panels=UUID(\+|%20)generator/)
  })

  test('closing a panel removes it and clears the url param', async ({
    page,
  }) => {
    await addPanel(page, 'misc', 'UUID generator')
    await getPanel(page, 'UUID generator')
      .getByRole('button', { name: 'Remove' })
      .click()

    await expect(getPanel(page, 'UUID generator')).toBeHidden()
    await expect(page).toHaveURL(/^[^?]*\/$/)
  })

  test('multiple panels can be open at once', async ({ page }) => {
    await addPanel(page, 'misc', 'UUID generator')
    await addPanel(page, 'time', 'Clock')

    await expect(
      page.getByRole('heading', { level: 2, name: 'UUID generator' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Clock' })
    ).toBeVisible()
    await expect(page).toHaveURL(/panels=[^&]*&panels=/)
  })

  test('closing the first panel keeps the second one', async ({ page }) => {
    await addPanel(page, 'misc', 'UUID generator')
    await addPanel(page, 'time', 'Clock')

    await getPanel(page, 'UUID generator')
      .getByRole('button', { name: 'Remove' })
      .first()
      .click()

    await expect(getPanel(page, 'UUID generator')).toBeHidden()
    await expect(getPanel(page, 'Clock')).toBeVisible()
  })

  test('the same utility can be added twice', async ({ page }) => {
    await addPanel(page, 'misc', 'UUID generator')
    await addPanel(page, 'misc', 'UUID generator')

    await expect(
      page.getByRole('heading', { level: 2, name: 'UUID generator' })
    ).toHaveCount(2)
  })

  test('panels are restored from query params on reload', async ({ page }) => {
    await page.goto('/?panels=Clock&panels=Guid%20generator')

    await expect(
      page.getByRole('heading', { level: 2, name: 'Clock' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'UUID generator' })
    ).toBeVisible()
  })

  test('panel identity persists across reload but entered content does not', async ({
    page,
  }) => {
    await addPanel(page, 'text', 'Base64 encode')
    await field(page, 'enter text').fill('persist me')

    await page.reload()

    await expect(
      page.getByRole('heading', { level: 2, name: 'Base64 encode' })
    ).toBeVisible()
    await expect(field(page, 'enter text')).toHaveValue('')
  })

  test('unknown panel in query params renders invalid selection', async ({
    page,
  }) => {
    await page.goto('/?panels=bogus')
    await expect(page.getByText('Invalid selection')).toBeVisible()
  })
})
