import { useEffect, useRef, useState } from 'react'
import { EXCHANGES, type Exchange } from '../lib/acidsBasesSalts'
import { tex } from './RichText'

interface Item {
  key: string
  label: string
  sign: '+' | '-'
  reacts: boolean
  before: [number, number]
}

const SLOTS_BEFORE: [number, number][] = [
  [-55, -30],
  [45, -40],
  [-35, 30],
  [55, 22],
]

const SLOTS_MIXED: [number, number][] = [
  [-130, -45],
  [-55, -60],
  [25, -50],
  [105, -62],
  [140, 5],
  [-110, 25],
  [70, 30],
  [-20, 15],
]

const MIX_CX = 320
const MIX_CY = 175

function items(ex: Exchange): Item[] {
  const out: Item[] = []
  const put = (side: 'L' | 'R', cx: number) => {
    const ions = side === 'L' ? ex.left.ions : ex.right.ions
    let k = 0
    for (const ion of ions)
      for (let i = 0; i < ion.n; i++) {
        const [dx, dy] = SLOTS_BEFORE[k++ % SLOTS_BEFORE.length]
        out.push({ key: `${side}${ion.label}${i}`, label: ion.label, sign: ion.sign, reacts: !!ion.reacts, before: [cx + dx, 175 + dy] })
      }
  }
  put('L', 160)
  put('R', 480)
  return out
}

function productPoint(ex: Exchange): [number, number] {
  if (!ex.product) return [MIX_CX, MIX_CY]
  if (ex.product.kind === 'solid') return [MIX_CX, 236]
  if (ex.product.kind === 'gas') return [MIX_CX, 100]
  return [MIX_CX, MIX_CY]
}

const beaker = (cx: number, w: number, top: number) =>
  `M ${cx - w / 2} ${top} L ${cx - w / 2 + 6} 248 q 0 10 10 10 H ${cx + w / 2 - 16} q 10 0 10 -10 L ${cx + w / 2} ${top}`

