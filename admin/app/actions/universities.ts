'use server'

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function addUniversity(universityName: string, domain: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('allowed_domains')
    .insert({ domain: domain.replace(/^@/, '').trim().toLowerCase(), university_name: universityName.trim(), is_active: true })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message.includes('unique') ? 'This domain already exists.' : error.message }
  }
  return { data, error: null }
}

export async function deleteUniversity(id: string) {
  const supabase = getServiceClient()

  // Check if any students are linked to this university
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('university_id', id)

  if ((count ?? 0) > 0) {
    return { error: `Cannot delete — this university has ${count} active student${count === 1 ? '' : 's'}. Disable it instead.` }
  }

  const { error } = await supabase
    .from('allowed_domains')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Failed to delete university. Please try again.' }
  return { error: null }
}

export async function toggleUniversity(id: string, isActive: boolean) {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('allowed_domains')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: 'Failed to update university status. Please try again.' }
  return { error: null }
}
