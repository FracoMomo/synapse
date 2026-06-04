import { createClient } from '@supabase/supabase-js'
import { Users, Building2, ShieldCheck, TrendingUp } from 'lucide-react'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function DashboardPage() {
  const supabase = getServiceClient()

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [
    { count: totalStudents },
    { count: totalUniversities },
    { count: newThisMonth },
    { count: newLastMonth },
    { data: recentDomains },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('allowed_domains').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfThisMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfLastMonth).lt('created_at', startOfThisMonth),
    supabase.from('allowed_domains').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const thisMonth = newThisMonth ?? 0
  const lastMonth = newLastMonth ?? 0
  const growthDisplay = thisMonth.toString()
  const growthSub = lastMonth > 0 ? `vs ${lastMonth} last month` : 'no signups last month'

  const stats = [
    { label: 'Total Students',      value: totalStudents ?? 0,  sub: null,       icon: Users,       color: 'bg-blue-500'   },
    { label: 'Universities',        value: totalUniversities ?? 0, sub: null,    icon: Building2,   color: 'bg-purple-500' },
    { label: 'Verified Domains',    value: totalUniversities ?? 0, sub: null,    icon: ShieldCheck, color: 'bg-green-500'  },
    { label: 'Growth (this month)', value: growthDisplay,        sub: growthSub, icon: TrendingUp,  color: 'bg-orange-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening across Synapse.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              {s.sub && <div className="text-xs text-gray-400 mt-1">{s.sub}</div>}
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Universities</h2>
          <a href="/universities" className="text-sm text-blue-600 font-semibold hover:underline">View all →</a>
        </div>
        <div className="divide-y divide-gray-50">
          {recentDomains && recentDomains.length > 0 ? recentDomains.map((d: any) => (
            <div key={d.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{d.university_name}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">@{d.domain}</div>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(d.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          )) : (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No universities added yet.{' '}
              <a href="/universities" className="text-blue-600 font-semibold hover:underline">Add one →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
