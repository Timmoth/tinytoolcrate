import { expect, test } from '@playwright/test'
import { addPanel, field, getPanel, openApp } from './helpers'

test.describe('aes encrypt', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'crypto', 'AES encryption')
  })

  test('round trips a message through encrypt and decrypt', async ({ page }) => {
    const p = getPanel(page, 'AES encryption')

    await field(p, 'plain text').fill('attack at dawn')
    await field(p, 'password').fill('correct horse')
    await p.getByTestId('aes-run').click()

    const ciphertext = field(p, 'ciphertext (base64)')
    await expect(ciphertext).not.toHaveValue('')
    const encrypted = await ciphertext.inputValue()
    expect(encrypted).not.toContain('attack at dawn')

    await p.getByRole('button', { name: 'decrypt' }).click()
    await field(p, 'ciphertext (base64)').fill(encrypted)
    await field(p, 'password').fill('correct horse')
    await p.getByTestId('aes-run').click()

    await expect(field(p, 'plain text')).toHaveValue('attack at dawn')
  })

  test('the same input encrypts differently each time', async ({ page }) => {
    const p = getPanel(page, 'AES encryption')
    await field(p, 'plain text').fill('same message')
    await field(p, 'password').fill('pw')

    await p.getByTestId('aes-run').click()
    await expect(field(p, 'ciphertext (base64)')).not.toHaveValue('')
    const first = await field(p, 'ciphertext (base64)').inputValue()

    await p.getByTestId('aes-run').click()
    await expect(field(p, 'ciphertext (base64)')).not.toHaveValue(first)
  })

  test('a wrong password fails loudly', async ({ page }) => {
    const p = getPanel(page, 'AES encryption')
    await field(p, 'plain text').fill('secret')
    await field(p, 'password').fill('right')
    await p.getByTestId('aes-run').click()
    await expect(field(p, 'ciphertext (base64)')).not.toHaveValue('')
    const encrypted = await field(p, 'ciphertext (base64)').inputValue()

    await p.getByRole('button', { name: 'decrypt' }).click()
    await field(p, 'ciphertext (base64)').fill(encrypted)
    await field(p, 'password').fill('wrong')
    await p.getByTestId('aes-run').click()

    await expect(p.getByTestId('aes-error')).toContainText('wrong password')
    await expect(field(p, 'plain text')).toHaveValue('')
  })

  test('requires a password', async ({ page }) => {
    const p = getPanel(page, 'AES encryption')
    await field(p, 'plain text').fill('x')
    await p.getByTestId('aes-run').click()

    await expect(p.getByTestId('aes-error')).toContainText('password is required')
  })

  test('rejects input that is not a ciphertext from this tool', async ({ page }) => {
    const p = getPanel(page, 'AES encryption')
    await p.getByRole('button', { name: 'decrypt' }).click()
    await field(p, 'ciphertext (base64)').fill('not base64 at all !!!')
    await field(p, 'password').fill('pw')
    await p.getByTestId('aes-run').click()

    await expect(p.getByTestId('aes-error')).toBeVisible()
  })
})

