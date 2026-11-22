'use client'

import Link from "next/link"
import { ArrowRight, BookText, Calendar, Languages, Newspaper, UsersRound } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type HomeContent = Record<string, string>

function PanelCard({ href, icon: Icon, title, desc }: { href: string; icon: typeof BookText; title: string; desc: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-border/80 bg-card/85 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_38px_-28px_rgba(15,23,42,0.38)]">
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

export function HomeTabs({ content }: { content: HomeContent }) {
  const tabs = [
    { value: "tools", label: content.tab_tools, icon: Languages },
    { value: "resources", label: content.tab_resources, icon: BookText },
    { value: "platform", label: content.tab_platform, icon: UsersRound },
  ]
  const panels = {
    resources: [
      { href: content.resource_blog_href, icon: Newspaper, title: content.resource_blog_title, desc: content.resource_blog_desc },
      { href: content.resource_agenda_href, icon: Calendar, title: content.resource_agenda_title, desc: content.resource_agenda_desc },
    ],
    platform: [
      { href: content.platform_about_href, icon: BookText, title: content.platform_about_title, desc: content.platform_about_desc },
      { href: content.platform_team_href, icon: UsersRound, title: content.platform_team_title, desc: content.platform_team_desc },
    ],
  }

  return (
    <Tabs defaultValue="tools" className="gap-7">
      <TabsList className="h-auto w-full justify-start gap-2 rounded-2xl border border-border/80 bg-muted/30 p-1.5">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="h-11 flex-none rounded-xl border border-transparent px-4 text-sm data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)] data-[state=active]:shadow-sm data-[state=active]:shadow-black/5 data-[state=inactive]:text-muted-foreground">
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="tools" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PanelCard href={content.tool_transcriber_href} icon={Languages} title={content.tool_transcriber_title} desc={content.tool_transcriber_desc} />
        <PanelCard href={content.tool_glossary_href} icon={BookText} title={content.tool_glossary_title} desc={content.tool_glossary_desc} />
      </TabsContent>

      <TabsContent value="resources" className="grid gap-5 sm:grid-cols-2">
        {panels.resources.map((panel) => <PanelCard key={panel.href} {...panel} />)}
      </TabsContent>

      <TabsContent value="platform" className="grid gap-5 sm:grid-cols-2">
        {panels.platform.map((panel) => <PanelCard key={panel.href} {...panel} />)}
      </TabsContent>
    </Tabs>
  )
}
