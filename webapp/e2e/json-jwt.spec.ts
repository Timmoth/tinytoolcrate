import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('format json', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JSON formatter')
  })

  test('pretty prints valid json', async ({ page }) => {
    const p = getPanel(page, 'JSON formatter')
    await field(p, 'Input JSON').fill('{"b":1,"a":[1,2]}')
    await expect(field(p, 'Formatted JSON')).toHaveValue(
      '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}'
    )
    await expect(p.getByText('Invalid JSON')).toBeHidden()
  })

  test('shows an error for invalid json and clears output', async ({
    page,
  }) => {
    const p = getPanel(page, 'JSON formatter')
    await field(p, 'Input JSON').fill('{"a":1}')
    await field(p, 'Input JSON').fill('{oops')
    await expect(p.getByText('Invalid JSON')).toBeVisible()
    await expect(field(p, 'Formatted JSON')).toHaveValue('')
  })
})

test.describe('jwt decode', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JWT decoder')
  })

  test('decodes the sample jwt on load', async ({ page }) => {
    const p = getPanel(page, 'JWT decoder')
    await expect(field(p, 'decoded jwt')).toHaveValue(/"name": "John Doe"/)
    await expect(field(p, 'decoded jwt')).toHaveValue(/"sub": "1234567890"/)
  })

  test('decodes a custom jwt', async ({ page }) => {
    const p = getPanel(page, 'JWT decoder')
    const payload = btoa(JSON.stringify({ hello: 'world' }))
    await field(p, 'Encoded jwt').fill(`header.${payload}.sig`)
    await expect(field(p, 'decoded jwt')).toHaveValue(
      '{\n  "hello": "world"\n}'
    )
  })

  test('invalid jwt shows an error', async ({ page }) => {
    const p = getPanel(page, 'JWT decoder')
    await field(p, 'Encoded jwt').fill('not.a.valid.jwt')
    await expect(field(p, 'decoded jwt')).toHaveValue('invalid jwt')
  })
})
