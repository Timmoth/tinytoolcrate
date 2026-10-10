import { useCallback, useEffect, useState } from 'react'
import TextField from '../fields/TextField'

function PublicIp() {
  const [publicIp, setPublicIp] = useState<string | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchPublicIp = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setPublicIp(data.ip)
    } catch (error) {
      console.error('Error fetching public IP:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPublicIp()
  }, [fetchPublicIp])

  return (
    <>
      <TextField
        label="public ip"
        content={error ? 'Failed to load public ip' : publicIp || 'Loading...'}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />
      <button
        type="button"
        onClick={fetchPublicIp}
        disabled={loading}
        className="self-start text-sm font-medium rounded-lg border border-border px-3 py-1.5 text-subtle hover:bg-hover hover:text-text disabled:opacity-40 transition-colors"
      >
        Refresh
      </button>
    </>
  )
}

export default PublicIp
