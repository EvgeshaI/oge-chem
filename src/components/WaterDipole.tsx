import { useState } from 'react'

const RED = '#e5484d'
const BLUE = '#2f7fec'

/* ---------------------------------------------------------------- диполь */

const DIPOLE_STEPS = [
  {
    title: '1. Молекула воды',
    text: 'Атом кислорода связан с двумя атомами водорода общими электронными парами. Молекула уголковая: угол между связями около 105°.',
  },
  {
    title: '2. Электроны смещаются',
    text: 'Кислород электроотрицательнее водорода, поэтому он сильнее притягивает общие электронные пары. Связь O–H ковалентная **полярная**.',
  },
  {
    title: '3. Появляются полюса',
    text: 'У кислорода избыток электронной плотности: частичный заряд **δ−**. У водорода её недостаёт: частичный заряд **δ+**. Молекула с двумя полюсами называется **диполем**.',
  },
]

const O: [number, number] = [320, 90]
const H1: [number, number] = [248, 148]
const H2: [number, number] = [392, 148]
const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

function bold(t: string) {
  return t.split('**').map((p, i) => (i % 2 ? <b key={i} className="text-orange">{p}</b> : p))
}

export function DipoleDemo() {
  const [st, setSt] = useState(0)
  // электронная пара: в середине связи, а при смещении ближе к O
  const t = st === 0 ? 0.5 : 0.28
  const p1 = lerp(O, H1, t)
  const p2 = lerp(O, H2, t)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <svg viewBox="0 0 640 230" className="w-full" role="img" aria-label="Молекула воды как диполь">
        <line x1={O[0]} y1={O[1]} x2={H1[0]} y2={H1[1]} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
        <line x1={O[0]} y1={O[1]} x2={H2[0]} y2={H2[1]} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />

        {/* электронные пары */}
        {[p1, p2].map((p, k) => (
          <g key={k} style={{ transform: `translate(${p[0]}px, ${p[1]}px)`, transition: 'transform .9s ease-in-out' }}>
            <circle cx={-5} r={4.5} fill="#f5d94a" />
            <circle cx={5} r={4.5} fill="#f5d94a" />
          </g>
        ))}

        {st >= 1 && (
          <g fill="none" stroke="#f5d94a" strokeWidth={2.5} strokeLinecap="round">
            <path d="M 262 140 L 292 107" markerEnd="url(#arr)" style={{ animation: 'fade-up .6s ease-out both' }} />
            <path d="M 378 140 L 348 107" markerEnd="url(#arr)" style={{ animation: 'fade-up .6s ease-out both' }} />
          </g>
        )}
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f5d94a" />
          </marker>
        </defs>

        <circle cx={O[0]} cy={O[1]} r={32} fill={RED} />
        <text x={O[0]} y={O[1] + 7} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff">O</text>
        {[H1, H2].map((h, k) => (
          <g key={k}>
            <circle cx={h[0]} cy={h[1]} r={20} fill="#e9edf8" />
            <text x={h[0]} y={h[1] + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill="#1b2445">H</text>
          </g>
        ))}

        {st >= 2 && (
          <g style={{ animation: 'fade-up .6s ease-out both' }}>
            <text x={O[0]} y={O[1] - 42} textAnchor="middle" fontSize={22} fontWeight={800} fill="#ff8a8e">δ−</text>
            <text x={H1[0] - 34} y={H1[1] + 8} textAnchor="middle" fontSize={22} fontWeight={800} fill="#7fb3ff">δ+</text>
            <text x={H2[0] + 34} y={H2[1] + 8} textAnchor="middle" fontSize={22} fontWeight={800} fill="#7fb3ff">δ+</text>

            {/* модель диполя */}
            <g transform="translate(540 30)">
              <rect x={-24} y={0} width={48} height={64} rx={24} fill={RED} />
              <rect x={-24} y={64} width={48} height={64} rx={24} fill={BLUE} />
              <rect x={-24} y={44} width={48} height={40} fill="#7d6a9b" />
              <text y={42} textAnchor="middle" fontSize={26} fontWeight={800} fill="#fff">−</text>
              <text y={112} textAnchor="middle" fontSize={26} fontWeight={800} fill="#fff">+</text>
              <text y={152} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">диполь</text>
              <text y={170} textAnchor="middle" fontSize={12} fill="#ffffffb0">два полюса</text>
            </g>
          </g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {DIPOLE_STEPS.map((s, k) => (
          <button
            key={k}
            onClick={() => setSt(k)}
            aria-pressed={k === st}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === st ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-white/90" aria-live="polite">
        {bold(DIPOLE_STEPS[st].text)}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ гидратация */

interface IonSpec {
  label: string
  after?: string
  sign: 1 | -1
  r: number
  at: [number, number]
  u: [number, number]
}

const CX = 320
const CY = 160
const G = 40

function crystal(): IonSpec[] {
  const out: IonSpec[] = []
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const cation = (dx + dy + 2) % 2 === 0
      const len = Math.hypot(dx, dy)
      out.push({
        label: cation ? 'Na⁺' : 'Cl⁻',
        sign: cation ? 1 : -1,
        r: cation ? 16 : 19,
        at: [dx * G, dy * G],
        u: len ? [dx / len, dy / len] : [0, 0],
      })
    }
  return out
}

const NACL = crystal()
const HCL: IonSpec[] = [
  { label: 'H', after: 'H⁺', sign: 1, r: 11, at: [-15, 0], u: [-1, 0] },
  { label: 'Cl', after: 'Cl⁻', sign: -1, r: 17, at: [18, 0], u: [1, 0] },
]

const rot = (u: [number, number], deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [u[0] * Math.cos(a) - u[1] * Math.sin(a), u[0] * Math.sin(a) + u[1] * Math.cos(a)]
}

interface W {
  ion: number
  rotDeg: number
  v: [number, number]
  /** где молекула воды стоит около иона (единичный вектор от иона) */
  dir: [number, number]
}

function watersOf(ions: IonSpec[]): W[] {
  const ws: W[] = []
  ions.forEach((ion, i) => {
    if (!ion.u[0] && !ion.u[1]) return
    // у «краевых» ионов кристалла — одна молекула воды, у угловых и у HCl — две
    const edge = Math.abs(ion.u[0]) === 1 || Math.abs(ion.u[1]) === 1
    const one = ions.length > 2 && edge
    for (const sgn of one ? [0] : [-1, 1]) {
      const dir = rot(ion.u, sgn * 40)
      // катион: к иону обращён кислород (H смотрит наружу); анион: к иону обращены атомы H
      const v: [number, number] = ion.sign === 1 ? dir : [-dir[0], -dir[1]]
      ws.push({ ion: i, v, dir, rotDeg: (Math.atan2(-v[0], v[1]) * 180) / Math.PI })
    }
  })
  return ws
}

const STAGES = {
  nacl: [
    'Кристалл NaCl опущен в воду. Молекулы воды (диполи) движутся хаотично.',
    'Диполи поворачиваются: к катиону Na⁺ — отрицательным полюсом (кислородом), к аниону Cl⁻ — положительным (водородом).',
    'Притяжение диполей воды ослабляет связь между ионами. Ионы отрываются от кристалла и уходят в раствор, окружённые молекулами воды. Это **гидратация**.',
  ],
  hcl: [
    'Молекула HCl полярная: у водорода δ+, у хлора δ−. Вокруг — хаотично движущиеся молекулы воды.',
    'Диполи воды поворачиваются: к водороду — кислородом (δ−), к хлору — водородом (δ+).',
    'Диполи воды «растягивают» молекулу, ковалентная связь рвётся: образуются гидратированные ионы H⁺ и Cl⁻.',
  ],
} as const

export function HydrationDemo() {
  const [sub, setSub] = useState<'nacl' | 'hcl'>('nacl')
  const [st, setSt] = useState(0)
  const ions = sub === 'nacl' ? NACL : HCL
  const waters = watersOf(ions)
  const spread = 1.75

  const ionPos = (ion: IonSpec): [number, number] =>
    st < 2 ? ion.at : [ion.at[0] * (sub === 'nacl' ? spread : 1) + ion.u[0] * (sub === 'nacl' ? 0 : 52), ion.at[1] * (sub === 'nacl' ? spread : 1) + ion.u[1] * (sub === 'nacl' ? 0 : 52)]

  const switchSub = (s: 'nacl' | 'hcl') => {
    setSub(s)
    setSt(0)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => switchSub('nacl')} aria-pressed={sub === 'nacl'} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${sub === 'nacl' ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
          Соль NaCl (ионный кристалл)
        </button>
        <button onClick={() => switchSub('hcl')} aria-pressed={sub === 'hcl'} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${sub === 'hcl' ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
          Кислота HCl (полярная молекула)
        </button>
      </div>

      <svg viewBox="0 0 640 320" className="mt-3 w-full" role="img" aria-label="Ориентация диполей воды вокруг ионов">
        <rect x={20} y={10} width={600} height={300} rx={20} fill="rgba(140,190,255,.1)" />

        {/* ковалентная связь HCl */}
        {sub === 'hcl' && (
          <line x1={CX + ions[0].at[0]} y1={CY} x2={CX + ions[1].at[0]} y2={CY} stroke="#fff" strokeWidth={5} strokeOpacity={st < 2 ? 0.8 : 0} style={{ transition: 'stroke-opacity .5s' }} />
        )}

        {/* молекулы воды */}
        {waters.map((w, k) => {
          const ion = ions[w.ion]
          const [ix, iy] = ionPos(ion)
          const dist = ion.r + 32
          const near: [number, number] = [CX + ix + w.dir[0] * dist, CY + iy + w.dir[1] * dist]
          const ang = k * 2.4
          const far: [number, number] = [CX + Math.cos(ang) * (110 + (k % 3) * 24) * 1.25, CY + Math.sin(ang) * (82 + (k % 3) * 16)]
          const p = st === 0 ? far : near
          const r = st === 0 ? (k * 53) % 360 : w.rotDeg
          return (
            <g key={`${sub}-${k}`} style={{ transform: `translate(${p[0]}px, ${p[1]}px) rotate(${r}deg) scale(1.4)`, transition: 'transform 1.2s ease-in-out' }}>
              <line x1={0} y1={0} x2={-11} y2={9} stroke="#ffffff90" strokeWidth={2} />
              <line x1={0} y1={0} x2={11} y2={9} stroke="#ffffff90" strokeWidth={2} />
              <circle cx={-11} cy={9} r={5} fill="#e9edf8" />
              <circle cx={11} cy={9} r={5} fill="#e9edf8" />
              <circle r={9} fill={RED} />
            </g>
          )
        })}

        {/* ионы */}
        {ions.map((ion, i) => {
          const [x, y] = ionPos(ion)
          const label = st >= 2 && ion.after ? ion.after : ion.label
          return (
            <g key={`${sub}-i${i}`} style={{ transform: `translate(${CX + x}px, ${CY + y}px)`, transition: 'transform 1.4s ease-in-out' }}>
              <circle r={ion.r} fill={ion.sign === 1 ? BLUE : RED} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} />
              <text y={4.5} textAnchor="middle" fontSize={sub === 'nacl' ? 13 : 14} fontWeight={800} fill="#fff">{label}</text>
            </g>
          )
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {['Диполи воды рядом', 'Диполи ориентируются', 'Ионы уходят в раствор'].map((t, k) => (
          <button
            key={k}
            onClick={() => setSt(k)}
            aria-pressed={k === st}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === st ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {k + 1}. {t}
          </button>
        ))}
        {st < 2 && (
          <button onClick={() => setSt(st + 1)} className="rounded-lg bg-teal px-4 py-1.5 text-sm font-bold text-white transition hover:brightness-110">Дальше →</button>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-white/90" aria-live="polite">
        {bold(STAGES[sub][st])}
      </div>

      <div className="mt-3 space-y-1.5 rounded-xl bg-white/5 p-3 text-sm text-white/85">
        <div className="flex items-start gap-2">
          <i className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-[#e9edf8]" />
          <span>
            <b>Белые кружки</b> — атомы водорода воды, они заряжены положительно (δ+), поэтому притягиваются к отрицательно заряженной части: к аниону (например, Cl⁻).
          </span>
        </div>
        <div className="flex items-start gap-2">
          <i className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: RED }} />
          <span>
            <b>Красные кружки</b> — атомы кислорода воды, они заряжены отрицательно (δ−), поэтому притягиваются к положительно заряженной части: к катиону (например, Na⁺ или H⁺).
          </span>
        </div>
      </div>
    </div>
  )
}
