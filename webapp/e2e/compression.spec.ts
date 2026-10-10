import { expect, Page, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

/** A deflate-raw + base64 SAML redirect payload, built in the page itself. */
async function makeSamlRedirect(page: Page, xml: string): Promise<string> {
  return page.evaluate(async (source) => {
    const bytes = new TextEncoder().encode(source)
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    const packed = new Uint8Array(await new Response(stream).arrayBuffer())
    let binary = ''
    packed.forEach((byte) => (binary += String.fromCharCode(byte)))
    return btoa(binary)
  }, xml)
}

test.describe('gzip', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Gzip')
  })

  test('round trips text through gzip', async ({ page }) => {
    const p = getPanel(page, 'Gzip')
    const text = 'repeat me '.repeat(80)

    await field(p, 'text').fill(text)
    await p.getByTestId('gzip-run').click()

    // Compression is async, so wait for the result before reading it.
    await expect(field(p, 'compressed (base64)')).not.toHaveValue('')
    const packed = await field(p, 'compressed (base64)').inputValue()
    await expect(p.getByTestId('gzip-stats')).toContainText('% smaller')

    await p.getByRole('button', { name: 'decompress' }).click()
    await field(p, 'compressed (base64)').fill(packed)
    await p.getByTestId('gzip-run').click()

    await expect(field(p, 'text')).toHaveValue(text)
  })

  test('detects the format from the data on decompress', async ({ page }) => {
    const p = getPanel(page, 'Gzip')
    await p.getByLabel('Format', { exact: true }).selectOption('deflate')
    await field(p, 'text').fill('zlib wrapped payload '.repeat(20))
    await p.getByTestId('gzip-run').click()
    // Compression is async, so wait for the result before reading it.
    await expect(field(p, 'compressed (base64)')).not.toHaveValue('')
    const packed = await field(p, 'compressed (base64)').inputValue()

    await p.getByRole('button', { name: 'decompress' }).click()
    // Deliberately leave the selector on gzip; sniffing should still win.
    await p.getByLabel('Format', { exact: true }).selectOption('gzip')
    await field(p, 'compressed (base64)').fill(packed)
    await p.getByTestId('gzip-run').click()

    await expect(p.getByTestId('gzip-stats')).toContainText('deflate (zlib)')
    await expect(field(p, 'text')).toHaveValue('zlib wrapped payload '.repeat(20))
  })

  test('explains input it cannot decompress', async ({ page }) => {
    const p = getPanel(page, 'Gzip')
    await p.getByRole('button', { name: 'decompress' }).click()
    await field(p, 'compressed (base64)').fill('bm90IGNvbXByZXNzZWQ=')
    await p.getByTestId('gzip-run').click()

    await expect(p.getByTestId('gzip-error')).toBeVisible()
  })
})

test.describe('zip files', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Create zip')
  })

  test('collects files and reports the total', async ({ page }) => {
    const p = getPanel(page, 'Create zip')
    await p.locator('input[type="file"]').setInputFiles([
      { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('a'.repeat(500)) },
      { name: 'b.txt', mimeType: 'text/plain', buffer: Buffer.from('b'.repeat(500)) },
    ])

    await expect(p.getByTestId('zip-file')).toHaveCount(2)
    await expect(p.getByTestId('zip-total')).toContainText('2 files')
  })

  test('renames a duplicate rather than losing it', async ({ page }) => {
    const p = getPanel(page, 'Create zip')
    const file = { name: 'same.txt', mimeType: 'text/plain', buffer: Buffer.from('x') }

    await p.locator('input[type="file"]').setInputFiles([file])
    await p.locator('input[type="file"]').setInputFiles([file])

    await expect(p.getByTestId('zip-file')).toHaveCount(2)
    await expect(p.getByTestId('zip-file').nth(1)).toContainText('same (1).txt')
  })

  test('a file can be removed again', async ({ page }) => {
    const p = getPanel(page, 'Create zip')
    await p.locator('input[type="file"]').setInputFiles([
      { name: 'gone.txt', mimeType: 'text/plain', buffer: Buffer.from('x') },
    ])
    await p.getByRole('button', { name: 'Remove gone.txt' }).click()

    await expect(p.getByTestId('zip-file')).toHaveCount(0)
  })

  test('builds a downloadable archive', async ({ page }) => {
    const p = getPanel(page, 'Create zip')
    await p.locator('input[type="file"]').setInputFiles([
      {
        name: 'readme.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello '.repeat(200)),
      },
    ])

    const download = page.waitForEvent('download')
    await p.getByTestId('zip-build').click()
    expect((await download).suggestedFilename()).toBe('archive.zip')

    await expect(p.getByTestId('zip-status')).toContainText('1 file')
  })
})

