import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim()

export const authConfigurationError = !supabaseUrl || !supabaseKey
  ? 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the frontend .env file.'
  : null

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null
