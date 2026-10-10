import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { COLOR_NAMES } from '../data/colorNames'
import {
  nearestName,
  parseColor,
  toCmyk,
  toHex,
  toHsl,
  toHwb,
  toRgbString,
} from '../tools/color'

const round = (value: number) => Math.round(value)

function ColorConvertUtil() {
  const [input, setInput] = useState<string>('rebeccapurple')
  const rgb = useMemo(() => parseColor(input), [input])

  const rows = useMemo((): [string, string][] => {
    if (!rgb) return []
    const hsl = toHsl(rgb)
    const hwb = toHwb(rgb)
    const cmyk = toCmyk(rgb)
    const match = nearestName(rgb, COLOR_NAMES)

    return [
      ['hex', toHex(rgb)],
      ['rgb', toRgbString(rgb)],
      ['hsl', `hsl(${round(hsl.h)} ${round(hsl.s)}% ${round(hsl.l)}%)`],
      ['hwb', `hwb(${round(hwb.h)} ${round(hwb.w)}% ${round(hwb.b)}%)`],
      [
        'cmyk',
        `cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(cmyk.k)}%)`,
      ],
      ['css name', match.exact ? match.name : `${match.name} (nearest)`],
    ]
  }, [rgb])

  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1">
          <TextField
            label="colour"
            content={input}
            onContentChange={setInput}
            isReadonly={false}
            isCopyable={false}
            isMultiline={false}
          />
        </div>
        <input
          type="color"
          aria-label="Pick a colour"
          value={rgb ? toHex(rgb) : '#000000'}
          onChange={(event) => setInput(event.target.value)}
          className="mt-6 h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-input"
        />
      </div>

      {!rgb && input.trim() !== '' && (
        <div className="text-sm text-red-600 dark:text-red-400">
          Not a colour we can read
        </div>
      )}

      {rgb && (
        <>
          <div
            data-testid="color-swatch"
            className="h-12 w-full rounded-lg border border-border"
            style={{ background: toHex(rgb) }}
          />
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
        </>
      )}

      <p className="text-[11px] text-faint">
        Accepts anything css does — names, hex, rgb(), hsl(), colour functions.
        CMYK is a straight conversion with no colour profile, so it is a guide
        rather than something to send to a printer.
      </p>
    </>
  )
}

export default ColorConvertUtil
