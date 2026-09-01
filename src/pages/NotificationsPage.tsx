import { Bell, CheckCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import type { Notification } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { formatDate } from '../features/testing/workflowFormat'

export function NotificationsPage() {
  const api = useApi()
  const { refreshAccount } = useAccount()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setNotifications(await api.listNotifications())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load notifications.')
    } finally {
      setIsLoading(false)
    }
  }, [api])

  useEffect(() => { void load() }, [load])

  const markRead = async (notification: Notification) => {
    if (notification.read_at) return
    try {
      await api.markNotificationRead(notification.id)
      await Promise.all([load(), refreshAccount()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to mark this notification read.')
    }
  }

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead()
      await Promise.all([load(), refreshAccount()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to mark notifications read.')
    }
  }

  const unread = notifications.filter((item) => !item.read_at).length

  return <div className="page-stack">
    <PageHeader eyebrow="ACTIVITY" title="Notifications" description="Applications, testing decisions, private messages, and dispute outcomes in one place." action={unread ? <button className="button button-outline" onClick={() => void markAllRead()}><CheckCheck size={16} /> Mark all read</button> : undefined} />
    {error && <div className="form-error">{error}</div>}
    <section className="panel notification-list">
      {isLoading ? <div className="empty-state"><p>Loading notifications…</p></div> : notifications.length ? notifications.map((notification) => <button className={notification.read_at ? '' : 'unread'} key={notification.id} onClick={() => void markRead(notification)}><span className="notification-icon"><Bell size={17} /></span><span><strong>{notification.title}</strong><p>{notification.body}</p><small>{formatDate(notification.created_at)}</small></span>{!notification.read_at && <i aria-label="Unread" />}</button>) : <div className="empty-state"><Bell size={26} /><h2>You’re caught up</h2><p>Workflow updates will appear here.</p></div>}
    </section>
  </div>
}
