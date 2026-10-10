import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'
import { portRange, randomPort, WELL_KNOWN_PORTS } from '../tools/userAgent'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

const RANGES: [string, string, number, number][] = [
  ['dynamic', 'dynamic / ephemeral (49152–65535)', 49152, 65535],
  ['registered', 'registered (1024–49151)', 1024, 49151],
  ['any', 'anything above 1024', 1024, 65535],
]

function RandomPortUtil() {
  const [range, setRange] = useState<string>('dynamic')
  // Seeded on the first render so the panel never flashes a zero.
  const [port, setPort] = useState<number>(() => randomPort(49152, 65535))
  const [lookup, setLookup] = useState<string>('')

  const roll = () => {
    const chosen = RANGES.find((entry) => entry[0] === range)!
    setPort(randomPort(chosen[2], chosen[3]))
  }

  useEffect(roll, [range])

  const known = WELL_KNOWN_PORTS[port]
  const asked = Number(lookup)
  const askedValid = /^\d+$/.test(lookup.trim()) && asked >= 0 && asked <= 65535

  return (
    <>
      <select
        aria-label="Range"
        className={SELECT}
        value={range}
        onChange={(event) => setRange(event.target.value)}
      >
        {RANGES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <p
        className="text-center font-mono tabular-nums text-4xl text-text py-2"
        data-testid="port"
      >
        {port}
      </p>

      <p className="text-center text-xs text-subtle" data-testid="port-range">
        {portRange(port)} range
        {known ? ` · usually ${known}` : ' · no common service uses it'}
      </p>

      <button
        type="button"
        onClick={roll}
        data-testid="port-roll"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors"
      >
        Pick another
      </button>

      <TextField
        label="look up a port"
        content={lookup}
        onContentChange={setLookup}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      {lookup.trim() !== '' && (
        <TextField
          label="what uses it"
          content={
            !askedValid
              ? 'Ports run from 0 to 65535'
              : `${portRange(asked)} range${
                  WELL_KNOWN_PORTS[asked] ? ` · ${WELL_KNOWN_PORTS[asked]}` : ' · nothing common'
                }`
          }
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      )}
    </>
  )
}

export default RandomPortUtil
