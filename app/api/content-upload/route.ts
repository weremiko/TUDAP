import { issueSignedToken } from '@vercel/blob'
import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isContentType, isUploadedContentPath, MEDIA_UPLOAD_RULES } from '@/lib/content-media'
import { recordModeratorAction } from '@/lib/moderator-audit'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: HandleUploadPresignedBody
  try {
    body = await request.json() as HandleUploadPresignedBody
  } catch {
    return NextResponse.json({ error: 'Geçersiz yükleme isteği.' }, { status: 400 })
  }

  const isCompletionCallback = body.type === 'blob.upload-completed'
  if (!isCompletionCallback) {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Dosya yüklemek için giriş yapın.' }, { status: 401 })
    }
  }

  const hasOidcCredentials = Boolean(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  if (!process.env.BLOB_WEBHOOK_PUBLIC_KEY) {
    return NextResponse.json({ error: 'Private Blob store bağlantısında BLOB_WEBHOOK_PUBLIC_KEY eksik.' }, { status: 503 })
  }
  if (!hasOidcCredentials && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Private Blob store bağlantısı eksik. Projeye bağlayın veya geçerli Blob kimlik bilgilerini tanımlayın.' }, { status: 503 })
  }

  try {
    const response = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) throw new Error('Dosya yüklemek için giriş yapın.')
        if (!isUploadedContentPath(pathname)) throw new Error('Geçersiz dosya yolu')

        let payload: { contentType?: unknown }
        try {
          payload = JSON.parse(clientPayload || '{}')
        } catch {
          throw new Error('Geçersiz içerik türü')
        }
        if (!isContentType(payload.contentType) || payload.contentType === 'article') {
          throw new Error('Bu içerik türüne dosya eklenemez')
        }

        const rules = MEDIA_UPLOAD_RULES[payload.contentType]
        const validUntil = Date.now() + 15 * 60 * 1000
        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: rules.contentTypes,
          maximumSizeInBytes: rules.maxSize,
          validUntil,
        })

        return {
          token,
          urlOptions: {
            allowedContentTypes: rules.contentTypes,
            maximumSizeInBytes: rules.maxSize,
            addRandomSuffix: true,
            validUntil,
            tokenPayload: JSON.stringify({ actorId: session.user.id, contentType: payload.contentType }),
          },
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const payload = JSON.parse(tokenPayload || '{}') as { actorId?: string; contentType?: string }
          if (payload.actorId) {
            await recordModeratorAction(payload.actorId, 'upload', 'content-media', blob.pathname, payload.contentType)
          }
        } catch (error) {
          console.error('[content-upload] Audit logging failed:', error)
        }
      },
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[content-upload] Presigned upload failed:', error)
    const message = error instanceof Error ? error.message : 'Vercel Blob isteği başarısız oldu.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}