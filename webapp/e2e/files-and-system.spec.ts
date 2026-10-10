import { expect, Page, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'
import { withExif } from './fixtures/exif'

/** Renders a gradient in the page and hands back the encoded bytes. */
async function makeImage(
  page: Page,
  width: number,
  height: number,
  type = 'image/png'
): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    ({ w, h, t }) => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const context = canvas.getContext('2d')!
      const gradient = context.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, '#ff3300')
      gradient.addColorStop(1, '#0033ff')
      context.fillStyle = gradient
      context.fillRect(0, 0, w, h)
      return canvas.toDataURL(t)
    },
    { w: width, h: height, t: type }
  )
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

test.describe('image converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Image converter')
  })

  test('reports the source and converts to webp', async ({ page }) => {
    const p = getPanel(page, 'Image converter')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: await makeImage(page, 240, 120),
    })

    await expect(p.getByTestId('image-stats')).toContainText('photo.png')
    await expect(p.getByTestId('image-stats')).toContainText('240×120')
    await expect(p.getByTestId('image-preview')).toBeVisible()
    await expect(p.getByTestId('image-download')).toContainText('.webp')
  })

  test('scaling changes the output dimensions', async ({ page }) => {
    const p = getPanel(page, 'Image converter')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: await makeImage(page, 200, 100),
    })

    await p.getByLabel('Scale', { exact: true }).fill('50')
    await expect(p.getByTestId('image-stats')).toContainText('100×50')
  })

  test('quality only applies to lossy formats', async ({ page }) => {
    const p = getPanel(page, 'Image converter')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: await makeImage(page, 100, 100),
    })

    await expect(p.getByLabel('Quality', { exact: true })).toBeVisible()
    await p.getByLabel('Format', { exact: true }).selectOption('image/png')
    await expect(p.getByLabel('Quality', { exact: true })).toBeHidden()
  })

  test('downloads with the converted extension', async ({ page }) => {
    const p = getPanel(page, 'Image converter')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'holiday.png',
      mimeType: 'image/png',
      buffer: await makeImage(page, 80, 80),
    })
    await p.getByLabel('Format', { exact: true }).selectOption('image/jpeg')

    const download = page.waitForEvent('download')
    await p.getByTestId('image-download').click()
    expect((await download).suggestedFilename()).toBe('holiday.jpg')
  })

  test('explains a file that is not an image', async ({ page }) => {
    const p = getPanel(page, 'Image converter')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('just text'),
    })

    await expect(p.getByTestId('image-error')).toContainText('not an image')
  })
})

test.describe('exif viewer', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'EXIF viewer')
  })

  test('reads camera metadata and warns about gps', async ({ page }) => {
    const p = getPanel(page, 'EXIF viewer')
    const jpeg = await makeImage(page, 60, 60, 'image/jpeg')

    await p.locator('input[type="file"]').setInputFiles({
      name: 'trip.jpg',
      mimeType: 'image/jpeg',
      buffer: withExif(jpeg, {
        make: 'Canon',
        model: 'EOS R6',
        software: 'tinytoolcrate',
        gps: { latitude: 51.5007, longitude: -0.1246 },
      }),
    })

    await expect(p.getByTestId('exif-summary')).toContainText('trip.jpg')
    await expect(p.getByTestId('exif-row').filter({ hasText: 'Camera make' })).toContainText(
      'Canon'
    )
    await expect(p.getByTestId('exif-row').filter({ hasText: 'Camera model' })).toContainText(
      'EOS R6'
    )
    await expect(p.getByTestId('exif-gps-warning')).toBeVisible()
    await expect(p.getByTestId('exif-row').filter({ hasText: 'Latitude' })).toContainText(
      '51.5007'
    )
  })

  test('says so when a photo carries no metadata', async ({ page }) => {
    const p = getPanel(page, 'EXIF viewer')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'plain.jpg',
      mimeType: 'image/jpeg',
      buffer: await makeImage(page, 40, 40, 'image/jpeg'),
    })

    await expect(p.getByTestId('exif-summary')).toContainText('no exif metadata')
    await expect(p.getByTestId('exif-gps-warning')).toHaveCount(0)
  })

  test('strips metadata into a downloadable copy', async ({ page }) => {
    const p = getPanel(page, 'EXIF viewer')
    const jpeg = await makeImage(page, 50, 50, 'image/jpeg')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'trip.jpg',
      mimeType: 'image/jpeg',
      buffer: withExif(jpeg, { make: 'Canon', model: 'EOS R6' }),
    })

    const download = page.waitForEvent('download')
    await p.getByTestId('exif-strip').click()
    const saved = await download
    expect(saved.suggestedFilename()).toBe('trip-clean.jpg')

    const stream = await saved.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(chunk as Buffer)
    expect(Buffer.concat(chunks).includes(Buffer.from('Canon'))).toBe(false)
  })

  test('rejects a file that is not a jpeg', async ({ page }) => {
    const p = getPanel(page, 'EXIF viewer')
    await p.locator('input[type="file"]').setInputFiles({
      name: 'image.png',
      mimeType: 'image/png',
      buffer: await makeImage(page, 20, 20),
    })

    await expect(p.getByTestId('exif-error')).toContainText('JPEG')
  })
})

