import { useState } from 'react'

type Lig = 'O' | 'OH' | 'H'

interface Sub {
  id: string
  tab: string
  title: string
  centre: string
  ligands: Lig[]
  kind: 'acid' | 'base' | 'amph' | 'free'
  note: string
}

const SUBS: Sub[] = [
  { id: 'h2so4', tab: 'H₂SO₄', title: 'серная кислота', centre: 'S', ligands: ['O', 'OH', 'O', 'OH'], kind: 'acid', note: 'H₂SO₄ = SO₂(OH)₂. Две группы OH — кислота двухосновная.' },
  { id: 'hno3', tab: 'HNO₃', title: 'азотная кислота', centre: 'N', ligands: ['O', 'O', 'OH'], kind: 'acid', note: 'HNO₃ = NO₂(OH). Одна группа OH — кислота одноосновная.' },
  { id: 'h3po4', tab: 'H₃PO₄', title: 'фосфорная кислота', centre: 'P', ligands: ['O', 'OH', 'OH', 'OH'], kind: 'acid', note: 'H₃PO₄ = PO(OH)₃. Три группы OH — кислота трёхосновная.' },
  { id: 'h2co3', tab: 'H₂CO₃', title: 'угольная кислота', centre: 'C', ligands: ['O', 'OH', 'OH'], kind: 'acid', note: 'H₂CO₃ = CO(OH)₂. Две группы OH — кислота двухосновная.' },
  { id: 'naoh', tab: 'NaOH', title: 'гидроксид натрия', centre: 'Na', ligands: ['OH'], kind: 'base', note: 'Металл связан с группой OH. При растворении рвётся связь Me–O и образуется ион OH⁻ — это основание.' },
  { id: 'aloh3', tab: 'Al(OH)₃', title: 'гидроксид алюминия', centre: 'Al', ligands: ['OH', 'OH', 'OH'], kind: 'amph', note: 'Al(OH)₃ = H₃AlO₃. Может вести себя двояко: с кислотой рвётся связь Al–O (как основание), со щёлочью — связь O–H (как кислота).' },
  { id: 'hcl', tab: 'HCl', title: 'соляная кислота', centre: 'Cl', ligands: ['H'], kind: 'free', note: 'Водород связан прямо с хлором, групп OH нет — это НЕ гидроксид. Но кислота: при растворении H⁺ отщепляется.' },
]

/** Углы расположения заместителей вокруг центрального атома (градусы, y вниз) */
const ANGLES: Record<number, number[]> = {
  1: [0],
  2: [-135, -45],
  3: [-90, 30, 150],
  4: [-90, 0, 90, 180],
}

const CX = 160
const CY = 120
const R1 = 58
const R2 = 98

const pol = (deg: number, r: number) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)] as const

type Cut = 'none' | 'oh' | 'centre'

