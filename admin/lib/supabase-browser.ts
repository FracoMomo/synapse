import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zqxvzyqopszkjfbafmmu.supabase.co'
// Using the new publishable key format
const SUPABASE_ANON_KEY = 'sb_publishable_77gnRLrueFOskTKTBjozHA_6PxAuCDD'

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
