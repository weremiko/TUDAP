import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { getBlogPosts } from "@/app/actions/blog"

const BASE = "https://dilbilim.org.tr"

export const metadata: Metadata = {
  title: "İçerikler — Türkçe Dilbilim Araştırma Platformu | TÜDAP",
  description:
    "Türkçe dilbilim, fonetik transkripsiyon, morfoloji ve sözdizimi üzerine akademik yazılar. TÜDAP platformundan dilbilimcilerin araştırma makaleleri ve analizleri.",
  keywords: [
    "dilbilim içerikleri", "türkçe dilbilim yazıları", "sesbilim makaleleri",
    "fonetik transkripsiyon", "morfoloji", "sözdizimi", "anlambilim",
    "akademik dilbilim", "türkçe dil araştırması",
  ],
  alternates: { canonical: `${BASE}/blog` },
  openGraph: {
    type: "website",
    title: "TÜDAP İçerikler — Türkçe Dilbilim Araştırmaları",
    description: "Türkçe dilbilim, fonetik ve dil araştırmaları üzerine yazı, video ve slaytlar.",
    url: `${BASE}/blog`,
    siteName: "TÜDAP",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "TÜDAP İçerikler" }],
  },
}

export default async function BlogPage() {
  const { posts } = await getBlogPosts(1, 20, true)

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "TÜDAP İçerikler",
    url: `${BASE}/blog`,
    description: "Türkçe dilbilim araştırmaları üzerine akademik yazılar.",
    inLanguage: "tr",
    publisher: { "@type": "Organization", name: "TÜDAP", url: BASE },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${BASE}/blog/${p.slug}`,
      datePublished: new Date(p.createdAt).toISOString(),
      dateModified: new Date(p.updatedAt).toISOString(),
      author: { "@type": "Person", name: p.authorName },
      description: p.excerpt || undefined,
    })),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-14 flex-1">
        <div className="space-y-2 mb-12">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Dilbilim</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">İçerikler</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Fonetik, morfoloji ve Türkçe dil araştırmaları üzerine yazı, video ve slaytlar.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Henüz yayımlanmış yazı bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <article key={post.id} className="py-8 group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <time className="text-xs text-muted-foreground uppercase tracking-wider">
                    {new Date(post.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span className="ml-3 inline-flex rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                    {post.contentType === 'video' ? 'Video' : post.contentType === 'slides' ? 'Slayt' : post.contentType === 'audio' ? 'Podcast' : post.contentType === 'document' ? 'Belge' : 'Yazı'}
                  </span>
                  <h2 className="mt-2 text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-balance">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{post.authorName}</span>
                    {(post as any).tags && (
                      <div className="flex gap-1 flex-wrap">
                        {(post as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="text-primary font-medium group-hover:underline ml-auto">İçeriğe git →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
