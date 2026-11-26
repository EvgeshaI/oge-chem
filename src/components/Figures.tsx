import type { ParticleKind } from '../content/types'

const C = { O: '#e5484d', H: '#2f7fec', C: '#3a4056', Fe: '#9aa3b8' }

/** Детерминированный генератор, чтобы схема не «прыгала» при каждой отрисовке */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

function Molecule({ kind, x, y, rot }: { kind: ParticleKind; x: number; y: number; rot: number }) {
  const atoms: [number, number, number, string][] = {
    O2: [[-4.5, 0, 6, C.O], [4.5, 0, 6, C.O]],
    H2: [[-3.5, 0, 4, C.H], [3.5, 0, 4, C.H]],
    H2O: [[0, 0, 6, C.O], [-8, 6, 4, C.H], [8, 6, 4, C.H]],
    CO2: [[-11, 0, 6, C.O], [0, 0, 6.5, C.C], [11, 0, 6, C.O]],
    Fe: [[0, 0, 6, C.Fe]],
  }[kind] as [number, number, number, string][]
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {atoms.map(([ax, ay, r, col], i) => (
        <circle key={i} cx={ax} cy={ay} r={r} fill={col} stroke="#fff" strokeWidth={0.8} />
      ))}
    </g>
  )
}

/** Модель вещества: цветные шарики — атомы; слипшиеся — молекула */
export function ParticleModel({
  particles, seed = 1,
}: {
  particles: { kind: ParticleKind; count: number }[]
  seed?: number
}) {
  const list = particles.flatMap((p) => Array.from({ length: p.count }, () => p.kind))
  const r = rng(seed * 7919)
  // сетка с небольшим смещением; смешиваем порядок
  const cols = list.some((k) => k === 'Fe') ? 7 : 3
  const rows = Math.ceil(list.length / cols)
  const order = list.map((k, i) => ({ k, key: r() + i * 0 })).sort((a, b) => a.key - b.key)
  const w = 160, h = 140
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-lg border-2 border-navy/15 bg-white" role="img" aria-label="Модель вещества">
      {order.map(({ k }, i) => {
        const cx = (w / cols) * ((i % cols) + 0.5) + (k === 'Fe' ? (Math.floor(i / cols) % 2 ? 6 : -2) : (r() - 0.5) * 12)
        const cy = (h / rows) * (Math.floor(i / cols) + 0.5) + (k === 'Fe' ? 0 : (r() - 0.5) * 10)
        return <Molecule key={i} kind={k} x={cx} y={cy} rot={k === 'Fe' ? 0 : Math.floor(r() * 360)} />
      })}
    </svg>
  )
}

/** Схема атома бора для задания «подпишите части атома»: 5 p⁺, 6 n⁰, оболочки 2 и 3 */
export function AtomBoron() {
  const nuc: [number, number, string][] = [
    [-9, -9, '#e5484d'], [7, -11, '#8a91a3'], [-12, 4, '#8a91a3'], [3, 0, '#e5484d'], [14, 2, '#e5484d'],
    [-3, 12, '#e5484d'], [9, 14, '#8a91a3'], [-14, -2, '#e5484d'], [0, -4, '#8a91a3'], [4, 9, '#8a91a3'], [-6, 5, '#8a91a3'],
  ]
  // электроны строго на своих орбитах: x = R·cos a, y = R·sin a (один и тот же угол)
  const e1 = [330, 150].map((a) => [Math.cos((a * Math.PI) / 180) * 55, Math.sin((a * Math.PI) / 180) * 55])
  const e2 = [90, 210, 330].map((a) => [Math.cos((a * Math.PI) / 180) * 95, Math.sin((a * Math.PI) / 180) * 95])
  const num = (x: number, y: number, n: number) => (
    <g>
      <circle cx={x} cy={y} r={11} fill="#fff" stroke="#f5a623" strokeWidth={2} />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#b8740a">{n}</text>
    </g>
  )
  return (
    <svg viewBox="-160 -135 320 270" className="mx-auto w-full max-w-[380px]" role="img" aria-label="Схема атома: ядро из протонов и нейтронов, два электронных слоя">
      <circle r={95} fill="none" stroke="#b9c1e0" strokeWidth={1.5} />
      <circle r={55} fill="none" stroke="#b9c1e0" strokeWidth={1.5} />
      <circle r={44} fill="#fdeeee" stroke="#f3c4c4" />
      {nuc.map(([x, y, c], i) => <circle key={i} cx={x * 1.5} cy={y * 1.5} r={9} fill={c} stroke="#fff" strokeWidth={1.2} />)}
      {[...e1, ...e2].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill="#2f7fec" stroke="#fff" strokeWidth={1} />)}
      {/* выноски: 1 протон, 2 нейтрон, 3 ядро, 4 электрон, 5 внешний слой */}
      <g stroke="#f5a623" strokeWidth={1.5} fill="none">
        <line x1={-14} y1={-14} x2={-120} y2={-100} />
        <line x1={10} y1={-16} x2={120} y2={-105} />
        <line x1={30} y1={20} x2={135} y2={20} />
        <line x1={-52} y1={31} x2={-135} y2={95} />
        <line x1={67} y1={67} x2={115} y2={105} />
      </g>
      {/* точка-«остриё» выноски 3 — внутри ядра, чтобы было ясно, что указывается всё ядро */}
      <circle cx={30} cy={20} r={3.5} fill="#f5a623" stroke="#fff" strokeWidth={1} />
      {num(-120, -100, 1)}
      {num(120, -105, 2)}
      {num(135, 20, 3)}
      {num(-135, 95, 4)}
      {num(115, 105, 5)}
    </svg>
  )
}

/** Электронная схема для задания: ядро + n дуг, подписи отдельно */
export function SchemeArcs({ layers, filled }: { layers: number; filled?: number[] }) {
  // ширина растёт с числом слоёв, чтобы последние дуги не обрезались (Br — 4 слоя, I — 5)
  const w = Math.max(170, 62 + (layers - 1) * 26 + 24)
  return (
    <svg viewBox={`0 0 ${w} 90`} className="w-full" style={{ maxWidth: (200 * w) / 170 }} role="img" aria-label={`Схема атома: ${layers} электронных слоя`}>
      <circle cx={30} cy={45} r={20} fill="#dcebff" stroke="#2f7fec" strokeWidth={2} />
      <text x={30} y={50} textAnchor="middle" fontSize={12} fontWeight={700} fill="#2f7fec">+</text>
      {Array.from({ length: layers }, (_, i) => {
        const x = 62 + i * 26
        return (
          <g key={i}>
            <path d={`M${x} 12 Q${x + 13} 45 ${x} 78`} fill="none" stroke="#1f2433" strokeWidth={2} />
            {filled && <text x={x + 5} y={92 - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1f2433">{filled[i]}</text>}
          </g>
        )
      })}
    </svg>
  )
}
