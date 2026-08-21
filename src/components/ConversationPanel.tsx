import { Send, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { WorkflowMessage } from '../features/testing/testingWorkflow'

type ConversationPanelProps = {
  threadId: string
  initialMessages: WorkflowMessage[]
  currentRole: 'tester' | 'developer'
  title?: string
}

function loadMessages(threadId: string, initialMessages: WorkflowMessage[]) {
  if (typeof window === 'undefined') return initialMessages

  try {
    const saved = window.localStorage.getItem(`testexchange.messages.${threadId}`)
    return saved ? (JSON.parse(saved) as WorkflowMessage[]) : initialMessages
  } catch {
    return initialMessages
  }
}

export function ConversationPanel({ threadId, initialMessages, currentRole, title = 'Private conversation' }: ConversationPanelProps) {
  const [messages, setMessages] = useState(() => loadMessages(threadId, initialMessages))
  const [message, setMessage] = useState('')

  const sendMessage = (event: FormEvent) => {
    event.preventDefault()
    const body = message.trim()
    if (!body) return

    const nextMessage: WorkflowMessage = {
      id: `${threadId}-${Date.now()}`,
      author: currentRole === 'tester' ? 'You' : 'Joseph · Calm Cards',
      role: currentRole,
      body,
      time: 'Just now',
    }
    const nextMessages = [...messages, nextMessage]
    setMessages(nextMessages)
    window.localStorage.setItem(`testexchange.messages.${threadId}`, JSON.stringify(nextMessages))
    setMessage('')
  }

  return (
    <section className="conversation-panel">
      <header className="conversation-head">
        <div><span className="conversation-icon"><ShieldCheck size={16} /></span><span><strong>{title}</strong><small>Visible only to this tester, developer, and dispute reviewers</small></span></div>
        <span className="privacy-label">Private</span>
      </header>
      <div className="message-thread" aria-live="polite">
        {messages.map((item) => item.role === 'system' ? (
          <div className="system-message" key={item.id}><ShieldCheck size={13} /><span>{item.body}</span><small>{item.time}</small></div>
        ) : (
          <article className={`thread-message ${item.role === currentRole ? 'mine' : ''}`} key={item.id}>
            <div><strong>{item.author}</strong><small>{item.time}</small></div>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <form className="message-composer" onSubmit={sendMessage}>
        <label htmlFor={`message-${threadId}`}>Message about this test</label>
        <div><textarea id={`message-${threadId}`} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a question or clarify the existing contract…" rows={2} /><button className="button button-dark" type="submit" disabled={!message.trim()}><Send size={15} /> Send</button></div>
        <small>Messages cannot add new testing requirements after the tester joins.</small>
      </form>
    </section>
  )
}
