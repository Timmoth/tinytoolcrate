import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

const ALPHABET = /^[0-9A-HJKMNP-TV-Z]{26}$/

/** "01:02.34" -> milliseconds */
function toMs(text: string): number {
  const match = /^(?:(\d+):)?(\d+):(\d+)\.(\d+)$/.exec(text.trim())
  if (!match) throw new Error(`unexpected stopwatch format: ${text}`)
  const [, hours = '0', minutes, seconds, hundredths] = match
  return (
    ((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds)) * 1000 +
    Number(hundredths) * 10
  )
}

test.describe('stopwatch', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'time', 'Stopwatch')
  })

  test('counts up while running and freezes when stopped', async ({ page }) => {
    const p = getPanel(page, 'Stopwatch')
    const time = p.getByTestId('stopwatch-time')
    await expect(time).toHaveText('00:00.00')

    await p.getByTestId('stopwatch-toggle').click()
    await expect(async () => {
      expect(toMs(await time.innerText())).toBeGreaterThan(150)
    }).toPass()

    await p.getByTestId('stopwatch-toggle').click()
    await expect(p.getByTestId('stopwatch-toggle')).toHaveText('Resume')
    const stopped = await time.innerText()
    await page.waitForTimeout(400)
    await expect(time).toHaveText(stopped)
  })

  test('resume continues from where it stopped', async ({ page }) => {
    const p = getPanel(page, 'Stopwatch')
    const time = p.getByTestId('stopwatch-time')

    await p.getByTestId('stopwatch-toggle').click()
    await expect(async () => {
      expect(toMs(await time.innerText())).toBeGreaterThan(150)
    }).toPass()
    await p.getByTestId('stopwatch-toggle').click()
    const first = toMs(await time.innerText())

    await p.getByTestId('stopwatch-toggle').click()
    await expect(async () => {
      expect(toMs(await time.innerText())).toBeGreaterThan(first + 150)
    }).toPass()
  })

  test('laps record the split and the total', async ({ page }) => {
    const p = getPanel(page, 'Stopwatch')
    await p.getByTestId('stopwatch-toggle').click()

    await page.waitForTimeout(250)
    await p.getByRole('button', { name: 'Lap' }).click()
    await page.waitForTimeout(250)
    await p.getByRole('button', { name: 'Lap' }).click()

    await expect(p.getByTestId('lap')).toHaveCount(2)
    // Newest first, so the top row holds the larger total.
    const rows = await p.getByTestId('lap').allInnerTexts()
    const total = (row: string) => toMs(row.split(/\s+/).pop()!)
    expect(total(rows[0])).toBeGreaterThan(total(rows[1]))
  })

  test('reset clears the time and the laps', async ({ page }) => {
    const p = getPanel(page, 'Stopwatch')
    await p.getByTestId('stopwatch-toggle').click()
    await page.waitForTimeout(200)
    await p.getByRole('button', { name: 'Lap' }).click()

    await p.getByRole('button', { name: 'Reset' }).click()
    await expect(p.getByTestId('stopwatch-time')).toHaveText('00:00.00')
    await expect(p.getByTestId('lap')).toHaveCount(0)
  })
})

test.describe('color converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Color converter')
  })

  test('converts a named colour to every notation', async ({ page }) => {
    const p = getPanel(page, 'Color converter')

    await expect(field(p, 'hex')).toHaveValue('#663399')
    await expect(field(p, 'rgb')).toHaveValue('rgb(102, 51, 153)')
    await expect(field(p, 'hsl')).toHaveValue('hsl(270 50% 40%)')
    await expect(field(p, 'cmyk')).toHaveValue('cmyk(33%, 67%, 0%, 40%)')
    await expect(field(p, 'css name')).toHaveValue('rebeccapurple')
  })

  test('names the nearest colour when there is no exact match', async ({
    page,
  }) => {
    const p = getPanel(page, 'Color converter')
    await field(p, 'colour').fill('#fe0001')

    await expect(field(p, 'css name')).toHaveValue('red (nearest)')
  })

  test('accepts rgb and hsl input', async ({ page }) => {
    const p = getPanel(page, 'Color converter')

    await field(p, 'colour').fill('rgb(255, 255, 0)')
    await expect(field(p, 'css name')).toHaveValue('yellow')

    await field(p, 'colour').fill('hsl(120, 100%, 50%)')
    await expect(field(p, 'hex')).toHaveValue('#00ff00')
  })

  test('rejects nonsense', async ({ page }) => {
    const p = getPanel(page, 'Color converter')
    await field(p, 'colour').fill('not-a-colour')
    await expect(p.getByText('Not a colour we can read')).toBeVisible()
  })
})

