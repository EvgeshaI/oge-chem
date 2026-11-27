import { useState } from 'react'
import type { ExamVariant, Task } from '../content/types'
import { checkTask, emptyValue, gradeFromShare, maxScore, type Value } from '../lib/check'
import { recordResult } from '../lib/progress'
import { TaskCard, type Phase } from './tasks/TaskCard'

const btn = 'rounded-xl px-5 py-2.5 font-semibold transition disabled:opacity-40'

/** Тренировка: каждое задание проверяется отдельно, сразу с разбором */
export function PracticeRunner({ tasks }: { tasks: Task[] }) {
  const [values, setValues] = useState<Record<string, Value>>({})
  const [phase, setPhase] = useState<Record<string, Phase>>({})
  /** Сохранённая самооценка развёрнутых ответов: сколько баллов записано */
  const [saved, setSaved] = useState<Record<string, number>>({})

  if (tasks.length === 0) return <Empty text="Тренировочные задания по этой теме скоро появятся." />

  const hasFormulaInputs = tasks.some((t) => t.type === 'cells' || t.type === 'models' || t.type === 'schemes')

  return (
    <div className="space-y-5">
      {hasFormulaInputs && (
        <div className="rounded-xl border-l-4 border-blue bg-blue/10 px-4 py-3 text-[15px]">
          <b>Как вводить ответы.</b> Знаки элементов и формулы пишите <b>латиницей</b> (O, H, Cl, Fe — английскими буквами, а не русскими «О», «Н»). Индексы — цифрами: <code>H2O</code>. Если нужно вписать несколько формул, ставьте между ними запятую — порядок не важен.
        </div>
      )}
      {tasks.map((t, i) => {
        const v = values[t.id] ?? emptyValue(t)
        const ph = phase[t.id] ?? 'answering'
        const check = () => {
          setPhase((p) => ({ ...p, [t.id]: 'checked' }))
          const r = checkTask(t, v)
          if (t.type !== 'open') recordResult(t.id, r.score, r.max)
        }
        const retry = () => {
          setValues((s) => ({ ...s, [t.id]: emptyValue(t) }))
          setPhase((p) => ({ ...p, [t.id]: 'answering' }))
          setSaved((s) => {
            const { [t.id]: _, ...rest } = s
            return rest
          })
        }
        const score = checkTask(t, v).score
        const isSaved = saved[t.id] === score
        return (
          <TaskCard
            key={t.id}
            task={t}
            index={i}
            value={v}
            phase={ph}
            onChange={(nv) => setValues((s) => ({ ...s, [t.id]: nv }))}
            footer={
              ph === 'answering' ? (
                <button onClick={check} className={`${btn} bg-purple text-white hover:bg-purple/90`}>Проверить</button>
              ) : (
                <div className="flex gap-3">
                  {t.type === 'open' &&
                    (isSaved ? (
                      <span className={`${btn} flex items-center gap-2 bg-teal/15 text-teal`} role="status">
                        ✓ Оценка сохранена: {score} из {maxScore(t)}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const r = checkTask(t, v)
                          recordResult(t.id, r.score, r.max)
                          setSaved((s) => ({ ...s, [t.id]: r.score }))
                        }}
                        className={`${btn} bg-teal text-white hover:bg-teal/90`}
                      >
                        Сохранить оценку
                      </button>
                    ))}
                  <button onClick={retry} className={`${btn} bg-navy/10 text-navy hover:bg-navy/15`}>Ещё раз</button>
                </div>
              )
            }
          />
        )
      })}
    </div>
  )
}

/** Выбор варианта ОГЭ и прохождение */
export function ExamSection({ variants }: { variants: ExamVariant[] }) {
  const [vid, setVid] = useState(variants[0]?.id)
  if (variants.length === 0) return <Empty text="Задания в формате ОГЭ по этой теме скоро появятся." />
  const variant = variants.find((v) => v.id === vid) ?? variants[0]
  return (
    <div>
      {variants.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Варианты">
          {variants.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === variant.id}
              onClick={() => setVid(v.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                v.id === variant.id ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-navy/10'
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>
      )}
      <ExamRunner key={variant.id} tasks={variant.tasks} />
    </div>
  )
}

/** Формат ОГЭ: отвечаем на всё, проверка и разбор — после «Завершить» */
export function ExamRunner({ tasks }: { tasks: Task[] }) {
  const [values, setValues] = useState<Record<string, Value>>({})
  const [done, setDone] = useState(false)

  const get = (t: Task) => values[t.id] ?? emptyValue(t)
  const total = tasks.reduce((s, t) => s + maxScore(t), 0)
  const got = tasks.reduce((s, t) => s + checkTask(t, get(t)).score, 0)

  const finish = () => {
    setDone(true)
    for (const t of tasks) {
      if (t.type === 'open') continue
      const r = checkTask(t, get(t))
      recordResult(t.id, r.score, r.max)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const restart = () => {
    setValues({})
    setDone(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-5">
      {!done && (
        <div className="rounded-xl border-l-4 border-blue bg-blue/10 px-4 py-3 text-[15px]">
          <b>Как проходить вариант.</b>
          {tasks.some((t) => t.type === 'single') && ' В заданиях с одним ответом выберите один вариант.'}
          {tasks.some((t) => t.type === 'digits') && ' В заданиях «выберите два высказывания» нажмите на оба верных.'}
          {tasks.some((t) => t.type === 'match') && ' В заданиях на соответствие для каждой буквы выберите цифру из списка.'}
          {tasks.some((t) => t.type === 'order') && ' В заданиях «расположите в порядке» нажимайте на элементы по очереди — цифры сложатся в ответ.'}
          {' Ответы можно менять, пока вы не нажали «Завершить и проверить»; результат и разбор появятся после этого.'}
        </div>
      )}
      {done && (
        <div className="rounded-2xl bg-navy p-6 text-white">
          <div className="text-sm uppercase tracking-wide text-white/60">Результат</div>
          <div className="mt-1 text-4xl font-bold">{got} из {total}</div>
          <div className="mt-1 text-white/80">Оценка по условной шкале: {gradeFromShare(total ? got / total : 0)}</div>
          <button onClick={restart} className={`${btn} mt-4 bg-orange text-navy hover:bg-orange/90`}>Пройти заново</button>
        </div>
      )}
      {tasks.map((t, i) => (
        <TaskCard
          key={t.id}
          task={t}
          index={i}
          value={get(t)}
          phase={done ? 'checked' : 'answering'}
          onChange={(nv) => setValues((s) => ({ ...s, [t.id]: nv }))}
        />
      ))}
      {!done && (
        <button onClick={finish} className={`${btn} bg-purple text-white hover:bg-purple/90`}>
          Завершить и проверить
        </button>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl bg-white p-8 text-center text-muted">{text}</div>
}
