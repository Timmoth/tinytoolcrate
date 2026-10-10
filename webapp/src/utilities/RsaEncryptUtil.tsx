import { useState } from 'react'
import TextField from '../fields/TextField'
import { rsaDecrypt, rsaEncrypt } from '../crypto'

const TOGGLE = 'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors'

type Mode = 'encrypt' | 'decrypt'

function RsaEncryptUtil() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [key, setKey] = useState<string>('')
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const run = async () => {
    setError(null)
    if (!input.trim()) {
      setError('Nothing to ' + mode)
      return
    }
    if (!key.trim()) {
      setError(`A ${mode === 'encrypt' ? 'public' : 'private'} key is required`)
      return
    }

    setBusy(true)
    try {
      setOutput(
        mode === 'encrypt' ? await rsaEncrypt(input, key) : await rsaDecrypt(input, key)
      )
    } catch (caught) {
      setOutput('')
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1" role="group" aria-label="Mode">
        {(['encrypt', 'decrypt'] as Mode[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => {
              setMode(option)
              setOutput('')
              setError(null)
            }}
            className={`${TOGGLE} ${
              mode === option
                ? 'border-accent bg-accent/10 text-text'
                : 'border-border text-subtle hover:bg-hover hover:text-text'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <TextField
        label={mode === 'encrypt' ? 'public key (PEM)' : 'private key (PEM)'}
        content={key}
        onContentChange={(value) => {
          setKey(value)
          setError(null)
        }}
        isReadonly={false}
        isCopyable={false}
        isMultiline={true}
      />

      <TextField
        label={mode === 'encrypt' ? 'plain text' : 'ciphertext (base64)'}
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
        onClick={run}
        disabled={busy}
        data-testid="rsa-run"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
      >
        {busy ? 'Working…' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" data-testid="rsa-error">
          {error}
        </div>
      )}

      <TextField
        label={mode === 'encrypt' ? 'ciphertext (base64)' : 'plain text'}
        content={output}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <p className="text-[11px] text-faint">
        RSA-OAEP with SHA-256. RSA can only wrap a short payload — roughly 190
        bytes on a 2048 bit key — so real systems use it to protect an AES key
        rather than the message itself.
      </p>
    </>
  )
}

export default RsaEncryptUtil
