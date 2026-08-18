import type { MetadataRoute } from "next"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const BASE = "https://dilbilim.org.tr"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/cevirici`,                lastModified: now, changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE}/terim-sozlugu`,           lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/blog`,                    lastModified: now, changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/ajanda`,                  lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/hakkinda`,                lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/iletisim`,                lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/sikca-sorulan-sorular`,   lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/gizlilik-politikasi`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/kullanim-kosullari`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/cerez-politikasi`,        lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    // English alternates
    { url: `${BASE}/en`,                      lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/en/about`,                lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/en/contact`,              lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/en/transcriber`,          lastModified: now, changeFrequency: "weekly",  priority: 0.75 },
  ]

  // Dynamic blog posts
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))

    blogEntries = posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }))
  } catch {
    // DB unavailable at build time — skip dynamic entries
  }

  return [...staticPages, ...blogEntries]
}
