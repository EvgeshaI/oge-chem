import katex from 'katex'
import 'katex/contrib/mhchem'
import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'

export function tex(src: string, display = false): string {
  return katex.renderToString(src, { throwOnError: false, displayMode: display, output: 'html' })
}

const TOKEN = /(\$[^$]+\$|\*\*[^*]+\*\*|\[([^\]]+)\]\((#[^)]+|\/[^)\s]+)\))/g

const linkCls = 'font-semibold text-purple underline decoration-purple/40 underline-offset-2 hover:decoration-purple'

/** Плавный скролл к якорю на этой же странице (`#metals.mechs-water` → блок `#metals.mechs`) */
export function scrollToId(id: string) {
  const el =
    document.getElementById(id) ??
    document.getElementById(id.replace(/-(acids|water|salts|nonmetals|oxides)$/, ''))
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
}

/** Текст с **жирным**, формулами $\ce{H2O}$ и ссылками [текст](#якорь) или [текст](/topic/id); `\n` → `<br>` */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => {
    const out: string[] = []
    let last = 0
    for (const m of text.matchAll(TOKEN)) {
      if (m.index! > last) out.push(text.slice(last, m.index))
      out.push(m[0])
      last = m.index! + m[0].length
    }
    if (last < text.length) out.push(text.slice(last))
    return out.filter((p) => p !== '')
  }, [text])

  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 2)
          return (
            <span
              key={i}
              className="inline-block max-w-full overflow-x-auto align-middle [&>.katex]:max-w-none"
              dangerouslySetInnerHTML={{ __html: tex(p.slice(1, -1)) }}
            />
          )
        if (p.startsWith('**') && p.endsWith('**'))
          return (
            <strong key={i} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          )
        const hash = /^\[([^\]]+)\]\((#[^)]+)\)$/.exec(p)
        if (hash) {
          const [, label, href] = hash
          const id = href.slice(1)
          return (
            <a
              key={i}
              href={href}
              className={linkCls}
              onClick={(e) => {
                e.preventDefault()
                history.pushState(null, '', href)
                scrollToId(id)
                window.dispatchEvent(new HashChangeEvent('hashchange'))
              }}
            >
              {label}
            </a>
          )
        }
        const route = /^\[([^\]]+)\]\((\/[^)]+)\)$/.exec(p)
        if (route) {
          const [, label, to] = route
          return (
            <Link key={i} to={to} className={linkCls}>
              {label}
            </Link>
          )
        }
        return (
          <Fragment key={i}>
            {p.split('\n').map((line, j, arr) => (
              <Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        )
      })}
    </span>
  )
}
