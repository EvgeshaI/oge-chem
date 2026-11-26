import { useEffect, useRef, useState } from 'react'
import { tex } from './RichText'

interface Stage {
  title: string
  temp: string
  /** цвет серы в пробирке */
  color: string
  /** уровень серы в пробирке, 0…1 */
  level: number
  /** твёрдые кристаллы или жидкость */
  solid?: boolean
  flame: boolean
  /** в стакане с водой (пластическая сера) */
  inWater?: boolean
  /** что на «молекулярном» уровне */
  micro: 'rings' | 'rings-move' | 'chains' | 'tangle' | 'rings-back'
  text: string
}

const STAGES: Stage[] = [
  {
    title: 'Ромбическая сера',
    temp: '20 °C',
    color: '#f7d94c',
    level: 0.42,
    solid: true,
    flame: false,
    micro: 'rings',
    text: 'При обычных условиях сера — **жёлтые хрупкие кристаллы**. Это **ромбическая сера**: она построена из молекул $\\ce{S8}$, похожих на зубчатую «корону». Молекулы — в узлах **молекулярной** кристаллической решётки.',
  },
  {
    title: 'Плавление',
    temp: '≈ 113–119 °C',
    color: '#ffe27a',
    level: 0.36,
    flame: true,
    micro: 'rings-move',
    text: 'Сера плавится при невысокой температуре (решётка молекулярная — притяжение между молекулами слабое). Получается **светло-жёлтая подвижная** жидкость: кольца $\\ce{S8}$ свободно скользят друг относительно друга.',
  },
  {
    title: 'Сильное нагревание',
    temp: '≈ 200 °C',
    color: '#7a3a12',
    level: 0.36,
    flame: true,
    micro: 'chains',
    text: 'Жидкость **темнеет** и становится такой **вязкой**, что пробирку можно перевернуть — сера не выливается. Кольца $\\ce{S8}$ **разрываются**, концы соединяются в **длинные цепи**, которые переплетаются.',
  },
  {
    title: 'В холодную воду',
    temp: 'резкое охлаждение',
    color: '#5b3a1c',
    level: 0.12,
    flame: false,
    inWater: true,
    micro: 'tangle',
    text: 'Нагретую почти до кипения серу выливают тонкой струйкой в холодную воду. Цепи не успевают свернуться в кольца — получается **пластическая сера**: тёмная **резиноподобная** масса, которая тянется, как резина.',
  },
  {
    title: 'Через несколько дней',
    temp: '20 °C',
    color: '#f2cf3f',
    level: 0.12,
    solid: true,
    flame: false,
    inWater: true,
    micro: 'rings-back',
    text: 'Пластическая сера неустойчива: цепи постепенно снова сворачиваются в кольца $\\ce{S8}$, масса **желтеет и становится хрупкой** — снова получается **ромбическая сера**, самая устойчивая модификация.',
  },
]

/** Координаты атомов «короны» S₈ (вид сверху: чередуются ближний и дальний радиусы) */
const ring = (cx: number, cy: number, r: number, rot = 0) =>
  Array.from({ length: 8 }, (_, k) => {
    const a = rot + (k * Math.PI) / 4
    const rr = k % 2 ? r * 0.72 : r
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) }
  })

const chain = (x0: number, y0: number, n: number, dx: number, amp: number, phase: number, tilt = 0) =>
  Array.from({ length: n }, (_, k) => ({
    x: x0 + k * dx,
    y: y0 + (k % 2 ? amp : -amp) + Math.sin(k * 0.55 + phase) * 9 + k * tilt,
  }))

const poly = (pts: { x: number; y: number }[], closed = false) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + (closed ? ` ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}` : '')

function Micro({ kind, t }: { kind: Stage['micro']; t: number }) {
  const atoms = (pts: { x: number; y: number }[], key: string, closed = false) => (
    <g key={key}>
      <polyline points={poly(pts, closed)} fill="none" stroke="#c9a51e" strokeWidth={3} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5.5} fill="#f7d94c" stroke="#8a6d00" strokeWidth={1} />
      ))}
    </g>
  )
  if (kind === 'rings' || kind === 'rings-move' || kind === 'rings-back') {
    const centers = [
      { x: 62, y: 62 },
      { x: 158, y: 62 },
      { x: 62, y: 158 },
      { x: 158, y: 158 },
    ]
    return (
      <>
        {centers.map((c, k) => {
          const move = kind === 'rings-move'
          const cx = c.x + (move ? Math.sin(t * 1.3 + k * 1.7) * 14 : 0)
          const cy = c.y + (move ? Math.cos(t * 1.1 + k * 2.1) * 12 : 0)
          return atoms(ring(cx, cy, 30, move ? t * 0.6 + k : k * 0.3), `r${k}`, true)
        })}
      </>
    )
  }
  if (kind === 'chains') {
    return (
      <>
        {atoms(chain(18, 45, 12, 17, 7, t * 0.8), 'c1')}
        {atoms(chain(22, 110, 11, 18, 7, t * 0.7 + 2, 0.8), 'c2')}
        {atoms(chain(14, 180, 12, 17, 7, t * 0.9 + 4, -1.2), 'c3')}
      </>
    )
  }
  // tangle — переплетённые цепи
  return (
    <>
      {atoms(chain(14, 40, 12, 17, 7, 0, 9), 'c1')}
      {atoms(chain(14, 190, 12, 17, 7, 1.5, -10), 'c2')}
      {atoms(chain(20, 110, 11, 18, 8, 3, 0), 'c3')}
    </>
  )
}

