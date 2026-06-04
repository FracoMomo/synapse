import { createClient } from '@supabase/supabase-js'
import StudentsClient from '@/components/StudentsClient'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function StudentsPage() {
  const supabase = getServiceClient()

  // Fetch profiles with their university info
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`id, full_name, course, year_level, created_at, allowed_domains ( university_name, domain )`)
    .order('full_name', { ascending: true })
    .limit(500)

  // Fetch emails from auth.users via admin API
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 500 })
  const emailMap: Record<string, string> = {}
  for (const u of authData?.users ?? []) {
    emailMap[u.id] = u.email ?? ''
  }

  const students = (profiles ?? []).map((p: any) => {
    const uni = Array.isArray(p.allowed_domains) ? p.allowed_domains[0] : p.allowed_domains
    return {
      id: p.id,
      full_name: p.full_name ?? null,
      course: p.course ?? null,
      year_level: p.year_level ?? null,
      created_at: p.created_at ?? null,
      email: emailMap[p.id] ?? null,
      university_name: uni?.university_name ?? null,
      domain: uni?.domain ?? null,
    }
  })

  // Derive unique universities for filter chips
  const universities = Array.from(
    new Map(
      students
        .filter(s => s.university_name)
        .map(s => [s.university_name, { university_name: s.university_name!, domain: s.domain! }])
    ).values()
  ).sort((a, b) => a.university_name.localeCompare(b.university_name))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Students</h1>
        <p className="text-sm text-gray-500 mt-1">All registered students across Synapse universities.</p>
      </div>
      <StudentsClient students={students} universities={universities} />
    </div>
  )
}
