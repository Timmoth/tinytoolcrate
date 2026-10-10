import { useState } from 'react'
import TextField from '../fields/TextField'
import Unsupported from '../components/Unsupported'
import {
 decompress,
  COMPRESSION_SUPPORTED,
} from '../tools/compress'
import { prettyXml, xmlError } from '../tools/xml'
import { fromBase64 } from '../crypto'

function SamlDecodeUtil() {
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const decode = async () => {
    setError(null)
    setNote('')

    const trimmed = input.trim()
    if (trimmed === '') {
      setError('Paste a SAML request or response first')
      return
    }

    // Redirect binding puts the payload in a query parameter, so it arrives
    // url-encoded and sometimes still wrapped in SAMLRequest=...
    let payload = trimmed
    const parameter = /(?:SAMLRequest|SAMLResponse)=([^&]+)/.exec(payload)
    if (parameter) payload = parameter[1]
    if (/%[0-9a-f]{2}/i.test(payload)) {
      try {
        payload = decodeURIComponent(payload)
      } catch {
        setError('Could not url-decode that input')
        return
      }
    }

    let bytes: Uint8Array
    try {
      bytes = fromBase64(payload)
    } catch {
      setError('Input is not valid base64')
      return
    }

    let xml: string
    let encoding: string
    const text = new TextDecoder().decode(bytes)
    if (text.trimStart().startsWith('<')) {
      xml = text
      encoding = 'plain base64, no compression'
    } else {
      try {
        xml = new TextDecoder().decode(await decompress(bytes, 'deflate-raw'))
        encoding = 'base64 + raw deflate (redirect binding)'
      } catch {
        setOutput('')
        setError('Decoded, but the result is neither xml nor raw-deflated xml')
        return
      }
    }

    const problem = xmlError(xml)
    setOutput(prettyXml(xml))
    setNote(problem ? `${encoding} · warning: ${problem}` : encoding)
  }

  if (!COMPRESSION_SUPPORTED) {
    return (
      <Unsupported
        feature="the browser compression api"
        available="It is available in Chrome 80, Safari 16.4 and Firefox 113 or newer."
      />
    )
  }

  return (
    <>
      <TextField
        label="saml request or response"
        content={input}
        onContentChange={(value) => {
          setInput(value)
          setError(null)
        }}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      <button
        type="button"
        onClick={decode}
        data-testid="saml-decode"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors"
      >
        Decode
      </button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="saml-error">
          {error}
        </div>
      )}
      {note && (
        <div className="text-xs text-subtle" data-testid="saml-note">
          {note}
        </div>
      )}

      <TextField
        label="xml"
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <p className="text-[11px] text-faint">
        Handles both bindings: POST sends plain base64, redirect sends
        url-encoded base64 of raw-deflated xml. Signatures are not verified.
      </p>
    </>
  )
}

export default SamlDecodeUtil
