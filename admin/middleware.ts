import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAILS = [
  'lolcool8000.camoro@gmail.com',
  'sebastianfranco.camoro@cit.edu',
]

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // Get session token from cookie
  const accessToken = request.cookies.get('sb-access-token')?.value
    ?? request.cookies.getAll().find(c => c.name.includes('auth-token'))?.value

  if (!accessToken) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser(accessToken)

    if (!user) {
      if (!isLoginPage) return NextResponse.redirect(new URL('/login', request.url))
      return NextResponse.next()
    }

    if (!ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }

    if (isLoginPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    if (!isLoginPage) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|debug|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
