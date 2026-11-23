import type { ReactNode } from "react"

function safeHref(value: string) {
  const href = value.trim()
  if (href.startsWith("/")) {
    if (href.startsWith("//")) return null
    try {
      return new URL(href, "https://tudap.invalid").origin === "https://tudap.invalid" ? href : null
    } catch {
      return null
    }
  }
  if (href.startsWith("#")) return href

  try {
    const url = new URL(href)
    if (["https:", "http:", "mailto:"].includes(url.protocol)) return href
  } catch {
    return null
  }
  return null
}

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|\*.+?\*)/g).filter(Boolean)

  return tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const href = safeHref(link[2])
      if (!href) return link[1]
      const external = /^https?:\/\//i.test(href)
      return <a key={index} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{link[1]}</a>
    }
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>
    if (token.startsWith("*") && token.endsWith("*")) return <em key={index}>{token.slice(1, -1)}</em>
    return token
  })
}

function isBlockStart(line: string) {
  return /^(#{1,3} |>|- |\d+\. |---$)/.test(line)
}

export function MarkdownContent({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,3}) (.+)$/)
    if (heading) {
      const Heading = `h${heading[1].length}` as "h1" | "h2" | "h3"
      blocks.push(<Heading key={index}>{renderInline(heading[2])}</Heading>)
      index += 1
      continue
    }

    if (line === "---") {
      blocks.push(<hr key={index} />)
      index += 1
      continue
    }

    if (line.startsWith("> ")) {
      const quote: string[] = []
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quote.push(lines[index].trim().slice(2))
        index += 1
      }
      blocks.push(<blockquote key={index}>{quote.map((item, lineIndex) => <p key={lineIndex}>{renderInline(item)}</p>)}</blockquote>)
      continue
    }

    const listMatch = line.match(/^(?:- |\d+\. )/)
    if (listMatch) {
      const ordered = /^\d+\. /.test(line)
      const items: ReactNode[] = []
      while (index < lines.length) {
        const item = lines[index].trim().match(ordered ? /^\d+\. (.+)$/ : /^- (.+)$/)
        if (!item) break
        items.push(<li key={index}>{renderInline(item[1])}</li>)
        index += 1
      }
      blocks.push(ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>)
      continue
    }

    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push(<p key={index}>{paragraph.map((part, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && <br />}{renderInline(part)}</span>)}</p>)
  }

  return <div className={className}>{blocks}</div>
}