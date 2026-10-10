import { useId, useState } from 'react'

function FileDrop({
  onFiles,
  multiple = false,
  accept,
  hint = 'Click to upload or drag and drop',
}: {
  onFiles: (files: File[]) => void
  multiple?: boolean
  accept?: string
  hint?: string
}) {
  const id = useId()
  const [over, setOver] = useState(false)

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (files.length > 0) onFiles(multiple ? files : [files[0]])
  }

  return (
    <div
      className="w-full"
      data-testid="file-drop"
      onDragOver={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        take(event.dataTransfer.files)
      }}
    >
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          over
            ? 'border-accent bg-accent/5'
            : 'border-border bg-input hover:border-faint hover:bg-hover/50'
        }`}
      >
        <svg
          className="w-7 h-7 mb-2 text-faint"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
          />
        </svg>
        <p className="text-sm text-subtle px-3 text-center">{hint}</p>
        <input
          id={id}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(event) => {
            take(event.target.files)
            event.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

export default FileDrop
