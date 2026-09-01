import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useApi } from '../api/ApiContext'
import { ApiError } from '../api/client'
import type { Profile } from '../api/types'
import { useAuth } from '../auth/AuthContext'

type AccountContextValue = {
  profile: Profile | null
  balance: number
  isModerator: boolean
  unreadNotifications: number
  isLoading: boolean
  error: string | null
  refreshAccount: () => Promise<void>
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

function defaultUsername(email: string, userId: string) {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '') || 'member'
  return `${base.slice(0, 30)}-${userId.slice(0, 6)}`
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const api = useApi()
  const { user, accessToken } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [balance, setBalance] = useState(0)
  const [isModerator, setIsModerator] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAccount = useCallback(async () => {
    if (!user || !accessToken) {
      setProfile(null)
      setBalance(0)
      setIsModerator(false)
      setUnreadNotifications(0)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      let nextProfile: Profile
      try {
        nextProfile = await api.getProfile()
      } catch (requestError) {
        if (!(requestError instanceof ApiError) || requestError.status !== 404) throw requestError
        nextProfile = await api.saveProfile({
          username: defaultUsername(user.email, user.id),
          display_name: user.name,
        })
      }
      const [creditBalance, capabilities, notifications] = await Promise.all([
        api.getCreditBalance(),
        api.getCapabilities(),
        api.listNotifications(),
      ])
      setProfile(nextProfile)
      setBalance(creditBalance.balance)
      setIsModerator(capabilities.is_moderator)
      setUnreadNotifications(notifications.filter((item) => !item.read_at).length)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load your TestExchange account.')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, api, user])

  useEffect(() => { void refreshAccount() }, [refreshAccount])

  const value = useMemo(() => ({ profile, balance, isModerator, unreadNotifications, isLoading, error, refreshAccount }), [balance, error, isLoading, isModerator, profile, refreshAccount, unreadNotifications])
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) throw new Error('useAccount must be used inside AccountProvider')
  return context
}
