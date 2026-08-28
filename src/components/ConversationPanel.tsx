import { Send, ShieldCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useApi } from '../api/ApiContext'
import type { PrivateMessage } from '../api/types'
import { useAuth } from '../auth/AuthContext'

type ConversationPanelProps = {
  assignmentId: string
  title?: string
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function ConversationPanel({ assignmentId, title = 'Private conversation' }: ConversationPanelProps) {
  const api = useApi()
  const { user } = useAuth()
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    void api.listMessages(assignmentId)
      .then((items) => { if (active) setMessages(items) })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load messages.') })
    return () => { active = false }
  }, [api, assignmentId])

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault()
    const body = message.trim()
    if (!body || sending) return
    setSending(true)
    setError(null)
    try {
      const nextMessage = await api.sendMessage(assignmentId, body)
      setMessages((current) => [...current, nextMessage])
      setMessage('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send this message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="conversation-panel">
      <header className="conversation-head">
        <div><span className="conversation-icon"><ShieldCheck size={16} /></span><span><strong>{title}</strong><small>Visible only to this tester, developer, and dispute reviewers</small></span></div>
        <span className="privacy-label">Private</span>
      </header>
      <div className="message-thread" aria-live="polite">
        {messages.length === 0 && <div className="system-message"><ShieldCheck size={13} /><span>No private messages yet.</span></div>}
        {messages.map((item) => (
          <article className={`thread-message ${item.sender_id === user?.id ? 'mine' : ''}`} key={item.id}>
            <div><strong>{item.sender_id === user?.id ? 'You' : 'Campaign participant'}</strong><small>{messageTime(item.created_at)}</small></div>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <form className="message-composer" onSubmit={sendMessage}>
        <label htmlFor={`message-${assignmentId}`}>Message about this test</label>
        <div><textarea id={`message-${assignmentId}`} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a question or clarify the existing contract…" rows={2} /><button className="button button-dark" type="submit" disabled={!message.trim() || sending}><Send size={15} /> {sending ? 'Sending…' : 'Send'}</button></div>
        {error && <small className="field-error">{error}</small>}
        <small>Messages cannot add new testing requirements after the tester joins.</small>
      </form>
    </section>
  )
}