test.describe('unzip', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'file', 'Unzip')
    await addPanel(page, 'file', 'Create zip')
  })

  test('reads back an archive this app built', async ({ page }) => {
    const builder = getPanel(page, 'Create zip')
    await builder.locator('input[type="file"]').setInputFiles([
      {
        name: 'notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('compress me '.repeat(100)),
      },
      { name: 'tiny.bin', mimeType: 'application/octet-stream', buffer: Buffer.from('xy') },
    ])

    const download = page.waitForEvent('download')
    await builder.getByTestId('zip-build').click()
    const path = await (await download).path()

    const viewer = getPanel(page, 'Unzip')
    await viewer.locator('input[type="file"]').setInputFiles(path)

    await expect(viewer.getByTestId('zip-entry')).toHaveCount(2)
    await expect(viewer.getByTestId('zip-summary')).toContainText('2 files')
    await expect(viewer.getByTestId('zip-entry').first()).toContainText('notes.txt')
    // Repetitive text deflates; two bytes are cheaper stored.
    await expect(viewer.getByTestId('zip-entry').first()).toContainText('deflate')
    await expect(viewer.getByTestId('zip-entry').nth(1)).toContainText('stored')
  })

  test('extracts a single entry back to its original bytes', async ({ page }) => {
    const builder = getPanel(page, 'Create zip')
    await builder.locator('input[type="file"]').setInputFiles([
      { name: 'payload.txt', mimeType: 'text/plain', buffer: Buffer.from('round trip '.repeat(50)) },
    ])
    const zipDownload = page.waitForEvent('download')
    await builder.getByTestId('zip-build').click()
    const path = await (await zipDownload).path()

    const viewer = getPanel(page, 'Unzip')
    await viewer.locator('input[type="file"]').setInputFiles(path)

    const fileDownload = page.waitForEvent('download')
    await viewer.getByRole('button', { name: 'Extract payload.txt' }).click()
    const saved = await fileDownload
    expect(saved.suggestedFilename()).toBe('payload.txt')

    const stream = await saved.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(chunk as Buffer)
    expect(Buffer.concat(chunks).toString()).toBe('round trip '.repeat(50))
  })

  test('rejects a file that is not a zip', async ({ page }) => {
    const viewer = getPanel(page, 'Unzip')
    await viewer.locator('input[type="file"]').setInputFiles({
      name: 'nope.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('definitely not a zip'),
    })

    await expect(viewer.getByTestId('zip-error')).toContainText('Not a zip file')
  })
})

test.describe('saml decode', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'SAML decoder')
  })

  test('inflates a redirect binding payload', async ({ page }) => {
    const xml =
      '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="abc123"><saml:Issuer>https://example.com</saml:Issuer></samlp:AuthnRequest>'
    const encoded = await makeSamlRedirect(page, xml)

    const p = getPanel(page, 'SAML decoder')
    await field(p, 'saml request or response').fill(encoded)
    await p.getByTestId('saml-decode').click()

    await expect(p.getByTestId('saml-note')).toContainText('raw deflate')
    await expect(field(p, 'xml')).toHaveValue(/samlp:AuthnRequest/)
    await expect(field(p, 'xml')).toHaveValue(/https:\/\/example\.com/)
  })

  test('handles a url-encoded SAMLRequest parameter', async ({ page }) => {
    const xml = '<AuthnRequest ID="xyz"><Issuer>acme</Issuer></AuthnRequest>'
    const encoded = await makeSamlRedirect(page, xml)

    const p = getPanel(page, 'SAML decoder')
    await field(p, 'saml request or response').fill(
      `SAMLRequest=${encodeURIComponent(encoded)}&RelayState=%2Fhome`
    )
    await p.getByTestId('saml-decode').click()

    await expect(field(p, 'xml')).toHaveValue(/acme/)
  })

  test('handles a plain base64 post binding', async ({ page }) => {
    const p = getPanel(page, 'SAML decoder')
    const encoded = Buffer.from('<Response><Status>ok</Status></Response>').toString(
      'base64'
    )

    await field(p, 'saml request or response').fill(encoded)
    await p.getByTestId('saml-decode').click()

    await expect(p.getByTestId('saml-note')).toContainText('no compression')
    await expect(field(p, 'xml')).toHaveValue(
      '<Response>\n  <Status>ok</Status>\n</Response>'
    )
  })

  test('explains input that is neither', async ({ page }) => {
    const p = getPanel(page, 'SAML decoder')
    await field(p, 'saml request or response').fill('bm90IHhtbCBhdCBhbGw=')
    await p.getByTestId('saml-decode').click()

    await expect(p.getByTestId('saml-error')).toBeVisible()
  })
})
