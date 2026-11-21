import { useState } from 'react'

interface Oxide {
  f: string
  acid: string | null
  alkali: string | null
  verdict: string
  hydroxide: string
}

const OXIDES: Oxide[] = [
  { f: 'CaO', acid: 'CaO + 2HCl → CaCl₂ + H₂O', alkali: null, verdict: 'основный', hydroxide: 'Ca(OH)₂ — основание (щёлочь)' },
  { f: 'Na₂O', acid: 'Na₂O + 2HCl → 2NaCl + H₂O', alkali: null, verdict: 'основный', hydroxide: 'NaOH — основание (щёлочь)' },
  { f: 'ZnO', acid: 'ZnO + 2HCl → ZnCl₂ + H₂O', alkali: 'ZnO + 2NaOH + H₂O → Na₂[Zn(OH)₄]', verdict: 'амфотерный', hydroxide: 'Zn(OH)₂ — амфотерный гидроксид' },
  { f: 'Al₂O₃', acid: 'Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O', alkali: 'Al₂O₃ + 2NaOH + 3H₂O → 2Na[Al(OH)₄]', verdict: 'амфотерный', hydroxide: 'Al(OH)₃ — амфотерный гидроксид' },
  { f: 'CO₂', acid: null, alkali: 'CO₂ + 2NaOH → Na₂CO₃ + H₂O', verdict: 'кислотный', hydroxide: 'H₂CO₃ — кислота' },
  { f: 'SO₃', acid: null, alkali: 'SO₃ + 2NaOH → Na₂SO₄ + H₂O', verdict: 'кислотный', hydroxide: 'H₂SO₄ — кислота' },
  { f: 'P₂O₅', acid: null, alkali: 'P₂O₅ + 6NaOH → 2Na₃PO₄ + 3H₂O', verdict: 'кислотный', hydroxide: 'H₃PO₄ — кислота' },
  { f: 'CO', acid: null, alkali: null, verdict: 'несолеобразующий', hydroxide: 'нет соответствующего гидроксида' },
  { f: 'NO', acid: null, alkali: null, verdict: 'несолеобразующий', hydroxide: 'нет соответствующего гидроксида' },
]

type Reagent = 'acid' | 'alkali'

function Tube({ oxide, reagent, done, onAdd }: { oxide: Oxide; reagent: Reagent; done: boolean; onAdd: () => void }) {
  const eq = oxide[reagent]
  const reacts = eq !== null
  const name = reagent === 'acid' ? 'кислоту HCl' : 'щёлочь NaOH'
  const liquid = reagent === 'acid' ? '#9fd8ff' : '#ffd29f'
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 150" className="w-28" role="img" aria-label={`Пробирка с оксидом ${oxide.f}`}>
        <defs>
          <clipPath id={`tube-${reagent}`}>
            <path d="M32 12 V108 a28 28 0 0 0 56 0 V12 Z" />
          </clipPath>
        </defs>
        <g clipPath={`url(#tube-${reagent})`}>
          <rect
            x={20}
            y={50}
            width={80}
            height={110}
            fill={reacts ? '#a7f3d0' : liquid}
            style={{ opacity: done ? 0.85 : 0, transition: 'opacity .6s' }}
          />
          {/* осадок / порошок оксида */}
          <ellipse
            cx={60}
            cy={126}
            rx={24}
            ry={10}
            fill="#e2e8f0"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center bottom',
              transform: done && reacts ? 'scale(0.05)' : 'scale(1)',
              opacity: done && reacts ? 0 : 1,
              transition: 'transform 1.6s ease-in .5s, opacity 1.6s ease-in .5s',
            }}
          />
          {/* пузырьки как признак «идёт реакция» */}
          {done &&
            reacts &&
            [0, 1, 2].map((k) => (
              <circle
                key={k}
                cx={48 + k * 12}
                cy={120}
                r={3}
                fill="#fff"
                fillOpacity={0.8}
                style={{ animation: `rise 1.4s ease-in ${0.5 + k * 0.35}s 2 both` }}
              />
            ))}
        </g>
        <path d="M32 12 V108 a28 28 0 0 0 56 0 V12" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        <line x1={26} y1={12} x2={94} y2={12} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        {/* капля реагента */}
        {done && (
          <circle cx={60} cy={30} r={5} fill={liquid} style={{ animation: 'drop .6s ease-in both' }} />
        )}
        <text x={60} y={146} textAnchor="middle" fontSize={10} fill="#fff" fillOpacity={0.8}>
          {oxide.f}
        </text>
      </svg>
      <button
        onClick={onAdd}
        disabled={done}
        className="rounded-xl bg-orange px-3 py-1.5 text-sm font-semibold text-navy transition hover:brightness-105 disabled:opacity-40"
      >
        {done ? 'Добавлено' : `Прилить ${name}`}
      </button>
      <div className="min-h-[3.2rem] text-center text-sm" style={done ? { animation: 'pop .4s ease-out both' } : undefined}>
        {done ? (
          reacts ? (
            <>
              <b className="text-teal">✓ реагирует</b>
              <div className="mt-1 text-white/90">{eq}</div>
            </>
          ) : (
            <b className="text-white/80">✗ реакции нет</b>
          )
        ) : (
          <span className="text-white/50">ещё не пробовали</span>
        )}
      </div>
    </div>
  )
}

function Test({ oxide }: { oxide: Oxide }) {
  const [done, setDone] = useState<Record<Reagent, boolean>>({ acid: false, alkali: false })
  const both = done.acid && done.alkali
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3">
        <Tube oxide={oxide} reagent="acid" done={done.acid} onAdd={() => setDone((d) => ({ ...d, acid: true }))} />
        <Tube oxide={oxide} reagent="alkali" done={done.alkali} onAdd={() => setDone((d) => ({ ...d, alkali: true }))} />
      </div>
      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        {both ? (
          <div style={{ animation: 'pop .4s ease-out both' }}>
            <p>
              <b className="text-white">{oxide.f}</b> — <b className="text-orange">{oxide.verdict} оксид</b>.
            </p>
            <p className="text-sm text-white/85">Соответствует: {oxide.hydroxide}.</p>
          </div>
        ) : (
          <p className="text-white/80">Прилейте и кислоту, и щёлочь — по результатам определим характер оксида.</p>
        )}
      </div>
    </>
  )
}

/** Как определить характер оксида по реакциям с кислотой и щёлочью */
export default function OxideTests() {
  const [i, setI] = useState(0)
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите оксид и проверьте, с чем он реагирует.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OXIDES.map((x, k) => (
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
      <Test key={OXIDES[i].f} oxide={OXIDES[i]} />
    </div>
  )
}
