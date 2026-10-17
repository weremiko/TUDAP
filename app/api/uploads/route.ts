import { get, put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname || !pathname.startsWith('uploads/')) return NextResponse.json({ error: 'Geçersiz dosya yolu.' }, { status: 400 })

  const result = await get(pathname, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  })
  if (!result) return new NextResponse('Dosya bulunamadı.', { status: 404 })
  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, 'Cache-Control': 'public, max-age=31536000, immutable' } })
  }
  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      ETag: result.blob.etag,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

  const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: 'Yalnızca JPG, PNG, WebP veya GIF yüklenebilir.' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Dosya boyutu 8 MB sınırını aşamaz.' }, { status: 400 })

  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const pathname = `uploads/${session.user.id}/${crypto.randomUUID()}.${extension}`
  const blob = await put(pathname, file, { access: 'private', addRandomSuffix: false, contentType: file.type })
  return NextResponse.json({ url: `/api/uploads?pathname=${encodeURIComponent(blob.pathname)}`, pathname: blob.pathname })
}
