import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { parseUserAgent } from '../tools/userAgent'

function UserAgentUtil() {
  const [input, setInput] = useState<string>('')
  const parsed = useMemo(() => parseUserAgent(input), [input])

  const rows: [string, string][] = parsed
    ? [
        [
          'browser',
          parsed.browserVersion
            ? `${parsed.browser} ${parsed.browserVersion}`
            : parsed.browser,
        ],
        ['engine', parsed.engine],
        ['operating system', parsed.os],
        ['device', parsed.device],
      ]
    : []

  return (
    <>
      <TextField
        label="user agent"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      <button
        type="button"
        onClick={() => setInput(navigator.userAgent)}
        data-testid="ua-mine"
        className="px-2.5 py-1 text-xs font-medium rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors self-start"
      >
        Use mine
      </button>

      {rows.map(([label, value]) => (
        <TextField
          key={label}
          label={label}
          content={value}
          isReadonly={true}
          isCopyable={true}
          isMultiline={false}
        />
      ))}

      <p className="text-[11px] text-faint">
        User agent strings are guesswork by design — every browser pretends to
        be several others for compatibility, so treat this as a best effort
        rather than a fact.
      </p>
    </>
  )
}

export default UserAgentUtil
