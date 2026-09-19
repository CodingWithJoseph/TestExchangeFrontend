import { useEffect, useState } from 'react'
import { useApi } from '../api/ApiContext'

export function ModerationAttachment({ disputeId, evidenceId }: { disputeId: string; evidenceId: string }) {
  const api = useApi()
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!url) return
    const timer = window.setTimeout(() => setUrl(null), 55_000)
    return () => window.clearTimeout(timer)
  }, [url])
  const prepare = async () => {
    setBusy(true)
    setError(null)
    try {
      const result = await api.getModerationEvidenceUrl(disputeId, evidenceId)
      setUrl(result.url)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to open this attachment.')
    } finally {
      setBusy(false)
    }
  }
  return <div>{url
    ? <a className="text-button" href={url} target="_blank" rel="noreferrer">Open private attachment · link expires in one minute</a>
    : <button className="button button-outline" disabled={busy} onClick={() => void prepare()}>{busy ? 'Preparing attachment…' : 'Get attachment link'}</button>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>
}
