import { expect, Page, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('panel error isolation', () => {
  // Breaking canvas makes the contrast checker throw while rendering, which is
  // exactly the kind of failure an error boundary exists to contain.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      ;(window as unknown as Record<string, unknown>).__restoreCanvas = () => {
        HTMLCanvasElement.prototype.getContext = original
      }
      HTMLCanvasElement.prototype.getContext = () => {
        throw new Error('canvas is unavailable')
      }
    })
  })

  test('a broken panel shows an error instead of taking down the app', async ({
    page,
  }) => {
    await page.goto('/?panels=Contrast%20checker&panels=Clock')

    const broken = getPanel(page, 'Contrast checker')
    await expect(broken.getByTestId('panel-error')).toBeVisible()
    await expect(broken.getByTestId('panel-error')).toContainText(
      'canvas is unavailable'
    )

    // Everything around it keeps working.
    await expect(page.locator('[data-testid="panel"]')).toHaveCount(2)
    await expect(getPanel(page, 'Clock')).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 1, name: 'tinytoolcrate' })
    ).toBeVisible()
  })

  test('the surviving panels stay interactive', async ({ page }) => {
    await page.goto('/?panels=Contrast%20checker&panels=Base64%20encode')

    await expect(
      getPanel(page, 'Contrast checker').getByTestId('panel-error')
    ).toBeVisible()

    const working = getPanel(page, 'Base64 encode')
    await field(working, 'enter text').fill('hello')
    await expect(field(working, 'encoded')).toHaveValue('aGVsbG8=')
  })

  test('a broken panel can still be closed', async ({ page }) => {
    await page.goto('/?panels=Contrast%20checker')
    await expect(
      getPanel(page, 'Contrast checker').getByTestId('panel-error')
    ).toBeVisible()

    await getPanel(page, 'Contrast checker')
      .getByRole('button', { name: 'Remove' })
      .click()
    await expect(page.locator('[data-testid="panel"]')).toHaveCount(0)
  })

  test('try again recovers once the cause is gone', async ({ page }) => {
    await page.goto('/?panels=Contrast%20checker')
    const p = getPanel(page, 'Contrast checker')
    await expect(p.getByTestId('panel-error')).toBeVisible()

    await page.evaluate(() =>
      (window as unknown as { __restoreCanvas: () => void }).__restoreCanvas()
    )
    await p.getByRole('button', { name: 'Try again' }).click()

    await expect(p.getByTestId('panel-error')).toHaveCount(0)
    await expect(p.getByTestId('contrast-ratio')).toBeVisible()
  })
})

test.describe('unsupported browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Pretend we are on a browser from before the compression streams api.
      delete (window as unknown as Record<string, unknown>).CompressionStream
      delete (window as unknown as Record<string, unknown>).DecompressionStream
    })
  })

  for (const tool of ['Gzip', 'Create zip', 'Unzip', 'SAML decoder']) {
    test(`${tool} explains itself rather than throwing`, async ({ page }) => {
      await page.goto(`/?panels=${encodeURIComponent(tool)}`)
      const p = getPanel(page, tool)

      await expect(p.getByTestId('unsupported')).toBeVisible()
      await expect(p.getByTestId('unsupported')).toContainText('compression api')
      await expect(p.getByTestId('panel-error')).toHaveCount(0)
    })
  }

  test('tools that do not need it are unaffected', async ({ page }) => {
    await page.goto('/?panels=File%20checksum&panels=Base64%20encode')

    await expect(page.locator('[data-testid="unsupported"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="panel-error"]')).toHaveCount(0)
  })
})