function Scheme({ sub, hl, cut }: { sub: Sub; hl: boolean; cut: Cut }) {
  const angles = ANGLES[sub.ligands.length]
  const leaver = sub.ligands.findIndex((l) => l === 'OH' || l === 'H')
  const shift = 30
  return (
    <svg viewBox="0 -28 320 292" className="mx-auto w-full max-w-[460px]" role="img" aria-label={`Структурная формула: ${sub.title}`}>
      {sub.ligands.map((lig, i) => {
        const a = angles[i]
        const [ox, oy] = pol(a, R1)
        const [hx, hy] = pol(a, R2)
        const rad = (a * Math.PI) / 180
        const isLeaver = i === leaver && cut !== 'none'
        const cutCentre = isLeaver && (cut === 'centre' || lig === 'H')
        const cutOH = isLeaver && cut === 'oh' && lig === 'OH'
        const dx = Math.cos(rad) * shift
        const dy = Math.sin(rad) * shift
        const groupMove = cutCentre ? `translate(${dx}px, ${dy}px)` : 'translate(0,0)'
        const hMove = cutOH ? `translate(${dx}px, ${dy}px)` : 'translate(0,0)'
        const move = (t: string) => ({ transform: t, transition: 'transform .9s ease-in-out' })
        const [sx, sy] = pol(a, 22) // край центрального атома
        const brokenStroke = '#ff6b6b'

        if (lig === 'H') {
          // водород прямо у центра
          const [hhx, hhy] = pol(a, R1)
          return (
            <g key={i}>
              <line x1={sx} y1={sy} x2={hhx} y2={hhy} stroke={cutCentre ? brokenStroke : '#fff'} strokeWidth={3} strokeDasharray={cutCentre ? '4 4' : undefined} />
              <g style={move(groupMove)}>
                <circle cx={hhx} cy={hhy} r={11} fill="#e6559b" stroke={cutCentre ? brokenStroke : 'none'} strokeWidth={2} />
                <text x={hhx} y={hhy + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">H</text>
                {cutCentre && (
                  <text x={hhx} y={hhy - 18} textAnchor="middle" fontSize={13} fontWeight={800} fill="#ffd9a0">H⁺</text>
                )}
              </g>
            </g>
          )
        }

        return (
          <g key={i}>
            {/* связь центр — O */}
            {(lig === 'O' ? [-3.5, 3.5] : [0]).map((off) => (
              <line
                key={off}
                x1={sx - off * Math.sin(rad)}
                y1={sy + off * Math.cos(rad)}
                x2={ox - off * Math.sin(rad)}
                y2={oy + off * Math.cos(rad)}
                stroke={cutCentre ? brokenStroke : '#fff'}
                strokeWidth={3}
                strokeDasharray={cutCentre ? '4 4' : undefined}
              />
            ))}
            <g style={move(groupMove)}>
              {lig === 'OH' && (
                <>
                  <line x1={ox} y1={oy} x2={hx} y2={hy} stroke={cutOH ? brokenStroke : '#fff'} strokeWidth={3} strokeDasharray={cutOH ? '4 4' : undefined} />
                  {hl && <ellipse cx={(ox + hx) / 2} cy={(oy + hy) / 2} rx={27} ry={27} fill="#f5a623" fillOpacity={0.22} stroke="#f5a623" strokeWidth={2} />}
                  <g style={move(hMove)}>
                    <circle cx={hx} cy={hy} r={10} fill="#e6559b" />
                    <text x={hx} y={hy + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">H</text>
                    {cutOH && <text x={hx} y={hy - 16} textAnchor="middle" fontSize={13} fontWeight={800} fill="#ffd9a0">H⁺</text>}
                  </g>
                </>
              )}
              <circle cx={ox} cy={oy} r={14} fill="#e5484d" />
              <text x={ox} y={oy + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">O</text>
              {cutCentre && lig === 'OH' && (
                <text x={(ox + hx) / 2 - 46 * Math.sin(rad)} y={(oy + hy) / 2 + 46 * Math.cos(rad) + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#ffd9a0">OH⁻</text>
              )}
            </g>
          </g>
        )
      })}
      <circle cx={CX} cy={CY} r={24} fill={sub.kind === 'acid' || sub.kind === 'free' ? '#16a58c' : '#2f7fec'} />
      <text x={CX} y={CY + 6} textAnchor="middle" fontSize={sub.centre.length > 1 ? 16 : 18} fontWeight={800} fill="#fff">
        {sub.centre}
      </text>
    </svg>
  )
}

const KIND_LABEL = { acid: 'кислота', base: 'основание', amph: 'амфотерный гидроксид', free: 'кислота без OH' } as const

/** Структурные формулы гидроксидов: группы OH и разрыв связи при растворении */
export default function AcidStructure() {
  const [i, setI] = useState(0)
  const [hl, setHl] = useState(true)
  const [cut, setCut] = useState<Cut>('none')
  const sub = SUBS[i]

  const pick = (k: number) => {
    setI(k)
    setCut('none')
  }

  const label = sub.kind === 'amph' ? null : cut === 'none' ? 'Показать, что рвётся в растворе →' : '↺ Вернуть'

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        {SUBS.map((x, k) => (
          <button
            key={x.id}
            onClick={() => pick(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white/5 p-2">
        <Scheme
          sub={sub}
          hl={hl && sub.ligands.includes('OH')}
          cut={sub.kind === 'base' ? (cut === 'none' ? 'none' : 'centre') : cut}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sub.ligands.includes('OH') && (
          <button
            onClick={() => setHl((v) => !v)}
            aria-pressed={hl}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            {hl ? 'Скрыть выделение OH' : 'Выделить группы OH'}
          </button>
        )}
        {label && (
          <button
            onClick={() => setCut((c) => (c === 'none' ? (sub.kind === 'base' ? 'centre' : 'oh') : 'none'))}
            className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-105"
          >
            {label}
          </button>
        )}
        {sub.kind === 'amph' && (
          <>
            <button
              onClick={() => setCut((c) => (c === 'centre' ? 'none' : 'centre'))}
              aria-pressed={cut === 'centre'}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${cut === 'centre' ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
            >
              С кислотой: рвётся Al–O
            </button>
            <button
              onClick={() => setCut((c) => (c === 'oh' ? 'none' : 'oh'))}
              aria-pressed={cut === 'oh'}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${cut === 'oh' ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Со щёлочью: рвётся O–H
            </button>
          </>
        )}
      </div>

      <div className="mt-3 space-y-2 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <p>
          <b className="text-white">{sub.tab}</b> — {sub.title}: <b className="text-orange">{KIND_LABEL[sub.kind]}</b>
        </p>
        <p className="text-white/90">{sub.note}</p>
        {sub.kind === 'acid' && cut !== 'none' && <p className="text-sm text-white/85">У неметалла рвётся связь O–H, образуется ион H⁺ — это кислота.</p>}
      </div>
    </div>
  )
}
