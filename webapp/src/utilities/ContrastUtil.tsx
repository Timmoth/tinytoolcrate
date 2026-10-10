import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { contrastChecks, contrastRatio, parseColor, toHex } from '../tools/color'

function ContrastUtil() {
  const [foreground, setForeground] = useState<string>('#5a5a5a')
  const [background, setBackground] = useState<string>('#ffffff')

  const parsed = useMemo(
    () => ({ fg: parseColor(foreground), bg: parseColor(background) }),
    [foreground, background]
  )

  const ratio =
    parsed.fg && parsed.bg ? contrastRatio(parsed.fg, parsed.bg) : null
  const checks = ratio === null ? [] : contrastChecks(ratio)

  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1">
          <TextField
            label="foreground"
            content={foreground}
            onContentChange={setForeground}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
        </div>
        <input
          type="color"
          aria-label="Pick foreground"
          value={parsed.fg ? toHex(parsed.fg) : '#000000'}
          onChange={(event) => setForeground(event.target.value)}
          className="mt-6 h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-input"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <TextField
            label="background"
            content={background}
            onContentChange={setBackground}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
        </div>
        <input
          type="color"
          aria-label="Pick background"
          value={parsed.bg ? toHex(parsed.bg) : '#ffffff'}
          onChange={(event) => setBackground(event.target.value)}
          className="mt-6 h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-input"
        />
      </div>

      {(!parsed.fg || !parsed.bg) && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {!parsed.fg ? 'Foreground' : 'Background'} is not a colour we can read
        </div>
      )}

      {parsed.fg && parsed.bg && (
        <>
          <div
            data-testid="contrast-preview"
            className="rounded-lg border border-border p-3"
            style={{ background: toHex(parsed.bg), color: toHex(parsed.fg) }}
          >
            <p className="text-base font-semibold">Large text sample</p>
            <p className="text-sm">
              Normal body text, the size most of your interface will use.
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-semibold text-text tabular-nums"
              data-testid="contrast-ratio"
            >
              {(Math.round(ratio! * 100) / 100).toFixed(2)}
            </span>
            <span className="text-sm text-subtle">: 1</span>
          </div>

          <ul className="space-y-1" data-testid="contrast-checks">
            {checks.map((check) => (
              <li
                key={check.label}
                data-testid="contrast-check"
                data-check={check.label}
                data-passes={check.passes}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-subtle">{check.label}</span>
                <span
                  className={`font-medium ${
                    check.passes
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {check.passes ? 'pass' : 'fail'} · needs {check.threshold}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default ContrastUtil
