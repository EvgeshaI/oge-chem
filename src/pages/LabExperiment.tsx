import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bench } from '../components/lab/Bench'
import { ResultTable } from '../components/lab/ResultTable'
import { Review } from '../components/lab/Review'
import {
  INSTRUCTION,
  MAX_K1,
  MAX_K2,
  TASK_ITEMS,
  addReagent,
  conditionOf,
  emptyCells,
  emptyRack,
  emptyTable,
  pourSample,
  randomContents,
  scoreTable,
} from '../lib/lab'
import { EXPERIMENTS, SOLUTIONS, type ChemId, type Experiment } from '../lib/labData'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Одна попытка: план, опыты, таблица, проверка */
function LabRun({ experiment, onRestart }: { experiment: Experiment; onRestart: () => void }) {
  const [contents] = useState(() => randomContents(experiment))
  const [plan, setPlan] = useState<ChemId[]>([])
  const [rack, setRack] = useState(emptyRack)
  const [table, setTable] = useState(emptyTable)
  const [checked, setChecked] = useState(false)
  const [mine, setMine] = useState<[boolean, boolean]>([false, false])
  const left = emptyCells(table)
  const score = checked ? scoreTable(table, experiment, contents) : null
  const next = EXPERIMENTS.find((e) => e.id === experiment.id + 1)

  const toggle = (id: ChemId) => setPlan((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 2 ? [...p, id] : p))

  return (
    <>
      <Step n={1} title="Спланируйте эксперимент">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-semibold">Выберите два реактива, которые нужны, чтобы определить вещества в склянках.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {experiment.reagents.map((id) => {
              const on = plan.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-pressed={on}
                  disabled={checked || (!on && plan.length === 2)}
                  className={`rounded-xl border-2 px-4 py-2 text-left font-semibold transition disabled:opacity-50 ${on ? 'border-purple bg-purple text-white' : 'border-navy/20 enabled:hover:border-purple'}`}
                >
                  {on ? '✓ ' : ''}
                  {SOLUTIONS[id].formula} <span className="font-normal">— {SOLUTIONS[id].name}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            Выбрано {plan.length} из 2{plan.length === 2 && !checked ? '. Чтобы заменить реактив, снимите один из выбранных.' : '.'}
          </p>
          <p className="mt-3 rounded-lg bg-blue/10 px-3 py-2 text-sm text-navy">
            <b>На листе:</b> для склянки № 1 и для склянки № 2 запишите молекулярное, полное и сокращённое ионные уравнения реакции,
            которую планируете провести. После проверки таблицы сравните их с разбором.
          </p>
        </div>
      </Step>

      <Step n={2} title="Проведите опыты">
        <Bench
          experiment={experiment}
          contents={contents}
          plan={plan}
          rack={rack}
          onPour={(f) => setRack((r) => pourSample(r, f))}
          onAdd={(id) => setRack((r) => addReagent(r, id))}
          onSelect={(id) => setRack((r) => ({ ...r, selected: id }))}
          onClear={() => setRack(emptyRack())}
        />
      </Step>

      <Step n={3} title="Заполните таблицу">
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <ResultTable experiment={experiment} value={table} onChange={setTable} score={score} />
          {!checked && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setChecked(true)}
                disabled={left > 0}
                className="rounded-xl bg-navy px-5 py-2.5 font-bold text-white transition enabled:hover:bg-navy/90 disabled:opacity-40"
              >
                Проверить
              </button>
              <span className="text-sm text-muted">{left > 0 ? `Осталось заполнить ячеек: ${left}` : 'После проверки откроется разбор.'}</span>
            </div>
          )}
        </div>
      </Step>

      {score && (
        <Step n={4} title="Проверьте себя">
          <Review experiment={experiment} contents={contents} plan={plan} score={score} mine={mine} onMine={setMine} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onRestart} className="rounded-xl bg-orange px-5 py-2.5 font-bold text-navy transition hover:brightness-110">
              ↺ Пройти заново
            </button>
            <Link
              to={next ? `/lab/${next.id}` : '/lab'}
              className="rounded-xl bg-navy px-5 py-2.5 font-bold text-white transition hover:bg-navy/90"
            >
              {next ? `Эксперимент ${next.id} →` : 'Все эксперименты'}
            </Link>
            <span className="text-sm text-muted">При повторе вещества в склянках распределятся заново.</span>
          </div>
        </Step>
      )}
    </>
  )
}

function ExperimentView({ experiment }: { experiment: Experiment }) {
  const [run, setRun] = useState(0)
  const restart = () => {
    setRun((r) => r + 1)
    window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <Link to="/lab" className="text-sm font-semibold text-muted hover:text-navy">
        ← Все эксперименты
      </Link>
      <section className="mt-3 rounded-3xl bg-gradient-to-r from-teal to-blue p-6 text-white sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-wide text-white/80">🥼 Лаборатория · задание 23</div>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Эксперимент {experiment.id}</h1>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">
          Задание 23 · {experiment.demo ? 'демоверсия ОГЭ 2027' : 'тренировочный вариант по образцу демоверсии'}
        </h2>
        <p className="mt-2 leading-relaxed">{conditionOf(experiment)}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 leading-relaxed">
          {TASK_ITEMS.map((t) => (
            <li key={t} className="marker:font-semibold">
              {t}
            </li>
          ))}
        </ol>
        <details className="mt-3 rounded-xl bg-paper p-3">
          <summary className="font-semibold">Инструкция по проведению эксперимента</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
            {INSTRUCTION.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </details>
        <details className="mt-2 rounded-xl bg-paper p-3">
          <summary className="font-semibold">Критерии оценивания</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            <li>
              <b>К1 (до {MAX_K1} баллов)</b> — молекулярное, полное и сокращённое ионные уравнения: 2 балла, если верны для обоих
              опытов, 1 — только для одного.
            </li>
            <li>
              <b>К2 (до {MAX_K2} баллов)</b> — таблица: по баллу за каждую верную строку (опыт 1, опыт 2, вывод).
            </li>
          </ul>
        </details>
      </section>

      <LabRun key={run} experiment={experiment} onRestart={restart} />
    </div>
  )
}

export default function LabExperimentPage() {
  const { id } = useParams()
  const experiment = EXPERIMENTS.find((e) => String(e.id) === id)
  if (!experiment)
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        Эксперимент не найден.{' '}
        <Link to="/lab" className="font-semibold text-purple underline">
          Все эксперименты
        </Link>
      </div>
    )
  // key: при переходе к следующему эксперименту всё начинается с чистого листа
  return <ExperimentView key={experiment.id} experiment={experiment} />
}
