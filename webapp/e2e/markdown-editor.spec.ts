import { expect, Page, test } from '@playwright/test'
import { addPanel, codeInput, getPanel, openApp } from './helpers'

const panel = (page: Page) => getPanel(page, 'Markdown editor')
const preview = (page: Page) => panel(page).locator('[data-testid="markdown-preview"]')

test.describe('markdown editor', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Markdown editor')
  })

  test('renders the sample document on open', async ({ page }) => {
    await expect(preview(page).locator('h1')).toHaveText('Title')
    await expect(preview(page).locator('strong').first()).toHaveText('markdown')
    await expect(preview(page).locator('li')).toHaveCount(2)
  })

  test('preview follows what you type', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('## Hello\n\nSome _emphasis_ here.')

    await expect(preview(page).locator('h2')).toHaveText('Hello')
    await expect(preview(page).locator('em')).toHaveText('emphasis')
  })

  test('renders tables', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('| a | b |\n| - | - |\n| 1 | 2 |')

    await expect(preview(page).locator('th')).toHaveCount(2)
    await expect(preview(page).locator('td').first()).toHaveText('1')
  })

  test('renders task lists', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('- [ ] todo\n- [x] done')

    const boxes = preview(page).locator('input[type="checkbox"]')
    await expect(boxes).toHaveCount(2)
    await expect(boxes.nth(1)).toBeChecked()
  })

  test('highlights code inside a fenced block', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('```js\nconst a = 1\n```')

    await expect(preview(page).locator('pre code .tok-keyword').first()).toHaveText(
      'const'
    )
  })

  test('escapes raw html instead of rendering it', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>')

    await expect(preview(page).locator('script')).toHaveCount(0)
    await expect(preview(page).locator('img')).toHaveCount(0)
    await expect(preview(page)).toContainText('<script>alert(1)</script>')
  })

  test('drops a javascript: link', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('[click](javascript:alert(1))')

    await expect(preview(page).locator('a')).toHaveCount(0)
    await expect(preview(page)).toContainText('[click](javascript:alert(1))')
  })

  test('keeps an ordinary link and opens it safely', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('[home](https://example.com)')

    const link = preview(page).locator('a')
    await expect(link).toHaveAttribute('href', 'https://example.com')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('bold button wraps the selection', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('make me bold')
    await codeInput(p).press('ControlOrMeta+a')
    await p.getByRole('button', { name: 'Bold' }).click()

    await expect(codeInput(p)).toHaveValue('**make me bold**')
    await expect(preview(page).locator('strong')).toHaveText('make me bold')
  })

  test('bold button inserts a placeholder when nothing is selected', async ({
    page,
  }) => {
    const p = panel(page)
    await codeInput(p).fill('')
    await p.getByRole('button', { name: 'Bold' }).click()

    await expect(codeInput(p)).toHaveValue('**bold text**')
  })

  test('heading button prefixes the current line', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('My heading')
    await p.getByRole('button', { name: 'Heading 1' }).click()

    await expect(codeInput(p)).toHaveValue('# My heading')
    await expect(preview(page).locator('h1')).toHaveText('My heading')
  })

  test('list button numbers the selected lines', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('one\ntwo')
    await codeInput(p).press('ControlOrMeta+a')
    await p.getByRole('button', { name: 'Numbered list' }).click()

    await expect(codeInput(p)).toHaveValue('1. one\n2. two')
    await expect(preview(page).locator('ol li')).toHaveCount(2)
  })

  test('table button inserts a starter table', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('')
    await p.getByRole('button', { name: 'Table', exact: true }).click()

    await expect(preview(page).locator('table')).toBeVisible()
  })

  test('view toggles hide the editor or the preview', async ({ page }) => {
    const p = panel(page)

    await p.getByRole('button', { name: 'preview', exact: true }).click()
    await expect(codeInput(p)).toBeHidden()
    await expect(preview(page)).toBeVisible()

    await p.getByRole('button', { name: 'write', exact: true }).click()
    await expect(codeInput(p)).toBeVisible()
    await expect(preview(page)).toBeHidden()

    await p.getByRole('button', { name: 'split', exact: true }).click()
    await expect(codeInput(p)).toBeVisible()
    await expect(preview(page)).toBeVisible()
  })

  test('warns about an unclosed fence while still rendering', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('# Title\n\n```js\nconst a = 1\n')

    await expect(p.locator('[data-testid="validity"]')).toContainText('1 error')
    await expect(preview(page).locator('h1')).toHaveText('Title')
  })

  test('counts words', async ({ page }) => {
    const p = panel(page)
    await codeInput(p).fill('one two three four')
    await expect(p.getByText('4 words')).toBeVisible()
  })
})
