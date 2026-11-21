import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CASES, NUANCES, TOPIC_TITLES } from '../../content/quest'
import { catalog } from '../../content/catalog'
import { topicSolved, useProgress } from '../../lib/progress'
import { achievementsOf, topicStats, totalXp, weakNuances, type QuestState } from '../../lib/questLogic'
import { RichText } from '../RichText'
import { RankBar } from './Hub'

interface Props {
  state: QuestState
  onBack: () => void
  onReset: () => void
  onPlay: (index: number) => void
}

const tone = (p: number) => (p >= 0.8 ? 'bg-teal' : p >= 0.5 ? 'bg-orange' : 'bg-red')

export function Report({ state, onBack, onReset, onPlay }: Props) {
  const progress = useProgress()
  const stats = topicStats(state)
  const weak = weakNuances(state)
  const xp = totalXp(state)
  const attempted = stats.reduce((n, s) => n + s.attempted, 0)
  const total = stats.reduce((n, s) => n + s.total, 0)
  const clean = stats.reduce((n, s) => n + s.clean, 0)
  const share = attempted ? clean / attempted : 0
  const all = attempted === total
  const ach = achievementsOf(state).length
  const verdict =
    share >= 0.85
      ? 'Отличная подготовка: почти всё получается с первой попытки.'
      : share >= 0.6
        ? 'Хорошая база, но есть темы, которые стоит подтянуть.'
        : 'Стоит вернуться к теории и потренироваться — ошибки помогут понять, что именно повторить.'
  // сначала предлагаем дело с самым важным нюансом
  const firstWeakCase = weak.length ? CASES.findIndex((c) => c.steps.some((s) => s.nuance === weak[0].nuance)) : -1
  const weakTopics = stats.filter((s) => s.attempted > 0 && s.clean < s.attempted)
  const strong = stats.filter((s) => s.attempted > 0 && s.clean === s.attempted)

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="text-sm text-muted hover:text-ink">
        ← К карте дел
      </button>

      <section className="rounded-3xl bg-navy p-6 text-white sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-wide text-orange">Итоги расследования</div>
        <h1 className="mt-1 text-3xl font-extrabold">📋 Отчёт детектива</h1>
        <p className="mt-2 max-w-xl text-white/85">{verdict}</p>
        <div className="mt-5 grid max-w-xl gap-4 sm:grid-cols-2">
          <div>
            <div className="text-4xl font-extrabold">
              {clean} <span className="text-xl font-semibold text-white/60">из {attempted}</span>
            </div>
            <div className="text-sm text-white/70">улик раскрыто с первой попытки</div>
          </div>
          <RankBar xp={xp} />
        </div>
        <div className="mt-4 text-sm text-white/70">
          Достижений: {ach} · опыта: {xp}
          {!all && ` · пройдено улик: ${attempted} из ${total} — итоги станут точнее после всех дел`}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-bold">Как вы знаете темы</h2>
        <p className="mb-4 text-muted">Доля улик по теме, раскрытых с первой попытки.</p>
        <ul className="space-y-3">
          {stats.map((s) => {
            const p = s.attempted ? s.clean / s.total : 0
            return (
              <li key={s.topic} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{TOPIC_TITLES[s.topic]}</span>
                  <span className="text-sm text-muted">
                    {s.attempted === 0 ? 'не пройдено' : `${s.clean} из ${s.total}`}
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-navy/10" aria-hidden>
                  <motion.div
                    className={`h-full rounded-full ${tone(p)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(p * 100)}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-bold">На что обратить внимание</h2>
        {weak.length === 0 ? (
          <div className="rounded-2xl bg-teal/10 p-5">
            <p className="font-semibold text-teal">
              {attempted === 0 ? 'Пока нечего разбирать — пройдите хотя бы одно дело.' : 'Ошибок в пройденных делах не осталось — отлично!'}
            </p>
            {attempted > 0 && (
              <p className="mt-1">
                Чтобы закрепить, решите варианты в формате ОГЭ по каждой теме: там формулировки ближе к экзамену.
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-muted">
              Нюансы, на которых были ошибки в последнем прохождении. Сначала — самые важные.
            </p>
            <ol className="space-y-3">
              {weak.map((w) => {
                const n = NUANCES[w.nuance]
                return (
                  <li key={w.nuance} className="rounded-2xl bg-white p-4 shadow-sm ring-2 ring-red/20">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-bold">
                        <RichText text={n.title} />
                      </h3>
                      <span className="rounded-full bg-purple/10 px-2.5 py-0.5 text-sm font-medium text-purple">
                        {TOPIC_TITLES[n.topic]}
                      </span>
                    </div>
                    {w.failed && <div className="mt-1 text-sm font-semibold text-red">Улика осталась нераскрытой</div>}
                    <p className="mt-2 leading-relaxed">
                      <RichText text={n.tip} />
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-muted">Повторить: «{n.lesson}»</span>
                      <Link
                        to={`/topic/${n.topic}?tab=theory`}
                        className="rounded-lg bg-purple/10 px-3 py-1.5 font-semibold text-purple hover:bg-purple/20"
                      >
                        Открыть теорию
                      </Link>
                      <Link
                        to={`/topic/${n.topic}?tab=practice`}
                        className="rounded-lg bg-navy/10 px-3 py-1.5 font-semibold text-navy hover:bg-navy/15"
                      >
                        К тренировке
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </section>

      {(weakTopics.length > 0 || strong.length > 0) && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-bold">Коротко</h2>
          <ul className="space-y-2 leading-relaxed">
            {strong.length > 0 && (
              <li>
                💪 <b>Уверенно:</b> {strong.map((s) => TOPIC_TITLES[s.topic]).join(', ')}.
              </li>
            )}
            {weakTopics.length > 0 && (
              <li>
                🎯 <b>Подтянуть в первую очередь:</b>{' '}
                {[...weakTopics].sort((a, b) => a.clean / a.attempted - b.clean / b.attempted).map((s) => TOPIC_TITLES[s.topic]).join(', ')}.
              </li>
            )}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">Что дальше</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {weak.length > 0 && firstWeakCase >= 0 && (
            <button
              onClick={() => onPlay(firstWeakCase)}
              className="rounded-2xl bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="font-bold">🔧 Исправить ошибки</div>
              <div className="text-sm text-muted">
                Пройти заново дело «{CASES[firstWeakCase].title}» — улучшенный результат даст достижение «Работа над ошибками».
              </div>
            </button>
          )}
          {(weakTopics.length > 0 ? weakTopics : stats.filter((s) => s.attempted > 0)).map((s) => {
              const meta = catalog.find((m) => m.id === s.topic)
              if (!meta) return null
              return (
                <Link
                  key={s.topic}
                  to={`/topic/${s.topic}?tab=exam`}
                  className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="font-bold">
                    {meta.emoji} Вариант ОГЭ: {TOPIC_TITLES[s.topic]}
                  </div>
                  <div className="text-sm text-muted">Решено заданий в теме: {topicSolved(progress, s.topic)} из {meta.totalTasks}</div>
                </Link>
              )
            })}
        </div>
      </section>

      <div className="border-t border-navy/10 pt-4">
        <button
          onClick={() => {
            if (window.confirm('Сбросить весь прогресс расследования — звёзды, опыт и достижения?')) onReset()
          }}
          className="text-sm text-muted underline hover:text-ink"
        >
          Начать расследование с нуля
        </button>
      </div>
    </div>
  )
}
