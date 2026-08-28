import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authConfigurationError, supabase } from './supabase'

export type ConsoleUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type AuthContextValue = {
  user: ConsoleUser | null
  accessToken: string | null
  isLoading: boolean
  configurationError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function consoleUser(user: User): ConsoleUser {
  const metadataName = user.user_metadata.display_name || user.user_metadata.full_name
  return {
    id: user.id,
    name: typeof metadataName === 'string' && metadataName.trim() ? metadataName : user.email?.split('@')[0] || 'TestExchange member',
    email: user.email || '',
    avatarUrl: typeof user.user_metadata.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ? consoleUser(session.user) : null,
    accessToken: session?.access_token ?? null,
    isLoading,
    configurationError: authConfigurationError,
    signIn: async (email, password) => {
      if (!supabase) throw new Error(authConfigurationError || 'Supabase is not configured.')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email, password, displayName) => {
      if (!supabase) throw new Error(authConfigurationError || 'Supabase is not configured.')
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
      if (error) throw error
      return Boolean(data.session)
    },
    signOut: async () => {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [isLoading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
