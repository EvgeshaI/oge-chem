import { useEffect, useState } from 'react'
import { CHALCOGENS } from '../lib/chalcogens'
import { SHELL_COLORS } from './ShellsSvg'

const COLORS = [...SHELL_COLORS, '#2f7fec']
const R = [36, 68, 100]
const CX = 170
const CY = 160
const STARTS = [
  { x: 480, y: 110 },
  { x: 480, y: 210 },
]
const OMEGA = [0.9, -0.7, 0.55]
const ARRIVE_S = 1.3
const DELAY_S = 0.5

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)

/** Угол «места» k на внешнем слое: 4 «пары мест» (0–1, 2–3, 4–5, 6–7) */
const outerAngle = (k: number, t: number, shell: number) =>
  -Math.PI / 2 + Math.floor(k / 2) * (Math.PI / 2) + (k % 2 ? 0.17 : -0.17) + OMEGA[shell] * t

const innerAngle = (k: number, n: number, t: number, shell: number) =>
  -Math.PI / 2 + shell * 0.5 + (2 * Math.PI * k) / n + OMEGA[shell] * t

/** Занятые места внешнего слоя: две пары и два неспаренных электрона; свободны места 5 и 7 */
const FILLED = [0, 1, 2, 3, 4, 6]
const FREE = [5, 7]

