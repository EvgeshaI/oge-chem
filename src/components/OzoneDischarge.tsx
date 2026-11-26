import { useEffect, useRef, useState } from 'react'
import { tex } from './RichText'

type Phase = 'o2' | 'flash' | 'atoms' | 'o3'

interface P {
  x: number
  y: number
}

/** Центры молекул O₂ в «колбе» */
const MOL: P[] = [
  { x: 100, y: 78 },
  { x: 235, y: 70 },
  { x: 370, y: 82 },
  { x: 110, y: 186 },
  { x: 250, y: 192 },
  { x: 390, y: 180 },
]
const D = 15 // половина длины молекулы O₂

/** Где окажутся атомы трёх верхних молекул: две молекулы озона (уголком) */
const O3_CENTERS: P[] = [
  { x: 150, y: 86 },
  { x: 320, y: 86 },
]
const o3 = (c: P, k: 0 | 1 | 2): P => (k === 1 ? { x: c.x, y: c.y - 12 } : { x: c.x + (k === 0 ? -25 : 25), y: c.y + 12 })

/** Разлетевшиеся атомы (между двумя этапами) */
const ATOMS_SPLIT: P[] = [
  { x: 70, y: 60 },
  { x: 140, y: 112 },
  { x: 205, y: 46 },
  { x: 262, y: 108 },
  { x: 345, y: 50 },
  { x: 410, y: 108 },
]

function atomPos(phase: Phase, mol: number, side: 0 | 1): P {
  const top = mol < 3
  if (!top || phase === 'o2' || phase === 'flash') {
    const c = MOL[mol]
    return { x: c.x + (side ? D : -D), y: c.y }
  }
  const idx = mol * 2 + side // 0…5
  if (phase === 'atoms') return ATOMS_SPLIT[idx]
  // o3: атомы 0,1,2 → первая молекула; 3,4,5 → вторая
  const c = O3_CENTERS[idx < 3 ? 0 : 1]
  return o3(c, (idx % 3) as 0 | 1 | 2)
}

/** Электрический разряд превращает часть кислорода в озон: 3O₂ → 2O₃ */
export default function OzoneDischarge() {
  const [phase, setPhase] = useState<Phase>('o2')
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const run = () => {
    timers.current.forEach(clearTimeout)
    setPhase('flash')
    timers.current = [window.setTimeout(() => setPhase('atoms'), 700), window.setTimeout(() => setPhase('o3'), 1700)]
  }
  const back = () => {
    timers.current.forEach(clearTimeout)
    setPhase('atoms')
    timers.current = [window.setTimeout(() => setPhase('o2'), 900)]
  }

  const o3made = phase === 'o3'
  /** связи: [ключ, начало, конец, задержка появления] — у молекул, которые не двигаются, ключ постоянный */
  const bonds: [string, P, P, number][] = []
  for (let m = 0; m < 6; m++) {
    const top = m < 3
    if (!top || phase === 'o2' || phase === 'flash') bonds.push([top ? `t${m}` : `m${m}`, atomPos(phase, m, 0), atomPos(phase, m, 1), top ? 0.8 : 0])
  }
  if (o3made)
    O3_CENTERS.forEach((c, n) => {
      bonds.push([`o3-${n}a`, o3(c, 0), o3(c, 1), 0.8], [`o3-${n}b`, o3(c, 1), o3(c, 2), 0.8])
    })

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">
        Кислород и озон образованы одним элементом — это <b>аллотропные модификации</b>. Нажмите «Разряд»: так озон образуется во время грозы и в озонаторах.
      </p>

      <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <svg viewBox="0 0 480 260" className="w-full rounded-xl" role="img" aria-label="Молекулы кислорода в сосуде; при электрическом разряде часть из них превращается в молекулы озона">
          <rect x={20} y={20} width={440} height={220} rx={22} fill={o3made ? 'rgba(120,170,255,0.16)' : 'rgba(255,255,255,0.05)'} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} style={{ transition: 'fill 1.2s' }} />
          {/* электроды */}
          <rect x={6} y={110} width={18} height={40} rx={4} fill="#9aa3b8" />
          <rect x={456} y={110} width={18} height={40} rx={4} fill="#9aa3b8" />
          {phase === 'flash' && (
            <polyline
              points="24,130 90,118 130,146 190,112 240,150 300,116 350,148 410,120 456,130"
              fill="none"
              stroke="#fff6a8"
              strokeWidth={4}
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px #fff6a8)', animation: 'pop .35s ease-out both' }}
            />
          )}
          {bonds.map(([key, a, b, delay]) => (
            <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffd0d0" strokeWidth={6} strokeLinecap="round" style={{ animation: `fade-up .5s ease-out ${delay}s both` }} />
          ))}
          {MOL.flatMap((_, m) =>
            ([0, 1] as const).map((side) => {
              const p = atomPos(phase, m, side)
              const inO3 = o3made && m < 3
              return (
                <g key={`${m}-${side}`} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform .9s cubic-bezier(.4,.1,.2,1)' }}>
                  <circle r={15} fill={inO3 ? '#7fb2ff' : '#ff8a8a'} stroke="#fff" strokeWidth={1.6} style={{ transition: 'fill .8s' }} />
                  <text y={5} textAnchor="middle" fontSize={13} fontWeight={800} fill={inO3 ? '#0f2350' : '#4a0f14'}>
                    O
                  </text>
                </g>
              )
            }),
          )}
          {o3made && (
            <g fontSize={12} fontWeight={700} fill="#bcd6ff" textAnchor="middle" style={{ animation: 'fade-up .6s ease-out both' }}>
              <text x={150} y={128}>O₃</text>
              <text x={320} y={128}>O₃</text>
            </g>
          )}
          <text x={240} y={254} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.7}>
            {phase === 'o2' ? 'шесть молекул O₂' : phase === 'flash' ? 'электрический разряд' : phase === 'atoms' ? 'часть молекул распалась на атомы' : 'три O₂ превратились в две O₃'}
          </text>
        </svg>

        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            <button onClick={run} disabled={phase !== 'o2'} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110 disabled:opacity-40">
              ⚡ Разряд
            </button>
            <button onClick={back} disabled={phase !== 'o3'} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20 disabled:opacity-40">
              ↺ Озон распадается
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-lg" dangerouslySetInnerHTML={{ __html: tex('\\ce{3O2 <=>[{разряд}] 2O3}', true) }} />
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/10 p-2">
              <div className="font-bold text-[#ff9d9d]">O₂ · кислород</div>
              <div className="text-white/80">2 атома в молекуле, без цвета и запаха</div>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <div className="font-bold text-[#9cc2ff]">O₃ · озон</div>
              <div className="text-white/80">3 атома, голубой, резкий запах «свежести»</div>
            </div>
          </div>
          <p className="text-white/70">Озон неустойчив и постепенно снова превращается в кислород — поэтому реакция обратима (⇄).</p>
        </div>
      </div>
    </div>
  )
}
