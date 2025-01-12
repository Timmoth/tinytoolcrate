import { useState } from 'react'
import TextField from '../fields/TextField'

function ViewBase64EncodedImageUtil() {
  const [base64EncodedImage, setBase64EncodedImage] = useState<string>('')

  return (
    <>
      <TextField
        label="base64 encoded image"
        content={base64EncodedImage}
        onContentChange={(c) => setBase64EncodedImage(c)}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <img src={base64EncodedImage}></img>
    </>
  )
}

export default ViewBase64EncodedImageUtil
