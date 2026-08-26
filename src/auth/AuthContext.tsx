import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type ConsoleUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type AuthContextValue = {
  user: ConsoleUser | null
  isLoading: boolean
  signInDemo: () => void
  signOut: () => void
}

const demoUser: ConsoleUser = {
  id: 'demo-user',
  name: 'Joseph Developer',
  email: 'joseph@example.com',
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const demoSessionKey = 'testexchange.demo-session.v1'

/**
 * Single integration point for authentication. This demo session keeps the MVP
 * runnable without a backend; replace its state with Supabase onAuthStateChange
 * and auth methods when the project is connected.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ConsoleUser | null>(() => window.localStorage.getItem(demoSessionKey) ? demoUser : null)

  const signInDemo = () => {
    window.localStorage.setItem(demoSessionKey, 'active')
    setUser(demoUser)
  }

  const signOut = () => {
    window.localStorage.removeItem(demoSessionKey)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isLoading: false,
      signInDemo,
      signOut,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
