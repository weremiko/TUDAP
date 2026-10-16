export type ContentType = 'article' | 'video' | 'slides' | 'audio' | 'document'

export const MEDIA_UPLOAD_RULES = {
  video: {
    accept: 'video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv',
    contentTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxSize: 500 * 1024 * 1024,
  },
  slides: {
    accept: 'application/pdf,.pdf',
    contentTypes: ['application/pdf'],
    maxSize: 50 * 1024 * 1024,
  },
  audio: {
    accept: 'audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/x-wav,audio/webm,.mp3,.m4a,.ogg,.wav,.webm',
    contentTypes: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm'],
    maxSize: 200 * 1024 * 1024,
  },
  document: {
    accept: 'application/pdf,.pdf',
    contentTypes: ['application/pdf'],
    maxSize: 50 * 1024 * 1024,
  },
} satisfies Record<Exclude<ContentType, 'article'>, {
  accept: string
  contentTypes: string[]
  maxSize: number
}>

export function isContentType(value: unknown): value is ContentType {
  return value === 'article' || value === 'video' || value === 'slides' || value === 'audio' || value === 'document'
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export function isUploadedContentPath(value: string) {
  return value.startsWith('content/') &&
    value.length <= 300 &&
    /^[a-zA-Z0-9._/-]+$/.test(value) &&
    !value.split('/').some((segment) => !segment || segment === '.' || segment === '..')
}

export function getContentMediaUrl(mediaUrl: string) {
  if (!isUploadedContentPath(mediaUrl)) return mediaUrl
  return `/api/content-media?pathname=${encodeURIComponent(mediaUrl)}`
}