test.describe('initial download', () => {
  test('heavy libraries are not fetched until their tool is opened', async ({
    page,
  }) => {
    const scripts: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url())
    })

    await openApp(page)
    await page.waitForLoadState('networkidle')

    const plotly = scripts.filter((url) => url.includes('PlotGraph'))
    expect(plotly).toHaveLength(0)

    await addPanel(page, 'misc', 'Function plotter')
    await expect(getPanel(page, 'Function plotter')).toBeVisible()
    await page.waitForLoadState('networkidle')

    expect(scripts.filter((url) => url.includes('PlotGraph')).length).toBeGreaterThan(0)
  })

  test('the plot still renders once its chunk arrives', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Function plotter')

    const p = getPanel(page, 'Function plotter')
    await expect(p.locator('.js-plotly-plot')).toBeVisible({ timeout: 20000 })
  })
})

test.describe('duplicate panels', () => {
  test('two file dropzones stay independent', async ({ page }) => {
    await page.goto('/?panels=File%20to%20base64&panels=File%20to%20base64')

    const panels = page.locator('[data-testid="panel"]')
    await expect(panels).toHaveCount(2)

    // Each dropzone must own its own input, or the second panel's upload
    // lands in the first.
    const ids = await page
      .locator('input[type="file"]')
      .evaluateAll((inputs) => inputs.map((input) => input.id))
    expect(new Set(ids).size).toBe(ids.length)

    await panels.nth(1).locator('input[type="file"]').setInputFiles({
      name: 'second.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('second panel'),
    })

    await expect(field(panels.nth(1), 'file')).toHaveValue(/second\.txt/)
    await expect(field(panels.nth(0), 'file')).toHaveCount(0)
  })

  test('two emoji pickers filter independently', async ({ page }) => {
    await page.goto('/?panels=Emoji%20picker&panels=Emoji%20picker')
    const panels = page.locator('[data-testid="panel"]')

    await panels.nth(0).getByRole('searchbox').fill('rocket')
    await expect(panels.nth(0).getByTestId('emoji').first()).toHaveText('🚀')
    await expect(panels.nth(1).getByTestId('emoji-count')).toContainText(
      '1497 of 1497'
    )
  })
})

test.describe('chunk failures', () => {
  // The production service worker re-issues requests, which would bypass the
  // page level route, so it is blocked for this check.
  test.use({ serviceWorkers: 'block' })

  test('a chunk that fails to load is contained by the error boundary', async ({
    page,
  }) => {
    await openApp(page)
    await page.route('**/*PlotGraphUtil*', (route) => route.abort())
    await addPanel(page, 'misc', 'Function plotter')

    const p = getPanel(page, 'Function plotter')
    await expect(p.getByTestId('panel-error')).toBeVisible({ timeout: 15000 })
    await expect(
      page.getByRole('heading', { level: 1, name: 'tinytoolcrate' })
    ).toBeVisible()
  })
})

test.describe('offline pwa', () => {
  // The service worker only registers in a production build.
  test.skip(
    !process.env.E2E_BASE_URL?.includes('4173'),
    'needs the production build'
  )

  /**
   * The worker caches what it serves, and it does not control the very first
   * load, so the shell is only in the cache from the second visit onwards.
   */
  const warmCache = async (page: Page, url: string) => {
    await page.goto(url)
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload()
    await page.waitForTimeout(500)
  }

  test('the app still loads with the network down', async ({ page, context }) => {
    await warmCache(page, '/')

    await context.setOffline(true)
    await page.reload()

    await expect(
      page.getByRole('heading', { level: 1, name: 'tinytoolcrate' })
    ).toBeVisible()
    await context.setOffline(false)
  })

  test('a tool still works offline', async ({ page, context }) => {
    await warmCache(page, '/?panels=Base64%20encode')

    await context.setOffline(true)
    await page.reload()

    const p = getPanel(page, 'Base64 encode')
    await field(p, 'enter text').fill('offline')
    await expect(field(p, 'encoded')).toHaveValue('b2ZmbGluZQ==')
    await context.setOffline(false)
  })

  test('the cache is empty on a first visit, so offline needs a warm-up', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForTimeout(500)

    const entries = await page.evaluate(async () => {
      const names = await caches.keys()
      let total = 0
      for (const name of names) total += (await (await caches.open(name)).keys()).length
      return total
    })
    expect(entries).toBe(0)
  })
})
