import { motion } from 'framer-motion'
import { useState } from 'react'
import { CASES, NUANCES, TOPIC_TITLES } from '../../content/quest'
import { recordQuestCase, recordQuestStep, useQuest } from '../../lib/quest'
import { ACHIEVEMENTS, MAX_HEARTS, achievementsOf, rankOf, starsFor, stepXp, totalXp } from '../../lib/questLogic'
import { RichText } from '../RichText'
import { Stars } from './Hub'
import { Safe } from './Safe'

type Phase = 'intro' | 'step' | 'result'
type Status = 'asking' | 'solved' | 'failed'

interface Props {
  index: number
  onExit: () => void
  onRestart: () => void
  onPlay: (index: number) => void
  onReport: () => void
}

export function Play({ index, onExit, onRestart, onPlay, onReport }: Props) {
  const c = CASES[index]
  const quest = useQuest()
  // снимок «до дела» — чтобы показать, что именно заработано в этом прохождении
  const [before] = useState(() => ({ ach: new Set(achievementsOf(quest)), xp: totalXp(quest) }))

  const [phase, setPhase] = useState<Phase>('intro')
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [tries, setTries] = useState(0)
  const [status, setStatus] = useState<Status>('asking')
  const [picked, setPicked] = useState('')
  const [crossed, setCrossed] = useState<number[]>([])
  const [shake, setShake] = useState(0)
  const [found, setFound] = useState<string[]>([])
  const [errors, setErrors] = useState(0)
  const [tip, setTip] = useState<string | null>(null)

  const step = c.steps[i]
  const need = step.kind === 'digits' ? String(step.answer).length : 1
  const nuance = NUANCES[step.nuance]
  const codes = c.steps.map((s) => s.code)
  const hasSafe = codes.every((d): d is string => !!d)

  const submit = (value: string) => {
    if (status !== 'asking') return
    if (value === String(step.answer)) {
      recordQuestStep(step.id, tries, true)
      setPicked(value)
      setStatus('solved')
      setTip(null)
      setFound((f) => [...f, step.found])
      return
    }
    const t = tries + 1
    const h = hearts - 1
    setTries(t)
    setHearts(h)
    setErrors((e) => e + 1)
    setShake((k) => k + 1)
    if (step.kind === 'single') setCrossed((x) => [...x, Number(value)])
    setPicked('')
    setTip(nuance.tip)
    if (h <= 0) {
      recordQuestStep(step.id, t, false)
      setStatus('failed')
    }
  }

  const toggle = (n: string) => {
    if (status !== 'asking') return
    setPicked((p) => {
      const s = new Set(p.split('').filter(Boolean))
      if (s.has(n)) s.delete(n)
      else s.add(n)
      return [...s].sort().join('')
    })
  }

  const next = () => {
    if (i + 1 < c.steps.length) {
      setI(i + 1)
      setStatus('asking')
      setPicked('')
      setCrossed([])
      setTries(0)
      setTip(null)
    } else {
      recordQuestCase(c.id, starsFor(hearts))
      setPhase('result')
    }
  }

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button onClick={onExit} className="text-sm text-muted hover:text-ink">
        ← К карте дел
      </button>
      <div className="flex items-center gap-4">
        {quest.streak >= 2 && (
          <span className="rounded-full bg-orange/20 px-3 py-1 text-sm font-semibold text-[#b8740a]" title="Улик подряд с первой попытки">
            🔥 {quest.streak}
          </span>
        )}
        <span
          key={shake}
          className="text-2xl"
          style={shake ? { display: 'inline-block', animation: 'shake 0.4s' } : undefined}
          role="img"
          aria-label={`Сердец осталось: ${hearts} из ${MAX_HEARTS}`}
        >
          {Array.from({ length: MAX_HEARTS }, (_, k) => (k < hearts ? '❤️' : '🤍')).join(' ')}
        </span>
      </div>
    </div>
  )

  if (phase === 'intro')
    return (
      <div className="space-y-6">
        {header}
        <section className="rounded-3xl bg-navy p-8 text-center text-white">
          <div className="text-6xl">{c.emoji}</div>
          <div className="mt-3 text-sm font-semibold uppercase tracking-wide text-orange">
            {index === CASES.length - 1 ? 'Финал' : `Дело ${index + 1}`}
          </div>
          <h1 className="mt-1 text-3xl font-extrabold">{c.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{c.intro}</p>
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-white/10 p-3 text-sm text-white/80">
            У вас {MAX_HEARTS} сердца. Каждая ошибка забирает одно. Сердца остались — получите звёзды: сколько осталось, столько и звёзд.
            Закончились — дело придётся начать заново.
          </p>
          <button
            onClick={() => setPhase('step')}
            className="mt-6 rounded-xl bg-orange px-7 py-3 text-lg font-bold text-navy transition hover:bg-orange/90"
          >
            Приступить к делу →
          </button>
        </section>
      </div>
    )

  if (phase === 'result') {
    const stars = starsFor(hearts)
    const xp = totalXp(quest)
    const gained = xp - before.xp
    const fresh = achievementsOf(quest).filter((a) => !before.ach.has(a))
    const nextIdx = index + 1 < CASES.length ? index + 1 : null
    const last = nextIdx === null
    const rank = rankOf(xp)
    const rankUp = rank.index > rankOf(before.xp).index
    return (
      <div className="space-y-6">
        <section className="rounded-3xl bg-navy p-8 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-wide text-orange">Дело закрыто</div>
          <h1 className="mt-1 text-3xl font-extrabold">
            {c.emoji} {c.title}
          </h1>
          <div className="mt-4 flex justify-center gap-2 text-5xl">
            {Array.from({ length: MAX_HEARTS }, (_, k) => (
              <motion.span
                key={k}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 + k * 0.25, type: 'spring', stiffness: 260, damping: 14 }}
                className={k < stars ? '' : 'opacity-25 grayscale'}
              >
                ⭐
              </motion.span>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-xl text-white/85">{c.outro}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1.5">✨ +{Math.max(0, gained)} оч. опыта</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              {errors === 0 ? '✅ без ошибок' : `❌ ошибок: ${errors}`}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              {rank.rank.emoji} {rank.rank.title}
            </span>
          </div>
          {rankUp && <p className="mt-3 font-semibold text-orange">Повышение! Теперь вы — {rank.rank.title}.</p>}
        </section>

        {fresh.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-bold">Новые достижения</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {fresh.map((id) => {
                const a = ACHIEVEMENTS.find((x) => x.id === id)!
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-2 ring-orange/50"
                    style={{ animation: 'pop 0.4s' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange/20 text-2xl">{a.emoji}</div>
                    <div>
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-sm text-muted">{a.how}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          {nextIdx !== null && (
            <button
              onClick={() => onPlay(nextIdx)}
              className="rounded-xl bg-purple px-6 py-3 font-semibold text-white hover:bg-purple/90"
            >
              Следующее дело →
            </button>
          )}
          {last && (
            <button onClick={onReport} className="rounded-xl bg-teal px-6 py-3 font-semibold text-white hover:bg-teal/90">
              Итоги расследования →
            </button>
          )}
          {stars < MAX_HEARTS && (
            <button onClick={onRestart} className="rounded-xl bg-navy/10 px-6 py-3 font-semibold text-navy hover:bg-navy/15">
              Пройти без ошибок
            </button>
          )}
          <button onClick={onExit} className="rounded-xl bg-navy/10 px-6 py-3 font-semibold text-navy hover:bg-navy/15">
            К карте дел
          </button>
        </div>
      </div>
    )
  }

  const solved = status === 'solved'
  const failed = status === 'failed'
  const right = String(step.answer)
  const earned = stepXp(tries, true)

  return (
    <div className="space-y-5">
      {header}

      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-muted">
          <span>
            {c.emoji} {c.title} · улика {i + 1} из {c.steps.length}
          </span>
          <span className="rounded-full bg-purple/10 px-2.5 py-0.5 font-medium text-purple">{TOPIC_TITLES[step.topic]}</span>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {c.steps.map((s, k) => (
            <div
              key={s.id}
              className={`h-2 flex-1 rounded-full ${k < i || (k === i && solved) ? 'bg-teal' : k === i ? 'bg-purple' : 'bg-navy/10'}`}
            />
          ))}
        </div>
      </div>

      {hasSafe && (
        <div className="flex justify-center md:hidden">
          <Safe code={codes as string[]} solved={found.length} wiggle={shake} className="w-36" />
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <article className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="rounded-xl border-l-4 border-purple bg-purple/5 px-4 py-3 text-[15px] leading-relaxed">
            <div className="mb-0.5 text-xs font-bold uppercase tracking-wide text-purple">Из материалов дела</div>
            <RichText text={step.story} />
          </div>

          <p className="text-lg font-semibold">
            <RichText text={step.question} />
          </p>
          {step.kind === 'digits' && !solved && !failed && (
            <p className="text-sm text-muted">Отметьте {need === 2 ? 'два варианта' : `${need} вариант(а)`}, затем нажмите «Проверить».</p>
          )}

          <ol className="space-y-2" role={step.kind === 'single' ? 'radiogroup' : 'group'}>
            {step.options.map((o, k) => {
              const n = k + 1
              const key = String(n)
              const isRight = step.kind === 'digits' ? right.includes(key) : right === key
              const on = picked.includes(key)
              const out = crossed.includes(n)
              let cls = 'border-navy/15 hover:border-purple/50'
              if (solved || failed) cls = isRight ? 'border-teal bg-teal/10' : 'border-navy/10 opacity-60'
              else if (out) cls = 'border-red/40 bg-red/5 opacity-70'
              else if (on) cls = 'border-purple bg-purple/10'
              return (
                <li key={key}>
                  <button
                    type="button"
                    role={step.kind === 'single' ? 'radio' : 'checkbox'}
                    aria-checked={on}
                    disabled={solved || failed || out}
                    onClick={() => (step.kind === 'single' ? submit(key) : toggle(key))}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition ${cls}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center text-sm font-bold text-white ${
                        step.kind === 'single' ? 'rounded-full' : 'rounded-md'
                      } ${out ? 'bg-red/60' : 'bg-navy'}`}
                    >
                      {out ? '✕' : n}
                    </span>
                    <span className={out ? 'line-through decoration-red/60' : ''}>
                      <RichText text={o} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {step.kind === 'digits' && !solved && !failed && (
            <button
              disabled={picked.length !== need}
              onClick={() => submit(picked)}
              className="rounded-xl bg-purple px-5 py-2.5 font-semibold text-white transition hover:bg-purple/90 disabled:opacity-40"
            >
              Проверить
            </button>
          )}

          {tip && !solved && !failed && (
            <div role="alert" className="rounded-xl border-l-4 border-red bg-red/5 px-4 py-3 text-[15px]">
              <b>Не совсем — минус одно сердце.</b> Подсказка: <RichText text={tip} />
            </div>
          )}

          {(solved || failed) && (
            <div className={`rounded-xl p-4 ${solved ? 'bg-teal/10' : 'bg-red/5'}`}>
              <div className="mb-1 font-bold">
                {solved ? (
                  <span className="text-teal">
                    ✔ Улика раскрыта!{' '}
                    <span className="font-semibold text-muted">
                      +{earned} оч.{tries > 0 ? ' (с ошибками — полный опыт даёт первая попытка)' : ''}
                    </span>
                  </span>
                ) : (
                  <span className="text-red">Сердца закончились — улика осталась нераскрытой</span>
                )}
              </div>
              <p className="leading-relaxed">
                <RichText text={step.explanation} />
              </p>
              {solved && tries > 0 && (
                <p className="mt-2 text-sm text-muted">
                  На заметку: <RichText text={nuance.tip} />
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                {solved && (
                  <button
                    onClick={next}
                    className="rounded-xl bg-purple px-5 py-2.5 font-semibold text-white hover:bg-purple/90"
                  >
                    {i + 1 < c.steps.length ? 'Дальше →' : 'Закрыть дело ✔'}
                  </button>
                )}
                {failed && (
                  <>
                    <button onClick={onRestart} className="rounded-xl bg-purple px-5 py-2.5 font-semibold text-white hover:bg-purple/90">
                      Начать дело заново
                    </button>
                    <button onClick={onExit} className="rounded-xl bg-navy/10 px-5 py-2.5 font-semibold text-navy hover:bg-navy/15">
                      К карте дел
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </article>

        <aside className="h-fit rounded-2xl bg-navy p-4 text-white">
          {hasSafe && (
            <div className="mb-4 hidden md:block">
              <div className="mb-2 text-sm font-bold uppercase tracking-wide text-orange">🔐 Сейф</div>
              <Safe code={codes as string[]} solved={found.length} wiggle={shake} className="mx-auto w-full max-w-[220px]" />
            </div>
          )}
          <div className="mb-2 text-sm font-bold uppercase tracking-wide text-orange">🗒 Блокнот детектива</div>
          {found.length === 0 ? (
            <p className="text-sm text-white/60">Пока пусто. Раскройте первую улику — и она появится здесь.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {found.map((f, k) => (
                <li key={k} className="rounded-lg bg-white/10 px-3 py-2" style={{ animation: 'pop 0.3s' }}>
                  <RichText text={f} />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60">
            <span>Звёзд за дело сейчас</span>
            <Stars n={hearts} size="text-base" />
          </div>
        </aside>
      </div>
    </div>
  )
}
