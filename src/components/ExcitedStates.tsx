import { useEffect, useRef, useState } from 'react'
import { CELLS_IN, LAYER_SUBS, excitedElements, formulaOf, stateAt, unpaired, type State } from '../lib/excited'

const ROMAN = ['—', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const NAMES = ['Основное состояние', '1-е возбуждённое', '2-е возбуждённое', '3-е возбуждённое']
const FLIGHT_MS = 1200

interface Flight {
  id: number
  symbol: '↑' | '↓'
  fx: number
  fy: number
  tx: number
  ty: number
}

const key = (sub: string, j: number) => `${sub}:${j}`

/** Основное и возбуждённые состояния: электроны переходят между ячейками внешнего слоя */
export default function ExcitedStates({ symbols }: { symbols?: string[] } = {}) {
  const list = symbols ? excitedElements.filter((e) => symbols.includes(e.sym)) : excitedElements
  const [ei, setEi] = useState(symbols ? list.length - 1 : 2)
  const [k, setK] = useState(0)
  const [flights, setFlights] = useState<Flight[]>([])
  const [pending, setPending] = useState<Set<string>>(new Set())
  const box = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seq = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const el = list[ei]
  const state = stateAt(el, k)
  const un = unpaired(state)

  const centerOf = (kk: string) => {
    const b = box.current!.getBoundingClientRect()
    const r = cellRefs.current[kk]!.getBoundingClientRect()
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }
  }

  /** Переходит в состояние next и анимирует электроны, которые поменяли ячейки */
  const go = (next: number) => {
    if (next === k) return
    clearTimeout(timer.current)
    const from = stateAt(el, k)
    const to = stateAt(el, next)
    const src: string[] = []
    const dst: string[] = []
    for (const sub of LAYER_SUBS[el.layer]) {
      from[sub]!.forEach((n, j) => {
        const d = to[sub]![j] - n
        for (let t = 0; t < Math.abs(d); t++) (d < 0 ? src : dst).push(key(sub, j))
      })
    }
    const fl: Flight[] = src.map((s, i) => {
      const a = centerOf(s)
      const b = centerOf(dst[i])
      const [ds, dj] = dst[i].split(':')
      const after = to[ds as keyof State]![Number(dj)]
      return { id: ++seq.current, symbol: after >= 2 ? '↓' : '↑', fx: a.x, fy: a.y, tx: b.x, ty: b.y }
    })
    setFlights(fl)
    setPending(new Set(dst))
    setK(next)
    timer.current = setTimeout(() => {
      setFlights([])
      setPending(new Set())
    }, FLIGHT_MS + 50)
  }

  const pick = (i: number) => {
    clearTimeout(timer.current)
    setFlights([])
    setPending(new Set())
    setEi(i)
    setK(0)
  }

  const move = k > 0 ? el.moves[k - 1] : null
  const prevUn = k > 0 ? unpaired(stateAt(el, k - 1)) : 0

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-1">
        {list.map((e, i) => (
          <button
            key={e.sym}
            onClick={() => pick(i)}
            className={`h-8 min-w-9 rounded-md px-2 text-sm font-semibold transition ${i === ei ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {e.sym}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-2xl font-bold">
          {el.sym} <span className="text-base font-medium text-white/70">{el.name[0].toUpperCase() + el.name.slice(1)}, Z = {el.z}</span>
        </div>
        <div className="text-base font-semibold text-orange" aria-label="Электронная формула">{formulaOf(el, state)}</div>
      </div>

      <div className="mt-1 text-sm text-white/70">
        Показан {el.layer}-й (внешний) слой. Внутренние слои не меняются.
      </div>

      <div ref={box} className="relative mt-3 flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border-2 border-orange/60 bg-orange/10 p-3">
        {LAYER_SUBS[el.layer].map((sub) => (
          <div key={sub}>
            <div className="mb-1 text-center text-xs font-semibold text-white/80">{sub}</div>
            <div className="flex gap-1">
              {Array.from({ length: CELLS_IN[sub[1]] }, (_, j) => {
                const n = state[sub]![j]
                const hide = pending.has(key(sub, j))
                return (
                  <div
                    key={j}
                    ref={(r) => {
                      cellRefs.current[key(sub, j)] = r
                    }}
                    className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md border-2 border-white/40 bg-white/5 text-xl font-bold leading-none"
                  >
                    <span className="text-orange" style={{ opacity: n >= 1 && !(hide && n === 1) ? 1 : 0 }}>↑</span>
                    <span className="text-teal" style={{ opacity: n >= 2 && !(hide && n === 2) ? 1 : 0 }}>↓</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {flights.map((f) => (
          <span
            key={f.id}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 -ml-3 -mt-4 flex h-8 w-6 items-center justify-center text-2xl font-bold text-red"
            style={
              {
                '--fx': `${f.fx}px`,
                '--fy': `${f.fy}px`,
                '--tx': `${f.tx}px`,
                '--ty': `${f.ty}px`,
                animation: `fly ${FLIGHT_MS}ms ease-in-out both`,
              } as React.CSSProperties
            }
          >
            {f.symbol}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: el.moves.length + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-pressed={i === k}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${i === k ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {NAMES[i]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm" aria-live="polite">
        <span className="rounded-full bg-white/10 px-3 py-1">Неспаренных ē: <b className="text-orange">{un}</b></span>
        <span className="rounded-full bg-white/10 px-3 py-1">Валентность: <b className="text-orange">{ROMAN[un]}</b></span>
        {el.moves.length > 0 && (
          <span className="rounded-full bg-white/10 px-3 py-1">Возможные валентности: <b>{Array.from({ length: el.moves.length + 1 }, (_, i) => ROMAN[unpaired(stateAt(el, i))]).filter((v) => v !== '—').join(', ')}</b></span>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
        {k === 0 && el.moves.length > 0 && (
          <p>
            <b className="text-white">Основное состояние:</b> электроны занимают самые «низкие» ячейки. Неспаренных ē — <b>{un}</b>. Нажмите «1-е возбуждённое»: атом получает энергию, и электрон перейдёт на свободную ячейку того же слоя.
          </p>
        )}
        {k === 0 && el.moves.length === 0 && (
          <p>
            <b className="text-white">Основное состояние.</b> Неспаренных ē — <b>{un}</b>. <b className="text-orange">Возбуждение невозможно.</b> {el.why}
          </p>
        )}
        {move && (
          <p>
            <b className="text-white">{NAMES[k]}:</b> электрон переходит с {move[0]} на {move[2]}
            {state[move[0]]![move[1]] === 1 && stateAt(el, k - 1)[move[0]]![move[1]] === 2 ? ' — пара электронов распаривается' : ''}. Неспаренных ē было {prevUn}, стало <b>{un}</b> — значит, атом может образовать {un} связей (валентность {ROMAN[un]}).
          </p>
        )}
      </div>
    </div>
  )
}
