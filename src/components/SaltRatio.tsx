import { useState } from 'react'
import { RATIO_SERIES, type RatioSeries } from '../lib/oxides'
import { tex } from './RichText'

const NOTE: Record<string, (s: RatioSeries) => string> = {
  'кислая соль': (s) => `Щёлочи ${s.second} не хватает, чтобы заменить все атомы H: часть водорода осталась в соли. Название — с приставкой «гидро-».`,
  'основная соль': (s) => `Кислоты ${s.second} не хватает, чтобы заменить все группы OH: одна осталась в соли. Название — с приставкой «гидроксо-».`,
  'средняя соль': (s) => (s.mode === 'acid' ? 'Щёлочи хватило на все атомы H — получилась средняя соль.' : 'Кислоты хватило на все группы OH — получилась средняя соль.'),
}

function Ratio({ s }: { s: RatioSeries }) {
  const [k, setK] = useState(0)
  const step = s.steps[k]
  const count = s.steps.length
  const acid = s.mode === 'acid'
  const chip = (j: number) => {
    const swapped = j < step.n
    const cls = swapped ? (acid ? 'bg-blue text-white' : 'bg-teal text-white') : acid ? 'bg-pink text-white' : 'bg-orange text-navy'
    return (
      <span
        key={`${j}-${swapped}`}
        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold sm:h-12 sm:w-12 sm:text-base ${cls}`}
        style={{ animation: swapped ? 'pop .4s ease-out both' : undefined }}
      >
        {swapped ? s.by : s.unit}
      </span>
    )
  }
  const units = <div className="flex gap-1.5">{Array.from({ length: count }, (_, j) => chip(j))}</div>
  const core = <span className={`flex h-11 min-w-12 items-center justify-center rounded-xl px-3 text-sm font-extrabold text-white sm:h-12 sm:text-base ${acid ? 'bg-teal' : 'bg-blue'}`}>{s.core}</span>

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-white/75">
          На 1 моль {s.first} взяли {s.second}:
        </span>
        {s.steps.map((x, j) => (
          <button
            key={x.n}
            onClick={() => setK(j)}
            aria-pressed={j === k}
            className={`rounded-md px-3 py-1.5 font-semibold transition ${j === k ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.n} моль
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {acid ? (
            <>
              {units}
              {core}
            </>
          ) : (
            <>
              {core}
              {units}
            </>
          )}
          <span className="mx-1 text-lg text-white/60">+</span>
          <div className="flex gap-1">
            {Array.from({ length: step.n }, (_, j) => (
              <span
                key={`${k}-${j}`}
                className="flex h-9 items-center rounded-full bg-[#9fd3ff] px-2.5 text-xs font-bold text-navy"
                style={{ animation: `pop .4s ease-out ${0.1 * j}s both` }}
              >
                H₂O
              </span>
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-white/70">
          {acid
            ? `Каждая молекула ${s.second} заменяет один атом H кислоты (розовый) на Na (синий) — и даёт одну молекулу воды.`
            : `Каждая молекула ${s.second} заменяет одну группу OH (оранжевую) на Cl (зелёный) — и даёт одну молекулу воды.`}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <div key={`${s.id}-${k}`} style={{ animation: 'pop .35s ease-out both' }}>
          <div className="overflow-x-auto text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${step.eq}}`) }} />
          <p className="mt-1">
            <b className="text-white">{step.salt}</b> — {step.name}: <b className="text-orange">{step.kind}</b>
          </p>
          <p className="mt-1 text-sm text-white/85">{NOTE[step.kind](s)}</p>
        </div>
      </div>
    </>
  )
}

/** Какая соль получится: зависит от того, сколько взяли щёлочи (или кислоты) */
export default function SaltRatio() {
  const [i, setI] = useState(0)
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите реакцию и количество второго вещества — посмотрите, какая соль получится.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {RATIO_SERIES.map((x, k) => (
          <button
            key={x.id}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.tab}
          </button>
        ))}
      </div>
      <Ratio key={RATIO_SERIES[i].id} s={RATIO_SERIES[i]} />
    </div>
  )
}
