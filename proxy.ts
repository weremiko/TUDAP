import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'

const PUBLIC_DURING_MAINTENANCE = ['/admin', '/sign-in', '/sign-up', '/api/auth']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/maintenance' || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  if (PUBLIC_DURING_MAINTENANCE.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }

  try {
    const [setting] = await db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, 'maintenance_mode'))
      .limit(1)

    if (setting?.value === 'true') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Platform maintenance in progress.' }, { status: 503 })
      }
      return NextResponse.rewrite(new URL('/maintenance', request.url))
    }
  } catch (error) {
    console.error('[maintenance] Route guard could not read setting:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
}
