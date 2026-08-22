'use client'

import Link from "next/link"
import { ArrowRight, BookText, Calendar, Languages, Newspaper, UsersRound } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "tools", label: "Araçlar", icon: Languages },
  { value: "resources", label: "Kaynaklar", icon: BookText },
  { value: "platform", label: "Platform", icon: UsersRound },
]

const PANELS = {
  resources: [
    { href: "/blog", icon: Newspaper, title: "Akademik Blog", desc: "Dilbilim araştırmaları, yazılar ve platform güncellemeleri." },
    { href: "/ajanda", icon: Calendar, title: "Etkinlik Ajandası", desc: "Seminer, konferans ve çalıştayları takip edin." },
  ],
  platform: [
    { href: "/hakkinda", icon: BookText, title: "Hakkında", desc: "TÜDAP’ın amacı, yaklaşımı ve geliştirme süreci." },
    { href: "/takimimiz", icon: UsersRound, title: "Takımımız", desc: "Platformun akademik ve teknik gelişimine katkı sunan ekip." },
  ],
}

function PanelCard({ href, icon: Icon, title, desc }: { href: string; icon: typeof BookText; title: string; desc: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-border p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </Card>
    </Link>
  )
}

export function HomeTabs() {
  return (
    <Tabs defaultValue="tools" className="gap-7">
      <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="h-11 flex-none rounded-none border-b-2 border-transparent px-4 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="tools" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PanelCard href="/cevirici" icon={Languages} title="Sesbilimsel Abece Çeviricisi" desc="Türkçe metinleri IPA formatına çevirin." />
        <PanelCard href="/terim-sozlugu" icon={BookText} title="Dilbilim Terimleri Sözlüğü" desc="700+ terim, Türkçe örnekler ve akademik açıklamalar." />
      </TabsContent>

      <TabsContent value="resources" className="grid gap-5 sm:grid-cols-2">
        {PANELS.resources.map((panel) => <PanelCard key={panel.href} {...panel} />)}
      </TabsContent>

      <TabsContent value="platform" className="grid gap-5 sm:grid-cols-2">
        {PANELS.platform.map((panel) => <PanelCard key={panel.href} {...panel} />)}
      </TabsContent>
    </Tabs>
  )
}