test.describe('rsa', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test('generates a pem key pair', async ({ page }) => {
    await addPanel(page, 'crypto', 'RSA key pair')
    const p = getPanel(page, 'RSA key pair')

    await p.getByTestId('rsa-generate').click()

    await expect(field(p, 'public key (PEM)')).toHaveValue(
      /^-----BEGIN PUBLIC KEY-----/,
      { timeout: 20000 }
    )
    await expect(field(p, 'private key (PEM)')).toHaveValue(
      /^-----BEGIN PRIVATE KEY-----/
    )
  })

  test('encrypts with the public key and decrypts with the private key', async ({
    page,
  }) => {
    await addPanel(page, 'crypto', 'RSA key pair')
    await addPanel(page, 'crypto', 'RSA encryption')

    const keys = getPanel(page, 'RSA key pair')
    await keys.getByTestId('rsa-generate').click()
    await expect(field(keys, 'public key (PEM)')).toHaveValue(/BEGIN PUBLIC KEY/, {
      timeout: 20000,
    })

    const publicKey = await field(keys, 'public key (PEM)').inputValue()
    const privateKey = await field(keys, 'private key (PEM)').inputValue()

    const p = getPanel(page, 'RSA encryption')
    await field(p, 'public key (PEM)').fill(publicKey)
    await field(p, 'plain text').fill('a short secret')
    await p.getByTestId('rsa-run').click()

    await expect(field(p, 'ciphertext (base64)')).not.toHaveValue('')
    const encrypted = await field(p, 'ciphertext (base64)').inputValue()

    await p.getByRole('button', { name: 'decrypt' }).click()
    await field(p, 'private key (PEM)').fill(privateKey)
    await field(p, 'ciphertext (base64)').fill(encrypted)
    await p.getByTestId('rsa-run').click()

    await expect(field(p, 'plain text')).toHaveValue('a short secret')
  })

  test('explains an unusable key', async ({ page }) => {
    await addPanel(page, 'crypto', 'RSA encryption')
    const p = getPanel(page, 'RSA encryption')

    await field(p, 'public key (PEM)').fill('-----BEGIN PUBLIC KEY-----\nnope\n-----END PUBLIC KEY-----')
    await field(p, 'plain text').fill('hello')
    await p.getByTestId('rsa-run').click()

    await expect(p.getByTestId('rsa-error')).toContainText('public key')
  })
})

test.describe('classic ciphers', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'crypto', 'Classic ciphers')
  })

  test('rot13 is its own inverse', async ({ page }) => {
    const p = getPanel(page, 'Classic ciphers')
    await field(p, 'input').fill('Hello, World!')
    await expect(field(p, 'output')).toHaveValue('Uryyb, Jbeyq!')
  })

  test('caesar shifts by the chosen amount', async ({ page }) => {
    const p = getPanel(page, 'Classic ciphers')
    await p.getByLabel('Cipher', { exact: true }).selectOption('caesar')
    await p.getByLabel('Shift', { exact: true }).fill('3')
    await field(p, 'input').fill('abc')
    await expect(field(p, 'output')).toHaveValue('def')

    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'input').fill('def')
    await expect(field(p, 'output')).toHaveValue('abc')
  })

  test('atbash mirrors the alphabet', async ({ page }) => {
    const p = getPanel(page, 'Classic ciphers')
    await p.getByLabel('Cipher', { exact: true }).selectOption('atbash')
    await field(p, 'input').fill('abc')
    await expect(field(p, 'output')).toHaveValue('zyx')
  })

  test('vigenere matches the textbook example', async ({ page }) => {
    const p = getPanel(page, 'Classic ciphers')
    await p.getByLabel('Cipher', { exact: true }).selectOption('vigenere')
    await field(p, 'key').fill('LEMON')
    await field(p, 'input').fill('ATTACKATDAWN')
    await expect(field(p, 'output')).toHaveValue('LXFOPVEFRNHR')
  })

  test('vigenere asks for a key', async ({ page }) => {
    const p = getPanel(page, 'Classic ciphers')
    await p.getByLabel('Cipher', { exact: true }).selectOption('vigenere')
    await field(p, 'input').fill('hello')
    await expect(p.getByText('needs a key')).toBeVisible()
  })

  test('xor round trips through hex', async ({ page }) => {
    const p = getPanel(page, 'Classic ciphers')
    await p.getByLabel('Cipher', { exact: true }).selectOption('xor')
    await field(p, 'key').fill('key')
    await field(p, 'input').fill('secret message')

    await expect(field(p, 'output')).toHaveValue(/^[0-9a-f]+$/)
    const encoded = await field(p, 'output').inputValue()

    await p.getByRole('button', { name: 'decode' }).click()
    await field(p, 'input').fill(encoded)
    await expect(field(p, 'output')).toHaveValue('secret message')
  })
})

test.describe('hash generator md5', () => {
  test('produces the known md5 of abc', async ({ page }) => {
    await openApp(page)
    await addPanel(page, 'code', 'Hash generator')
    const p = getPanel(page, 'Hash generator')

    await field(p, 'enter text').fill('abc')
    await expect(field(p, 'MD5 Hash')).toHaveValue(
      '900150983cd24fb0d6963f7d28e17f72'
    )
    await expect(field(p, 'SHA-256 Hash')).toHaveValue(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })
})
