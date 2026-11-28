import { useState } from 'react'
import { BRIDGE, BRIDGE_REACTIONS, KIND_NAME, PROBLEMS, SOLUTION_EXAMPLE, num, type LinkKind } from '../lib/problems'
import { tex } from './RichText'

const btn = (on: boolean) => `rounded-md px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`
const Tex = ({ s }: { s: string }) => <span dangerouslySetInnerHTML={{ __html: tex(s) }} />
const pop = { animation: 'pop .35s ease-out both' }

const KIND_CLASS: Record<LinkKind, string> = {
  solution: 'bg-blue text-white',
  mass: 'bg-orange text-navy',
  amount: 'bg-teal text-white',
  volume: 'bg-pink text-white',
  fraction: 'bg-purple text-white',
}

/* ───────────── Пошаговое решение задачи ───────────── */

export function ProblemChainDemo({ id }: { id: string }) {
  const p = PROBLEMS.find((x) => x.id === id)!
  const [k, setK] = useState(0)
  const all = p.rows.flatMap((r) => r.links)
  const last = all.length - 1
  const kinds = [...new Set(all.map((l) => l.kind))]
  // номер первого звена каждого ряда в общем списке шагов
  const starts = p.rows.map((_, i) => p.rows.slice(0, i).reduce((s, r) => s + r.links.length, 0))

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Задача: {p.condition}</p>
      <div className="mt-3 overflow-x-auto rounded-xl bg-white/10 p-3 text-center text-[13px] sm:text-lg">
        <Tex s={`\\ce{${p.eq}}`} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
        {kinds.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${KIND_CLASS[kind]}`} />
            {KIND_NAME[kind]}
          </span>
        ))}
      </div>

      {p.rows.map((row, ri) => (
        <div key={ri} className="mt-4">
          {row.label && <div className="mb-2 text-sm font-semibold text-white/80">{row.label}</div>}
          <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-3">
            {row.links.map((link, li) => {
              const j = starts[ri] + li
              const shown = j <= k
              return (
                <div key={li} className="flex flex-col items-center sm:flex-row">
                  {link.how && (
                    <div className={`flex flex-col items-center px-1 text-xs font-bold transition-opacity sm:min-w-16 ${shown ? 'opacity-100' : 'opacity-25'}`}>
                      <span className={link.how === BRIDGE ? 'rounded-full border-2 border-teal px-2 py-0.5 text-white' : 'text-orange'}>{link.how}</span>
                      <span className="text-xl leading-none text-white/70">
                        <span className="hidden sm:inline">→</span>
                        <span className="sm:hidden">↓</span>
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setK(j)}
                    aria-current={j === k ? 'step' : undefined}
                    className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition ${shown ? KIND_CLASS[link.kind] : 'bg-white/10 text-white/50'} ${j === k ? 'ring-4 ring-white' : ''}`}
                    style={j === k ? pop : undefined}
                  >
                    {shown ? link.box : `${link.box.split(' = ')[0]} = ?`}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div key={k} className="mt-4 rounded-xl bg-white/10 p-3 text-[15px]" style={pop} aria-live="polite">
        <span className="text-xs font-bold uppercase tracking-wide text-orange">шаг {k + 1} из {all.length}. </span>
        {all[k].calc}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setK((v) => (v === last ? 0 : v + 1))} className="rounded-md bg-teal px-4 py-1.5 text-sm font-semibold">
          {k === last ? 'Сначала' : 'Следующий шаг →'}
        </button>
        {k > 0 && k < last && (
          <button onClick={() => setK((v) => v - 1)} className={btn(false)}>
            ← Назад
          </button>
        )}
        {k === last && <b className="ml-auto text-orange">Ответ: {p.answer}</b>}
      </div>
    </div>
  )
}

/* ───────────── Мост через количество вещества ───────────── */

const PORTIONS = [0.1, 0.2, 0.5, 1]

