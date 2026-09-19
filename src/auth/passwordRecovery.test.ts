import { beforeEach, describe, expect, it, vi } from 'vitest'
const auth = vi.hoisted(() => ({ resetPasswordForEmail: vi.fn(), getSession: vi.fn(), updateUser: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { auth }, authConfigurationError: null }))
import { requestPasswordReset, updatePassword } from './passwordRecovery'

describe('password recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('window', { location: { origin: 'https://testexchange.example' } })
  })
  it('sends the reset link to the dedicated route on this origin', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null })
    await requestPasswordReset(' member@example.test ')
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('member@example.test', { redirectTo: 'https://testexchange.example/reset-password' })
  })
  it('does not update a password with an expired recovery session', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    await expect(updatePassword('new-password')).rejects.toThrow('expired')
    expect(auth.updateUser).not.toHaveBeenCalled()
  })
  it('updates with a valid session and surfaces provider validation failures', async () => {
    auth.getSession.mockResolvedValue({ data: { session: {} }, error: null })
    auth.updateUser.mockResolvedValue({ error: new Error('Password is too weak') })
    await expect(updatePassword('weak-password')).rejects.toThrow('too weak')
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'weak-password' })
  })
})
