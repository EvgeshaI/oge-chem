import { useEffect, useState } from 'react'
import { HALOGENS as ALL_HALOGENS, sub } from '../lib/halogens'
import { SHELL_COLORS } from './ShellsSvg'

// иод не показываем: атом слишком большой, принцип понятен и по F, Cl, Br
const HALOGENS = ALL_HALOGENS.filter((x) => x.sym !== 'I')

const COLORS = [...SHELL_COLORS, '#2f7fec']
const R = [34, 62, 90, 118, 146]
const CX = 170
const CY = 160
const START = { x: 470, y: 160 }
const OMEGA = [0.9, -0.7, 0.55, -0.4, 0.3]
const ARRIVE_S = 1.3

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)

/** Угол «места» k на внешнем слое: 4 пары (0–1, 2–3, 4–5, 6–7) */
const outerAngle = (k: number, t: number, shell: number) =>
  -Math.PI / 2 + Math.floor(k / 2) * (Math.PI / 2) + (k % 2 ? 0.17 : -0.17) + OMEGA[shell] * t

const innerAngle = (k: number, n: number, t: number, shell: number) =>
  -Math.PI / 2 + shell * 0.5 + (2 * Math.PI * k) / n + OMEGA[shell] * t

/** Атом галогена: 7 внешних электронов, одно «пустое место», присоединение электрона → анион */
export default function HalogenAtoms() {
  const [i, setI] = useState(1)
  const [got, setGot] = useState<number | null>(null) // момент прилёта (с)
  const [t, setT] = useState(0)
  const h = HALOGENS[i]
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

  const pick = (k: number) => {
    setI(k)
    setGot(null)
  }
  const accepted = got !== null
  const u = accepted ? Math.min(1, (t - got) / ARRIVE_S) : 0

  const eNew = outerAngle(7, t, outer)
  const target = { x: CX + R[outer] * Math.cos(eNew), y: CY + R[outer] * Math.sin(eNew) }
  const arrive = accepted ? ease(Math.max(0, u)) : 0
  const flying = { x: START.x + (target.x - START.x) * arrive, y: START.y + (target.y - START.y) * arrive }

  const shellsLabel = (extra: boolean) => h.shells.map((n, k) => (k === outer && extra ? n + 1 : n)).join('·')

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {HALOGENS.map((x, k) => (
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

      <svg viewBox="0 0 520 320" className="mx-auto mt-3 w-full max-w-[600px]" role="img" aria-label={`Атом ${h.gen}: электроны по слоям ${h.shells.join('·')}, на внешнем слое 7`}>
        {h.shells.map((_, k) => (
          <circle key={`${h.sym}-r${k}`} cx={CX} cy={CY} r={R[k]} fill="none" stroke={COLORS[k]} strokeWidth={k === outer ? 2.2 : 1.4} style={{ opacity: k === outer ? 0.7 : 0.35 }} />
        ))}

        {/* стрелка и подпись */}
        <g style={{ opacity: accepted ? 0.25 : 1, transition: 'opacity .6s' }}>
          <path d="M 500 160 H 400" stroke="#f5a623" strokeWidth={2} strokeDasharray="5 5" fill="none" />
          <path d="M 408 154 L 398 160 L 408 166" stroke="#f5a623" strokeWidth={2} fill="none" />
          <text x={450} y={130} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" opacity={0.85}>
            электрон
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

        {/* внешний слой: 7 электронов + пустое место */}
        {Array.from({ length: 7 }, (_, k) => {
          const a = outerAngle(k, t, outer)
          const unpaired = k === 6
          return (
            <g key={`${h.sym}-o${k}`}>
              {unpaired && !accepted && (
                <circle cx={CX + R[outer] * Math.cos(a)} cy={CY + R[outer] * Math.sin(a)} r={12} fill="#ffd54a" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1.4s ease-in-out infinite' }} />
              )}
              <circle cx={CX + R[outer] * Math.cos(a)} cy={CY + R[outer] * Math.sin(a)} r={7} fill={unpaired && !accepted ? '#ffd54a' : COLORS[outer]} stroke="#fff" strokeWidth={1.5} />
            </g>
          )
        })}
        {!accepted && (
          <circle
            cx={target.x}
            cy={target.y}
            r={8}
            fill="none"
            stroke="#fff"
            strokeWidth={1.6}
            strokeDasharray="3 3"
            style={{ opacity: 0.85 }}
          />
        )}
        {accepted && <circle cx={flying.x} cy={flying.y} r={7} fill="#ff6b8a" stroke="#fff" strokeWidth={1.5} />}
        {accepted && u >= 1 && (
          <circle cx={target.x} cy={target.y} r={14} fill="none" stroke="#6ee7c4" strokeWidth={2} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'pop .5s ease-out both' }} />
        )}

        <text x={CX} y={310} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff" opacity={0.8}>
          {accepted && u >= 1 ? 'внешний слой завершён: 8 электронов' : 'на внешнем слое 7 электронов: 3 пары и 1 неспаренный'}
        </text>
      </svg>

      <div className="mt-2 flex justify-center">
        {!accepted ? (
          <button onClick={() => setGot(t)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            ← Принять электрон
          </button>
        ) : (
          <button onClick={() => setGot(null)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Вернуть
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 px-3 py-4 text-center text-2xl font-bold sm:text-3xl" aria-live="polite">
        {h.sym}⁰ + 1<span className="text-[#ff6b8a]">ē</span> <span className="text-orange">→</span>{' '}
        <span className="text-teal" style={{ opacity: accepted && u >= 1 ? 1 : 0.35, transition: 'opacity .6s' }}>
          {h.sym}⁻
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
        <Fact label="Слои (по электронам)" value={`${shellsLabel(accepted && u >= 1)}`} />
        <Fact label="Заряд ядра" value={`+${h.z}`} />
        <Fact label="Электронов" value={`${h.z + (accepted && u >= 1 ? 1 : 0)}`} />
        <Fact label="Заряд частицы" value={accepted && u >= 1 ? '−1' : '0'} />
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
        {accepted && u >= 1 ? (
          <>
            Атом принял электрон и стал <b>анионом {h.sym}⁻</b>: заряд ядра не изменился, а электронов стало на один больше. Внешний слой завершён — {h.shells.length === 2 ? 'как у неона' : h.shells.length === 3 ? 'как у аргона' : h.shells.length === 4 ? 'как у криптона' : 'как у ксенона'}. Радиус аниона больше радиуса атома: электроны сильнее отталкиваются.
          </>
        ) : (
          <>
            До завершённого слоя из 8 электронов не хватает <b>одного</b> (пунктирное «место»). Поэтому у всех галогенов сильная тяга <b>принять электрон</b> — они сильные окислители, а низшая степень окисления равна <b>−1</b>.
            {!h.oge && <> <span className="text-white/60">(Строение атомов {h.gen} за пределами ОГЭ — оно показано, чтобы увидеть закономерность в группе.)</span></>}
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-white/60">Молекула — {sub(h.sym + '2')}. Электроны вращаются по слоям; 7 внешних подсвечены цветом внешнего слоя.</p>
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
