import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createApiClient, type ApiClient } from './client'

const ApiContext = createContext<ApiClient | undefined>(undefined)

export function ApiProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()
  const client = useMemo(() => createApiClient(accessToken), [accessToken])
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
}

export function useApi() {
  const client = useContext(ApiContext)
  if (!client) throw new Error('useApi must be used inside ApiProvider')
  return client
}
