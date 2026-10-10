import { useState } from 'react'
import TextField from '../fields/TextField'

const MAX_QUANTITY = 100

function randomHex(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)))
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length)
}

function generateGuid(version: '4' | '7'): string {
  if (version === '4') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r =
        (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 1)
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const timestamp = Date.now().toString(16).padStart(12, '0')
  const randA = randomHex(3)
  const variant = (((crypto.getRandomValues(new Uint8Array(1))[0] & 0x3) | 0x8)).toString(16)
  const randB = randomHex(15)

  return (
    `${timestamp.slice(0, 8)}-${timestamp.slice(8, 12)}-` +
    `7${randA}-${variant}${randB.slice(0, 3)}-${randB.slice(3)}`
  )
}

function GuidUtil() {
  const [version, setVersion] = useState<'4' | '7'>('4')
  const [quantity, setQuantity] = useState<number>(1)
  const [guids, setGuids] = useState<string[]>(() => [generateGuid('4')])

  const regenerate = (count: number, ver: '4' | '7') => {
    setGuids(Array.from({ length: count }, () => generateGuid(ver)))
  }

  const adjustQuantity = (delta: number) => {
    const next = Math.min(MAX_QUANTITY, Math.max(1, quantity + delta))
    setQuantity(next)
    regenerate(next, version)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          version
        </span>
        <select
          data-testid="guid-version"
          aria-label="UUID version"
          value={version}
          onChange={(e) => {
            const ver = e.target.value as '4' | '7'
            setVersion(ver)
            regenerate(quantity, ver)
          }}
          className="text-sm rounded-lg border border-border bg-input px-2 py-1.5 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option value="4">v4 (random)</option>
          <option value="7">v7 (time-ordered)</option>
        </select>
      </div>

      {quantity === 1 ? (
        <TextField
          label={`uuid v${version}`}
          content={guids[0]}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ) : (
        <TextField
          label={`uuids v${version}`}
          content={guids.join('\n')}
          isReadonly={true}
          isCopyable={true}
          isMultiline={true}
        />
      )}

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          quantity
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="guid-decrease"
            aria-label="Decrease quantity"
            onClick={() => adjustQuantity(-1)}
            disabled={quantity <= 1}
            className="w-7 h-7 rounded-md border border-border text-subtle text-sm hover:bg-hover disabled:opacity-40 transition-colors"
          >
            −
          </button>
          <span
            data-testid="guid-quantity"
            className="tabular-nums text-sm text-text w-8 text-center"
          >
            {quantity}
          </span>
          <button
            type="button"
            data-testid="guid-increase"
            aria-label="Increase quantity"
            onClick={() => adjustQuantity(1)}
            disabled={quantity >= MAX_QUANTITY}
            className="w-7 h-7 rounded-md border border-border text-subtle text-sm hover:bg-hover disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => regenerate(quantity, version)}
        type="button"
        className="self-start text-sm font-medium rounded-lg border border-border px-3 py-1.5 text-subtle hover:bg-hover hover:text-text transition-colors"
      >
        New
      </button>
    </>
  )
}

export default GuidUtil
