import { createClient } from '@supabase/supabase-js'
import UniversitiesClient from '@/components/UniversitiesClient'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function UniversitiesPage() {
  const supabase = getServiceClient()
  const { data: domains } = await supabase
    .from('allowed_domains')
    .select('*')
    .order('university_name', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Universities</h1>
        <p className="text-sm text-gray-500 mt-1">Manage which university email domains can access Synapse.</p>
      </div>
      <UniversitiesClient initialDomains={domains ?? []} />
    </div>
  )
}
