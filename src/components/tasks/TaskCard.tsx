import type { ReactNode } from 'react'
import type { Cell, CellInput, Task } from '../../content/types'
import { checkTask, type OpenValue, type Result, type Value } from '../../lib/check'
import { AtomBoron, ParticleModel, SchemeArcs } from '../Figures'
import { RichText, tex } from '../RichText'
import { Select } from '../Select'

const LABELS = ['А', 'Б', 'В', 'Г', 'Д', 'Е']

export type Phase = 'answering' | 'checked'

interface Props {
  task: Task
  index: number
  value: Value
  onChange: (v: Value) => void
  phase: Phase
  /** Показывать пояснение и верный ответ после проверки */
  showExplanation?: boolean
  footer?: ReactNode
}

const FIELD_TYPES = ['fill', 'classify', 'cells', 'models', 'schemes', 'redox']

/** Типовая подсказка «как отвечать» для заданий, у которых нет своей */
function defaultHint(task: Task): string | undefined {
  switch (task.type) {
    case 'fill':
      return task.reuse
        ? 'Для каждого пропуска выберите слово из списка. Слова можно использовать несколько раз.'
        : 'Для каждого пропуска выберите слово из списка. Каждое слово нужно один раз; в списке могут быть лишние слова.'
    case 'classify':
      return 'Для каждого пункта выберите вариант из выпадающего списка.'
    case 'digits':
      return 'Нажмите на верные утверждения — они отметятся. Ответ — цифры в порядке возрастания, без пробелов и запятых.'
    case 'single':
      return 'Выберите один верный ответ.'
    case 'order':
      return 'Нажимайте на элементы по очереди — в том порядке, в котором они должны стоять в ответе. Ответ — цифры без пробелов. Ошиблись — нажмите «Стереть» или «Сбросить».'
    case 'match':
      return 'Для каждой буквы выберите цифру из списка. Ответ — цифры подряд, без пробелов.'
    case 'schemes':
      return 'Числа вводите цифрами, тип элемента выберите из списка.'
    case 'redox':
      return 'Впишите коэффициенты (единицу можно не писать — оставьте поле пустым), выберите окислитель и восстановитель из списка. После верного выбора появятся уравнения электронного баланса — впишите в них число электронов.'
    default:
      return undefined
  }
}