/** Атомы кислорода и серы: 6 внешних электронов, два «пустых места», присоединение 2 электронов → Э²⁻ */
export default function ChalcogenAtoms() {
  const [i, setI] = useState(0)
  const [got, setGot] = useState<number | null>(null)
  const [t, setT] = useState(0)
  const h = CHALCOGENS[i]
  const outer = h.shells.length - 1

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

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const accepted = got !== null
  const progress = (n: number) => (accepted ? (reduced ? 1 : Math.min(1, Math.max(0, (t - got - n * DELAY_S) / ARRIVE_S))) : 0)
  const done = accepted && progress(1) >= 1
  const arrivedCount = accepted ? [0, 1].filter((n) => progress(n) >= 1).length : 0

  const pick = (k: number) => {
    setI(k)
    setGot(null)
  }

  const pos = (k: number) => {
    const a = outerAngle(k, t, outer)
    return { x: CX + R[outer] * Math.cos(a), y: CY + R[outer] * Math.sin(a) }
  }

  const shellsLabel = h.shells.map((n, k) => (k === outer ? n + arrivedCount : n)).join('·')

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {CHALCOGENS.map((x, k) => (
          <button
            key={x.sym}
            onClick={() => pick(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.sym} · {x.name}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 540 320" className="mx-auto mt-3 w-full max-w-[600px]" role="img" aria-label={`Атом ${h.gen}: электроны по слоям ${h.shells.join('·')}, на внешнем слое 6`}>
        {h.shells.map((_, k) => (
          <circle key={`${h.sym}-r${k}`} cx={CX} cy={CY} r={R[k]} fill="none" stroke={COLORS[k]} strokeWidth={k === outer ? 2.2 : 1.4} style={{ opacity: k === outer ? 0.7 : 0.35 }} />
        ))}

        {/* стрелки и подписи */}
        <g style={{ opacity: accepted ? 0.25 : 1, transition: 'opacity .6s' }}>
          {STARTS.map((s, n) => (
            <g key={n}>
              <path d={`M ${s.x + 30} ${s.y} H ${s.x - 70}`} stroke="#f5a623" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              <path d={`M ${s.x - 62} ${s.y - 6} L ${s.x - 72} ${s.y} L ${s.x - 62} ${s.y + 6}`} stroke="#f5a623" strokeWidth={2} fill="none" />
              {!accepted && <circle cx={s.x} cy={s.y} r={7} fill="#ff6b8a" stroke="#fff" strokeWidth={1.5} />}
            </g>
          ))}
          <text x={470} y={164} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" opacity={0.85}>
            2 электрона
          </text>
        </g>

        <circle cx={CX} cy={CY} r={22} fill="#e5484d" stroke="#fff" strokeWidth={2} />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
          +{h.z}
        </text>

        {/* внутренние слои */}
        {h.shells.slice(0, outer).flatMap((n, k) =>
          Array.from({ length: n }, (_, j) => {
            const a = innerAngle(j, n, t, k)
            return <circle key={`${h.sym}-${k}-${j}`} cx={CX + R[k] * Math.cos(a)} cy={CY + R[k] * Math.sin(a)} r={6} fill={COLORS[k]} stroke="#fff" strokeWidth={1.2} />
          }),
        )}

        {/* внешний слой: 6 электронов, два из них неспаренные */}
        {FILLED.map((k) => {
          const p = pos(k)
          const unpaired = (k === 4 || k === 6) && !done
          return (
            <g key={`${h.sym}-o${k}`}>
              {unpaired && (
                <circle cx={p.x} cy={p.y} r={12} fill="#ffd54a" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1.4s ease-in-out infinite' }} />
              )}
              <circle cx={p.x} cy={p.y} r={7} fill={unpaired ? '#ffd54a' : COLORS[outer]} stroke="#fff" strokeWidth={1.5} />
            </g>
          )
        })}

        {/* свободные места и прилетающие электроны */}
        {FREE.map((k, n) => {
          const target = pos(k)
          const u = progress(n)
          if (!accepted) {
            return <circle key={`free-${k}`} cx={target.x} cy={target.y} r={8} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="3 3" style={{ opacity: 0.85 }} />
          }
          const e = ease(u)
          const s = STARTS[n]
          return (
            <g key={`in-${k}`}>
              {u < 1 && <circle cx={target.x} cy={target.y} r={8} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="3 3" style={{ opacity: 0.6 }} />}
              <circle cx={s.x + (target.x - s.x) * e} cy={s.y + (target.y - s.y) * e} r={7} fill="#ff6b8a" stroke="#fff" strokeWidth={1.5} />
              {u >= 1 && (
                <circle cx={target.x} cy={target.y} r={14} fill="none" stroke="#6ee7c4" strokeWidth={2} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'pop .5s ease-out both' }} />
              )}
            </g>
          )
        })}

        <text x={CX} y={310} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff" opacity={0.8}>
          {done ? 'внешний слой завершён: 8 электронов' : 'на внешнем слое 6 электронов: 2 пары и 2 неспаренных'}
        </text>
      </svg>

      <div className="mt-2 flex justify-center">
        {!accepted ? (
          <button onClick={() => setGot(t)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            ← Принять 2 электрона
          </button>
        ) : (
          <button onClick={() => setGot(null)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Вернуть
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 px-3 py-4 text-center text-2xl font-bold sm:text-3xl" aria-live="polite">
        {h.sym}⁰ + 2<span className="text-[#ff6b8a]">ē</span> <span className="text-orange">→</span>{' '}
        <span className="text-teal" style={{ opacity: done ? 1 : 0.35, transition: 'opacity .6s' }}>
          {h.sym}²⁻
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
        <Fact label="Слои (по электронам)" value={shellsLabel} />
        <Fact label="Заряд ядра" value={`+${h.z}`} />
        <Fact label="Электронов" value={`${h.z + arrivedCount}`} />
        <Fact label="Заряд частицы" value={arrivedCount === 0 ? '0' : `−${arrivedCount}`} />
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
        {done ? (
          <>
            Атом принял два электрона и стал <b>анионом {h.sym}²⁻</b> ({h.sym === 'O' ? 'оксид-ион' : 'сульфид-ион'}): заряд ядра не изменился, а электронов стало на два больше. Внешний слой завершён — как у {h.noble}. Такие ионы есть в {h.sym === 'O' ? 'оксидах металлов, например MgO, CaO' : 'сульфидах металлов, например Na₂S, FeS'}.
          </>
        ) : (
          <>
            До завершённого слоя из 8 электронов не хватает <b>двух</b> (два пунктирных «места»). Поэтому атомы {h.sym === 'O' ? 'кислорода' : 'серы'} стремятся <b>принять 2 электрона</b>: низшая степень окисления равна <b>−2</b>, а в реакциях с металлами и водородом они — <b>окислители</b>.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-white/60">Электроны вращаются по слоям; два неспаренных электрона внешнего слоя подсвечены жёлтым.</p>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}
