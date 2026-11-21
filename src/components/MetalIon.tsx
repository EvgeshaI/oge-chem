import { useEffect, useState } from 'react'
import { METAL_ATOMS, chargeOf, ionLabel, type MetalAtom } from '../lib/metalAtoms'
import { SHELL_COLORS } from './ShellsSvg'

const R = [44, 76, 108, 140]
const CX = 170
const CY = 160
const TX = 415 // куда улетают электроны
/** угловая скорость слоёв, рад/с */
const OMEGA = [0.9, -0.7, 0.55, -0.4]

const pos = (shell: number, k: number, n: number, t: number) => {
  const a = -Math.PI / 2 + shell * 0.5 + (2 * Math.PI * k) / n + OMEGA[shell] * t
  return { x: CX + R[shell] * Math.cos(a), y: CY + R[shell] * Math.sin(a) }
}

interface Snap {
  x: number
  y: number
  /** место в очереди на вылет (0 — первый) */
  j: number
}

/** Атом металла: слои с вращающимися электронами, кнопка «Отдать», внизу схема Na⁰ − 1ē → Na⁺ */
export default function MetalIon() {
  const [id, setId] = useState('na')
  const [snap, setSnap] = useState<Record<string, Snap> | null>(null)
  const [t, setT] = useState(0)
  const m = METAL_ATOMS.find((x) => x.id === id)!
  const ch = chargeOf(m)
  const ion = ionLabel(m.sym, ch)
  const done = snap !== null

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const t0 = performance.now()
    const loop = (now: number) => {
      setT((now - t0) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const choose = (next: MetalAtom) => {
    setId(next.id)
    setSnap(null)
  }

  const give = () => {
    const out: { key: string; x: number; y: number }[] = []
    m.sh.forEach((n, i) => {
      for (let k = 0; k < m.take[i]; k++) out.push({ key: `${i}-${k}`, ...pos(i, k, n, t) })
    })
    out.sort((a, b) => b.x - a.x)
    setSnap(Object.fromEntries(out.map((e, j) => [e.key, { x: e.x, y: e.y, j }])))
  }

  const leaving = m.take.reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {METAL_ATOMS.map((x) => (
          <button
            key={x.id}
            onClick={() => choose(x)}
            aria-pressed={x.id === id}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.chip}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 480 320" className="mx-auto mt-3 w-full max-w-[560px]" role="img" aria-label={`Строение атома ${m.name}: электроны по слоям ${m.sh.join('·')}`}>
        {m.sh.map((n, i) => {
          const emptied = m.take[i] === n
          return (
            <circle
              key={`${id}-r${i}`}
              cx={CX}
              cy={CY}
              r={R[i]}
              fill="none"
              stroke={SHELL_COLORS[i]}
              strokeWidth={1.5}
              strokeDasharray={done && emptied ? '4 6' : undefined}
              style={{ opacity: done && emptied ? 0.12 : 0.4, transition: 'opacity .8s ease .6s' }}
            />
          )
        })}

        {/* стрелка к окислителю */}
        <g style={{ opacity: done ? 1 : 0.35, transition: 'opacity .6s' }}>
          <path d="M 330 160 H 470" stroke="#f5a623" strokeWidth={2} strokeDasharray="5 5" fill="none" />
          <path d="M 462 154 L 472 160 L 462 166" stroke="#f5a623" strokeWidth={2} fill="none" />
          <text x={400} y={110} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" opacity={0.85}>
            окислитель
          </text>
        </g>

        {/* ядро */}
        <circle cx={CX} cy={CY} r={22} fill="#e5484d" stroke="#fff" strokeWidth={2} />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
          +{m.z}
        </text>

        {/* электроны */}
        {m.sh.flatMap((n, i) =>
          Array.from({ length: n }, (_, k) => {
            const key = `${i}-${k}`
            const leave = k < m.take[i]
            const s = snap?.[key]
            const live = pos(i, k, n, t)
            const p = s ?? live
            const ty = s ? CY + (s.j - (leaving - 1) / 2) * 22 : 0
            return (
              <g key={`${id}-${key}`}>
                {leave && !done && (
                  <circle cx={p.x} cy={p.y} r={12} fill="#ffd54a" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1.4s ease-in-out infinite' }} />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill={leave ? '#ffd54a' : SHELL_COLORS[i]}
                  stroke="#fff"
                  strokeWidth={1.5}
                  style={{
                    transform: s ? `translate(${TX - s.x}px, ${ty - s.y}px)` : 'translate(0px, 0px)',
                    transition: s ? `transform 1.3s ease-in-out ${s.j * 220}ms` : 'none',
                  }}
                />
              </g>
            )
          }),
        )}
      </svg>

      <div className="mt-2 flex justify-center">
        {!done ? (
          <button onClick={give} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Отдать {leaving === 1 ? 'электрон' : 'электроны'} →
          </button>
        ) : (
          <button onClick={() => setSnap(null)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Вернуть
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 px-3 py-4 text-center text-2xl font-bold sm:text-3xl" aria-live="polite">
        {m.sym}⁰ − {ch}
        <span className="text-yellow-300">ē</span> <span className="text-orange">→</span>{' '}
        <span className="text-teal" style={{ opacity: done ? 1 : 0.35, transition: 'opacity .6s ease 1s' }}>
          {ion}
        </span>
      </div>
    </div>
  )
}
