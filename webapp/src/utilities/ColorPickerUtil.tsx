import { useState } from 'react'
import { RGBColor, SketchPicker } from 'react-color'

function ColorPickerUtil() {
  const [sketchPickerColor, setSketchPickerColor] = useState<RGBColor>()
  return (
    <>
      <div className="text-black">
        <SketchPicker
          onChange={(color) => {
            setSketchPickerColor(color.rgb)
          }}
          color={sketchPickerColor}
        />
      </div>
    </>
  )
}

export default ColorPickerUtil
