import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isContentType, MEDIA_UPLOAD_RULES } from '@/lib/content-media'
import { recordModeratorAction } from '@/lib/moderator-audit'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Dosya yüklemek için giriş yapın.' }, { status: 401 })
  }

  let body: HandleUploadBody
  try {
    body = await request.json() as HandleUploadBody
  } catch {
    return NextResponse.json({ error: 'Geçersiz yükleme isteği.' }, { status: 400 })
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith('content/')) throw new Error('Geçersiz dosya yolu')

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
        return {
          allowedContentTypes: rules.contentTypes,
          maximumSizeInBytes: rules.maxSize,
          addRandomSuffix: true,
          validUntil: Date.now() + 15 * 60 * 1000,
          tokenPayload: JSON.stringify({ actorId: session.user.id, contentType: payload.contentType }),
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
    })

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'Dosya yüklenemedi. Depolama ayarlarını kontrol edin.' }, { status: 400 })
  }
}