export function MoleBridgeDemo() {
  const [r, setR] = useState(0)
  const [known, setKnown] = useState(0)
  const [x, setX] = useState(0.2)
  const reaction = BRIDGE_REACTIONS[r]
  const base = reaction.species[known]
  // сколько «порций уравнения» прореагировало
  const portion = x / base.k

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">
        Выберите вещество, о котором что-то известно, и задайте его количество. Остальные вещества пересчитываются по коэффициентам — только через моли.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {BRIDGE_REACTIONS.map((q, i) => (
          <button
            key={q.tab}
            onClick={() => {
              setR(i)
              setKnown(0)
            }}
            aria-pressed={i === r}
            className={btn(i === r)}
          >
            {q.tab}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl bg-white/10 p-3 text-center text-[13px] sm:text-lg">
        <Tex s={`\\ce{${reaction.eq}}`} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/80">n({base.label}) =</span>
        {PORTIONS.map((v) => (
          <button key={v} onClick={() => setX(v)} aria-pressed={v === x} className={btn(v === x)}>
            {num(v)} моль
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))]">
        {reaction.species.map((s, i) => {
          const n = portion * s.k
          const on = i === known
          return (
            <button
              key={`${r}-${s.f}`}
              onClick={() => setKnown(i)}
              aria-pressed={on}
              aria-label={`Известное вещество: ${s.label}`}
              className={`rounded-xl bg-white/10 p-3 text-center transition hover:bg-white/20 ${on ? 'ring-4 ring-orange' : ''}`}
            >
              <div className="text-lg font-bold">{s.label}</div>
              <div className="text-xs text-white/60">{i < reaction.nLeft ? 'реагент' : 'продукт'} · коэффициент {s.k}</div>
              <div key={`${n}`} className="mt-2 rounded-lg bg-teal px-2 py-1 font-bold" style={pop}>
                n = {num(n, 3)} моль
              </div>
              <div className="my-1 text-xs text-white/70">× M = {num(s.M)} г/моль</div>
              <div className="rounded-lg bg-orange px-2 py-1 font-bold text-navy">m = {num(n * s.M)} г</div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-teal p-3 text-[15px]">
          <b>Моли</b> относятся как коэффициенты:
          <div className="mt-1 font-bold">{reaction.species.map((s) => num(portion * s.k, 3)).join(' : ')}</div>
          <div className="text-white/70">= {reaction.species.map((s) => s.k).join(' : ')} ✓</div>
        </div>
        <div className="rounded-xl border-2 border-orange p-3 text-[15px]">
          <b>Массы</b> так не относятся:
          <div className="mt-1 font-bold">{reaction.species.map((s) => num(portion * s.k * s.M)).join(' : ')}</div>
          <div className="text-white/70">≠ {reaction.species.map((s) => s.k).join(' : ')} ✗</div>
        </div>
      </div>
    </div>
  )
}

/* ───────────── Масса вещества, а не раствора ───────────── */

export function SolutionSubstanceDemo() {
  const [right, setRight] = useState(false)
  const { mSolution, w, M, productM } = SOLUTION_EXAMPLE
  const mSub = mSolution * w
  const used = right ? mSub : mSolution
  const n = used / M

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">
        В колбе {mSolution} г раствора карбоната натрия, ω = {num(w * 100)}%. Какую массу подставить в формулу n = m / M? Попробуйте оба варианта.
      </p>
      <div className="mt-3 flex h-12 overflow-hidden rounded-xl text-sm font-bold">
        <div
          className={`flex items-center justify-center bg-orange text-navy transition ${right ? 'ring-4 ring-inset ring-white' : ''}`}
          style={{ width: `${w * 100}%` }}
          title={`соль ${num(mSub)} г`}
        />
        <div className={`flex flex-1 items-center justify-center bg-blue px-2 text-center ${right ? 'opacity-40' : ''}`}>вода {num(mSolution - mSub)} г</div>
      </div>
      <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs">
        <span className="font-bold text-orange">↑ соль Na₂CO₃: {num(mSub)} г — только она реагирует</span>
        <span className="text-white/60">весь раствор: {mSolution} г</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setRight(false)} aria-pressed={!right} className={btn(!right)}>
          взять массу раствора
        </button>
        <button onClick={() => setRight(true)} aria-pressed={right} className={btn(right)}>
          взять массу вещества
        </button>
      </div>

      <div key={String(right)} className={`mt-3 rounded-xl border-2 p-3 text-[15px] ${right ? 'border-teal bg-teal/15' : 'border-red bg-red/15'}`} style={pop} aria-live="polite">
        <div className="text-lg font-bold">
          {right ? '✓ Верно' : '✗ Ошибка'}: n(Na₂CO₃) = {num(used)} / {M} {right ? '=' : '≈'} {num(n)} моль
        </div>
        <div className="mt-1">
          Тогда осадка CaCO₃ получилось бы {num(n)} · {productM} {right ? '=' : '≈'} <b>{num(Math.round(n * 100) / 100 * productM)} г</b>.
        </div>
        <div className="mt-1 text-white/85">
          {right
            ? 'Сначала m(в-ва) = ω · m(р-ра), и только потом n = m(в-ва) / M.'
            : `Так мы посчитали, будто все ${mSolution} г — это соль, а вода тоже превратилась в осадок. Из ${num(mSub)} г соли столько получиться не может.`}
        </div>
      </div>
    </div>
  )
}
