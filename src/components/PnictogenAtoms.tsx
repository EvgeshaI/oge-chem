import { useEffect, useState } from 'react'
import { PNICTOGENS } from '../lib/pnictogens'
import { SHELL_COLORS } from './ShellsSvg'

const COLORS = [...SHELL_COLORS, '#2f7fec']
const R = [36, 68, 100]
const CX = 170
const CY = 160
/** откуда прилетают 3 электрона */
const STARTS = [
  { x: 480, y: 90 },
  { x: 480, y: 160 },
  { x: 480, y: 230 },
]
const OMEGA = [0.9, -0.7, 0.55]
const FLY_S = 1.3
const DELAY_S = 0.4

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)

/** Угол «места» k на внешнем слое: 4 «пары мест» (0–1, 2–3, 4–5, 6–7) */
const outerAngle = (k: number, t: number, shell: number) =>
  -Math.PI / 2 + Math.floor(k / 2) * (Math.PI / 2) + (k % 2 ? 0.17 : -0.17) + OMEGA[shell] * t

const innerAngle = (k: number, n: number, t: number, shell: number) =>
  -Math.PI / 2 + shell * 0.5 + (2 * Math.PI * k) / n + OMEGA[shell] * t

/** Внешний слой: одна пара (места 0–1) и три неспаренных электрона (2, 4, 6); свободны места 3, 5, 7 */
const FILLED = [0, 1, 2, 4, 6]
const UNPAIRED = [2, 4, 6]
const FREE = [3, 5, 7]

type Mode = 'gain' | 'lose' | null

