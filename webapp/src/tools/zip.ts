import { compress, decompress } from './compress'

const LOCAL_HEADER = 0x04034b50
const CENTRAL_HEADER = 0x02014b50
const END_OF_DIRECTORY = 0x06054b50
/** Names are utf-8; bit 11 says so. */
const UTF8_FLAG = 0x0800

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let value = i
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[i] = value >>> 0
  }
  return table
})()

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

class ByteWriter {
  private parts: Uint8Array[] = []
  private length = 0

  push(bytes: Uint8Array) {
    this.parts.push(bytes)
    this.length += bytes.length
  }

  u16(value: number) {
    this.push(new Uint8Array([value & 0xff, (value >>> 8) & 0xff]))
  }

  u32(value: number) {
    this.push(
      new Uint8Array([
        value & 0xff,
        (value >>> 8) & 0xff,
        (value >>> 16) & 0xff,
        (value >>> 24) & 0xff,
      ])
    )
  }

  get size() {
    return this.length
  }

  bytes(): Uint8Array {
    const out = new Uint8Array(this.length)
    let at = 0
    for (const part of this.parts) {
      out.set(part, at)
      at += part.length
    }
    return out
  }
}

function toDos(date: Date) {
  return {
    time:
      (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date:
      ((Math.max(1980, date.getFullYear()) - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  }
}

function fromDos(time: number, date: number): Date {
  return new Date(
    1980 + ((date >>> 9) & 0x7f),
    ((date >>> 5) & 0x0f) - 1,
    date & 0x1f,
    (time >>> 11) & 0x1f,
    (time >>> 5) & 0x3f,
    (time & 0x1f) * 2
  )
}

export type ZipInput = { name: string; data: Uint8Array; date?: Date }

/**
 * Builds a zip with stored and deflated entries. No encryption and no zip64,
 * so a single entry has to stay under 4GB.
 */
export async function createZip(files: ZipInput[]): Promise<Blob> {
  const encoder = new TextEncoder()
  const body: Uint8Array[] = []
  const directory: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const checksum = crc32(file.data)
    const { time, date } = toDos(file.date ?? new Date())

    let method = 8
    let payload = await compress(file.data, 'deflate-raw')
    // Incompressible data is cheaper stored than deflated.
    if (payload.length >= file.data.length) {
      method = 0
      payload = file.data
    }

    const local = new ByteWriter()
    local.u32(LOCAL_HEADER)
    local.u16(20)
    local.u16(UTF8_FLAG)
    local.u16(method)
    local.u16(time)
    local.u16(date)
    local.u32(checksum)
    local.u32(payload.length)
    local.u32(file.data.length)
    local.u16(name.length)
    local.u16(0)
    local.push(name)

    const entry = new ByteWriter()
    entry.u32(CENTRAL_HEADER)
    entry.u16(20)
    entry.u16(20)
    entry.u16(UTF8_FLAG)
    entry.u16(method)
    entry.u16(time)
    entry.u16(date)
    entry.u32(checksum)
    entry.u32(payload.length)
    entry.u32(file.data.length)
    entry.u16(name.length)
    entry.u16(0)
    entry.u16(0)
    entry.u16(0)
    entry.u16(0)
    entry.u32(0)
    entry.u32(offset)
    entry.push(name)

    offset += local.size + payload.length
    body.push(local.bytes(), payload)
    directory.push(entry.bytes())
  }

  const directorySize = directory.reduce((total, part) => total + part.length, 0)
  const end = new ByteWriter()
  end.u32(END_OF_DIRECTORY)
  end.u16(0)
  end.u16(0)
  end.u16(files.length)
  end.u16(files.length)
  end.u32(directorySize)
  end.u32(offset)
  end.u16(0)

  return new Blob([...body, ...directory, end.bytes()] as BlobPart[], {
    type: 'application/zip',
  })
}

export type ZipEntry = {
  name: string
  size: number
  compressedSize: number
  method: number
  crc: number
  date: Date
  directory: boolean
  offset: number
}

export function readZip(data: Uint8Array): ZipEntry[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)

  let end = -1
  const earliest = Math.max(0, data.length - 22 - 0xffff)
  for (let i = data.length - 22; i >= earliest; i--) {
    if (view.getUint32(i, true) === END_OF_DIRECTORY) {
      end = i
      break
    }
  }
  if (end === -1) throw new Error('Not a zip file — no end of central directory')

  const count = view.getUint16(end + 10, true)
  let at = view.getUint32(end + 16, true)
  const decoder = new TextDecoder()
  const entries: ZipEntry[] = []

  for (let i = 0; i < count; i++) {
    if (at + 46 > data.length || view.getUint32(at, true) !== CENTRAL_HEADER) {
      throw new Error('Zip directory is corrupt')
    }
    const method = view.getUint16(at + 10, true)
    const time = view.getUint16(at + 12, true)
    const date = view.getUint16(at + 14, true)
    const crc = view.getUint32(at + 16, true)
    const compressedSize = view.getUint32(at + 20, true)
    const size = view.getUint32(at + 24, true)
    const nameLength = view.getUint16(at + 28, true)
    const extraLength = view.getUint16(at + 30, true)
    const commentLength = view.getUint16(at + 32, true)
    const offset = view.getUint32(at + 42, true)
    const name = decoder.decode(data.subarray(at + 46, at + 46 + nameLength))

    entries.push({
      name,
      size,
      compressedSize,
      method,
      crc,
      date: fromDos(time, date),
      directory: name.endsWith('/'),
      offset,
    })

    at += 46 + nameLength + extraLength + commentLength
  }

  return entries
}

export async function extractEntry(
  data: Uint8Array,
  entry: ZipEntry
): Promise<Uint8Array> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  if (view.getUint32(entry.offset, true) !== LOCAL_HEADER) {
    throw new Error(`Local header for "${entry.name}" is missing`)
  }

  // The local header's name and extra lengths can differ from the directory's.
  const nameLength = view.getUint16(entry.offset + 26, true)
  const extraLength = view.getUint16(entry.offset + 28, true)
  const start = entry.offset + 30 + nameLength + extraLength
  const payload = data.subarray(start, start + entry.compressedSize)

  if (entry.method === 0) return payload.slice()
  if (entry.method === 8) return decompress(payload, 'deflate-raw')
  throw new Error(`"${entry.name}" uses unsupported compression method ${entry.method}`)
}
