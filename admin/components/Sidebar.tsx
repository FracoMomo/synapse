'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, Users, LogOut } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard',    label: 'Overview',     icon: LayoutDashboard },
  { href: '/universities', label: 'Universities', icon: Building2       },
  { href: '/students',     label: 'Students',     icon: Users           },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    // Clear the session cookie
    document.cookie = 'sb-access-token=; path=/; max-age=0'
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-black">S</span>
          </div>
          <div>
            <div className="font-black text-gray-900 text-sm leading-none">Synapse</div>
            <div className="text-xs text-gray-400 mt-0.5">Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
