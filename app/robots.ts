import type { MetadataRoute } from "next"

const BASE = "https://dilbilim.org.tr"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/sign-in/",
          "/sign-up/",
          "/api/",
          "/profil/ayarlar/",
          "/profil/blog-basvurusu/",
          "/eren/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