/** Атомы азота и фосфора: 5 внешних электронов. Принять 3 (→ −3) или условно отдать все 5 (→ +5). */
export default function PnictogenAtoms() {
  const [i, setI] = useState(0)
  const [mode, setMode] = useState<Mode>(null)
  const [t0, setT0] = useState(0)
  const [t, setT] = useState(0)
  const h = PNICTOGENS[i]
  const outer = h.shells.length - 1

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      setT((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const progress = (n: number) => (mode ? (reduced ? 1 : Math.min(1, Math.max(0, (t - t0 - n * DELAY_S) / FLY_S))) : 0)
  const count = mode === 'gain' ? 3 : mode === 'lose' ? 5 : 0
  const moved = mode ? Array.from({ length: count }, (_, n) => n).filter((n) => progress(n) >= 1).length : 0
  const done = mode !== null && moved === count

  const go = (m: Mode) => {
    setMode(m)
    setT0(t)
  }
  const pick = (k: number) => {
    setI(k)
    setMode(null)
  }

  const pos = (k: number) => {
    const a = outerAngle(k, t, outer)
    return { x: CX + R[outer] * Math.cos(a), y: CY + R[outer] * Math.sin(a) }
  }

  const outerNow = mode === 'gain' ? 5 + moved : mode === 'lose' ? 5 - moved : 5
  const shellsLabel = mode === 'lose' && done ? h.shells.slice(0, outer).join('·') : h.shells.map((n, k) => (k === outer ? outerNow : n)).join('·')
  const charge = mode === 'gain' ? -moved : mode === 'lose' ? moved : 0

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {PNICTOGENS.map((x, k) => (
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

      <svg viewBox="0 0 540 320" className="mx-auto mt-3 w-full max-w-[600px]" role="img" aria-label={`Атом ${h.gen}: электроны по слоям ${h.shells.join('·')}, на внешнем слое 5`}>
        {h.shells.map((_, k) => (
          <circle
            key={`${h.sym}-r${k}`}
            cx={CX}
            cy={CY}
            r={R[k]}
            fill="none"
            stroke={COLORS[k]}
            strokeWidth={k === outer ? 2.2 : 1.4}
            style={{ opacity: k === outer ? (mode === 'lose' && done ? 0.12 : 0.7) : 0.35, transition: 'opacity .6s' }}
          />
        ))}

        {/* стрелки: электроны прилетают (−3) или улетают (+5) */}
        {mode !== 'lose' && (
          <g style={{ opacity: mode === 'gain' ? 0.25 : 1, transition: 'opacity .6s' }}>
            {STARTS.map((s, n) => (
              <g key={n}>
                <path d={`M ${s.x + 30} ${s.y} H ${s.x - 70}`} stroke="#f5a623" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                <path d={`M ${s.x - 62} ${s.y - 6} L ${s.x - 72} ${s.y} L ${s.x - 62} ${s.y + 6}`} stroke="#f5a623" strokeWidth={2} fill="none" />
                {!mode && <circle cx={s.x} cy={s.y} r={7} fill="#ff6b8a" stroke="#fff" strokeWidth={1.5} />}
              </g>
            ))}
            <text x={480} y={268} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" opacity={0.85}>
              3 электрона
            </text>
          </g>
        )}

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

        {/* внешний слой: 5 электронов, три неспаренных */}
        {FILLED.map((k, n) => {
          const p = pos(k)
          const un = UNPAIRED.includes(k) && mode !== 'gain'
          if (mode === 'lose') {
            const u = ease(progress(n))
            const tx = 500
            const ty = 40 + n * 56
            if (progress(n) >= 1) return null
            return <circle key={`${h.sym}-o${k}`} cx={p.x + (tx - p.x) * u} cy={p.y + (ty - p.y) * u} r={7} fill={COLORS[outer]} stroke="#fff" strokeWidth={1.5} />
          }
          const lit = un && !(mode === 'gain' && done)
          return (
            <g key={`${h.sym}-o${k}`}>
              {lit && <circle cx={p.x} cy={p.y} r={12} fill="#ffd54a" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1.4s ease-in-out infinite' }} />}
              <circle cx={p.x} cy={p.y} r={7} fill={lit ? '#ffd54a' : COLORS[outer]} stroke="#fff" strokeWidth={1.5} />
            </g>
          )
        })}

        {/* свободные места и прилетающие электроны */}
        {mode !== 'lose' &&
          FREE.map((k, n) => {
            const target = pos(k)
            if (mode !== 'gain') {
              return <circle key={`free-${k}`} cx={target.x} cy={target.y} r={8} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="3 3" style={{ opacity: 0.85 }} />
            }
            const u = progress(n)
            const e = ease(u)
            const s = STARTS[n]
            return (
              <g key={`in-${k}`}>
                {u < 1 && <circle cx={target.x} cy={target.y} r={8} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="3 3" style={{ opacity: 0.6 }} />}
                <circle cx={s.x + (target.x - s.x) * e} cy={s.y + (target.y - s.y) * e} r={7} fill="#ff6b8a" stroke="#fff" strokeWidth={1.5} />
                {u >= 1 && <circle cx={target.x} cy={target.y} r={14} fill="none" stroke="#6ee7c4" strokeWidth={2} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'pop .5s ease-out both' }} />}
              </g>
            )
          })}

        <text x={CX} y={310} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff" opacity={0.8}>
          {mode === 'gain' && done
            ? 'внешний слой завершён: 8 электронов'
            : mode === 'lose' && done
              ? 'все 5 внешних электронов ушли'
              : 'на внешнем слое 5 электронов: 1 пара и 3 неспаренных'}
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button onClick={() => go('gain')} aria-pressed={mode === 'gain'} className={`rounded-lg px-4 py-2 font-bold transition ${mode === 'gain' ? 'bg-teal text-navy' : 'bg-orange text-navy hover:brightness-110'}`}>
          ← Принять 3 электрона
        </button>
        <button onClick={() => go('lose')} aria-pressed={mode === 'lose'} className={`rounded-lg px-4 py-2 font-bold transition ${mode === 'lose' ? 'bg-teal text-navy' : 'bg-white/15 hover:bg-white/25'}`}>
          Отдать 5 электронов →
        </button>
        {mode && (
          <button onClick={() => setMode(null)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Вернуть
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 px-3 py-4 text-center text-2xl font-bold sm:text-3xl" aria-live="polite">
        {mode === 'lose' ? (
          <>
            {h.sym}⁰ − 5<span className="text-[#6ec1ff]">ē</span> <span className="text-orange">→</span>{' '}
            <span className="text-teal" style={{ opacity: done ? 1 : 0.35, transition: 'opacity .6s' }}>
              {h.sym}⁺⁵
            </span>
          </>
        ) : (
          <>
            {h.sym}⁰ + 3<span className="text-[#ff6b8a]">ē</span> <span className="text-orange">→</span>{' '}
            <span className="text-teal" style={{ opacity: mode === 'gain' && done ? 1 : 0.35, transition: 'opacity .6s' }}>
              {h.sym}⁻³
            </span>
          </>
        )}
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
        <Fact label="Слои (по электронам)" value={shellsLabel} />
        <Fact label="Заряд ядра" value={`+${h.z}`} />
        <Fact label="Электронов" value={`${h.z - charge}`} />
        <Fact label="Степень окисления" value={charge === 0 ? '0' : charge > 0 ? `+${charge}` : `−${-charge}`} />
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
        {mode === 'gain' && done ? (
          <>
            Атом принял три электрона: внешний слой завершён, как у {h.noble}. Это низшая степень окисления <b>−3</b> — такой {h.sym === 'N' ? 'азот' : 'фосфор'} в {h.ionExamples} и в {h.sym === 'N' ? 'аммиаке NH₃' : 'фосфине PH₃'}. Принимая электроны, {h.sym === 'N' ? 'азот' : 'фосфор'} — <b>окислитель</b>.
          </>
        ) : mode === 'lose' && done ? (
          <>
            Все 5 внешних электронов «ушли» к более электроотрицательным атомам. Это высшая степень окисления <b>+5</b> = номер группы: {h.plus5}. Отдавая электроны, {h.sym === 'N' ? 'азот' : 'фосфор'} — <b>восстановитель</b>. Ион {h.sym}⁵⁺ на самом деле не образуется: +5 — условный заряд в молекуле.
          </>
        ) : (
          <>
            До восьми не хватает <b>трёх</b> электронов (три пунктирных «места»), а отдать можно все <b>пять</b>. Поэтому степени окисления {h.gen} лежат между <b>−3</b> и <b>+5</b>: с металлами и водородом он принимает электроны, с кислородом и хлором — отдаёт.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-white/60">Электроны вращаются по слоям; три неспаренных электрона внешнего слоя подсвечены жёлтым.</p>
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
