export type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw'

/**
 * The compression streams api landed in Chrome 80, Safari 16.4 and Firefox
 * 113. Everything here depends on it, so tools check before rendering.
 */
export const COMPRESSION_SUPPORTED =
  typeof CompressionStream !== 'undefined' &&
  typeof DecompressionStream !== 'undefined'

export const FORMAT_LABELS: Record<CompressionFormat, string> = {
  gzip: 'gzip (.gz)',
  deflate: 'deflate (zlib)',
  'deflate-raw': 'deflate (raw)',
}

async function run(data: Uint8Array, stream: TransformStream): Promise<Uint8Array> {
  const piped = new Blob([data as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(piped).arrayBuffer())
}

export function compress(
  data: Uint8Array,
  format: CompressionFormat
): Promise<Uint8Array> {
  return run(data, new CompressionStream(format))
}

export function decompress(
  data: Uint8Array,
  format: CompressionFormat
): Promise<Uint8Array> {
  return run(data, new DecompressionStream(format))
}

/** Picks the format from the magic bytes, so a pasted blob usually just works. */
export function sniffFormat(data: Uint8Array): CompressionFormat | null {
  if (data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b) return 'gzip'
  // zlib: low nibble of the first byte is 8, and the two bytes are a multiple of 31
  if (
    data.length >= 2 &&
    (data[0] & 0x0f) === 8 &&
    ((data[0] << 8) | data[1]) % 31 === 0
  ) {
    return 'deflate'
  }
  return null
}
