import { MAX_K1, MAX_K2, detectionOf, modelTable, neededOf, type Contents, type TableScore } from '../../lib/lab'
import { OBSERVATIONS, SOLUTIONS, type ChemId, type Experiment } from '../../lib/labData'
import { tex } from '../RichText'

interface Props {
  experiment: Experiment
  contents: Contents
  plan: ChemId[]
  score: TableScore
  /** самопроверка: верны ли все три уравнения для склянки № 1 и № 2 */
  mine: [boolean, boolean]
  onMine: (v: [boolean, boolean]) => void
}

/** Уравнение по кускам «знак + вещество»: длинное переносится на следующую строку, а не обрезается */
function Equation({ title, eq }: { title: string; eq: string }) {
  const parts = eq.split(/ (\+|->) /)
  const chunks = [['', parts[0]]]
  for (let i = 1; i < parts.length; i += 2) chunks.push([parts[i], parts[i + 1]])
  return (
    <div className="mt-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</div>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[15px] sm:text-lg">
        {chunks.map(([op, term], i) => (
          <span key={i} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
            {op && <span dangerouslySetInnerHTML={{ __html: tex(op === '+' ? '+' : '\\ce{->}') }} />}
            <span dangerouslySetInnerHTML={{ __html: tex(`\\ce{${term}}`) }} />
          </span>
        ))}
      </div>
    </div>
  )
}

const formulas = (ids: ChemId[]) => ids.map((id) => SOLUTIONS[id].formula).join(' и ')
const capital = (s: string) => s[0].toUpperCase() + s.slice(1)

/** Разбор задания: баллы по критериям, выбор реактивов, уравнения и эталонная таблица */
export function Review({ experiment, contents, plan, score, mine, onMine }: Props) {
  const k1 = mine.filter(Boolean).length
  const model = modelTable(experiment, contents)
  const needed = neededOf(experiment)
  const extra = SOLUTIONS[experiment.reagents.find((id) => !needed.includes(id))!]
  const planOk = plan.length === 2 && needed.every((id) => plan.includes(id))
  const marks = [
    ['Опыт 1', score.rows[0].correct],
    ['Опыт 2', score.rows[1].correct],
    ['Вывод', score.conclusionCorrect],
  ] as const

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm" aria-live="polite">
        <h3 className="text-lg font-bold">
          Ваш результат: {k1 + score.k2} из {MAX_K1 + MAX_K2}
        </h3>
        <p className="mt-2">
          <b>
            К2. Таблица: {score.k2} из {MAX_K2}.
          </b>{' '}
          Балл даётся за каждую полностью верную строку.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {marks.map(([name, ok]) => (
            <span key={name} className={`rounded-full px-3 py-1 text-sm font-semibold ${ok ? 'bg-teal/15 text-teal' : 'bg-red/10 text-red'}`}>
              {ok ? '✓' : '✗'} {name}
            </span>
          ))}
        </div>
        <p className="mt-3">
          <b>
            К1. Уравнения: {k1} из {MAX_K1}.
          </b>{' '}
          Сравните свои записи с разбором ниже и отметьте, где всё верно.
        </p>
      </div>

      <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
        <h3 className="text-lg font-bold">Разбор</h3>
        <p className="mt-2 text-white/90">
          <b className={planOk ? 'text-teal' : 'text-pink'}>
            {planOk ? 'Реактивы выбраны верно' : `Вы выбрали ${formulas(plan) || 'не все реактивы'}`}.
          </b>{' '}
          Нужны {formulas(needed)}: каждое вещество даёт признак реакции только с одним из них. {capital(extra.name)}{' '}
          {extra.formula} не даёт видимых изменений ни с одним из выданных веществ, поэтому ничего не определяет.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {([0, 1] as const).map((j) => {
            const s = contents[j]
            const d = detectionOf(experiment, s)
            return (
              <section key={j} className="rounded-xl bg-white/10 p-3">
                <h4 className="font-bold text-orange">
                  Склянка № {j + 1} — {SOLUTIONS[s].formula}, {SOLUTIONS[s].name}
                </h4>
                <p className="mt-1 text-sm text-white/85">{d.why}</p>
                <Equation title="Молекулярное" eq={d.molecular} />
                <Equation title="Полное ионное" eq={d.full} />
                <Equation title="Сокращённое ионное" eq={d.short} />
                <label className="mt-3 flex items-start gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-orange"
                    checked={mine[j]}
                    onChange={(e) => onMine(j === 0 ? [e.target.checked, mine[1]] : [mine[0], e.target.checked])}
                  />
                  У меня все три уравнения для склянки № {j + 1} верны
                </label>
              </section>
            )
          })}
        </div>

        <div className="mt-4 rounded-xl bg-white/10 p-3">
          <h4 className="font-bold">Как заполнить таблицу</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {model.rows.map((row, i) => (
              <li key={i}>
                <b>
                  Опыт {i + 1}, {SOLUTIONS[row.reagent as ChemId].formula}.
                </b>{' '}
                {row.obs.map((o, j) => `Склянка № ${j + 1}: ${o && OBSERVATIONS[o].toLowerCase()}`).join('. ')}.
              </li>
            ))}
            <li>
              <b>Вывод.</b> {contents.map((s, j) => `Склянка № ${j + 1}: ${SOLUTIONS[s].name} (${SOLUTIONS[s].formula})`).join('. ')}.
            </li>
          </ul>
          <p className="mt-2 text-sm text-white/70">Опыты можно записать и в обратном порядке.</p>
        </div>
      </div>
    </div>
  )
}
