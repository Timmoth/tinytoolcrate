/**
 * Builds an APP1 EXIF segment so tests have a photo with real metadata.
 * Little endian throughout, which is what most cameras emit.
 */

type Entry = {
  tag: number
  type: number
  count: number
  /** Written inline when it fits in four bytes, otherwise into the data area. */
  bytes: Buffer
}

function ascii(text: string): Entry['bytes'] {
  return Buffer.from(`${text}\0`, 'latin1')
}

function rationals(values: [number, number][]): Buffer {
  const out = Buffer.alloc(values.length * 8)
  values.forEach(([numerator, denominator], index) => {
    out.writeUInt32LE(numerator, index * 8)
    out.writeUInt32LE(denominator, index * 8 + 4)
  })
  return out
}

function degreesToParts(value: number): [number, number][] {
  const absolute = Math.abs(value)
  const degrees = Math.floor(absolute)
  const minutes = Math.floor((absolute - degrees) * 60)
  const seconds = Math.round((absolute - degrees - minutes / 60) * 3600 * 100)
  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ]
}

/** Serialises one IFD plus its overflow data, starting at `start` in the tiff. */
function buildIfd(entries: Entry[], start: number): Buffer {
  const sorted = [...entries].sort((a, b) => a.tag - b.tag)
  const tableSize = 2 + sorted.length * 12 + 4

  const table = Buffer.alloc(tableSize)
  const overflow: Buffer[] = []
  let dataOffset = start + tableSize

  table.writeUInt16LE(sorted.length, 0)
  sorted.forEach((entry, index) => {
    const at = 2 + index * 12
    table.writeUInt16LE(entry.tag, at)
    table.writeUInt16LE(entry.type, at + 2)
    table.writeUInt32LE(entry.count, at + 4)

    if (entry.bytes.length <= 4) {
      entry.bytes.copy(table, at + 8)
    } else {
      table.writeUInt32LE(dataOffset, at + 8)
      overflow.push(entry.bytes)
      dataOffset += entry.bytes.length
    }
  })
  table.writeUInt32LE(0, 2 + sorted.length * 12)

  return Buffer.concat([table, ...overflow])
}

export type ExifFixture = {
  make: string
  model: string
  software?: string
  gps?: { latitude: number; longitude: number }
}

export function buildExifSegment(fixture: ExifFixture): Buffer {
  const header = Buffer.alloc(8)
  header.write('II', 0, 'latin1')
  header.writeUInt16LE(42, 2)
  header.writeUInt32LE(8, 4)

  const main: Entry[] = [
    { tag: 0x010f, type: 2, count: fixture.make.length + 1, bytes: ascii(fixture.make) },
    { tag: 0x0110, type: 2, count: fixture.model.length + 1, bytes: ascii(fixture.model) },
    { tag: 0x0112, type: 3, count: 1, bytes: Buffer.from([6, 0, 0, 0]) },
  ]
  if (fixture.software) {
    main.push({
      tag: 0x0131,
      type: 2,
      count: fixture.software.length + 1,
      bytes: ascii(fixture.software),
    })
  }

  let tiff: Buffer
  if (fixture.gps) {
    // The GPS pointer has to hold a real offset, so lay the main ifd out once
    // to learn where the gps block will land, then write it for real.
    const probe = buildIfd(
      [...main, { tag: 0x8825, type: 4, count: 1, bytes: Buffer.alloc(4) }],
      8
    )
    const gpsOffset = 8 + probe.length

    const gps = buildIfd(
      [
        {
          tag: 0x0001,
          type: 2,
          count: 2,
          bytes: ascii(fixture.gps.latitude >= 0 ? 'N' : 'S'),
        },
        {
          tag: 0x0002,
          type: 5,
          count: 3,
          bytes: rationals(degreesToParts(fixture.gps.latitude)),
        },
        {
          tag: 0x0003,
          type: 2,
          count: 2,
          bytes: ascii(fixture.gps.longitude >= 0 ? 'E' : 'W'),
        },
        {
          tag: 0x0004,
          type: 5,
          count: 3,
          bytes: rationals(degreesToParts(fixture.gps.longitude)),
        },
      ],
      gpsOffset
    )

    const pointer = Buffer.alloc(4)
    pointer.writeUInt32LE(gpsOffset, 0)
    const withPointer = buildIfd(
      [...main, { tag: 0x8825, type: 4, count: 1, bytes: pointer }],
      8
    )
    tiff = Buffer.concat([header, withPointer, gps])
  } else {
    tiff = Buffer.concat([header, buildIfd(main, 8)])
  }

  const body = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff])
  const segment = Buffer.alloc(4)
  segment[0] = 0xff
  segment[1] = 0xe1
  segment.writeUInt16BE(body.length + 2, 2)

  return Buffer.concat([segment, body])
}

/** Splices an EXIF block into a real jpeg, right after the SOI marker. */
export function withExif(jpeg: Buffer, fixture: ExifFixture): Buffer {
  return Buffer.concat([
    jpeg.subarray(0, 2),
    buildExifSegment(fixture),
    jpeg.subarray(2),
  ])
}
