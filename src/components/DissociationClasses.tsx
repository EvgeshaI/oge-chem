import { useState } from 'react'
import { tex } from './RichText'

const BLUE = '#2f7fec'
const RED = '#e5484d'

/* ----------------------------------------- кислоты, основания, соли */

interface Ion {
  label: string
  n: number
  charge: number
}
interface Case {
  name: string
  kind: 'кислота' | 'щёлочь' | 'соль'
  ce: string
  cations: Ion[]
  anions: Ion[]
}

const CASES: Case[] = [
  { name: 'HCl', kind: 'кислота', ce: 'HCl -> H+ + Cl-', cations: [{ label: 'H⁺', n: 1, charge: 1 }], anions: [{ label: 'Cl⁻', n: 1, charge: -1 }] },
  { name: 'H₂SO₄', kind: 'кислота', ce: 'H2SO4 -> 2H+ + SO4^2-', cations: [{ label: 'H⁺', n: 2, charge: 1 }], anions: [{ label: 'SO₄²⁻', n: 1, charge: -2 }] },
  { name: 'NaOH', kind: 'щёлочь', ce: 'NaOH -> Na+ + OH-', cations: [{ label: 'Na⁺', n: 1, charge: 1 }], anions: [{ label: 'OH⁻', n: 1, charge: -1 }] },
  { name: 'Ba(OH)₂', kind: 'щёлочь', ce: 'Ba(OH)2 -> Ba^2+ + 2OH-', cations: [{ label: 'Ba²⁺', n: 1, charge: 2 }], anions: [{ label: 'OH⁻', n: 2, charge: -1 }] },
  { name: 'Na₂SO₄', kind: 'соль', ce: 'Na2SO4 -> 2Na+ + SO4^2-', cations: [{ label: 'Na⁺', n: 2, charge: 1 }], anions: [{ label: 'SO₄²⁻', n: 1, charge: -2 }] },
  { name: 'Ca(NO₃)₂', kind: 'соль', ce: 'Ca(NO3)2 -> Ca^2+ + 2NO3-', cations: [{ label: 'Ca²⁺', n: 1, charge: 2 }], anions: [{ label: 'NO₃⁻', n: 2, charge: -1 }] },
  { name: 'Al₂(SO₄)₃', kind: 'соль', ce: 'Al2(SO4)3 -> 2Al^3+ + 3SO4^2-', cations: [{ label: 'Al³⁺', n: 2, charge: 3 }], anions: [{ label: 'SO₄²⁻', n: 3, charge: -2 }] },
  { name: 'NH₄Cl', kind: 'соль', ce: 'NH4Cl -> NH4+ + Cl-', cations: [{ label: 'NH₄⁺', n: 1, charge: 1 }], anions: [{ label: 'Cl⁻', n: 1, charge: -1 }] },
]

/**
 * Формула по частям: b — катион (бледно-синий), r — анион (красноватый),
 * k — индекс, показывающий число ионов (чёрный). Индекс внутри иона (SO₄) — часть иона, поэтому красный.
 */
type Seg = 'b' | 'r' | 'k'
const SEG_COLOR: Record<Seg, string> = { b: '#5b97ea', r: '#e0605f', k: '#1b2445' }
const SEGS: Record<string, [string, Seg][]> = {
  HCl: [['H', 'b'], ['Cl', 'r']],
  'H₂SO₄': [['H', 'b'], ['₂', 'k'], ['SO₄', 'r']],
  NaOH: [['Na', 'b'], ['OH', 'r']],
  'Ba(OH)₂': [['Ba', 'b'], ['(OH)', 'r'], ['₂', 'k']],
  'Na₂SO₄': [['Na', 'b'], ['₂', 'k'], ['SO₄', 'r']],
  'Ca(NO₃)₂': [['Ca', 'b'], ['(NO₃)', 'r'], ['₂', 'k']],
  'Al₂(SO₄)₃': [['Al', 'b'], ['₂', 'k'], ['(SO₄)', 'r'], ['₃', 'k']],
  'NH₄Cl': [['NH₄', 'b'], ['Cl', 'r']],
}

