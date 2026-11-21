import { useState } from 'react'

interface Step {
  formula: string
  name: string
  kind: string
}

interface Series {
  id: string
  tab: string
  /** Что у «ядра» заменяют */
  mode: 'acid' | 'base'
  core: string
  coreNote: string
  unit: 'H' | 'OH'
  count: number
  by: string
  steps: Step[]
}

const SERIES: Series[] = [
  {
    id: 'hcl',
    tab: 'HCl + Na',
    mode: 'acid',
    core: 'Cl⁻',
    coreNote: 'остаток Cl⁻',
    unit: 'H',
    count: 1,
    by: 'Na',
    steps: [
      { formula: 'HCl', name: 'соляная кислота', kind: 'кислота' },
      { formula: 'NaCl', name: 'хлорид натрия', kind: 'средняя соль' },
    ],
  },
  {
    id: 'h2so4',
    tab: 'H₂SO₄ + Na',
    mode: 'acid',
    core: 'SO₄²⁻',
    coreNote: 'остаток SO₄²⁻',
    unit: 'H',
    count: 2,
    by: 'Na',
    steps: [
      { formula: 'H₂SO₄', name: 'серная кислота', kind: 'кислота' },
      { formula: 'NaHSO₄', name: 'гидросульфат натрия', kind: 'кислая соль' },
      { formula: 'Na₂SO₄', name: 'сульфат натрия', kind: 'средняя соль' },
    ],
  },
  {
    id: 'h3po4',
    tab: 'H₃PO₄ + Na',
    mode: 'acid',
    core: 'PO₄³⁻',
    coreNote: 'остаток PO₄³⁻',
    unit: 'H',
    count: 3,
    by: 'Na',
    steps: [
      { formula: 'H₃PO₄', name: 'фосфорная кислота', kind: 'кислота' },
      { formula: 'NaH₂PO₄', name: 'дигидрофосфат натрия', kind: 'кислая соль' },
      { formula: 'Na₂HPO₄', name: 'гидрофосфат натрия', kind: 'кислая соль' },
      { formula: 'Na₃PO₄', name: 'фосфат натрия', kind: 'средняя соль' },
    ],
  },
  {
    id: 'mgoh2',
    tab: 'Mg(OH)₂ + HCl',
    mode: 'base',
    core: 'Mg²⁺',
    coreNote: 'металл Mg²⁺',
    unit: 'OH',
    count: 2,
    by: 'Cl',
    steps: [
      { formula: 'Mg(OH)₂', name: 'гидроксид магния', kind: 'основание' },
      { formula: 'MgOHCl', name: 'гидроксохлорид магния', kind: 'основная соль' },
      { formula: 'MgCl₂', name: 'хлорид магния', kind: 'средняя соль' },
    ],
  },
  {
    id: 'aloh3',
    tab: 'Al(OH)₃ + HCl',
    mode: 'base',
    core: 'Al³⁺',
    coreNote: 'металл Al³⁺',
    unit: 'OH',
    count: 3,
    by: 'Cl',
    steps: [
      { formula: 'Al(OH)₃', name: 'гидроксид алюминия', kind: 'амфотерный гидроксид' },
      { formula: 'Al(OH)₂Cl', name: 'дигидроксохлорид алюминия', kind: 'основная соль' },
      { formula: 'AlOHCl₂', name: 'гидроксохлорид алюминия', kind: 'основная соль' },
      { formula: 'AlCl₃', name: 'хлорид алюминия', kind: 'средняя соль' },
    ],
  },
]

const KIND_NOTE: Record<string, string> = {
  'средняя соль': 'Замещены все H (или все OH): в формуле нет ни H, ни OH.',
  'кислая соль': 'Замещены не все H кислоты: в формуле остался H, название с приставкой «гидро-».',
  'основная соль': 'Замещены не все группы OH: в формуле остался OH, название с приставкой «гидроксо-».',
}

function Chain({ s }: { s: Series }) {
  const [k, setK] = useState(0)
  const step = s.steps[k]
  const acid = s.mode === 'acid'
  const unitBg = (swapped: boolean) =>
    swapped ? (acid ? 'bg-blue text-white' : 'bg-teal text-white') : acid ? 'bg-pink text-white' : 'bg-orange text-navy'
  const unitLabel = (swapped: boolean) => (swapped ? s.by : s.unit)

  return (
    <>
      <div className="mt-4 rounded-xl bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {acid ? (
            <>
              <div className="flex gap-1.5">
                {Array.from({ length: s.count }, (_, j) => (
                  <span
                    key={`${j}-${j < k}`}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-extrabold ${unitBg(j < k)}`}
                    style={{ animation: j < k ? 'pop .4s ease-out both' : undefined }}
                  >
                    {unitLabel(j < k)}
                  </span>
                ))}
              </div>
              <span className="flex h-12 min-w-14 items-center justify-center rounded-xl bg-teal px-3 text-base font-extrabold text-white">{s.core}</span>
            </>
          ) : (
            <>
              <span className="flex h-12 min-w-14 items-center justify-center rounded-xl bg-blue px-3 text-base font-extrabold text-white">{s.core}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: s.count }, (_, j) => (
                  <span
                    key={`${j}-${j < k}`}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-extrabold ${unitBg(j < k)}`}
                    style={{ animation: j < k ? 'pop .4s ease-out both' : undefined }}
                  >
                    {j < k ? s.by : s.unit}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-white/70">
          {acid
            ? `Атомы H кислоты (розовые) по одному замещаются на Na (синие); ${s.coreNote}`
            : `Группы OH основания (оранжевые) по одной замещаются на кислотный остаток Cl (зелёные); ${s.coreNote}`}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setK((v) => Math.min(v + 1, s.count))}
          disabled={k === s.count}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-105 disabled:opacity-40"
        >
          {acid ? 'Заменить ещё один H на Na →' : 'Заменить ещё одну группу OH на Cl →'}
        </button>
        <button
          onClick={() => setK(0)}
          disabled={k === 0}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-40"
        >
          ↺ Сначала
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <div key={k} style={{ animation: 'pop .35s ease-out both' }}>
          <p>
            <b className="text-xl text-white">{step.formula}</b> — {step.name}: <b className="text-orange">{step.kind}</b>
          </p>
          {KIND_NOTE[step.kind] && <p className="mt-1 text-sm text-white/85">{KIND_NOTE[step.kind]}</p>}
        </div>
      </div>
    </>
  )
}

/** Конструктор солей: средние, кислые, основные */
export default function SaltBuilder() {
  const [i, setI] = useState(1)
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите вещество и по шагам замещайте водород кислоты или группы OH основания.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SERIES.map((x, k) => (
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
      <Chain key={SERIES[i].id} s={SERIES[i]} />
    </div>
  )
}
