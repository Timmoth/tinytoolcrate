import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('base64 encode', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Base64 encode')
  })

  test('encodes ascii text live', async ({ page }) => {
    const p = getPanel(page, 'Base64 encode')
    await field(p, 'enter text').fill('Hello, World!')
    await expect(field(p, 'encoded')).toHaveValue('SGVsbG8sIFdvcmxkIQ==')
  })

  test('empty input encodes to empty output', async ({ page }) => {
    const p = getPanel(page, 'Base64 encode')
    await field(p, 'enter text').fill('abc')
    await field(p, 'enter text').fill('')
    await expect(field(p, 'encoded')).toHaveValue('')
  })

  test('encodes unicode (utf-8) correctly', async ({ page }) => {
    const p = getPanel(page, 'Base64 encode')
    await field(p, 'enter text').fill('héllo 😀')
    await expect(field(p, 'encoded')).toHaveValue('aMOpbGxvIPCfmIA=')
  })

  test('output field is read only', async ({ page }) => {
    const p = getPanel(page, 'Base64 encode')
    await expect(field(p, 'encoded')).toHaveAttribute('readonly')
  })
})

test.describe('base64 decode', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Base64 decode')
  })

  test('decodes valid base64 live', async ({ page }) => {
    const p = getPanel(page, 'Base64 decode')
    await field(p, 'enter encoded').fill('SGVsbG8sIFdvcmxkIQ==')
    await expect(field(p, 'decoded')).toHaveValue('Hello, World!')
  })

  test('invalid base64 shows an error', async ({ page }) => {
    const p = getPanel(page, 'Base64 decode')
    await field(p, 'enter encoded').fill('!!!not base64!!!')
    await expect(field(p, 'decoded')).toHaveValue('Error decoding from base64')
  })

  test('decodes utf-8 multibyte correctly', async ({ page }) => {
    const p = getPanel(page, 'Base64 decode')
    await field(p, 'enter encoded').fill('aMOpbGxvIPCfmIA=')
    await expect(field(p, 'decoded')).toHaveValue('héllo 😀')
  })

  test('encode then decode round trips', async ({ page }) => {
    await addPanel(page, 'text', 'Base64 encode')
    const enc = getPanel(page, 'Base64 encode')
    const dec = getPanel(page, 'Base64 decode')

    await field(enc, 'enter text').fill('round trip é')
    await expect(field(enc, 'encoded')).not.toHaveValue('')
    const encoded = await field(enc, 'encoded').inputValue()
    await field(dec, 'enter encoded').fill(encoded)
    await expect(field(dec, 'decoded')).toHaveValue('round trip é')
  })
})

test.describe('url encode / decode', () => {
  test('url encode escapes reserved characters', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'URL encode')
    const p = getPanel(page, 'URL encode')

    await field(p, 'enter text').fill('hello world&=?/#')
    await expect(field(p, 'encoded')).toHaveValue(
      'hello%20world%26%3D%3F%2F%23'
    )
  })

  test('url decode unescapes percent sequences', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'URL decode')
    const p = getPanel(page, 'URL decode')

    await field(p, 'enter encoded').fill('hello%20world%26')
    await expect(field(p, 'decoded')).toHaveValue('hello world&')
  })

  test('malformed percent sequence shows an error', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'URL decode')
    const p = getPanel(page, 'URL decode')

    await field(p, 'enter encoded').fill('%E0%A4%A')
    await expect(field(p, 'decoded')).toHaveValue('Error decoding url')
  })
})

test.describe('text stats', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Word count')
  })

  test('counts lines and words', async ({ page }) => {
    const p = getPanel(page, 'Word count')
    await field(p, 'enter text').fill('one two\nthree four five\nsix')
    await expect(field(p, 'lines')).toHaveValue('3')
    await expect(field(p, 'words')).toHaveValue('6')
  })

  test('empty text is one line with zero words', async ({ page }) => {
    const p = getPanel(page, 'Word count')
    await expect(field(p, 'lines')).toHaveValue('1')
    await expect(field(p, 'words')).toHaveValue('0')
  })

  test('punctuation and whitespace do not count as words', async ({
    page,
  }) => {
    const p = getPanel(page, 'Word count')
    await field(p, 'enter text').fill('  ...!!!  ')
    await expect(field(p, 'words')).toHaveValue('0')
  })
})

test.describe('find and replace', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Find and replace')
  })

  test('replaces all plain matches', async ({ page }) => {
    const p = getPanel(page, 'Find and replace')
    await field(p, 'input text').fill('hello world')
    await field(p, 'find').fill('o')
    await field(p, 'replace').fill('0')
    await expect(field(p, 'output text')).toHaveValue('hell0 w0rld')
  })

  test('supports regex patterns', async ({ page }) => {
    const p = getPanel(page, 'Find and replace')
    await field(p, 'input text').fill('a1b22c333')
    await field(p, 'find').fill('\\d+')
    await field(p, 'replace').fill('N')
    await expect(field(p, 'output text')).toHaveValue('aNbNcN')
  })

  test('empty find mirrors the input', async ({ page }) => {
    const p = getPanel(page, 'Find and replace')
    await field(p, 'input text').fill('unchanged')
    await expect(field(p, 'output text')).toHaveValue('unchanged')
  })
})

test.describe('count occurrences', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Count occurrences')
  })

  test('counts plain matches', async ({ page }) => {
    const p = getPanel(page, 'Count occurrences')
    await field(p, 'Enter Text').fill('abcabcabc')
    await field(p, 'Find').fill('abc')
    await expect(field(p, 'Occurrences')).toHaveValue('3')
  })

  test('counts regex matches', async ({ page }) => {
    const p = getPanel(page, 'Count occurrences')
    await field(p, 'Enter Text').fill('a1a2a3')
    await field(p, 'Find').fill('a.')
    await expect(field(p, 'Occurrences')).toHaveValue('3')
  })

  test('empty find term counts zero', async ({ page }) => {
    const p = getPanel(page, 'Count occurrences')
    await field(p, 'Enter Text').fill('abcabc')
    await field(p, 'Find').fill('abc')
    await field(p, 'Find').fill('')
    await expect(field(p, 'Occurrences')).toHaveValue('0')
  })

  test('invalid regex counts zero', async ({ page }) => {
    const p = getPanel(page, 'Count occurrences')
    await field(p, 'Enter Text').fill('abc')
    await field(p, 'Find').fill('(')
    await expect(field(p, 'Occurrences')).toHaveValue('0')
  })
})

test.describe('escape / unescape string', () => {
  test('escape string escapes quotes and newlines', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Escape string')
    const p = getPanel(page, 'Escape string')

    await field(p, 'Enter text').fill('a"b\nc')
    await expect(field(p, 'Encoded string')).toHaveValue('a\\"b\\nc')
  })

  test('unescape string restores escaped characters', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Unescape string')
    const p = getPanel(page, 'Unescape string')

    await field(p, 'enter encoded').fill('a\\"b\\nc')
    await expect(field(p, 'decoded')).toHaveValue('a"b\nc')
  })

  test('unescaping a trailing backslash shows an error', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Unescape string')
    const p = getPanel(page, 'Unescape string')

    await field(p, 'enter encoded').fill('a\\')
    await expect(field(p, 'decoded')).toHaveValue('Error decoding string')
  })
})