const KIND_COLOR = { кислота: '#e6559b', щёлочь: '#2f7fec', соль: '#16a58c' } as const

const expand = (ions: Ion[]) => ions.flatMap((i) => Array.from({ length: i.n }, () => i))

function slot(k: number, total: number, side: -1 | 1): [number, number] {
  const rows = Math.ceil(total / 3)
  const col = k % 3
  const row = Math.floor(k / 3)
  const x = 320 + side * (110 + col * 56)
  const y = 110 + (row - (rows - 1) / 2) * 56
  return [x, y]
}

export function ClassesDemo() {
  const [i, setI] = useState(0)
  const [done, setDone] = useState(false)
  const c = CASES[i]
  const cat = expand(c.cations)
  const an = expand(c.anions)
  const plus = c.cations.reduce((s, x) => s + x.n * x.charge, 0)
  const minus = -c.anions.reduce((s, x) => s + x.n * x.charge, 0)

  const segs = SEGS[c.name]

  const ions = [
    ...cat.map((x, k) => ({ ...x, pos: slot(k, cat.length, -1), pos0: [320, 110] as [number, number], plus: true })),
    ...an.map((x, k) => ({ ...x, pos: slot(k, an.length, 1), pos0: [320, 110] as [number, number], plus: false })),
  ]

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите вещество и растворите его в воде. Следите, на какие ионы оно распадается.</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CASES.map((x, k) => (
          <button
            key={x.name}
            onClick={() => {
              setI(k)
              setDone(false)
            }}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 640 230" className="mt-3 w-full" role="img" aria-label={`Диссоциация ${c.name}`}>
        <rect x={20} y={10} width={600} height={210} rx={20} fill="rgba(140,190,255,.1)" />
        <g style={{ opacity: done ? 0 : 1, transition: 'opacity .4s' }}>
          <rect x={210} y={80} width={220} height={60} rx={14} fill="#fff" />
          <text x={320} y={118} textAnchor="middle" fontSize={28} fontWeight={800}>
            {segs.map(([t, k], i) => (
              <tspan key={i} fill={SEG_COLOR[k]}>{t}</tspan>
            ))}
          </text>
        </g>
        {done && (
          <>
            <text x={170} y={36} textAnchor="middle" fontSize={14} fontWeight={700} fill="#7fb3ff">катионы</text>
            <text x={470} y={36} textAnchor="middle" fontSize={14} fontWeight={700} fill="#ff8a8e">анионы</text>
          </>
        )}
        {ions.map((x, k) => {
          const [px, py] = done ? x.pos : x.pos0
          return (
            <g key={`${c.name}-${k}`} style={{ transform: `translate(${px}px, ${py}px) scale(${done ? 1 : 0.2})`, opacity: done ? 1 : 0, transition: `transform .9s ease-out ${k * 60}ms, opacity .4s ease ${k * 60}ms` }}>
              <circle r={25} fill={x.plus ? BLUE : RED} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} />
              <text y={5} textAnchor="middle" fontSize={x.label.length > 3 ? 13 : 15} fontWeight={800} fill="#fff">{x.label}</text>
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => setDone((v) => !v)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
          {done ? '↺ Заново' : 'Растворить в воде'}
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        <div className="text-sm">
          <b style={{ color: KIND_COLOR[c.kind] === '#2f7fec' ? '#7fb3ff' : KIND_COLOR[c.kind] }}>{c.kind[0].toUpperCase() + c.kind.slice(1)}</b>
          <span className="text-white/70"> {c.kind === 'кислота' ? '— в качестве катионов образуются ионы водорода H⁺, анионы — ионы кислотного остатка' : c.kind === 'щёлочь' ? '— в качестве анионов образуются гидроксид-ионы OH⁻, катионы — ионы металла' : '— катионы: ионы металла (или NH₄⁺), анионы: ионы кислотного остатка'}</span>
        </div>
        {done ? (
          <>
            <div className="mt-2 text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${c.ce}}`) }} />
            <div className="mt-1 text-sm text-white/85">
              Проверка зарядов: катионы <b className="text-[#7fb3ff]">+{plus}</b>, анионы <b className="text-[#ff8a8e]">−{minus}</b>. Раствор в целом нейтрален.
            </div>
          </>
        ) : (
          <div className="mt-2 text-sm text-white/70">Нажмите «Растворить в воде».</div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------ ступенчатая диссоциация */

interface Step {
  from: string
  to: string
  ce: string
  hint: string
}
interface Acid {
  name: string
  steps: Step[]
}

const ACIDS: Acid[] = [
  {
    name: 'H₃PO₄',
    steps: [
      { from: 'H₃PO₄', to: 'H₂PO₄⁻', ce: 'H3PO4 <=> H+ + H2PO4-', hint: 'идёт легче всего' },
      { from: 'H₂PO₄⁻', to: 'HPO₄²⁻', ce: 'H2PO4- <=> H+ + HPO4^2-', hint: 'идёт заметно слабее' },
      { from: 'HPO₄²⁻', to: 'PO₄³⁻', ce: 'HPO4^2- <=> H+ + PO4^3-', hint: 'идёт совсем слабо' },
    ],
  },
  {
    name: 'H₂CO₃',
    steps: [
      { from: 'H₂CO₃', to: 'HCO₃⁻', ce: 'H2CO3 <=> H+ + HCO3-', hint: 'идёт легче' },
      { from: 'HCO₃⁻', to: 'CO₃²⁻', ce: 'HCO3- <=> H+ + CO3^2-', hint: 'идёт гораздо слабее' },
    ],
  },
  {
    name: 'H₂S',
    steps: [
      { from: 'H₂S', to: 'HS⁻', ce: 'H2S <=> H+ + HS-', hint: 'идёт легче' },
      { from: 'HS⁻', to: 'S²⁻', ce: 'HS- <=> H+ + S^2-', hint: 'идёт гораздо слабее' },
    ],
  },
]
const BARS = [92, 22, 5]

export function StepwiseDemo() {
  const [a, setA] = useState(0)
  const [n, setN] = useState(0)
  const acid = ACIDS[a]
  const cur = n === 0 ? acid.name : acid.steps[n - 1].to
  const full = n === acid.steps.length

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Многоосновная кислота отдаёт ионы H⁺ не все сразу, а по одному — по ступеням. Нажимайте «Следующая ступень».</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ACIDS.map((x, k) => (
          <button
            key={x.name}
            onClick={() => {
              setA(k)
              setN(0)
            }}
            aria-pressed={k === a}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === a ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3" key={`${acid.name}-${n}`}>
        <div className="rounded-xl bg-white px-5 py-3 text-2xl font-extrabold text-navy" style={{ animation: 'pop .4s ease-out both' }}>{cur}</div>
        {n > 0 && <span className="text-xl text-white/60">+</span>}
        {Array.from({ length: n }, (_, k) => (
          <div key={k} className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold" style={{ background: BLUE, animation: 'pop .4s ease-out both' }}>
            H⁺
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        {acid.steps.map((s, k) => {
          const shown = k < n
          return (
            <div key={k} className={`rounded-xl p-3 transition ${shown ? 'bg-white/15' : 'bg-white/5 opacity-50'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold">{k + 1}-я ступень</div>
                {shown && <div className="text-xs text-white/70">{s.hint}</div>}
              </div>
              {shown ? (
                <>
                  <div className="overflow-x-auto text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${s.ce}}`) }} />
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-pink" style={{ width: `${BARS[k]}%`, transition: 'width .6s ease' }} />
                  </div>
                </>
              ) : (
                <div className="text-sm text-white/60">ещё не рассмотрена</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setN((v) => Math.min(v + 1, acid.steps.length))}
          disabled={full}
          className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110 disabled:opacity-40"
        >
          Следующая ступень →
        </button>
        <button onClick={() => setN(0)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">↺ Заново</button>
      </div>
      {full && (
        <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-white/90" aria-live="polite">
          Каждая следующая ступень идёт слабее предыдущей: отрывать H⁺ от иона с зарядом «−» труднее, чем от нейтральной молекулы. Поэтому в растворе больше всего ионов первой ступени.
        </div>
      )}
    </div>
  )
}
