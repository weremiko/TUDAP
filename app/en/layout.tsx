import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    languages: { "tr": "https://dilbilim.org.tr" },
  },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
