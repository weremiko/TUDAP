import { issueSignedToken, presignUrl } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { blogPosts, user } from '@/lib/db/schema'
import { isUploadedContentPath } from '@/lib/content-media'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const pathname = new URL(request.url).searchParams.get('pathname') ?? ''
  if (!isUploadedContentPath(pathname)) return new NextResponse('Not found', { status: 404 })

  const [post] = await db.select({
    authorId: blogPosts.authorId,
    published: blogPosts.published,
    submissionStatus: blogPosts.submissionStatus,
  }).from(blogPosts).where(eq(blogPosts.mediaUrl, pathname)).limit(1)
  if (!post) return new NextResponse('Not found', { status: 404 })

  const isPublic = post.published && post.submissionStatus === 'approved'
  if (!isPublic) {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) return new NextResponse('Not found', { status: 404 })
    if (session.user.id !== post.authorId) {
      const [account] = await db.select({ role: user.role }).from(user)
        .where(eq(user.id, session.user.id)).limit(1)
      if (account?.role !== 'admin' && account?.role !== 'moderator') {
        return new NextResponse('Not found', { status: 404 })
      }
    }
  }

  try {
    const validUntil = Date.now() + 60 * 60 * 1000
    const token = await issueSignedToken({ pathname, operations: ['get'], validUntil })
    const { presignedUrl } = await presignUrl(token, {
      operation: 'get',
      pathname,
      access: 'private',
      validUntil,
    })
    return NextResponse.redirect(presignedUrl, {
      status: 307,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[content-media] Signed read URL failed:', error)
    return new NextResponse('Media is temporarily unavailable', { status: 503 })
  }
}