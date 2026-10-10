export type ExifTag = { group: string; name: string; value: string }

const TIFF_TAGS: Record<number, string> = {
  0x010e: 'Image description',
  0x010f: 'Camera make',
  0x0110: 'Camera model',
  0x0112: 'Orientation',
  0x011a: 'X resolution',
  0x011b: 'Y resolution',
  0x0131: 'Software',
  0x0132: 'Date and time',
  0x013b: 'Artist',
  0x8298: 'Copyright',
}

const EXIF_TAGS: Record<number, string> = {
  0x829a: 'Exposure time',
  0x829d: 'F number',
  0x8822: 'Exposure program',
  0x8827: 'ISO',
  0x9003: 'Date taken',
  0x9004: 'Date digitised',
  0x9201: 'Shutter speed',
  0x9202: 'Aperture',
  0x9204: 'Exposure bias',
  0x9207: 'Metering mode',
  0x9209: 'Flash',
  0x920a: 'Focal length',
  0xa002: 'Pixel width',
  0xa003: 'Pixel height',
  0xa402: 'Exposure mode',
  0xa403: 'White balance',
  0xa406: 'Scene capture type',
  0xa431: 'Serial number',
  0xa432: 'Lens info',
  0xa433: 'Lens make',
  0xa434: 'Lens model',
  0xa435: 'Lens serial number',
}

const GPS_TAGS: Record<number, string> = {
  0x0001: 'Latitude ref',
  0x0002: 'Latitude',
  0x0003: 'Longitude ref',
  0x0004: 'Longitude',
  0x0005: 'Altitude ref',
  0x0006: 'Altitude',
  0x0007: 'Timestamp',
  0x0012: 'Map datum',
  0x001d: 'Date',
}

const ORIENTATION: Record<number, string> = {
  1: '1 — normal',
  2: '2 — flipped horizontally',
  3: '3 — rotated 180°',
  4: '4 — flipped vertically',
  5: '5 — transposed',
  6: '6 — rotated 90° clockwise',
  7: '7 — transverse',
  8: '8 — rotated 90° anticlockwise',
}

const TYPE_SIZES: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
}

type Reader = {
  view: DataView
  little: boolean
  /** Offset of the TIFF header, which every internal offset is relative to. */
  base: number
}

function readValue(
  reader: Reader,
  type: number,
  count: number,
  valueOffset: number
): string {
  const { view, little, base } = reader
  const size = TYPE_SIZES[type]
  if (!size) return ''

  const total = size * count
  const at = total <= 4 ? valueOffset : base + view.getUint32(valueOffset, little)
  if (at < 0 || at + total > view.byteLength) return ''

  if (type === 2) {
    let text = ''
    for (let i = 0; i < count; i++) {
      const code = view.getUint8(at + i)
      if (code === 0) break
      text += String.fromCharCode(code)
    }
    return text.trim()
  }

  const numbers: number[] = []
  for (let i = 0; i < count && i < 8; i++) {
    const offset = at + i * size
    switch (type) {
      case 1:
      case 7:
        numbers.push(view.getUint8(offset))
        break
      case 3:
        numbers.push(view.getUint16(offset, little))
        break
      case 4:
        numbers.push(view.getUint32(offset, little))
        break
      case 9:
        numbers.push(view.getInt32(offset, little))
        break
      case 5:
      case 10: {
        const numerator =
          type === 5
            ? view.getUint32(offset, little)
            : view.getInt32(offset, little)
        const denominator =
          type === 5
            ? view.getUint32(offset + 4, little)
            : view.getInt32(offset + 4, little)
        numbers.push(denominator === 0 ? 0 : numerator / denominator)
        break
      }
    }
  }

  return numbers.map((n) => Math.round(n * 10000) / 10000).join(', ')
}

/** Turns the three rational parts and a hemisphere letter into degrees. */
function toDegrees(value: string, ref: string): string {
  const parts = value.split(',').map((part) => Number(part.trim()))
  if (parts.length < 3 || parts.some(Number.isNaN)) return value

  const degrees = parts[0] + parts[1] / 60 + parts[2] / 3600
  const signed = ref === 'S' || ref === 'W' ? -degrees : degrees
  return `${signed.toFixed(6)}° (${value} ${ref})`
}

function readIfd(
  reader: Reader,
  offset: number,
  group: string,
  names: Record<number, string>,
  pointers: Map<number, [string, Record<number, string>]>,
  tags: ExifTag[],
  seen: Set<number>
) {
  const { view, little, base } = reader
  if (seen.has(offset) || offset + 2 > view.byteLength) return
  seen.add(offset)

  const count = view.getUint16(offset, little)
  if (count > 512) return

  for (let i = 0; i < count; i++) {
    const entry = offset + 2 + i * 12
    if (entry + 12 > view.byteLength) return

    const tag = view.getUint16(entry, little)
    const type = view.getUint16(entry + 2, little)
    const length = view.getUint32(entry + 4, little)

    const pointer = pointers.get(tag)
    if (pointer) {
      const target = base + view.getUint32(entry + 8, little)
      readIfd(reader, target, pointer[0], pointer[1], new Map(), tags, seen)
      continue
    }

    const name = names[tag]
    if (!name) continue

    let value = readValue(reader, type, length, entry + 8)
    if (value === '') continue
    if (name === 'Orientation') value = ORIENTATION[Number(value)] ?? value

    tags.push({ group, name, value })
  }
}

/**
 * Reads the EXIF block out of a JPEG. Returns an empty list when the file
 * carries no metadata, and throws only when it is not a JPEG at all.
 */
export function readExif(data: Uint8Array): ExifTag[] {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
    throw new Error('Only JPEG files carry an EXIF block')
  }

  let at = 2
  let app1 = -1
  while (at + 4 < data.length) {
    if (data[at] !== 0xff) break
    const marker = data[at + 1]
    if (marker === 0xda) break // start of scan, no more metadata
    const length = (data[at + 2] << 8) | data[at + 3]
    if (
      marker === 0xe1 &&
      data[at + 4] === 0x45 &&
      data[at + 5] === 0x78 &&
      data[at + 6] === 0x69 &&
      data[at + 7] === 0x66
    ) {
      app1 = at + 10
      break
    }
    at += 2 + length
  }

  if (app1 === -1) return []

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const order = view.getUint16(app1, false)
  if (order !== 0x4949 && order !== 0x4d4d) return []

  const little = order === 0x4949
  const reader: Reader = { view, little, base: app1 }
  if (view.getUint16(app1 + 2, little) !== 42) return []

  const tags: ExifTag[] = []
  const pointers = new Map<number, [string, Record<number, string>]>([
    [0x8769, ['Camera', EXIF_TAGS]],
    [0x8825, ['Location', GPS_TAGS]],
  ])

  readIfd(
    reader,
    app1 + view.getUint32(app1 + 4, little),
    'Image',
    TIFF_TAGS,
    pointers,
    tags,
    new Set()
  )

  // Fold the hemisphere refs into the coordinates so they read as real numbers.
  for (const axis of ['Latitude', 'Longitude'] as const) {
    const value = tags.find((tag) => tag.name === axis)
    const ref = tags.find((tag) => tag.name === `${axis} ref`)
    if (value && ref) value.value = toDegrees(value.value, ref.value)
  }

  return tags.filter((tag) => !tag.name.endsWith(' ref'))
}

export function hasLocation(tags: ExifTag[]): boolean {
  return tags.some((tag) => tag.group === 'Location')
}