test.describe('chmod calculator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Chmod calculator')
  })

  test('starts at 644 and follows the checkboxes', async ({ page }) => {
    const p = getPanel(page, 'Chmod calculator')
    await expect(field(p, 'octal')).toHaveValue('644')
    await expect(field(p, 'symbolic')).toHaveValue('rw-r--r--')

    await p.getByLabel('owner execute', { exact: true }).check()
    await expect(field(p, 'octal')).toHaveValue('744')
    await expect(field(p, 'command')).toHaveValue('chmod 744 file')
  })

  test('typing an octal number updates everything else', async ({ page }) => {
    const p = getPanel(page, 'Chmod calculator')
    await field(p, 'octal').fill('755')

    await expect(field(p, 'symbolic')).toHaveValue('rwxr-xr-x')
    await expect(p.getByLabel('owner execute', { exact: true })).toBeChecked()
    await expect(p.getByLabel('group write', { exact: true })).not.toBeChecked()
  })

  test('typing a symbolic string updates the octal', async ({ page }) => {
    const p = getPanel(page, 'Chmod calculator')
    await field(p, 'symbolic').fill('rw-rw----')

    await expect(field(p, 'octal')).toHaveValue('660')
  })

  test('handles the setuid and sticky bits', async ({ page }) => {
    const p = getPanel(page, 'Chmod calculator')
    await field(p, 'octal').fill('755')
    await p.getByLabel('setuid', { exact: true }).check()

    await expect(field(p, 'octal')).toHaveValue('4755')
    await expect(field(p, 'symbolic')).toHaveValue('rwsr-xr-x')
  })

  test('presets apply a common mode', async ({ page }) => {
    const p = getPanel(page, 'Chmod calculator')
    await p.getByRole('button', { name: '600', exact: true }).click()

    await expect(field(p, 'octal')).toHaveValue('600')
    await expect(field(p, 'symbolic')).toHaveValue('rw-------')
  })
})

test.describe('file size converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'File size converter')
  })

  test('converts a gigabyte across the decimal and binary units', async ({
    page,
  }) => {
    const p = getPanel(page, 'File size converter')

    await expect(field(p, 'MB')).toHaveValue('1000')
    await expect(field(p, 'B')).toHaveValue('1000000000')
    await expect(field(p, 'GiB')).toHaveValue('0.9313')
  })

  test('converts from a binary unit', async ({ page }) => {
    const p = getPanel(page, 'File size converter')
    await p.getByLabel('Unit', { exact: true }).selectOption('GiB')

    await expect(field(p, 'B')).toHaveValue('1073741824')
    await expect(field(p, 'GB')).toHaveValue('1.0737')
  })

  test('rejects text', async ({ page }) => {
    const p = getPanel(page, 'File size converter')
    await field(p, 'size').fill('abc')
    await expect(p.getByText('Enter a number')).toBeVisible()
  })
})

test.describe('list compare', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'text', 'Compare lists')
  })

  test('splits two lists into shared and unique entries', async ({ page }) => {
    const p = getPanel(page, 'Compare lists')
    await field(p, 'list A').fill('alpha\nbeta\ngamma')
    await field(p, 'list B').fill('beta\ngamma\ndelta')

    await expect(field(p, 'in both (intersection) — 2')).toHaveValue('beta\ngamma')
    await expect(field(p, 'only in A (difference) — 1')).toHaveValue('alpha')
    await expect(field(p, 'only in B — 1')).toHaveValue('delta')
    await expect(field(p, 'all, deduped (union) — 4')).toHaveValue(
      'alpha\nbeta\ngamma\ndelta'
    )
  })

  test('ignore case folds entries together', async ({ page }) => {
    const p = getPanel(page, 'Compare lists')
    await field(p, 'list A').fill('Alpha')
    await field(p, 'list B').fill('alpha')

    await expect(field(p, 'only in A (difference) — 1')).toHaveValue('Alpha')

    await p.getByText('ignore case').click()
    await expect(field(p, 'in both (intersection) — 1')).toHaveValue('Alpha')
  })

  test('deduplicates within a single list', async ({ page }) => {
    const p = getPanel(page, 'Compare lists')
    await field(p, 'list A').fill('one\none\ntwo')
    await field(p, 'list B').fill('')

    await expect(field(p, 'all, deduped (union) — 2')).toHaveValue('one\ntwo')
  })
})
