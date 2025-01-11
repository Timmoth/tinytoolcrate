import { useState } from 'react'
import TextField from '../fields/TextField'

function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r =
      (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 1)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function GuidUtil() {
  const [currentGuid, setCurrentGuid] = useState<string>(generateGuid())

  return (
    <>
      <TextField
        label="guid v4"
        content={currentGuid}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
      <button
        onClick={() => setCurrentGuid(generateGuid())}
        type="button"
        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      >
        New
      </button>
    </>
  )
}

export default GuidUtil
