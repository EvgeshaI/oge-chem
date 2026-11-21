import { motion } from 'framer-motion'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { RankBar } from '../components/quest/Hub'
import { catalog } from '../content/catalog'
import { CASES } from '../content/quest'
import { ACCENT } from '../lib/accent'
import { topicSolved, useProgress } from '../lib/progress'
import { useQuest } from '../lib/quest'
import { MAX_HEARTS, totalXp } from '../lib/questLogic'

/** Итоговая игра стоит в списке после пяти тем, на которых она основана */
const QUEST_AFTER = 'bonds'

export default function Home() {
  const progress = useProgress()
  const quest = useQuest()
  const doneCases = CASES.filter((c) => (quest.cases[c.id] ?? 0) > 0).length
  const stars = CASES.reduce((n, c) => n + (quest.cases[c.id] ?? 0), 0)
  return (
    <div>
      <section className="rounded-3xl bg-navy p-8 text-white sm:p-12">
        <h1 className="text-3xl font-extrabold sm:text-5xl">Химия для ОГЭ</h1>
        <p className="mt-3 max-w-xl text-lg text-white/80">
          Наглядная теория с анимациями, тренировка по каждой теме и задания в формате экзамена — с разбором ошибок.
        </p>
      </section>

      <h2 className="mb-4 mt-10 text-2xl font-bold">Темы</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {catalog.map((t, i) => {
          const a = ACCENT[t.accent]
          const solved = topicSolved(progress, t.id)
          const pct = t.totalTasks ? Math.round((solved / t.totalTasks) * 100) : 0
          return (
            <Fragment key={t.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link
                  to={`/topic/${t.id}`}
                  className="block rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${a.soft}`}>{t.emoji}</div>
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{t.title}</h3>
                  <p className="mt-1 text-muted">{t.subtitle}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper" aria-label={`Решено ${pct}%`}>
                    <div className={`h-full ${a.bg} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    Решено {solved} из {t.totalTasks} · задания КИМ: {t.kim.join(', ')}
                  </div>
                </Link>
              </motion.div>

              {t.id === QUEST_AFTER && (
                <motion.div
                  className="sm:col-span-2"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i + 1) * 0.06 }}
                >
                  <Link
                    to="/quest"
                    className="block rounded-3xl bg-gradient-to-r from-purple to-pink p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="max-w-md">
                        <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Итоговая игра</div>
                        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">🕵️ Химическое расследование</h2>
                        <p className="mt-1 text-white/90">
                          Раскрывайте дела, собирайте звёзды и достижения. В конце — разбор, что повторить.
                        </p>
                      </div>
                      <div className="w-full max-w-xs sm:w-72">
                        <RankBar xp={totalXp(quest)} />
                        <div className="mt-2 text-sm text-white/85">
                          Дел: {doneCases} из {CASES.length} · ⭐ {stars} из {CASES.length * MAX_HEARTS}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