export function TaskCard({ task, index, value, onChange, phase, showExplanation = true, footer }: Props) {
  const checked = phase === 'checked'
  const result = checked ? checkTask(task, value) : null
  const frame = !result
    ? 'ring-transparent'
    : task.type === 'open'
      ? 'ring-blue/40'
      : result.correct
        ? 'ring-teal'
        : 'ring-red'
  const fv = FIELD_TYPES.includes(task.type) ? (value as string[]) : []
  const setField = (i: number, v: string) => {
    const next = [...fv]
    next[i] = v
    onChange(next)
  }
  const fp = { value: fv, set: setField, result }
  const hint = task.hint ?? defaultHint(task)

  return (
    <article className={`rounded-2xl bg-white p-5 shadow-sm ring-2 ${frame}`} aria-label={`Задание ${index + 1}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{index + 1}</span>
        {result && <Badge result={result} open={task.type === 'open'} />}
      </div>
      {hint && (
        <p className="mb-3 rounded-lg bg-blue/10 px-3 py-2 text-sm text-navy">
          <b>Как отвечать:</b> <RichText text={hint} />
        </p>
      )}

      {task.type === 'fill' && <Fill task={task} {...fp} />}
      {task.type === 'classify' && <Classify task={task} {...fp} />}
      {task.type === 'cells' && <Cells task={task} {...fp} />}
      {task.type === 'redox' && <RedoxEq task={task} {...fp} />}
      {task.type === 'models' && <Models task={task} {...fp} />}
      {task.type === 'schemes' && <Schemes task={task} {...fp} />}
      {task.type === 'digits' && <Digits task={task} value={value as string} onChange={onChange} checked={checked} />}
      {task.type === 'single' && <Single task={task} value={value as string} onChange={onChange} checked={checked} />}
      {task.type === 'order' && <Order task={task} value={value as string} onChange={onChange} checked={checked} />}
      {task.type === 'match' && <Match task={task} value={value as string} onChange={onChange} checked={checked} />}
      {task.type === 'open' && <Open task={task} value={value as OpenValue} onChange={onChange} checked={checked} />}

      {checked && showExplanation && (
        <div className="mt-4 rounded-xl bg-paper p-4">
          <div className="mb-1 text-sm font-bold uppercase tracking-wide text-navy">Разбор</div>
          {task.type === 'digits' && (
            <p className="mb-1 font-semibold">
              Ответ: <span className="rounded bg-teal/15 px-2 py-0.5">{task.answer.split('').sort().join('')}</span>
            </p>
          )}
          {task.type === 'single' && (
            <p className="mb-1 font-semibold">
              Ответ: <span className="rounded bg-teal/15 px-2 py-0.5">{task.answer}</span>
            </p>
          )}
          {(task.type === 'match' || task.type === 'order') && (
            <p className="mb-1 font-semibold">
              Ответ: <span className="rounded bg-teal/15 px-2 py-0.5">{task.answer}</span>
            </p>
          )}
          <p className="leading-relaxed whitespace-pre-line">
            <RichText text={task.explanation} />
          </p>
        </div>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </article>
  )
}

function Badge({ result, open }: { result: Result; open: boolean }) {
  if (open) return <span className="rounded-full bg-blue/10 px-3 py-1 text-sm font-semibold text-blue">{result.score} из {result.max}</span>
  return result.correct ? (
    <span className="rounded-full bg-teal/15 px-3 py-1 text-sm font-semibold text-teal">Верно</span>
  ) : (
    <span className="rounded-full bg-red/10 px-3 py-1 text-sm font-semibold text-red">
      {result.max > 1 ? `Верно ${result.score} из ${result.max}` : 'Неверно'}
    </span>
  )
}

/* ---------- Общее поле: список или ввод ---------- */
interface FieldProps {
  value: string
  onChange: (v: string) => void
  result: Result | null
  idx: number
  correct: string
  options?: string[]
  w?: number
  label: string
  placeholder?: string
}
function FieldBox({ value, onChange, result, idx, correct, options, w = 6, label, placeholder }: FieldProps) {
  const ok = result?.gaps?.[idx]
  const color = ok === undefined ? 'border-navy/30' : ok ? 'border-teal bg-teal/10' : 'border-red bg-red/10'
  const common = `rounded-lg border-2 bg-white px-2 py-1 text-base ${color}`
  return (
    <span className="inline-flex flex-col align-middle">
      {options ? (
        <Select
          aria-label={label}
          value={value}
          disabled={result !== null}
          onChange={onChange}
          className={common}
          options={[{ value: '', label: '…' }, ...options.map((o) => ({ value: o, label: o }))]}
        />
      ) : (
        <input
          aria-label={label}
          value={value}
          placeholder={placeholder}
          disabled={result !== null}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: `${Math.max(w, 3) * 0.75 + 1.5}rem` }}
          className={common}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}
      {ok === false && <span className="mt-0.5 text-xs text-teal">верно: {correct}</span>}
    </span>
  )
}

interface FP {
  value: string[]
  set: (i: number, v: string) => void
  result: Result | null
}

/* ---------- Текст с пропусками ---------- */
function Fill({ task, value, set, result }: { task: Extract<Task, { type: 'fill' }> } & FP) {
  const parts = task.text.split(/\{(\d+)\}/)
  const used = new Set(value.filter(Boolean))
  return (
    <div>
      <p className="text-[17px] leading-[2.6]">
        {parts.map((p, i) => {
          if (i % 2 === 0) return <RichText key={i} text={p} />
          const g = Number(p) - 1
          const a = task.answers[g]
          return (
            <span key={i} className="mx-1">
              <FieldBox
                idx={g}
                value={value[g] ?? ''}
                onChange={(v) => set(g, v)}
                result={result}
                correct={Array.isArray(a) ? a[0] : a}
                options={task.bank}
                label={`Пропуск ${g + 1}`}
              />
            </span>
          )
        })}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {task.bank.map((w) => (
          <span
            key={w}
            className={`rounded-full px-3 py-1 text-sm ${!task.reuse && used.has(w) ? 'bg-navy/5 text-muted line-through' : 'bg-purple/10 text-purple'}`}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- Выбор варианта для каждого утверждения ---------- */
function Classify({ task, value, set, result }: { task: Extract<Task, { type: 'classify' }> } & FP) {
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      {task.figure === 'atom-boron' && (
        <div className="mb-4 rounded-xl bg-paper p-3">
          <AtomBoron />
          <p className="mt-1 text-center text-sm text-muted">Атом элемента X. Показаны все частицы атома.</p>
        </div>
      )}
      <ul className="space-y-2">
        {task.items.map((it, i) => (
          <li key={i} className="rounded-xl bg-paper p-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-navy px-1 text-sm font-bold text-white">{i + 1}</span>
              <span className="min-w-0 flex-1"><RichText text={it.text} /></span>
              <FieldBox
                idx={i}
                value={value[i] ?? ''}
                onChange={(v) => set(i, v)}
                result={result}
                correct={it.answer}
                options={task.options}
                label={`Утверждение ${i + 1}`}
              />
            </div>
            {result && it.why && <p className="mt-1 pl-10 text-sm text-muted"><RichText text={it.why} /></p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Таблица с полями ---------- */
function Cells({ task, value, set, result }: { task: Extract<Task, { type: 'cells' }> } & FP) {
  let k = 0
  const field = (c: CellInput) => {
    const i = k++
    return (
      <FieldBox
        key={i}
        idx={i}
        value={value[i] ?? ''}
        onChange={(v) => set(i, v)}
        result={result}
        correct={Array.isArray(c.a) ? c.a[0] : c.a}
        options={c.options}
        w={c.w}
        label={`Поле ${i + 1}`}
      />
    )
  }
  const cell = (c: Cell) => (typeof c === 'string' ? <RichText text={c} /> : field(c))

  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      {task.figure === 'atom-boron' && (
        <div className="mb-4 rounded-xl bg-paper p-3">
          <AtomBoron />
          <p className="mt-1 text-center text-sm text-muted">Атом элемента X. Показаны все частицы атома.</p>
        </div>
      )}
      {task.head ? (
        <div className="overflow-x-auto rounded-xl border border-navy/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-purple text-white">
                {task.head.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-semibold"><RichText text={h} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {task.rows.map((r, i) => (
                <tr key={i} className="border-t border-paper">
                  {r.map((c, j) => (
                    <td key={j} className={`px-3 py-2 align-top ${typeof c === 'string' ? 'bg-purple/5 font-semibold' : ''}`}>{cell(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="space-y-2">
          {task.rows.map((r, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3 text-[17px]">
              {r.map((c, j) => (
                <span key={j}>{cell(c)}</span>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- Часть 2: уравнение ОВР, окислитель/восстановитель, электроны ---------- */
const Tex = ({ s }: { s: string }) => <span className="inline-block align-middle" dangerouslySetInnerHTML={{ __html: tex(s) }} />

function RedoxEq({ task, value, set, result }: { task: Extract<Task, { type: 'redox' }> } & FP) {
  const n = task.ce.length
  const [iOx, iRed, iEr, iEo] = [n, n + 1, n + 2, n + 3]
  const chosenOk = value[iOx] === task.names[task.ox] && value[iRed] === task.names[task.red]
  const showHalf = chosenOk || result !== null
  const fb = (idx: number, correct: string, label: string, opts?: { options?: string[]; w?: number }) => (
    <FieldBox idx={idx} value={value[idx] ?? ''} onChange={(v) => set(idx, v)} result={result} correct={correct} label={label} {...opts} />
  )
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <div className="rounded-xl bg-paper p-3">
        <div className="mb-2 text-sm font-semibold text-muted">Расставьте коэффициенты:</div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-[17px]">
          {task.ce.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {i > 0 && <span className="mx-1 text-muted">{i === task.nLeft ? '→' : '+'}</span>}
              {fb(i, task.coef[i] === 1 ? '1 (можно не писать)' : String(task.coef[i]), `Коэффициент перед ${task.names[i]}`, { w: 2 })}
              <Tex s={`\\ce{${f}}`} />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3">
          <span className="font-semibold">Окислитель:</span>
          {fb(iOx, task.names[task.ox], 'Окислитель', { options: task.names })}
        </label>
        <label className="flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3">
          <span className="font-semibold">Восстановитель:</span>
          {fb(iRed, task.names[task.red], 'Восстановитель', { options: task.names })}
        </label>
      </div>
      {showHalf ? (
        <div className="mt-3 space-y-2 rounded-xl border-2 border-purple/20 p-3">
          <div className="text-sm font-semibold text-muted">Электронный баланс — впишите число электронов:</div>
          <div className="flex flex-wrap items-center gap-2 text-[17px]">
            <span className="w-36 text-sm text-pink">восстановитель отдаёт</span>
            <Tex s={task.halfRed.pre} />
            {fb(iEr, String(task.halfRed.n), 'Число отданных электронов', { w: 2 })}
            <Tex s={task.halfRed.post} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[17px]">
            <span className="w-36 text-sm text-blue">окислитель принимает</span>
            <Tex s={task.halfOx.pre} />
            {fb(iEo, String(task.halfOx.n), 'Число принятых электронов', { w: 2 })}
            <Tex s={task.halfOx.post} />
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-purple/5 px-3 py-2 text-sm text-muted">
          Выберите окислитель и восстановитель — при верном выборе появятся уравнения отдачи и принятия электронов.
        </p>
      )}
    </div>
  )
}

/* ---------- Модели веществ ---------- */
function Models({ task, value, set, result }: { task: Extract<Task, { type: 'models' }> } & FP) {
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <Dot c="#e5484d" t="кислород O" /><Dot c="#2f7fec" t="водород H" /><Dot c="#3a4056" t="углерод C" /><Dot c="#9aa3b8" t="железо Fe" />
      </div>
      <p className="mb-3 text-sm text-muted">
        Если на схеме несколько веществ, впишите все формулы <b>латиницей через запятую</b> (например, <code>H2, CO2</code>) — порядок не важен. Индексы пишите цифрами: H2.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {task.models.map((m, mi) => {
          const b = mi * 4
          return (
            <div key={mi} className="rounded-xl bg-paper p-3">
              <div className="mb-2 font-bold text-blue">{m.label}</div>
              <ParticleModel particles={m.particles} seed={mi + 1} />
              <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 text-sm">
                <span>элементов:</span>
                <FieldBox idx={b} value={value[b] ?? ''} onChange={(v) => set(b, v)} result={result} correct={String(m.elements)} w={3} label={`${m.label} элементов`} />
                <span>веществ:</span>
                <FieldBox idx={b + 1} value={value[b + 1] ?? ''} onChange={(v) => set(b + 1, v)} result={result} correct={String(m.substances)} w={3} label={`${m.label} веществ`} />
                <span>это:</span>
                <FieldBox idx={b + 2} value={value[b + 2] ?? ''} onChange={(v) => set(b + 2, v)} result={result} correct={m.kind} options={task.kinds} label={`${m.label} это`} />
                <span>формулы:</span>
                <FieldBox idx={b + 3} value={value[b + 3] ?? ''} onChange={(v) => set(b + 3, v)} result={result} correct={m.formulas} w={9} label={`${m.label} формулы`} placeholder="через запятую" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
const Dot = ({ c, t }: { c: string; t: string }) => (
  <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full" style={{ background: c }} />{t}</span>
)

/* ---------- Электронные схемы ---------- */
function Schemes({ task, value, set, result }: { task: Extract<Task, { type: 'schemes' }> } & FP) {
  let k = 0
  const f = (correct: string, label: string, opts?: { options?: string[]; w?: number }) => {
    const i = k++
    return <FieldBox idx={i} value={value[i] ?? ''} onChange={(v) => set(i, v)} result={result} correct={correct} label={label} {...opts} />
  }
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <div className="grid gap-4 sm:grid-cols-2">
        {task.schemes.map((s, si) => (
          <div key={si} className="rounded-xl bg-paper p-3">
            <div className="mb-1 font-bold text-blue">{s.label}</div>
            <SchemeArcs layers={s.layers} filled={s.given ? s.shells : undefined} />
            <div className="mt-2 space-y-1.5 text-sm">
              {s.element && <div className="flex items-center gap-2">Элемент (символ): {f(s.element, `${s.label}: элемент`, { w: 4 })}</div>}
              <div className="flex items-center gap-2">Заряд ядра: + {f(String(s.charge), `${s.label}: заряд ядра`, { w: 3 })}</div>
              {!s.given && (
                <div className="flex flex-wrap items-center gap-2">
                  Электронов по слоям:
                  {s.shells.map((_, li) => (
                    <span key={li}>{f(String(s.shells[li]), `${s.label}: слой ${li + 1}`, { w: 2 })}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">Внешних ē: {f(String(s.outer), `${s.label}: внешних электронов`, { w: 3 })}</div>
              <div className="flex items-center gap-2">Тип: {f(s.kind, `${s.label}: тип`, { options: task.kinds })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Выбрать верные утверждения (формат ОГЭ) ---------- */
function Digits({
  task, value, onChange, checked,
}: {
  task: Extract<Task, { type: 'digits' }>
  value: string
  onChange: (v: Value) => void
  checked: boolean
}) {
  const selected = new Set(value.split(''))
  const right = new Set(task.answer.split(''))
  const toggle = (n: string) => {
    const s = new Set(selected)
    if (s.has(n)) s.delete(n)
    else s.add(n)
    onChange([...s].sort().join(''))
  }
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <ol className="space-y-2">
        {task.options.map((o, i) => {
          const n = String(i + 1)
          const on = selected.has(n)
          let cls = on ? 'border-purple bg-purple/10' : 'border-navy/15 hover:border-purple/50'
          if (checked) cls = right.has(n) ? 'border-teal bg-teal/10' : on ? 'border-red bg-red/10' : 'border-navy/10 opacity-70'
          return (
            <li key={n}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                disabled={checked}
                onClick={() => toggle(n)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">{n}</span>
                <span><RichText text={o} /></span>
              </button>
            </li>
          )
        })}
      </ol>
      <AnswerCells value={value} len={task.answer.length} />
    </div>
  )
}

/* ---------- Один верный ответ (формат ОГЭ) ---------- */
function Single({
  task, value, onChange, checked,
}: {
  task: Extract<Task, { type: 'single' }>
  value: string
  onChange: (v: Value) => void
  checked: boolean
}) {
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <ol className="space-y-2" role="radiogroup">
        {task.options.map((o, i) => {
          const n = String(i + 1)
          const on = value === n
          const right = task.answer === i + 1
          let cls = on ? 'border-purple bg-purple/10' : 'border-navy/15 hover:border-purple/50'
          if (checked) cls = right ? 'border-teal bg-teal/10' : on ? 'border-red bg-red/10' : 'border-navy/10 opacity-70'
          return (
            <li key={n}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                disabled={checked}
                onClick={() => onChange(n)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{n}</span>
                <span><RichText text={o} /></span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------- Расставить по порядку (формат ОГЭ, задание 3) ---------- */
function Order({
  task, value, onChange, checked,
}: {
  task: Extract<Task, { type: 'order' }>
  value: string
  onChange: (v: Value) => void
  checked: boolean
}) {
  const n = task.options.length
  const add = (d: string) => {
    if (checked || value.includes(d) || value.length >= n) return
    onChange(value + d)
  }
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <ol className="grid gap-2 sm:grid-cols-3">
        {task.options.map((o, i) => {
          const d = String(i + 1)
          const pos = value.indexOf(d)
          const used = pos >= 0
          let cls = used ? 'border-purple bg-purple/10' : 'border-navy/15 hover:border-purple/50'
          if (checked) cls = 'border-navy/10'
          return (
            <li key={d}>
              <button
                type="button"
                disabled={checked || used}
                onClick={() => add(d)}
                aria-label={`${d}) ${o}${used ? `, на месте ${pos + 1}` : ''}`}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">{d}</span>
                <span className="flex-1"><RichText text={o} /></span>
                {used && <span className="rounded-full bg-purple px-2 py-0.5 text-xs font-bold text-white">{pos + 1}-е место</span>}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        Ответ:
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-md border-2 text-lg font-bold text-ink ${checked ? (value[i] === task.answer[i] ? 'border-teal bg-teal/10' : 'border-red bg-red/10') : 'border-navy/30'}`}>
            {value[i] ?? ''}
          </span>
        ))}
        {!checked && (
          <>
            <button type="button" onClick={() => onChange(value.slice(0, -1))} disabled={!value} className="ml-2 rounded-lg bg-navy/10 px-3 py-1.5 font-semibold text-navy hover:bg-navy/15 disabled:opacity-40">Стереть</button>
            <button type="button" onClick={() => onChange('')} disabled={!value} className="rounded-lg bg-navy/10 px-3 py-1.5 font-semibold text-navy hover:bg-navy/15 disabled:opacity-40">Сбросить</button>
          </>
        )}
      </div>
    </div>
  )
}

