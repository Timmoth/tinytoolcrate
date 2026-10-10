import { useState } from 'react'
import TextField from '../fields/TextField'

function ViewBase64EncodedImageUtil() {
  const [base64EncodedImage, setBase64EncodedImage] = useState<string>('')
  const [dimensions, setDimensions] = useState<string>('')

  return (
    <>
      <TextField
        label="base64 encoded image"
        content={base64EncodedImage}
        onContentChange={(c) => {
          setBase64EncodedImage(c)
          setDimensions('')
        }}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      {dimensions && (
        <TextField
          label="dimensions"
          content={dimensions}
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      )}
      <img
        data-testid="preview-image"
        alt="Decoded image preview"
        src={base64EncodedImage}
        onLoad={(e) => {
          const img = e.currentTarget
          setDimensions(`${img.naturalWidth} × ${img.naturalHeight}`)
        }}
        onError={() => setDimensions('failed to load')}
        className="max-w-full"
      ></img>
    </>
  )
}

export default ViewBase64EncodedImageUtil
