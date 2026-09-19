import { authConfigurationError, supabase } from './supabase'

export async function requestPasswordReset(email: string) {
  if (!supabase) throw new Error(authConfigurationError || 'Authentication is unavailable.')
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: new URL('/reset-password', window.location.origin).href,
  })
  if (error) throw error
}

export async function updatePassword(password: string) {
  if (!supabase) throw new Error(authConfigurationError || 'Authentication is unavailable.')
  const { data, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !data.session) throw new Error('This reset link has expired. Request a new one.')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}
