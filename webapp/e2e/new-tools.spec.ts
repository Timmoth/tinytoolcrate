import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('regex tester', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Regex tester')
  })

  test('counts and lists matches', async ({ page }) => {
    const p = getPanel(page, 'Regex tester')
    await field(p, 'pattern').fill('\\d+')
    await field(p, 'test string').fill('a1b22c333')
    await expect(field(p, 'matches')).toHaveValue('3')
    await expect(field(p, 'matched values')).toHaveValue('1\n22\n333')
  })

  test('supports flags', async ({ page }) => {
    const p = getPanel(page, 'Regex tester')
    await field(p, 'pattern').fill('hello')
    await field(p, 'flags').fill('i')
    await field(p, 'test string').fill('Hello HELLO hello')
    await expect(field(p, 'matches')).toHaveValue('3')
  })

  test('invalid pattern shows an error', async ({ page }) => {
    const p = getPanel(page, 'Regex tester')
    await field(p, 'pattern').fill('(')
    await expect(p.getByText('Invalid regex')).toBeVisible()
    await expect(field(p, 'matches')).toHaveValue('0')
  })
})

test.describe('hash generator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Hash generator')
  })

  test('computes all hashes for text', async ({ page }) => {
    const p = getPanel(page, 'Hash generator')
    await field(p, 'enter text').fill('hello')

    await expect(field(p, 'SHA-1 Hash')).toHaveValue(
      'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'
    )
    await expect(field(p, 'SHA-256 Hash')).toHaveValue(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    )
    await expect(field(p, 'SHA-384 Hash')).toHaveValue(
      '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f'
    )
    await expect(field(p, 'SHA-512 Hash')).toHaveValue(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
    )
  })

  test('clears hashes when input is cleared', async ({ page }) => {
    const p = getPanel(page, 'Hash generator')
    await field(p, 'enter text').fill('hello')
    await expect(field(p, 'SHA-256 Hash')).not.toHaveValue('')
    await field(p, 'enter text').fill('')
    await expect(field(p, 'SHA-256 Hash')).toHaveCount(0)
  })
})

test.describe('password generator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Password generator')
  })

  test('generates a 20 char password by default', async ({ page }) => {
    const p = getPanel(page, 'Password generator')
    const password = await field(p, 'password').inputValue()
    expect(password).toHaveLength(20)
    await expect(p.locator('[data-testid="pw-length"]')).toHaveText('20')
  })

  test('length stepper adjusts length', async ({ page }) => {
    const p = getPanel(page, 'Password generator')
    await p.locator('[data-testid="pw-increase"]').click()
    await p.locator('[data-testid="pw-increase"]').click()
    await expect(p.locator('[data-testid="pw-length"]')).toHaveText('22')
    await expect(field(p, 'password')).toHaveValue(/.{22}/)
  })

  test('toggling digits removes them', async ({ page }) => {
    const p = getPanel(page, 'Password generator')
    await p.getByRole('checkbox', { name: 'digits' }).uncheck()
    const password = await field(p, 'password').inputValue()
    expect(password).not.toMatch(/\d/)
  })

  test('generate produces a new password', async ({ page }) => {
    const p = getPanel(page, 'Password generator')
    const first = await field(p, 'password').inputValue()
    await p.getByRole('button', { name: 'Generate' }).click()
    const second = await field(p, 'password').inputValue()
    expect(second).not.toBe(first)
  })
})

test.describe('case converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Case converter')
  })

  test('converts between all cases', async ({ page }) => {
    const p = getPanel(page, 'Case converter')
    await field(p, 'enter text').fill('hello world foo')

    await expect(field(p, 'camelCase')).toHaveValue('helloWorldFoo')
    await expect(field(p, 'snake_case')).toHaveValue('hello_world_foo')
    await expect(field(p, 'kebab-case')).toHaveValue('hello-world-foo')
    await expect(field(p, 'Title Case')).toHaveValue('Hello World Foo')
    await expect(field(p, 'UPPERCASE')).toHaveValue('HELLO WORLD FOO')
    await expect(field(p, 'lowercase')).toHaveValue('hello world foo')
  })

  test('splits camelCase input', async ({ page }) => {
    const p = getPanel(page, 'Case converter')
    await field(p, 'enter text').fill('myVariableName')
    await expect(field(p, 'snake_case')).toHaveValue('my_variable_name')
  })
})