test.describe('percentage calculator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Percentage calculator')
  })

  test('works out a percentage of a value', async ({ page }) => {
    const p = getPanel(page, 'Percentage calculator')
    await expect(field(p, 'result')).toHaveValue('30')
  })

  test('works out what percent one number is of another', async ({ page }) => {
    const p = getPanel(page, 'Percentage calculator')
    await p.getByLabel('Calculation', { exact: true }).selectOption('isWhatPercent')
    await field(p, 'value (A)').fill('50')
    await field(p, 'out of (B)').fill('200')

    await expect(field(p, 'result')).toHaveValue('25%')
  })

  test('works out a percent change, including a fall', async ({ page }) => {
    const p = getPanel(page, 'Percentage calculator')
    await p.getByLabel('Calculation', { exact: true }).selectOption('change')

    await field(p, 'from (A)').fill('100')
    await field(p, 'to (B)').fill('150')
    await expect(field(p, 'result')).toHaveValue('+50%')

    await field(p, 'to (B)').fill('75')
    await expect(field(p, 'result')).toHaveValue('-25%')
  })

  test('increases a value by a percentage', async ({ page }) => {
    const p = getPanel(page, 'Percentage calculator')
    await p.getByLabel('Calculation', { exact: true }).selectOption('adjust')
    await field(p, 'percent (A)').fill('15')
    await field(p, 'value (B)').fill('200')

    await expect(field(p, 'result')).toHaveValue('230')
  })
})

test.describe('roman numerals', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Roman numerals')
  })

  test('converts both directions', async ({ page }) => {
    const p = getPanel(page, 'Roman numerals')
    await expect(field(p, 'roman numeral')).toHaveValue('MMXXVI')

    await field(p, 'roman numeral').fill('MCMXCIX')
    await expect(field(p, 'number')).toHaveValue('1999')

    await field(p, 'number').fill('4')
    await expect(field(p, 'roman numeral')).toHaveValue('IV')
  })

  test('rejects non-standard numerals', async ({ page }) => {
    const p = getPanel(page, 'Roman numerals')
    await field(p, 'roman numeral').fill('IIII')
    await expect(p.getByText('Not a valid roman numeral')).toBeVisible()
  })

  test('rejects numbers outside the range', async ({ page }) => {
    const p = getPanel(page, 'Roman numerals')
    await field(p, 'number').fill('4000')
    await expect(p.getByText('between 1 and 3999')).toBeVisible()
  })
})

