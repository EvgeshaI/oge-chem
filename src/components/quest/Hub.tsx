import { motion } from 'framer-motion'
import { CASES, TOPIC_TITLES } from '../../content/quest'
import {
  ACHIEVEMENTS,
  MAX_HEARTS,
  RANKS,
  achievementsOf,
  caseUnlocked,
  rankOf,
  totalXp,
  type QuestState,
} from '../../lib/questLogic'

export function Stars({ n, size = 'text-xl' }: { n: number; size?: string }) {
  return (
    <span className={`${size} tracking-wide`} aria-label={`Звёзд: ${n} из ${MAX_HEARTS}`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <span key={i} className={i < n ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  )
}

export function RankBar({ xp, dark = true }: { xp: number; dark?: boolean }) {
  const r = rankOf(xp)
  // одна общая шкала от «Стажёра» до «Главного детектива»; ранги отмечены на ней метками
  const top = RANKS[RANKS.length - 1].from
  const pct = Math.min(1, xp / top) * 100
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">
          {r.rank.emoji} {r.rank.title}
        </span>
        <span className={dark ? 'text-white/70' : 'text-muted'}>
          {r.next ? `до «${r.next.title}» — ${r.left} оч.` : 'высший ранг!'}
        </span>
      </div>
      <div className={`relative mt-1.5 h-3 rounded-full ${dark ? 'bg-white/15' : 'bg-navy/10'}`}>
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <motion.div
            className="h-full rounded-full bg-orange"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        {RANKS.slice(1, -1).map((rk) => (
          <span
            key={rk.title}
            aria-hidden
            className={`absolute top-0 h-full w-0.5 ${dark ? 'bg-white/50' : 'bg-white'}`}
            style={{ left: `${(rk.from / top) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-6" aria-hidden>
        {RANKS.map((rk, i) => (
          <span
            key={rk.title}
            title={`${rk.title} — от ${rk.from} оч.`}
            className={`absolute text-lg leading-6 ${xp >= rk.from ? '' : 'opacity-40 grayscale'}`}
            style={{
              left: `${(rk.from / top) * 100}%`,
              transform: `translateX(${i === 0 ? '0' : i === RANKS.length - 1 ? '-100%' : '-50%'})`,
            }}
          >
            {rk.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}

interface Props {
  state: QuestState
  onPlay: (index: number) => void
  onReport: () => void
}

export function Hub({ state, onPlay, onReport }: Props) {
  const xp = totalXp(state)
  const got = new Set(achievementsOf(state))
  const solved = CASES.flatMap((c) => c.steps).filter((s) => state.steps[s.id]?.solved).length
  const totalSteps = CASES.reduce((n, c) => n + c.steps.length, 0)
  const doneCases = CASES.filter((c) => (state.cases[c.id] ?? 0) > 0).length
  const stars = CASES.reduce((n, c) => n + (state.cases[c.id] ?? 0), 0)
  const started = Object.keys(state.steps).length > 0

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-navy p-6 text-white sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-wide text-orange">Итоговая игра</div>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">🕵️ Химическое расследование</h1>
        <p className="mt-2 max-w-xl text-white/80">
          Раскройте 5 дел: каждая улика — вопрос из пройденных тем. Чем меньше ошибок, тем больше звёзд и опыта. В конце вы узнаете,
          на что обратить внимание.
        </p>
        <div className="mt-5 max-w-md">
          <RankBar xp={xp} />
        </div>
        <dl className="mt-5 flex flex-wrap gap-2 text-sm">
          {[
            ['🔎', `Улик раскрыто: ${solved} из ${totalSteps}`],
            ['🗂️', `Дел закрыто: ${doneCases} из ${CASES.length}`],
            ['⭐', `Звёзд: ${stars} из ${CASES.length * MAX_HEARTS}`],
            ['🔥', `Лучшая серия: ${state.bestStreak}`],
          ].map(([e, t]) => (
            <div key={t} className="rounded-full bg-white/10 px-3 py-1.5">
              {e} {t}
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Дела</h2>
        <ol className="space-y-3">
          {CASES.map((c, i) => {
            const open = caseUnlocked(state, CASES, i)
            const best = state.cases[c.id] ?? 0
            const topics = [...new Set(c.steps.map((s) => TOPIC_TITLES[s.topic]))]
            const boss = i === CASES.length - 1
            return (
              <li key={c.id}>
                <div
                  className={`flex flex-wrap items-center gap-4 rounded-2xl p-4 shadow-sm ring-2 sm:flex-nowrap sm:p-5 ${
                    open ? (boss ? 'bg-orange/15 ring-orange/40' : 'bg-white ring-transparent') : 'bg-white/60 ring-transparent'
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${open ? 'bg-purple/10' : 'bg-navy/5 grayscale'}`}
                  >
                    {open ? c.emoji : '🔒'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {boss ? 'Финал' : `Дело ${i + 1}`}
                    </div>
                    <h3 className={`text-lg font-bold ${open ? '' : 'text-muted'}`}>{c.title}</h3>
                    <div className="mt-1 text-sm text-muted">
                      {open ? topics.join(' · ') : `Откроется после дела «${CASES[i - 1].title}»`}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
                    {best > 0 ? <Stars n={best} /> : <span className="text-sm text-muted">{open ? 'новое дело' : ''}</span>}
                    <button
                      disabled={!open}
                      onClick={() => onPlay(i)}
                      className="rounded-xl bg-purple px-5 py-2 font-semibold text-white transition hover:bg-purple/90 disabled:bg-navy/15 disabled:text-muted"
                    >
                      {best > 0 ? 'Ещё раз' : 'Начать'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">
            Достижения <span className="text-base font-medium text-muted">{got.size} из {ACHIEVEMENTS.length}</span>
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const on = got.has(a.id)
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-2xl p-3 shadow-sm ${on ? 'bg-white' : 'bg-white/60'}`}>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${on ? 'bg-orange/20' : 'bg-navy/5 grayscale'}`}
                >
                  {on ? a.emoji : '🔒'}
                </div>
                <div className="min-w-0">
                  <div className={`font-semibold ${on ? '' : 'text-muted'}`}>{a.title}</div>
                  <div className="text-sm text-muted">{a.how}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">📋 Итоги расследования</h2>
        <p className="mt-1 text-muted">
          Сколько улик раскрыто с первой попытки по каждой теме и какие нюансы стоит повторить.
        </p>
        <button
          disabled={!started}
          onClick={onReport}
          className="mt-3 rounded-xl bg-teal px-5 py-2.5 font-semibold text-white transition hover:bg-teal/90 disabled:bg-navy/15 disabled:text-muted"
        >
          {started ? 'Посмотреть итоги' : 'Появятся после первого дела'}
        </button>
      </section>
    </div>
  )
}
