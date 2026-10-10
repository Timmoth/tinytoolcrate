import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

const HELLO = Buffer.from('hello')

test.describe('file checksum', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'File checksum')
  })

  test('computes md5 and the sha family for an uploaded file', async ({ page }) => {
    const p = getPanel(page, 'File checksum')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'hello.txt',
      mimeType: 'text/plain',
      buffer: HELLO,
    })

    await expect(field(p, 'MD5 Hash')).toHaveValue(
      '5d41402abc4b2a76b9719d911017c592'
    )
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

  test('uploading a second file replaces the hashes', async ({ page }) => {
    const p = getPanel(page, 'File checksum')
    await p
      .locator('input[type="file"]')
      .setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: HELLO })
    await expect(field(p, 'SHA-256 Hash')).toHaveValue(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    )

    await p
      .locator('input[type="file"]')
      .setInputFiles({
        name: 'b.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('world'),
      })
    await expect(field(p, 'SHA-256 Hash')).toHaveValue(
      '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7'
    )
  })
})

test.describe('base64 encode file', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'File to base64')
  })

  test('encodes an uploaded file as a data url', async ({ page }) => {
    const p = getPanel(page, 'File to base64')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'hello.txt',
      mimeType: 'text/plain',
      buffer: HELLO,
    })

    await expect(field(p, 'Base64 encoded file')).toHaveValue(
      'data:text/plain;base64,aGVsbG8='
    )
  })
})

test.describe('base64 encoded image viewer', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Base64 to image')
  })

  test('renders an img for a pasted data url', async ({ page }) => {
    const p = getPanel(page, 'Base64 to image')
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

    await field(p, 'base64 encoded image').fill(dataUrl)
    await expect(p.locator('[data-testid="preview-image"]')).toHaveAttribute(
      'src',
      dataUrl
    )
  })

  test('img has no source before any input', async ({ page }) => {
    const p = getPanel(page, 'Base64 to image')
    const img = p.locator('[data-testid="preview-image"]')
    await expect(img).toHaveCount(1)
    const src = await img.getAttribute('src')
    expect(src === null || src === '').toBe(true)
  })
})
