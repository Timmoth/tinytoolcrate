/**
 * MD5, because plenty of legacy systems still hand out md5 checksums and
 * WebCrypto deliberately does not implement it.
 *
 * MD5 is broken for anything security related — use SHA-256 for that.
 */

function rotate(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift))
}

function step(
  mix: number,
  a: number,
  b: number,
  word: number,
  shift: number,
  constant: number
): number {
  const sum = (((a + mix) | 0) + ((word + constant) | 0)) | 0
  return (rotate(sum, shift) + b) | 0
}

const F = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
  step((b & c) | (~b & d), a, b, x, s, t)
const G = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
  step((b & d) | (c & ~d), a, b, x, s, t)
const H = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
  step(b ^ c ^ d, a, b, x, s, t)
const I = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
  step(c ^ (b | ~d), a, b, x, s, t)

function toWords(bytes: Uint8Array): number[] {
  const length = bytes.length
  const blocks = (((length + 8) >> 6) + 1) * 16
  const words = new Array<number>(blocks).fill(0)

  for (let i = 0; i < length; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8)
  }
  words[length >> 2] |= 0x80 << ((length % 4) * 8)
  words[blocks - 2] = (length * 8) >>> 0
  words[blocks - 1] = Math.floor((length * 8) / 4294967296)

  return words
}

export function md5(bytes: Uint8Array): string {
  const words = toWords(bytes)
  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878

  for (let i = 0; i < words.length; i += 16) {
    const x = words.slice(i, i + 16)
    const [oldA, oldB, oldC, oldD] = [a, b, c, d]

    a = F(a, b, c, d, x[0], 7, -680876936)
    d = F(d, a, b, c, x[1], 12, -389564586)
    c = F(c, d, a, b, x[2], 17, 606105819)
    b = F(b, c, d, a, x[3], 22, -1044525330)
    a = F(a, b, c, d, x[4], 7, -176418897)
    d = F(d, a, b, c, x[5], 12, 1200080426)
    c = F(c, d, a, b, x[6], 17, -1473231341)
    b = F(b, c, d, a, x[7], 22, -45705983)
    a = F(a, b, c, d, x[8], 7, 1770035416)
    d = F(d, a, b, c, x[9], 12, -1958414417)
    c = F(c, d, a, b, x[10], 17, -42063)
    b = F(b, c, d, a, x[11], 22, -1990404162)
    a = F(a, b, c, d, x[12], 7, 1804603682)
    d = F(d, a, b, c, x[13], 12, -40341101)
    c = F(c, d, a, b, x[14], 17, -1502002290)
    b = F(b, c, d, a, x[15], 22, 1236535329)

    a = G(a, b, c, d, x[1], 5, -165796510)
    d = G(d, a, b, c, x[6], 9, -1069501632)
    c = G(c, d, a, b, x[11], 14, 643717713)
    b = G(b, c, d, a, x[0], 20, -373897302)
    a = G(a, b, c, d, x[5], 5, -701558691)
    d = G(d, a, b, c, x[10], 9, 38016083)
    c = G(c, d, a, b, x[15], 14, -660478335)
    b = G(b, c, d, a, x[4], 20, -405537848)
    a = G(a, b, c, d, x[9], 5, 568446438)
    d = G(d, a, b, c, x[14], 9, -1019803690)
    c = G(c, d, a, b, x[3], 14, -187363961)
    b = G(b, c, d, a, x[8], 20, 1163531501)
    a = G(a, b, c, d, x[13], 5, -1444681467)
    d = G(d, a, b, c, x[2], 9, -51403784)
    c = G(c, d, a, b, x[7], 14, 1735328473)
    b = G(b, c, d, a, x[12], 20, -1926607734)

    a = H(a, b, c, d, x[5], 4, -378558)
    d = H(d, a, b, c, x[8], 11, -2022574463)
    c = H(c, d, a, b, x[11], 16, 1839030562)
    b = H(b, c, d, a, x[14], 23, -35309556)
    a = H(a, b, c, d, x[1], 4, -1530992060)
    d = H(d, a, b, c, x[4], 11, 1272893353)
    c = H(c, d, a, b, x[7], 16, -155497632)
    b = H(b, c, d, a, x[10], 23, -1094730640)
    a = H(a, b, c, d, x[13], 4, 681279174)
    d = H(d, a, b, c, x[0], 11, -358537222)
    c = H(c, d, a, b, x[3], 16, -722521979)
    b = H(b, c, d, a, x[6], 23, 76029189)
    a = H(a, b, c, d, x[9], 4, -640364487)
    d = H(d, a, b, c, x[12], 11, -421815835)
    c = H(c, d, a, b, x[15], 16, 530742520)
    b = H(b, c, d, a, x[2], 23, -995338651)

    a = I(a, b, c, d, x[0], 6, -198630844)
    d = I(d, a, b, c, x[7], 10, 1126891415)
    c = I(c, d, a, b, x[14], 15, -1416354905)
    b = I(b, c, d, a, x[5], 21, -57434055)
    a = I(a, b, c, d, x[12], 6, 1700485571)
    d = I(d, a, b, c, x[3], 10, -1894986606)
    c = I(c, d, a, b, x[10], 15, -1051523)
    b = I(b, c, d, a, x[1], 21, -2054922799)
    a = I(a, b, c, d, x[8], 6, 1873313359)
    d = I(d, a, b, c, x[15], 10, -30611744)
    c = I(c, d, a, b, x[6], 15, -1560198380)
    b = I(b, c, d, a, x[13], 21, 1309151649)
    a = I(a, b, c, d, x[4], 6, -145523070)
    d = I(d, a, b, c, x[11], 10, -1120210379)
    c = I(c, d, a, b, x[2], 15, 718787259)
    b = I(b, c, d, a, x[9], 21, -343485551)

    a = (a + oldA) | 0
    b = (b + oldB) | 0
    c = (c + oldC) | 0
    d = (d + oldD) | 0
  }

  return [a, b, c, d]
    .map((word) =>
      Array.from({ length: 4 }, (_, byte) =>
        ((word >>> (byte * 8)) & 0xff).toString(16).padStart(2, '0')
      ).join('')
    )
    .join('')
}
