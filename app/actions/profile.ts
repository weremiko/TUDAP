'use server'

import { db } from '@/lib/db'
import { user, userFollows } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, count, or, ne } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

let profileColumnsReady: Promise<void> | null = null

export async function ensureProfileColumns() {
  if (!profileColumnsReady) {
    profileColumnsReady = db.execute(sql`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS blue_verified BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS institution TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS website_url TEXT,
        ADD COLUMN IF NOT EXISTS profile_slug TEXT,
        ADD COLUMN IF NOT EXISTS profile_visibility BOOLEAN NOT NULL DEFAULT TRUE;
      UPDATE "user" SET profile_visibility = TRUE WHERE profile_visibility IS DISTINCT FROM TRUE
    `).then(async () => {
      const users = await db.select({ id: user.id, name: user.name, profileSlug: user.profileSlug }).from(user)
      for (const account of users) {
        if (!account.profileSlug) {
          const profileSlug = await createUniqueProfileSlug(account.name, account.id)
          await db.update(user).set({ profileSlug }).where(eq(user.id, account.id))
        }
      }
    })
  }
  await profileColumnsReady
}

function hasEduDomain(email: string) {
  return email.trim().toLowerCase().endsWith('.edu.tr')
}

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Oturum açmanız gerekiyor')
  return session.user.id
}

let socialTableReady: Promise<void> | null = null

function ensureSocialTable() {
  if (!socialTableReady) {
    socialTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_follows (
        follower_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        following_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id),
        CHECK (follower_id <> following_id)
      );
      CREATE TABLE IF NOT EXISTS app_migrations (
        key TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      WITH seeded AS (
        INSERT INTO app_migrations (key)
        SELECT 'initial-admin-follows'
        WHERE EXISTS (SELECT 1 FROM "user" WHERE role = 'admin')
        ON CONFLICT (key) DO NOTHING
        RETURNING key
      )
      INSERT INTO user_follows (follower_id, following_id)
      SELECT follower.id, admin.id
      FROM "user" AS follower
      CROSS JOIN "user" AS admin
      CROSS JOIN seeded
      WHERE admin.role = 'admin' AND follower.id <> admin.id
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `).then(() => undefined)
  }
  return socialTableReady
}

export async function updateProfile(data: { name: string; image: string; institution: string; bio: string; websiteUrl: string }) {
  const userId = await requireUser()
  await ensureProfileColumns()
  const name = data.name.trim()
  const image = data.image.trim()
  const institution = data.institution.trim()
  const bio = data.bio.trim()
  const websiteUrl = data.websiteUrl.trim()

  if (name.length < 2 || name.length > 80) {
    throw new Error('Ad Soyad 2 ile 80 karakter arasında olmalıdır')
  }
  if (image.length > 2_100_000) {
    throw new Error('Profil görseli 2 MB sınırını aşamaz')
  }
  if (image.startsWith('data:') && !/^data:image\/(png|jpeg|webp|gif);base64,/.test(image)) {
    throw new Error('Desteklenmeyen profil görseli biçimi')
  }
  if (institution.length > 120 || bio.length > 500) {
    throw new Error('Kurum veya biyografi alanı çok uzun')
  }
  if (websiteUrl.length > 500) {
    throw new Error('Profil bağlantısı çok uzun')
  }
  if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) {
    throw new Error('Profil bağlantısı http:// veya https:// ile başlamalıdır')
  }

  await db
    .update(user)
    .set({ name, profileSlug: await createUniqueProfileSlug(name, userId), image: image || null, institution: institution || null, bio: bio || null, websiteUrl: websiteUrl || null, profileVisibility: true, updatedAt: new Date() })
    .where(eq(user.id, userId))

  revalidatePath('/profil')
  revalidatePath('/profil/ayarlar')
}

export async function getOwnProfile() {
  const userId = await requireUser()
  await ensureProfileColumns()
  const [profile] = await db
    .select({ id: user.id, name: user.name, profileSlug: user.profileSlug, email: user.email, image: user.image, institution: user.institution, bio: user.bio, websiteUrl: user.websiteUrl, points: user.points, blueVerified: user.blueVerified })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return profile ?? null
}

export async function toggleFollow(targetUserId: string) {
  const userId = await requireUser()
  await ensureSocialTable()
  if (userId === targetUserId) throw new Error('Kendi profilinizi takip edemezsiniz')
  const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, targetUserId)).limit(1)
  if (!target) throw new Error('Kullanıcı bulunamadı')
  const [existing] = await db.select().from(userFollows).where(and(eq(userFollows.followerId, userId), eq(userFollows.followingId, targetUserId))).limit(1)
  if (existing) {
    await db.delete(userFollows).where(and(eq(userFollows.followerId, userId), eq(userFollows.followingId, targetUserId)))
    return false
  }
  await db.insert(userFollows).values({ followerId: userId, followingId: targetUserId })
  return true
}

export async function getFollowSummary(targetUserId: string) {
  await ensureSocialTable()
  const currentUserId = await requireUser().catch(() => null)
  const [[{ followers }], [{ following }]] = await Promise.all([
    db.select({ followers: count() }).from(userFollows).where(eq(userFollows.followingId, targetUserId)),
    db.select({ following: count() }).from(userFollows).where(eq(userFollows.followerId, targetUserId)),
  ])
  let isFollowing = false
  if (currentUserId) {
    const [row] = await db.select().from(userFollows).where(and(eq(userFollows.followerId, currentUserId), eq(userFollows.followingId, targetUserId))).limit(1)
    isFollowing = Boolean(row)
  }
  return { followers: Number(followers), following: Number(following), isFollowing }
}

export async function getPublicProfile(targetUserId: string) {
  await Promise.all([ensureProfileColumns(), ensureSocialTable()])
  const [profile] = await db
    .select({ id: user.id, name: user.name, profileSlug: user.profileSlug, email: user.email, image: user.image, institution: user.institution, bio: user.bio, websiteUrl: user.websiteUrl, blueVerified: user.blueVerified })
    .from(user)
    .where(or(eq(user.profileSlug, targetUserId), eq(user.id, targetUserId)))
    .limit(1)
  if (!profile) return null
  return { ...profile, isVerified: profile.blueVerified || hasEduDomain(profile.email), ...(await getFollowSummary(targetUserId)) }
}

function profileSlugBase(name: string) {
  return name.trim().toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'profil'
}

async function createUniqueProfileSlug(name: string, excludeUserId?: string) {
  const base = profileSlugBase(name)
  let candidate = base
  let suffix = 2
  while (true) {
    const [existing] = await db.select({ id: user.id }).from(user).where(
      excludeUserId
        ? and(eq(user.profileSlug, candidate), ne(user.id, excludeUserId))
        : eq(user.profileSlug, candidate)
    ).limit(1)
    if (!existing) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}
