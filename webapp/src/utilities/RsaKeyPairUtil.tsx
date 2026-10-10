import { useState } from 'react'
import TextField from '../fields/TextField'
import { generateRsaKeyPair, RsaPurpose } from '../crypto'

const SELECT =
  'text-xs rounded-md border border-border bg-input px-2 py-1 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

function RsaKeyPairUtil() {
  const [bits, setBits] = useState<number>(2048)
  const [purpose, setPurpose] = useState<RsaPurpose>('encrypt')
  const [publicKey, setPublicKey] = useState<string>('')
  const [privateKey, setPrivateKey] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  const generate = async () => {
    setBusy(true)
    setError(null)
    try {
      const pair = await generateRsaKeyPair(bits, purpose)
      setPublicKey(pair.publicKey)
      setPrivateKey(pair.privateKey)
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Key size"
          className={SELECT}
          value={bits}
          onChange={(event) => setBits(Number(event.target.value))}
        >
          <option value={2048}>2048 bit</option>
          <option value={3072}>3072 bit</option>
          <option value={4096}>4096 bit</option>
        </select>

        <select
          aria-label="Key purpose"
          className={SELECT}
          value={purpose}
          onChange={(event) => setPurpose(event.target.value as RsaPurpose)}
        >
          <option value="encrypt">Encryption (RSA-OAEP)</option>
          <option value="sign">Signing (RSASSA-PKCS1-v1_5)</option>
        </select>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={busy}
        data-testid="rsa-generate"
        className="w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text hover:bg-hover transition-colors disabled:opacity-50"
      >
        {busy ? 'Generating…' : 'Generate key pair'}
      </button>

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <TextField
        label="public key (PEM)"
        content={publicKey}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField
        label="private key (PEM)"
        content={privateKey}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

      <p className="text-[11px] text-faint">
        Generated in your browser and never sent anywhere. Public key is SPKI,
        private key is PKCS#8. A 4096 bit key can take a few seconds.
      </p>
    </>
  )
}

export default RsaKeyPairUtil
