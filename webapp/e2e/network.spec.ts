import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('subnet calculator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'Subnet calculator')
  })

  test('breaks down a /24 straight away', async ({ page }) => {
    const p = getPanel(page, 'Subnet calculator')

    await expect(field(p, 'network')).toHaveValue('192.168.1.0/24')
    await expect(field(p, 'netmask')).toHaveValue('255.255.255.0')
    await expect(field(p, 'wildcard')).toHaveValue('0.0.0.255')
    await expect(field(p, 'broadcast')).toHaveValue('192.168.1.255')
    await expect(field(p, 'first host')).toHaveValue('192.168.1.1')
    await expect(field(p, 'last host')).toHaveValue('192.168.1.254')
    await expect(field(p, 'usable hosts')).toHaveValue('254')
    await expect(field(p, 'scope')).toHaveValue('private (192.168.0.0/16)')
  })

  test('handles the /31 and /32 special cases', async ({ page }) => {
    const p = getPanel(page, 'Subnet calculator')

    await field(p, 'address / cidr').fill('10.0.0.1/32')
    await expect(field(p, 'total addresses')).toHaveValue('1')
    await expect(field(p, 'usable hosts')).toHaveValue('1')

    await field(p, 'address / cidr').fill('10.0.0.0/31')
    await expect(field(p, 'total addresses')).toHaveValue('2')
    await expect(field(p, 'usable hosts')).toHaveValue('2')
  })

  test('accepts a dotted netmask', async ({ page }) => {
    const p = getPanel(page, 'Subnet calculator')
    await field(p, 'address / cidr').fill('172.16.5.4 255.255.0.0')

    await expect(field(p, 'network')).toHaveValue('172.16.0.0/16')
    await expect(field(p, 'scope')).toHaveValue('private (172.16.0.0/12)')
  })

  test('rejects a non-contiguous netmask and bad addresses', async ({ page }) => {
    const p = getPanel(page, 'Subnet calculator')

    await field(p, 'address / cidr').fill('1.2.3.4 255.0.255.0')
    await expect(p.getByText('Netmask bits must be contiguous')).toBeVisible()

    await field(p, 'address / cidr').fill('256.1.1.1')
    await expect(p.getByText('Not a valid IPv4 address')).toBeVisible()

    await field(p, 'address / cidr').fill('1.2.3.4/33')
    await expect(p.getByText('IPv4 prefix must be between 0 and 32')).toBeVisible()
  })

  test('handles ipv6', async ({ page }) => {
    const p = getPanel(page, 'Subnet calculator')
    await field(p, 'address / cidr').fill('2001:db8:1:2:3:4:5:6/64')

    await expect(field(p, 'network')).toHaveValue('2001:db8:1:2::/64')
    await expect(field(p, 'expanded')).toHaveValue(
      '2001:0db8:0001:0002:0003:0004:0005:0006'
    )
    await expect(field(p, 'scope')).toHaveValue('global unicast (2000::/3)')
    await expect(field(p, 'broadcast')).toHaveCount(0)
  })

  test('example buttons fill the input', async ({ page }) => {
    const p = getPanel(page, 'Subnet calculator')
    await p.getByRole('button', { name: '10.0.0.0/8' }).click()

    await expect(field(p, 'address / cidr')).toHaveValue('10.0.0.0/8')
    await expect(field(p, 'usable hosts')).toHaveValue('16777214')
  })
})

test.describe('http status codes', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'HTTP status codes')
  })

  test('finds a code and explains it', async ({ page }) => {
    const p = getPanel(page, 'HTTP status codes')
    await p.getByRole('searchbox').fill('404')

    const rows = p.locator('[data-testid="reference-row"]')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('Not Found')
  })

  test('searches by meaning, not just code', async ({ page }) => {
    const p = getPanel(page, 'HTTP status codes')
    await p.getByRole('searchbox').fill('rate limited')

    const rows = p.locator('[data-testid="reference-row"]')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('429')
  })

  test('shows a count and an empty state', async ({ page }) => {
    const p = getPanel(page, 'HTTP status codes')
    await expect(p.locator('[data-testid="reference-count"]')).toContainText(
      'click a row to copy'
    )

    await p.getByRole('searchbox').fill('zzzzz')
    await expect(p.getByText('No matches')).toBeVisible()
  })
})

test.describe('mime types', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'MIME types')
  })

  test('looks up a content-type by extension', async ({ page }) => {
    const p = getPanel(page, 'MIME types')
    await p.getByRole('searchbox').fill('.webp')

    const rows = p.locator('[data-testid="reference-row"]')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('image/webp')
  })

  test('looks up an extension by content-type', async ({ page }) => {
    const p = getPanel(page, 'MIME types')
    await p.getByRole('searchbox').fill('application/pdf')

    await expect(p.locator('[data-testid="reference-row"]')).toHaveCount(1)
    await expect(p.locator('[data-testid="reference-row"]').first()).toContainText(
      '.pdf'
    )
  })
})
