import { get, put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { and, eq, or } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { blogPosts, user } from '@/lib/db/schema'
import { isUploadedContentPath } from '@/lib/content-media'

const DEFAULT_MAX_FILE_SIZE = 8 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MEDIA_RULES: Record<string, { types: Set<string>; maxSize: number }> = {
  image: { types: IMAGE_TYPES, maxSize: DEFAULT_MAX_FILE_SIZE },
  video: { types: new Set(['video/mp4', 'video/webm', 'video/quicktime']), maxSize: 500 * 1024 * 1024 },
  audio: { types: new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm']), maxSize: 100 * 1024 * 1024 },
  slides: { types: new Set(['application/pdf']), maxSize: 30 * 1024 * 1024 },
  document: { types: new Set(['application/pdf']), maxSize: 30 * 1024 * 1024 },
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname')
  const noStoreHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
  if (!pathname || !pathname.startsWith('uploads/') || !isUploadedContentPath(pathname)) {
    return new NextResponse('Not found', { status: 404, headers: noStoreHeaders })
  }

  const session = await auth.api.getSession({ headers: request.headers })
  let role: string | null = null
  if (session?.user) {
    const [account] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
    role = account?.role ?? null
  }
  const isOwner = Boolean(session?.user && pathname.startsWith(`uploads/${session.user.id}/`))
  const isStaff = role === 'admin' || role === 'moderator'
  const mediaUrl = `/api/uploads?pathname=${encodeURIComponent(pathname)}`
  const [publishedPost] = await db.select({ id: blogPosts.id }).from(blogPosts).where(and(
    or(eq(blogPosts.mediaUrl, pathname), eq(blogPosts.mediaUrl, mediaUrl)),
    eq(blogPosts.published, true),
    eq(blogPosts.submissionStatus, 'approved'),
  )).limit(1)
  if (!publishedPost && !isOwner && !isStaff) {
    return new NextResponse('Not found', { status: 404, headers: noStoreHeaders })
  }

  const result = await get(pathname, { access: 'private' })
  if (!result) return new NextResponse('Not found', { status: 404, headers: noStoreHeaders })
  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      ETag: result.blob.etag,
      'X-Content-Type-Options': 'nosniff',
      ...noStoreHeaders,
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
  const contentType = String(formData.get('contentType') || 'image')
  const rules = MEDIA_RULES[contentType]
  if (!(file instanceof File)) return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 })
  if (!rules || !rules.types.has(file.type)) return NextResponse.json({ error: 'Bu dosya türü desteklenmiyor.' }, { status: 400 })
  if (file.size > rules.maxSize) return NextResponse.json({ error: `Dosya boyutu ${Math.round(rules.maxSize / 1024 / 1024)} MB sınırını aşamaz.` }, { status: 400 })

  try {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const pathname = `uploads/${session.user.id}/${crypto.randomUUID()}.${extension}`
    const blob = await put(pathname, file, { access: 'private', addRandomSuffix: false, contentType: file.type })
    return NextResponse.json({ url: `/api/uploads?pathname=${encodeURIComponent(blob.pathname)}`, pathname: blob.pathname })
  } catch (error) {
    console.error('[uploads] Blob upload failed:', error)
    return NextResponse.json({ error: 'Dosya depolamaya yüklenemedi. Blob bağlantısını ve proje ortamını kontrol edin.' }, { status: 503 })
  }
}
