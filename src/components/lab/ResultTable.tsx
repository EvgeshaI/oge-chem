import type { Flask, LabTableValue, TableScore } from '../../lib/lab'
import { OBSERVATIONS, SOLUTIONS, type ChemId, type Experiment, type ObsId } from '../../lib/labData'
import { Select, type SelectOption } from '../Select'

interface Props {
  experiment: Experiment
  value: LabTableValue
  onChange: (v: LabTableValue) => void
  /** результат проверки: поля блокируются и подсвечиваются */
  score: TableScore | null
}

const EMPTY: SelectOption = { value: '', label: 'выберите…' }
const OBS_OPTIONS = [EMPTY, ...Object.entries(OBSERVATIONS).map(([value, label]) => ({ value, label }))]
const chemOptions = (ids: ChemId[]) => [EMPTY, ...ids.map((id) => ({ value: id, label: SOLUTIONS[id].formula }))]

function Field({ ok, label, ...props }: { ok: boolean | undefined; label: string; value: string; onChange: (v: string) => void; options: SelectOption[] }) {
  const color = ok === undefined ? 'border-navy/30' : ok ? 'border-teal bg-teal/10' : 'border-red bg-red/10'
  return (
    <span className="inline-flex items-center gap-1.5">
      <Select {...props} aria-label={label} disabled={ok !== undefined} className={`rounded-lg border-2 bg-white px-2.5 py-1.5 text-sm ${color}`} />
      {ok !== undefined && (
        <span className={`font-bold ${ok ? 'text-teal' : 'text-red'}`} aria-label={ok ? 'верно' : 'неверно'} role="img">
          {ok ? '✓' : '✗'}
        </span>
      )}
    </span>
  )
}

const cell = 'border border-navy/25 p-2 max-md:flex max-md:flex-col max-md:items-start max-md:gap-1 max-md:border-0 max-md:px-3 max-md:py-1.5'
const head = 'border border-navy/25 p-2 font-semibold'
const mobileRow = 'max-md:mb-3 max-md:block max-md:rounded-xl max-md:border max-md:border-navy/25 max-md:py-1.5'
const MobileLabel = ({ text }: { text: string }) => (
  <span className="text-xs font-semibold text-muted md:hidden" aria-hidden>
    {text}
  </span>
)

/** Таблица для записи результатов эксперимента — в форме бланка из демоверсии. На телефоне строки складываются в карточки. */
export function ResultTable({ experiment, value, onChange, score }: Props) {
  const reagentOptions = chemOptions(experiment.reagents)
  const substanceOptions = chemOptions(experiment.substances)
  const setRow = (i: number, patch: Partial<LabTableValue['rows'][number]>) => {
    const rows = [...value.rows] as LabTableValue['rows']
    rows[i] = { ...rows[i], ...patch }
    onChange({ ...value, rows })
  }
  const setObs = (i: number, j: Flask, v: string) => {
    const obs = [...value.rows[i].obs] as [ObsId | '', ObsId | '']
    obs[j] = v as ObsId | ''
    setRow(i, { obs })
  }
  const setConclusion = (j: Flask, v: string) => {
    const conclusion = [...value.conclusion] as LabTableValue['conclusion']
    conclusion[j] = v as ChemId | ''
    onChange({ ...value, conclusion })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center text-sm max-md:block max-md:text-left">
        <caption className="mb-2 font-bold italic max-md:block max-md:text-center">Таблица для записи результатов эксперимента</caption>
        <thead className="max-md:hidden">
          <tr>
            <th rowSpan={2} className={head}>
              № опыта
            </th>
            <th rowSpan={2} className={head}>
              Реактив
              <br />
              <span className="font-normal">(формула или название)</span>
            </th>
            <th colSpan={2} className={head}>
              Наблюдаемые признаки реакции
            </th>
          </tr>
          <tr>
            <th className={head}>
              Вещество
              <br />
              из склянки № 1
            </th>
            <th className={head}>
              Вещество
              <br />
              из склянки № 2
            </th>
          </tr>
        </thead>
        <tbody className="max-md:block">
          {value.rows.map((row, i) => (
            <tr key={i} className={mobileRow}>
              <td className={cell}>
                <span className="max-md:font-bold">
                  <span className="md:hidden">Опыт </span>
                  {i + 1}
                </span>
              </td>
              <td className={cell}>
                <MobileLabel text="Реактив (формула или название)" />
                <Field
                  label={`Опыт ${i + 1}: реактив`}
                  ok={score?.rows[i].reagent}
                  value={row.reagent}
                  onChange={(v) => setRow(i, { reagent: v as ChemId | '' })}
                  options={reagentOptions}
                />
              </td>
              {([0, 1] as const).map((j) => (
                <td key={j} className={cell}>
                  <MobileLabel text={`Признаки: вещество из склянки № ${j + 1}`} />
                  <Field
                    label={`Опыт ${i + 1}: признаки реакции, склянка № ${j + 1}`}
                    ok={score?.rows[i].obs[j]}
                    value={row.obs[j]}
                    onChange={(v) => setObs(i, j, v)}
                    options={OBS_OPTIONS}
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr className={mobileRow}>
            <th colSpan={2} className={`${head} text-right max-md:block max-md:border-0 max-md:px-3 max-md:py-1.5 max-md:text-left`}>
              ВЫВОД:
            </th>
            {([0, 1] as const).map((j) => (
              <td key={j} className={cell}>
                <MobileLabel text={`В склянке № ${j + 1}`} />
                <Field
                  label={`Вывод: вещество в склянке № ${j + 1}`}
                  ok={score?.conclusion[j]}
                  value={value.conclusion[j]}
                  onChange={(v) => setConclusion(j, v)}
                  options={substanceOptions}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