/** Нагревание серы: ромбическая → расплав → вязкие цепи → пластическая сера → снова ромбическая */
export default function SulfurHeating() {
  const [k, setK] = useState(0)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timers = useRef<number[]>([])
  const s = STAGES[k]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const t0 = performance.now()
    const loop = (now: number) => {
      setT((now - t0) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      timers.current.forEach(clearTimeout)
    }
  }, [])

  const play = () => {
    timers.current.forEach(clearTimeout)
    setPlaying(true)
    setK(0)
    timers.current = STAGES.map((_, i) =>
      window.setTimeout(() => {
        setK(i)
        if (i === STAGES.length - 1) setPlaying(false)
      }, i * 3600),
    )
  }

  // пробирка: x 70…120, дно y 230
  const tubeTop = 40
  const tubeBottom = 220
  const liqTop = tubeBottom - (tubeBottom - tubeTop) * s.level

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((x, i) => (
          <button
            key={i}
            onClick={() => setK(i)}
            aria-pressed={i === k}
            className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold transition ${i === k ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {i + 1}. {x.title}
          </button>
        ))}
        <button onClick={play} disabled={playing} className="rounded-xl bg-teal px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">
          ▶ По порядку
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* опыт */}
        <svg viewBox="0 0 260 300" className="w-full rounded-xl bg-white/5" role="img" aria-label={`${s.title}: ${s.temp}`}>
          <text x={130} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#ffcf6b">
            {s.temp}
          </text>
          {!s.inWater ? (
            <g>
              <defs>
                <clipPath id="sh-tube">
                  <path d="M 105 40 V 205 A 25 25 0 0 0 155 205 V 40 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#sh-tube)">
                <rect x={100} y={liqTop} width={60} height={240} fill={s.color} style={{ transition: 'fill 1.4s ease, y .8s' }} />
                {s.solid &&
                  Array.from({ length: 7 }, (_, i) => (
                    <rect key={i} x={108 + (i % 4) * 11} y={liqTop + 4 + Math.floor(i / 4) * 14} width={9} height={9} fill="#ffe680" stroke="#b39200" strokeWidth={0.8} transform={`rotate(${(i * 23) % 45} ${112 + (i % 4) * 11} ${liqTop + 8 + Math.floor(i / 4) * 14})`} />
                  ))}
                <rect x={110} y={liqTop} width={5} height={240} fill="#fff" opacity={0.2} />
              </g>
              <path d="M 105 40 V 205 A 25 25 0 0 0 155 205 V 40" fill="none" stroke="#fff" strokeWidth={2.4} strokeOpacity={0.9} />
              <path d="M 100 40 H 160" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
              {/* держатель */}
              <rect x={150} y={70} width={70} height={8} rx={3} fill="#a07a4a" />
              {s.flame && (
                <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
                  <path d="M 130 290 C 108 272 118 252 130 240 C 142 252 152 272 130 290 Z" fill="#ffb347" />
                  <path d="M 130 290 C 120 280 124 266 130 260 C 136 266 140 280 130 290 Z" fill="#5b8cff" />
                </g>
              )}
              {k === 2 && (
                <text x={200} y={180} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.8}>
                  <tspan x={200}>вязкая —</tspan>
                  <tspan x={200} dy={14}>не выливается</tspan>
                </text>
              )}
            </g>
          ) : (
            <g>
              {/* стакан с водой */}
              <path d="M 50 90 V 260 Q 50 272 62 272 H 198 Q 210 272 210 260 V 90" fill="rgba(143,196,255,.08)" stroke="#fff" strokeWidth={2.4} />
              <rect x={52} y={130} width={156} height={140} rx={8} fill="#8fc4ff" opacity={0.35} />
              <path
                d="M 70 250 C 90 215 110 262 128 228 C 146 196 160 256 182 222 C 196 200 172 186 150 200 C 126 214 104 182 86 206 C 72 224 96 236 110 220"
                fill="none"
                stroke={s.color}
                strokeWidth={9}
                strokeLinecap="round"
                style={{ transition: 'stroke 1.4s' }}
              />
              <text x={130} y={115} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.8}>
                холодная вода
              </text>
              {k === 3 && (
                <g>
                  <path d="M 170 40 L 150 60" stroke="#fff" strokeWidth={2.4} />
                  <path d="M 150 60 C 146 90 140 110 138 160" stroke="#7a3a12" strokeWidth={4} fill="none" strokeDasharray="6 4" style={{ animation: 'dash-flow .6s linear infinite' }} />
                  <text x={200} y={56} fontSize={11} fill="#fff" opacity={0.8}>расплав</text>
                </g>
              )}
            </g>
          )}
        </svg>

        {/* молекулы */}
        <div className="rounded-xl bg-white/5 p-2">
          <div className="px-1 text-xs font-bold uppercase tracking-wide text-white/60">Что с молекулами</div>
          <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[280px]" role="img" aria-label={s.micro.startsWith('rings') ? 'Кольцевые молекулы S8' : 'Длинные цепи атомов серы'}>
            <Micro kind={s.micro} t={t} />
          </svg>
          <div className="text-center text-sm font-bold text-[#ffe27a]">
            {s.micro.startsWith('rings') ? 'кольца S₈' : s.micro === 'chains' ? 'кольца рвутся → цепи' : 'длинные переплетённые цепи'}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3" aria-live="polite">
        <div className="font-bold text-orange">
          {k + 1}. {s.title}
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-white/90" dangerouslySetInnerHTML={{ __html: rich(s.text) }} />
      </div>
      <p className="mt-2 text-xs text-white/60">Температуры приблизительные. Опыт проводят в вытяжном шкафу: пары серы и сернистый газ раздражают дыхательные пути.</p>
    </div>
  )
}

function rich(text: string) {
  return text.replace(/\$([^$]+)\$/g, (_, f: string) => tex(f)).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}
