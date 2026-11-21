import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BlockView } from '../components/Blocks'
import { ExamSection, PracticeRunner } from '../components/Runners'
import { scrollToId } from '../components/RichText'
import { topicById } from '../content/catalog'
import { loadTopic } from '../content/loader'
import type { TopicContent } from '../content/types'
import { AccessError, canAccess, setDevAccess, useFullAccess } from '../lib/access'
import { ACCENT } from '../lib/accent'

const TABS = [
  { id: 'theory', label: '📖 Теория' },
  { id: 'practice', label: '✏️ Тренировка' },
  { id: 'exam', label: '📝 Формат ОГЭ' },
] as const
type TabId = (typeof TABS)[number]['id']

type State = { status: 'loading' } | { status: 'locked' } | { status: 'error'; msg: string } | { status: 'ready'; content: TopicContent }

export default function TopicPage() {
  const { id = '' } = useParams()
  const meta = topicById(id)
  const [params, setParams] = useSearchParams()
  const full = useFullAccess()
  const [state, setState] = useState<State>({ status: 'loading' })
  const tabsRef = useRef<HTMLDivElement>(null)

  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'theory') as TabId

  useEffect(() => {
    if (!meta) return
    let cancelled = false
    setState({ status: 'loading' })
    loadTopic(id)
      .then((content) => !cancelled && setState({ status: 'ready', content }))
      .catch((e) => {
        if (cancelled) return
        setState(e instanceof AccessError ? { status: 'locked' } : { status: 'error', msg: String(e.message ?? e) })
      })
    return () => {
      cancelled = true
    }
  }, [id, meta, full])

  // якорь из адресной строки (#metals.series) — после загрузки теории
  useEffect(() => {
    if (state.status !== 'ready' || tab !== 'theory') return
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const t = window.setTimeout(() => scrollToId(hash), 80)
    return () => window.clearTimeout(t)
  }, [state, tab, id])

  const goTab = (next: TabId) => {
    setParams({ tab: next })
    // после смены вкладки показываем её начало (первое задание), а не середину страницы
    requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      tabsRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
    })
  }

  if (!meta)
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        <p className="mb-4 text-lg">Такой темы нет.</p>
        <Link to="/" className="font-semibold text-purple">← К списку тем</Link>
      </div>
    )

  const a = ACCENT[meta.accent]

  return (
    <div>
      <Link to="/" className="text-sm text-muted hover:text-ink">← Все темы</Link>
      <div className="mt-2 flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${a.soft}`}>{meta.emoji}</div>
        <div>
          <h1 className="text-3xl font-extrabold">{meta.title}</h1>
          <p className="text-muted">{meta.subtitle}</p>
        </div>
      </div>

      {!canAccess(meta) || state.status === 'locked' ? (
        <Locked />
      ) : state.status === 'loading' ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white" />
      ) : state.status === 'error' ? (
        <div className="mt-8 rounded-2xl bg-red/10 p-6 text-red">Не удалось загрузить тему: {state.msg}</div>
      ) : (
        <>
          <div ref={tabsRef} role="tablist" className="mt-6 flex scroll-mt-4 gap-2 overflow-x-auto border-b border-navy/10">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => goTab(t.id)}
                className={`whitespace-nowrap border-b-4 px-4 py-2 font-semibold transition ${
                  tab === t.id ? `border-purple text-purple` : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-6">
            {tab === 'theory' && (
              <div className="space-y-8">
                {state.content.lessons.map((l) => (
                  <section key={l.id} id={l.id} className="min-w-0 scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-bold">{l.title}</h2>
                    {l.blocks.map((b, i) => (
                      <BlockView key={i} block={b} />
                    ))}
                  </section>
                ))}
                <button
                  onClick={() => goTab('practice')}
                  className="rounded-xl bg-purple px-5 py-3 font-semibold text-white hover:bg-purple/90"
                >
                  К тренировке →
                </button>
              </div>
            )}
            {tab === 'practice' && <PracticeRunner key={id} tasks={state.content.practice} />}
            {tab === 'exam' && <ExamSection key={id} variants={state.content.exam} />}
          </div>
        </>
      )}
    </div>
  )
}

function Locked() {
  return (
    <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="text-5xl">🔒</div>
      <h2 className="mt-3 text-2xl font-bold">Эта тема в полном курсе</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Первые две темы бесплатны. Полный курс — все темы, тренировка и варианты в формате ОГЭ.
      </p>
      <button disabled className="mt-5 rounded-xl bg-orange px-6 py-3 font-bold text-navy opacity-60">
        Купить курс — 5 000 ₽ (скоро)
      </button>
      {import.meta.env.DEV && (
        <div>
          <button onClick={() => setDevAccess(true)} className="mt-4 text-sm text-purple underline">
            dev: открыть без оплаты
          </button>
        </div>
      )}
    </div>
  )
}
