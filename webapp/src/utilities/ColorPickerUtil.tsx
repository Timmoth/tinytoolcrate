import { useState } from 'react'
import { ColorResult, RGBColor, SketchPicker } from 'react-color'
import TextField from '../fields/TextField'

function ColorPickerUtil() {
  const [sketchPickerColor, setSketchPickerColor] = useState<RGBColor>()
  const [result, setResult] = useState<ColorResult | null>(null)

  const rgb = result?.rgb
  const hsl = result?.hsl

  const rgbText = rgb
    ? `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`
    : ''
  const hslText = hsl
    ? `hsl(${hsl.h}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`
    : ''

  return (
    <>
      <div
        className="self-center rounded-lg overflow-hidden ring-1 ring-border"
        data-testid="color-picker"
      >
        <SketchPicker
          onChange={(color) => {
            setSketchPickerColor(color.rgb)
            setResult(color)
          }}
          color={sketchPickerColor}
        />
      </div>
      {result && (
        <div className="space-y-2">
          <TextField
            label="hex"
            content={result.hex}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="rgb"
            content={rgbText}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="hsl"
            content={hslText}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
        </div>
      )}
    </>
  )
}

export default ColorPickerUtil
