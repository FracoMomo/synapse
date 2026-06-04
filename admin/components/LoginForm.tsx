'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const SUPABASE_URL = 'https://zqxvzyqopszkjfbafmmu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeHZ6eXFvcHN6a2pmYmFmbW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDMxNzcsImV4cCI6MjA5NTM3OTE3N30.O770c7t644fK4JTB7tGA56Wdd_rHLldD3CbROhwD5kM'

export default function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error_description ?? data.msg ?? data.message ?? 'Login failed')
        setLoading(false)
        return
      }

      // Store session in localStorage so middleware can read it
      localStorage.setItem('sb-access-token', data.access_token)
      localStorage.setItem('sb-refresh-token', data.refresh_token)

      // Also set as cookie for middleware
      document.cookie = `sb-access-token=${data.access_token}; path=/; max-age=3600`

      router.push('/dashboard')
      router.refresh()

    } catch (err: any) {
      setError('Network error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@synapse.app"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