test.describe('ulid generator', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'ULID generator')
  })

  test('generates a 26 character crockford id', async ({ page }) => {
    const p = getPanel(page, 'ULID generator')
    await expect(field(p, 'ulid')).toHaveValue(ALPHABET)
  })

  test('new produces a different id', async ({ page }) => {
    const p = getPanel(page, 'ULID generator')
    const first = await field(p, 'ulid').inputValue()
    await p.getByRole('button', { name: 'New' }).click()
    await expect(field(p, 'ulid')).not.toHaveValue(first)
  })

  test('generates the number of ids asked for, all unique', async ({ page }) => {
    const p = getPanel(page, 'ULID generator')
    await p.getByRole('button', { name: '10', exact: true }).click()

    // The list is rebuilt in an effect, so wait for ten lines before reading.
    await expect(field(p, '10 ulids')).toHaveValue(
      /^(?:[0-9A-HJKMNP-TV-Z]{26}\n){9}[0-9A-HJKMNP-TV-Z]{26}$/
    )
    const all = (await field(p, '10 ulids').inputValue()).split('\n')
    expect(new Set(all).size).toBe(10)
    // Generated in one tick, so they share the timestamp prefix.
    expect(new Set(all.map((value) => value.slice(0, 8))).size).toBe(1)
  })

  test('an id made later sorts after an earlier one', async ({ page }) => {
    const p = getPanel(page, 'ULID generator')
    await expect(field(p, 'ulid')).toHaveValue(ALPHABET)
    const earlier = await field(p, 'ulid').inputValue()

    await page.waitForTimeout(50)
    await p.getByRole('button', { name: 'New' }).click()
    await expect(field(p, 'ulid')).not.toHaveValue(earlier)

    const later = await field(p, 'ulid').inputValue()
    expect(later > earlier).toBe(true)
  })

  test('decodes the timestamp back out', async ({ page }) => {
    const p = getPanel(page, 'ULID generator')
    const value = await field(p, 'ulid').inputValue()
    await field(p, 'decode a ulid').fill(value)

    await expect(field(p, 'created')).toHaveValue(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('explains an invalid ulid', async ({ page }) => {
    const p = getPanel(page, 'ULID generator')
    await field(p, 'decode a ulid').fill('not-a-ulid')
    await expect(field(p, 'created')).toHaveValue('Not a valid ulid')
  })
})

test.describe('keyboard codes', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'misc', 'Keyboard codes')
  })

  test('reports the key, code and modifiers', async ({ page }) => {
    const p = getPanel(page, 'Keyboard codes')
    await p.getByTestId('keycode-listen').click()
    await page.keyboard.press('a')

    await expect(p.getByTestId('keycode-key')).toHaveText('a')
    await expect(field(p, 'event.code')).toHaveValue('KeyA')
    await expect(field(p, 'event.keyCode (deprecated)')).toHaveValue('65')
    await expect(field(p, 'modifiers')).toHaveValue('none')
  })

  test('picks up modifier combinations', async ({ page }) => {
    const p = getPanel(page, 'Keyboard codes')
    await p.getByTestId('keycode-listen').click()
    await page.keyboard.press('Shift+ArrowUp')

    await expect(field(p, 'event.code')).toHaveValue('ArrowUp')
    await expect(field(p, 'modifiers')).toHaveValue('shift')
  })
})

test.describe('basic auth header', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'Basic auth header')
  })

  test('builds the header from a username and password', async ({ page }) => {
    const p = getPanel(page, 'Basic auth header')
    await field(p, 'username').fill('user')
    await field(p, 'password').fill('pass')

    await expect(field(p, 'credentials only')).toHaveValue('dXNlcjpwYXNz')
    await expect(field(p, 'header')).toHaveValue(
      'Authorization: Basic dXNlcjpwYXNz'
    )
  })

  test('decodes a header back to credentials', async ({ page }) => {
    const p = getPanel(page, 'Basic auth header')
    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'header or credentials').fill(
      'Authorization: Basic dXNlcjpwYXNz'
    )

    await expect(field(p, 'username')).toHaveValue('user')
    await expect(field(p, 'password')).toHaveValue('pass')
  })

  test('keeps a colon that belongs to the password', async ({ page }) => {
    const p = getPanel(page, 'Basic auth header')
    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'header or credentials').fill(
      Buffer.from('user:pa:ss').toString('base64')
    )

    await expect(field(p, 'username')).toHaveValue('user')
    await expect(field(p, 'password')).toHaveValue('pa:ss')
  })

  test('explains input that is not base64', async ({ page }) => {
    const p = getPanel(page, 'Basic auth header')
    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'header or credentials').fill('!!! not base64 !!!')

    await expect(p.getByText('Not valid base64')).toBeVisible()
  })
})

test.describe('ip address converter', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'IP address converter')
  })

  test('converts an ipv4 address to its numeric forms', async ({ page }) => {
    const p = getPanel(page, 'IP address converter')

    await expect(field(p, 'decimal')).toHaveValue('3232235777')
    await expect(field(p, 'hex')).toHaveValue('0xc0a80101')
    await expect(field(p, 'binary')).toHaveValue('11000000.10101000.00000001.00000001')
    await expect(field(p, 'ipv6 mapped')).toHaveValue('::ffff:192.168.1.1')
  })

  test('converts a decimal back to an address', async ({ page }) => {
    const p = getPanel(page, 'IP address converter')
    await field(p, 'ip address, decimal or hex').fill('3232235777')

    await expect(field(p, 'ipv4')).toHaveValue('192.168.1.1')
  })

  test('accepts hex input', async ({ page }) => {
    const p = getPanel(page, 'IP address converter')
    await field(p, 'ip address, decimal or hex').fill('0x08080808')

    await expect(field(p, 'ipv4')).toHaveValue('8.8.8.8')
  })

  test('handles ipv6', async ({ page }) => {
    const p = getPanel(page, 'IP address converter')
    await field(p, 'ip address, decimal or hex').fill('2001:db8::1')

    await expect(field(p, 'ipv6')).toHaveValue('2001:db8::1')
    await expect(field(p, 'decimal')).toHaveValue(
      '42540766411282592856903984951653826561'
    )
  })

  test('rejects a bad address', async ({ page }) => {
    const p = getPanel(page, 'IP address converter')
    await field(p, 'ip address, decimal or hex').fill('999.1.1.1')
    await expect(p.getByText('Not a valid IP address')).toBeVisible()
  })
})

