import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { describeSubnet } from '../tools/ip'

const EXAMPLES = ['192.168.1.130/24', '10.0.0.0/8', '172.16.5.4 255.255.0.0', '2001:db8::/48']

function SubnetUtil() {
  const [input, setInput] = useState<string>('192.168.1.130/24')
  const result = useMemo(() => describeSubnet(input), [input])

  return (
    <>
      <TextField
        label="address / cidr"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={false}
        isMultiline={false}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="px-2.5 py-1 text-xs font-mono rounded-md border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      {!result.ok && result.error !== '' && (
        <div className="text-sm text-red-600 dark:text-red-400">{result.error}</div>
      )}

      {result.ok &&
        result.info.rows.map(([label, value]) => (
          <TextField
            key={label}
            label={label}
            content={value}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
        ))}
    </>
  )
}

export default SubnetUtil
