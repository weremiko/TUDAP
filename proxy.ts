import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteSettings, user } from '@/lib/db/schema'

const PUBLIC_ADMIN_PATHS = ['/admin', '/sign-in', '/sign-up', '/api/auth', '/api/health', '/api/healthz']
const MAINTENANCE_HEADERS = {
  'Retry-After': '3600',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'no-store, max-age=0',
}

async function isAdminRequest(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) return false
    const [currentUser] = await db.select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)
    return currentUser?.role === 'admin'
  } catch (error) {
    console.error('[maintenance] Could not verify admin session:', error)
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  let enabled = false
  try {
    const [setting] = await db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, 'maintenance_mode'))
      .limit(1)
    enabled = setting?.value === 'true'
  } catch (error) {
    console.error('[maintenance] Could not read mode; allowing site traffic:', error)
  }

  if (!enabled) return NextResponse.next()

  const isAdmin = await isAdminRequest(request)
  if (isAdmin) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tudap-maintenance-admin', 'true')
    requestHeaders.set('x-tudap-maintenance-locale', pathname.startsWith('/en') ? 'en' : 'tr')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Platform maintenance in progress.' },
      { status: 503, headers: MAINTENANCE_HEADERS },
    )
  }

  const destination = pathname.startsWith('/en') ? '/en/maintenance' : '/maintenance'
  return NextResponse.rewrite(new URL(destination, request.url), {
    status: 503,
    headers: MAINTENANCE_HEADERS,
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}