/** Реакция ионного обмена: какие ионы связываются (осадок, газ, вода), а какие остаются в растворе */
export default function IonExchange() {
  const [id, setId] = useState(EXCHANGES[0].id)
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const timer = useRef<number | undefined>(undefined)
  const ex = EXCHANGES.find((e) => e.id === id)!
  const list = items(ex)
  const [px, py] = productPoint(ex)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const reset = (next = id) => {
    window.clearTimeout(timer.current)
    setId(next)
    setPhase(0)
  }

  const mix = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return setPhase(2)
    setPhase(1)
    timer.current = window.setTimeout(() => setPhase(2), 1300)
  }

  const water = ex.product?.kind === 'water' ? list.filter((x) => x.reacts && x.sign === '+').length : 0

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите пару растворов и слейте их. Следите, какие ионы «находят пару».</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXCHANGES.map((e) => (
          <button
            key={e.id}
            onClick={() => reset(e.id)}
            aria-pressed={e.id === id}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${e.id === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {e.left.name} + {e.right.name}
          </button>
        ))}
      </div>

      <svg viewBox="0 40 640 250" className="mt-4 w-full" role="img" aria-label={`Сливаем растворы ${ex.left.name} и ${ex.right.name}`}>
        <g style={{ opacity: phase === 0 ? 1 : 0, transition: 'opacity .5s' }}>
          {[
            [160, ex.left.name],
            [480, ex.right.name],
          ].map(([cx, name]) => (
            <g key={cx}>
              <path d={`${beaker(cx as number, 200, 110)} Z`} fill="rgba(140,190,255,.12)" />
              <path d={beaker(cx as number, 200, 95)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
              <text x={cx} y={282} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
                {name} (р-р)
              </text>
            </g>
          ))}
          <text x={320} y={185} textAnchor="middle" fontSize={30} fontWeight={700} fill="#f7a93b">
            +
          </text>
        </g>

        <g style={{ opacity: phase === 0 ? 0 : 1, transition: 'opacity .5s' }}>
          <path d={`${beaker(MIX_CX, 380, 100)} Z`} fill="rgba(140,190,255,.12)" />
          <path d={beaker(MIX_CX, 380, 80)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
          <text x={MIX_CX} y={282} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
            после сливания
          </text>
        </g>

        {ex.product?.kind === 'solid' && (
          <g style={{ opacity: phase === 2 ? 1 : 0, transition: 'opacity .8s ease .5s' }}>
            <path d={`M ${MIX_CX - 110} 257 Q ${MIX_CX} 212 ${MIX_CX + 110} 257 Z`} fill={ex.product.color} />
            <text x={MIX_CX} y={250} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1c2540">
              {ex.product.label}
            </text>
          </g>
        )}
        {ex.product?.kind === 'gas' && phase === 2 && (
          <g>
            {[-90, -40, 10, 60, 110].map((dx, i) => (
              <circle
                key={dx}
                cx={MIX_CX + dx}
                cy={230}
                r={5 + (i % 2) * 2}
                fill="none"
                stroke={ex.product!.color}
                strokeWidth={2}
                style={{ animation: `rise 1.6s ease-out ${i * 0.3}s infinite`, transformBox: 'fill-box' }}
              />
            ))}
            <text x={MIX_CX} y={62} textAnchor="middle" fontSize={17} fontWeight={700} fill="#f7a93b" style={{ animation: 'pop .4s ease-out both' }}>
              {ex.product.label}
            </text>
          </g>
        )}
        {ex.product?.kind === 'water' &&
          phase === 2 &&
          Array.from({ length: water }, (_, i) => (
            <g key={i} transform={`translate(${MIX_CX - 40 + i * 80} ${MIX_CY})`}>
              <g style={{ animation: 'pop .4s ease-out both', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <rect x={-28} y={-16} width={56} height={32} rx={16} fill={ex.product!.color} />
                <text y={5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1c2540">
                  H₂O
                </text>
              </g>
            </g>
          ))}

        {list.map((it, i) => {
          const [mx, my] = SLOTS_MIXED[i % SLOTS_MIXED.length]
          const [x, y] = phase === 0 ? it.before : phase === 2 && it.reacts ? [px, py] : [MIX_CX + mx, MIX_CY + my]
          const gone = phase === 2 && it.reacts && !!ex.product
          return (
            <g
              key={`${ex.id}-${it.key}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                opacity: gone ? 0 : 1,
                transition: gone ? 'transform .9s ease-in, opacity .3s ease .7s' : 'transform 1.1s ease-in-out',
              }}
            >
              <circle r={21} fill={it.sign === '+' ? '#2f7fec' : '#e5484d'} stroke={phase > 0 && it.reacts && ex.product ? '#f7a93b' : 'none'} strokeWidth={3} />
              <text y={4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
                {it.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {phase === 0 ? (
          <button onClick={mix} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Слить растворы
          </button>
        ) : (
          <button onClick={() => reset()} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Заново
          </button>
        )}
        <span className="flex items-center gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-full bg-[#2f7fec]" /> катион
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-full bg-[#e5484d]" /> анион
          </span>
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        {phase < 2 ? (
          <div className="text-white/70">В растворах вещества уже распались на ионы. Слейте растворы.</div>
        ) : (
          <>
            <div className="font-bold text-teal">{ex.look}</div>
            {ex.mol && (
              <div className="mt-2 grid gap-1.5 text-sm">
                {[
                  ['Молекулярное', ex.mol],
                  ['Полное ионное', ex.full!],
                  ['Сокращённое ионное', ex.short!],
                ].map(([title, ce]) => (
                  <div key={title} className="grid items-center gap-1 sm:grid-cols-[150px_1fr]">
                    <span className="text-white/70">{title}:</span>
                    <span className="overflow-x-auto text-base" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${ce}}`) }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
