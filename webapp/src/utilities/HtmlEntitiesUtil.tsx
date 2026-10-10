import { useEffect, useState } from 'react'
import TextField from '../fields/TextField'

const NAMED_ENTITIES: { [key: string]: string } = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function encodeEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function decodeEntities(text: string): string {
  return text.replace(
    /&(#[0-9]+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g,
    (match, entity: string) => {
      if (entity.startsWith('#x') || entity.startsWith('#X')) {
        const code = parseInt(entity.slice(2), 16)
        return isNaN(code) ? match : String.fromCodePoint(code)
      }
      if (entity.startsWith('#')) {
        const code = parseInt(entity.slice(1), 10)
        return isNaN(code) ? match : String.fromCodePoint(code)
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match
    }
  )
}

function HtmlEntitiesUtil() {
  const [input, setInput] = useState<string>('')
  const [encoded, setEncoded] = useState<string>('')
  const [decoded, setDecoded] = useState<string>('')

  useEffect(() => {
    setEncoded(encodeEntities(input))
    setDecoded(decodeEntities(input))
  }, [input])

  return (
    <>
      <TextField
        label="enter text"
        content={input}
        onContentChange={setInput}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="encoded"
        content={encoded}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="decoded"
        content={decoded}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
    </>
  )
}

export default HtmlEntitiesUtil