test.describe('base converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Number base converter')
  })

  test('converts decimal to all bases', async ({ page }) => {
    const p = getPanel(page, 'Number base converter')
    await field(p, 'value').fill('255')

    await expect(field(p, 'hex')).toHaveValue('ff')
    await expect(field(p, 'decimal')).toHaveValue('255')
    await expect(field(p, 'octal')).toHaveValue('377')
    await expect(field(p, 'binary')).toHaveValue('11111111')
  })

  test('converts from another base', async ({ page }) => {
    const p = getPanel(page, 'Number base converter')
    await p.locator('[data-testid="base-select"]').selectOption('16')
    await field(p, 'value').fill('ff')
    await expect(field(p, 'decimal')).toHaveValue('255')
  })

  test('invalid digit for base shows an error', async ({ page }) => {
    const p = getPanel(page, 'Number base converter')
    await p.locator('[data-testid="base-select"]').selectOption('2')
    await field(p, 'value').fill('12')
    await expect(p.getByText('Invalid number for base 2')).toBeVisible()
  })
})

test.describe('timestamp converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Timestamp converter')
  })

  test('converts unix seconds to human and iso', async ({ page }) => {
    const p = getPanel(page, 'Timestamp converter')
    await field(p, 'unix time (s or ms)').fill('1735689600')
    await expect(field(p, 'iso 8601')).toHaveValue('2025-01-01T00:00:00.000Z')
    await expect(field(p, 'human date')).not.toHaveValue('')
  })

  test('accepts milliseconds too', async ({ page }) => {
    const p = getPanel(page, 'Timestamp converter')
    await field(p, 'unix time (s or ms)').fill('1735689600000')
    await expect(field(p, 'iso 8601')).toHaveValue('2025-01-01T00:00:00.000Z')
  })

  test('invalid timestamp shows an error', async ({ page }) => {
    const p = getPanel(page, 'Timestamp converter')
    await field(p, 'unix time (s or ms)').fill('abc')
    await expect(p.getByText('Invalid timestamp')).toBeVisible()
  })

  test('date input produces unix seconds', async ({ page }) => {
    const p = getPanel(page, 'Timestamp converter')
    await p.locator('[data-testid="date-input"]').evaluate((el) => {
      const input = el as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set
      setter?.call(input, '2025-01-01T12:00:00')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const unix = await field(p, 'unix seconds').inputValue()
    expect(Number(unix)).toBeGreaterThan(0)
  })
})

test.describe('json minify', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'json', 'JSON minifier')
  })

  test('minifies valid json', async ({ page }) => {
    const p = getPanel(page, 'JSON minifier')
    await field(p, 'Input JSON').fill('{\n  "a": 1,\n  "b": [1, 2]\n}')
    await expect(field(p, 'Minified JSON')).toHaveValue('{"a":1,"b":[1,2]}')
  })

  test('invalid json shows an error', async ({ page }) => {
    const p = getPanel(page, 'JSON minifier')
    await field(p, 'Input JSON').fill('{oops')
    await expect(p.getByText('Invalid JSON')).toBeVisible()
    await expect(field(p, 'Minified JSON')).toHaveValue('')
  })
})

test.describe('html entities', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'HTML entities')
  })

  test('encodes special characters', async ({ page }) => {
    const p = getPanel(page, 'HTML entities')
    await field(p, 'enter text').fill('<a href="x">&</a>')
    await expect(field(p, 'encoded')).toHaveValue(
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;'
    )
  })

  test('decodes named and numeric entities', async ({ page }) => {
    const p = getPanel(page, 'HTML entities')
    await field(p, 'enter text').fill('&lt;b&gt;&#65;&#x42;&amp;')
    await expect(field(p, 'decoded')).toHaveValue('<b>AB&')
  })
})

test.describe('cron explain', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Cron explainer')
  })

  test('describes the default expression', async ({ page }) => {
    const p = getPanel(page, 'Cron explainer')
    await expect(field(p, 'description')).toHaveValue(/Every 5 minutes|Minutes/)
    await expect(field(p, 'next runs')).not.toHaveValue('')
  })

  test('describes a fixed schedule', async ({ page }) => {
    const p = getPanel(page, 'Cron explainer')
    await field(p, 'cron expression').fill('0 9 * * 1-5')
    await expect(field(p, 'description')).toHaveValue('At 09:00, on Mon, Tue, Wed, Thu, Fri')
    await expect(field(p, 'next runs')).toContainText('9:00')
  })

  test('invalid expression shows an error', async ({ page }) => {
    const p = getPanel(page, 'Cron explainer')
    await field(p, 'cron expression').fill('bad')
    await expect(p.getByText('Expected 5 fields')).toBeVisible()
  })
})

test.describe('text diff', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Text diff')
  })

  test('shows added and removed lines', async ({ page }) => {
    const p = getPanel(page, 'Text diff')
    await field(p, 'original').fill('a\nb\nc')
    await field(p, 'changed').fill('a\nx\nc')
    await expect(field(p, 'diff')).toHaveValue('  a\n- b\n+ x\n  c')
  })

  test('identical inputs show no changes', async ({ page }) => {
    const p = getPanel(page, 'Text diff')
    await field(p, 'original').fill('same\nlines')
    await field(p, 'changed').fill('same\nlines')
    await expect(field(p, 'diff')).toHaveValue('  same\n  lines')
  })
})
