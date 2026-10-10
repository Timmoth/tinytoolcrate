export { md5 } from './md5'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function utf8(text: string): Uint8Array {
  return encoder.encode(text)
}

export function fromUtf8(bytes: Uint8Array): string {
  return decoder.decode(bytes)
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/[\s:]/g, '')
  if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) {
    throw new Error('Not valid hex')
  }
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

export function fromBase64(text: string): Uint8Array {
  const binary = atob(text.replace(/\s+/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/* ------------------------------------------------------------------ *
 * AES-GCM with a password derived key
 * ------------------------------------------------------------------ */

const SALT_BYTES = 16
const IV_BYTES = 12
export const PBKDF2_ITERATIONS = 250_000

async function deriveAesKey(
  password: string,
  salt: Uint8Array,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  )
}

/** Output is base64 of salt(16) | iv(12) | ciphertext+tag. */
export async function aesEncrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveAesKey(password, salt, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, utf8(plaintext))
  )

  const payload = new Uint8Array(salt.length + iv.length + ciphertext.length)
  payload.set(salt, 0)
  payload.set(iv, salt.length)
  payload.set(ciphertext, salt.length + iv.length)
  return toBase64(payload)
}

export async function aesDecrypt(payload: string, password: string): Promise<string> {
  let bytes: Uint8Array
  try {
    bytes = fromBase64(payload.trim())
  } catch {
    throw new Error('Input is not valid base64')
  }
  if (bytes.length <= SALT_BYTES + IV_BYTES) {
    throw new Error('Input is too short to be a ciphertext from this tool')
  }

  const salt = bytes.slice(0, SALT_BYTES)
  const iv = bytes.slice(SALT_BYTES, SALT_BYTES + IV_BYTES)
  const ciphertext = bytes.slice(SALT_BYTES + IV_BYTES)
  const key = await deriveAesKey(password, salt, ['decrypt'])

  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return fromUtf8(new Uint8Array(plain))
  } catch {
    throw new Error('Could not decrypt — wrong password, or the input was altered')
  }
}

/* ------------------------------------------------------------------ *
 * RSA
 * ------------------------------------------------------------------ */

export function toPem(key: ArrayBuffer, label: string): string {
  const body = toBase64(new Uint8Array(key)).match(/.{1,64}/g) ?? []
  return `-----BEGIN ${label}-----\n${body.join('\n')}\n-----END ${label}-----`
}

export function fromPem(pem: string): Uint8Array {
  const body = pem.replace(/-----[^-]*-----/g, '').replace(/\s+/g, '')
  if (body === '') throw new Error('No key found')
  try {
    return fromBase64(body)
  } catch {
    throw new Error('Key is not valid base64')
  }
}

export type RsaPurpose = 'encrypt' | 'sign'

export async function generateRsaKeyPair(bits: number, purpose: RsaPurpose) {
  const algorithm = {
    name: purpose === 'encrypt' ? 'RSA-OAEP' : 'RSASSA-PKCS1-v1_5',
    modulusLength: bits,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  }
  const usages: KeyUsage[] =
    purpose === 'encrypt' ? ['encrypt', 'decrypt'] : ['sign', 'verify']

  const pair = (await crypto.subtle.generateKey(algorithm, true, usages)) as CryptoKeyPair
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.exportKey('spki', pair.publicKey),
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
  ])

  return {
    publicKey: toPem(publicKey, 'PUBLIC KEY'),
    privateKey: toPem(privateKey, 'PRIVATE KEY'),
  }
}

export async function rsaEncrypt(text: string, publicKeyPem: string): Promise<string> {
  let key: CryptoKey
  try {
    key = await crypto.subtle.importKey(
      'spki',
      fromPem(publicKeyPem),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    )
  } catch {
    throw new Error('Could not read the public key — expected a PEM SPKI public key')
  }

  try {
    const cipher = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, utf8(text))
    return toBase64(new Uint8Array(cipher))
  } catch {
    throw new Error('Message is too long for this key — RSA can only wrap short payloads')
  }
}

export async function rsaDecrypt(payload: string, privateKeyPem: string): Promise<string> {
  let key: CryptoKey
  try {
    key = await crypto.subtle.importKey(
      'pkcs8',
      fromPem(privateKeyPem),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt']
    )
  } catch {
    throw new Error('Could not read the private key — expected a PEM PKCS#8 private key')
  }

  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      key,
      fromBase64(payload.trim())
    )
    return fromUtf8(new Uint8Array(plain))
  } catch {
    throw new Error('Could not decrypt — the key does not match this ciphertext')
  }
}

/* ------------------------------------------------------------------ *
 * Classic ciphers
 * ------------------------------------------------------------------ */

const A = 'a'.charCodeAt(0)
const Z = 'z'.charCodeAt(0)
const UPPER_A = 'A'.charCodeAt(0)
const UPPER_Z = 'Z'.charCodeAt(0)

export function caesar(text: string, shift: number): string {
  const offset = ((shift % 26) + 26) % 26
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0)
    const base = code >= A && code <= Z ? A : UPPER_A
    return String.fromCharCode(((code - base + offset) % 26) + base)
  })
}

export function atbash(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0)
    return code >= A && code <= Z
      ? String.fromCharCode(Z - (code - A))
      : String.fromCharCode(UPPER_Z - (code - UPPER_A))
  })
}

export function vigenere(text: string, key: string, decode: boolean): string {
  const letters = key.toLowerCase().replace(/[^a-z]/g, '')
  if (letters === '') throw new Error('Vigenère needs a key of letters')

  let index = 0
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0)
    const base = code >= A && code <= Z ? A : UPPER_A
    const shift = letters.charCodeAt(index % letters.length) - A
    index++
    const moved = decode ? code - base - shift + 26 : code - base + shift
    return String.fromCharCode((moved % 26) + base)
  })
}

/** Encodes to hex so the result stays printable. */
export function xorCipher(text: string, key: string, decode: boolean): string {
  if (key === '') throw new Error('XOR needs a key')
  const keyBytes = utf8(key)
  const input = decode ? fromHex(text) : utf8(text)

  const out = new Uint8Array(input.length)
  for (let i = 0; i < input.length; i++) {
    out[i] = input[i] ^ keyBytes[i % keyBytes.length]
  }
  return decode ? fromUtf8(out) : toHex(out)
}