function AnswerCells({ value, len }: { value: string; len: number }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-muted">
      Ответ:
      {Array.from({ length: len }, (_, i) => (
        <span key={i} className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-navy/30 text-lg font-bold text-ink">
          {value[i] ?? ''}
        </span>
      ))}
    </div>
  )
}

/* ---------- Соответствие А–Б–В (формат ОГЭ) ---------- */
function Match({
  task, value, onChange, checked,
}: {
  task: Extract<Task, { type: 'match' }>
  value: string
  onChange: (v: Value) => void
  checked: boolean
}) {
  const set = (row: number, v: string) => {
    const arr = task.rows.map((_, i) => value[i] ?? ' ')
    arr[row] = v || ' '
    onChange(arr.join(''))
  }
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ul className="space-y-2">
          {task.rows.map((r, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-paper p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple text-sm font-bold text-white">{LABELS[i]}</span>
              <span className="flex-1"><RichText text={r} /></span>
              <Select
                aria-label={`Соответствие для ${LABELS[i]}`}
                disabled={checked}
                value={(value[i] ?? ' ').trim()}
                onChange={(v) => set(i, v)}
                className={`rounded-lg border-2 bg-white px-2 py-1 ${
                  checked ? ((value[i] ?? '') === task.answer[i] ? 'border-teal bg-teal/10' : 'border-red bg-red/10') : 'border-navy/30'
                }`}
                options={[{ value: '', label: '–' }, ...task.choices.map((_, k) => ({ value: String(k + 1), label: String(k + 1) }))]}
              />
            </li>
          ))}
        </ul>
        <ol className="space-y-2">
          {task.choices.map((c, k) => (
            <li key={k} className="flex gap-3 rounded-xl border-2 border-navy/10 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">{k + 1}</span>
              <RichText text={c} />
            </li>
          ))}
        </ol>
      </div>
      <AnswerCells value={value.replace(/ /g, '')} len={task.rows.length} />
    </div>
  )
}

/* ---------- Развёрнутый ответ с самооценкой ---------- */
function Open({
  task, value, onChange, checked,
}: {
  task: Extract<Task, { type: 'open' }>
  value: OpenValue
  onChange: (v: Value) => void
  checked: boolean
}) {
  return (
    <div>
      <p className="mb-3 text-[17px] font-medium"><RichText text={task.question} /></p>
      <textarea
        value={value.text}
        disabled={checked}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        rows={4}
        placeholder="Запишите решение…"
        className="w-full rounded-xl border-2 border-navy/20 p-3 focus:border-purple focus:outline-none"
      />
      {checked && (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-teal/10 p-3">
            <div className="mb-1 text-sm font-bold uppercase tracking-wide text-teal">Эталон</div>
            <RichText text={task.solution} />
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold">Отметьте, что у вас выполнено:</div>
            {task.criteria.map((c, i) => (
              <label key={i} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={value.ticked[i]}
                  onChange={(e) => {
                    const t = [...value.ticked]
                    t[i] = e.target.checked
                    onChange({ ...value, ticked: t })
                  }}
                  className="h-5 w-5 accent-teal"
                />
                <span>{c.text} <span className="text-muted">({c.points} б.)</span></span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
