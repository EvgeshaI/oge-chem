import { useState } from 'react'

interface Item {
  f: string
  kind: 'основный' | 'кислотный'
  hydroxide: string
  /** Р — растворим, М — малорастворим, Н — нерастворим */
  sol: 'Р' | 'М' | 'Н'
  eq: string
  note?: string
}

const ITEMS: Item[] = [
  { f: 'Na₂O', kind: 'основный', hydroxide: 'NaOH', sol: 'Р', eq: 'Na₂O + H₂O → 2NaOH' },
  { f: 'BaO', kind: 'основный', hydroxide: 'Ba(OH)₂', sol: 'Р', eq: 'BaO + H₂O → Ba(OH)₂' },
  { f: 'CaO', kind: 'основный', hydroxide: 'Ca(OH)₂', sol: 'М', eq: 'CaO + H₂O → Ca(OH)₂', note: 'Ca(OH)₂ малорастворим, но это щёлочь — CaO с водой реагирует (гашение извести).' },
  { f: 'CuO', kind: 'основный', hydroxide: 'Cu(OH)₂', sol: 'Н', eq: '' },
  { f: 'MgO', kind: 'основный', hydroxide: 'Mg(OH)₂', sol: 'Н', eq: '' },
  { f: 'SO₃', kind: 'кислотный', hydroxide: 'H₂SO₄', sol: 'Р', eq: 'SO₃ + H₂O → H₂SO₄' },
  { f: 'P₂O₅', kind: 'кислотный', hydroxide: 'H₃PO₄', sol: 'Р', eq: 'P₂O₅ + 3H₂O → 2H₃PO₄' },
  { f: 'CO₂', kind: 'кислотный', hydroxide: 'H₂CO₃', sol: 'Р', eq: 'CO₂ + H₂O ⇄ H₂CO₃', note: 'H₂CO₃ — слабая нестойкая кислота, реакция обратимая.' },
  { f: 'SiO₂', kind: 'кислотный', hydroxide: 'H₂SiO₃', sol: 'Н', eq: '' },
]

const SOL_TEXT = { Р: 'растворим (Р)', М: 'малорастворим (М)', Н: 'нерастворим (Н)' }

function Test({ item }: { item: Item }) {
  const [stage, setStage] = useState(0)
  const dissolves = item.sol !== 'Н'
  const water = stage >= 3

  const labels = ['1. Найти соответствующий гидроксид', '2. Посмотреть в таблице растворимости', '3. Добавить воду']

  return (
    <>
      <div className="mt-4 grid gap-3 rounded-xl bg-white/5 p-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex justify-center">
          <svg viewBox="0 0 160 150" className="w-40" role="img" aria-label={`Стакан с оксидом ${item.f}`}>
            <defs>
              <clipPath id="oxsol-beaker">
                <path d="M40 20 L46 128 a8 8 0 0 0 8 8 H106 a8 8 0 0 0 8 -8 L120 20 Z" />
              </clipPath>
            </defs>
            <g clipPath="url(#oxsol-beaker)">
              <rect
                x={30}
                y={50}
                width={100}
                height={100}
                fill={dissolves ? '#a7f3d0' : '#9fd8ff'}
                style={{ opacity: water ? 0.8 : 0, transition: 'opacity .7s' }}
              />
              <ellipse
                cx={80}
                cy={126}
                rx={26}
                ry={9}
                fill="#e2e8f0"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center bottom',
                  transform: water && dissolves ? 'scale(0.05)' : 'scale(1)',
                  opacity: water && dissolves ? 0 : 1,
                  transition: 'transform 1.8s ease-in .5s, opacity 1.8s ease-in .5s',
                }}
              />
              {water &&
                dissolves &&
                [0, 1, 2].map((k) => (
                  <circle
                    key={k}
                    cx={66 + k * 14}
                    cy={118}
                    r={3}
                    fill="#fff"
                    fillOpacity={0.8}
                    style={{ animation: `rise 1.4s ease-in ${0.5 + k * 0.35}s 2 both` }}
                  />
                ))}
            </g>
            <path d="M40 20 L46 128 a8 8 0 0 0 8 8 H106 a8 8 0 0 0 8 -8 L120 20" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            {water && <circle cx={80} cy={28} r={5} fill="#9fd8ff" style={{ animation: 'drop .6s ease-in both' }} />}
            <text x={80} y={148} textAnchor="middle" fontSize={10} fill="#fff" fillOpacity={0.8}>
              {item.f}
            </text>
          </svg>
        </div>

        <div className="space-y-2 text-[15px]">
          <div className={`rounded-lg bg-white/10 px-3 py-2 ${stage >= 1 ? '' : 'opacity-40'}`}>
            <span className="text-white/70">Гидроксид: </span>
            {stage >= 1 ? (
              <b style={{ animation: 'pop .35s ease-out both' }} className="inline-block">
                {item.f} → {item.hydroxide}
              </b>
            ) : (
              '?'
            )}
          </div>
          <div className={`rounded-lg bg-white/10 px-3 py-2 ${stage >= 2 ? '' : 'opacity-40'}`}>
            <span className="text-white/70">По таблице растворимости: </span>
            {stage >= 2 ? (
              <b style={{ animation: 'pop .35s ease-out both' }} className={`inline-block ${item.sol === 'Н' ? 'text-orange' : 'text-teal'}`}>
                {item.hydroxide} — {SOL_TEXT[item.sol]}
              </b>
            ) : (
              '?'
            )}
          </div>
          <div className={`rounded-lg bg-white/10 px-3 py-2 ${water ? '' : 'opacity-40'}`}>
            <span className="text-white/70">С водой: </span>
            {water ? (
              dissolves ? (
                <b style={{ animation: 'pop .35s ease-out both' }} className="inline-block text-teal">
                  ✓ реагирует: {item.eq}
                </b>
              ) : (
                <b style={{ animation: 'pop .35s ease-out both' }} className="inline-block text-orange">
                  ✗ не реагирует, остаётся осадок
                </b>
              )
            ) : (
              '?'
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStage((s) => s + 1)}
          disabled={stage >= 3}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-105 disabled:opacity-40"
        >
          {stage < 3 ? labels[stage] : 'Готово'}
        </button>
        {stage > 0 && (
          <button onClick={() => setStage(0)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
            ↺ Сначала
          </button>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        {water ? (
          <div style={{ animation: 'pop .4s ease-out both' }}>
            <p>
              Гидроксид {dissolves ? 'растворим' : 'нерастворим'} — значит, {item.kind} оксид <b className="text-white">{item.f}</b>{' '}
              <b className={dissolves ? 'text-teal' : 'text-orange'}>{dissolves ? 'реагирует с водой' : 'с водой не реагирует'}</b>.
            </p>
            {item.note && <p className="mt-1 text-sm text-white/85">{item.note}</p>}
          </div>
        ) : (
          <p className="text-white/80">Пройдите три шага: гидроксид → таблица растворимости → вода.</p>
        )}
      </div>
    </>
  )
}

/** Растворимость оксидов в воде определяется растворимостью соответствующего гидроксида */
export default function OxideSolubility() {
  const [i, setI] = useState(0)
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите оксид и узнайте, растворяется ли он в воде.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ITEMS.map((x, k) => (
          <button
            key={x.f}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.f}
          </button>
        ))}
      </div>
      <Test key={ITEMS[i].f} item={ITEMS[i]} />
    </div>
  )
}