test.describe('user agent parser', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'User agent parser')
  })

  test('parses a chrome on windows string', async ({ page }) => {
    const p = getPanel(page, 'User agent parser')
    await field(p, 'user agent').fill(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    await expect(field(p, 'browser')).toHaveValue('Chrome 120.0.0.0')
    await expect(field(p, 'engine')).toHaveValue('Blink')
    await expect(field(p, 'operating system')).toHaveValue('Windows 10 or 11')
    await expect(field(p, 'device')).toHaveValue('desktop')
  })

  test('tells edge apart from chrome', async ({ page }) => {
    const p = getPanel(page, 'User agent parser')
    await field(p, 'user agent').fill(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    )

    await expect(field(p, 'browser')).toHaveValue('Edge 120.0.0.0')
  })

  test('spots a mobile device and a bot', async ({ page }) => {
    const p = getPanel(page, 'User agent parser')

    await field(p, 'user agent').fill(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    )
    await expect(field(p, 'operating system')).toHaveValue('iOS 17.1')
    await expect(field(p, 'device')).toHaveValue('mobile')

    await field(p, 'user agent').fill(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    )
    await expect(field(p, 'device')).toHaveValue('bot or script')
  })

  test('use mine fills in this browser', async ({ page }) => {
    const p = getPanel(page, 'User agent parser')
    await p.getByTestId('ua-mine').click()

    await expect(field(p, 'user agent')).toHaveValue(/Mozilla/)
    await expect(field(p, 'engine')).toHaveValue('Blink')
  })
})

test.describe('random port', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'net', 'Random port')
  })

  test('picks from the dynamic range by default', async ({ page }) => {
    const p = getPanel(page, 'Random port')
    const port = Number(await p.getByTestId('port').innerText())

    expect(port).toBeGreaterThanOrEqual(49152)
    expect(port).toBeLessThanOrEqual(65535)
    await expect(p.getByTestId('port-range')).toContainText('dynamic range')
  })

  test('a different range changes the numbers', async ({ page }) => {
    const p = getPanel(page, 'Random port')
    await p.getByLabel('Range', { exact: true }).selectOption('registered')
    // Wait for the re-roll before reading the number.
    await expect(p.getByTestId('port-range')).toContainText('registered range')

    const port = Number(await p.getByTestId('port').innerText())
    expect(port).toBeGreaterThanOrEqual(1024)
    expect(port).toBeLessThanOrEqual(49151)
    await expect(p.getByTestId('port-range')).toContainText('registered range')
  })

  test('picking again keeps it in range', async ({ page }) => {
    const p = getPanel(page, 'Random port')
    for (let i = 0; i < 5; i++) {
      await p.getByTestId('port-roll').click()
      const port = Number(await p.getByTestId('port').innerText())
      expect(port).toBeGreaterThanOrEqual(49152)
      expect(port).toBeLessThanOrEqual(65535)
    }
  })

  test('looks up what normally runs on a port', async ({ page }) => {
    const p = getPanel(page, 'Random port')

    await field(p, 'look up a port').fill('443')
    await expect(field(p, 'what uses it')).toHaveValue(
      'well known range · https'
    )

    await field(p, 'look up a port').fill('5432')
    await expect(field(p, 'what uses it')).toHaveValue(
      'registered range · postgres'
    )

    await field(p, 'look up a port').fill('99999')
    await expect(field(p, 'what uses it')).toHaveValue('Ports run from 0 to 65535')
  })
})
