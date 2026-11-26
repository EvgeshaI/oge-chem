import { useEffect, useMemo, useState } from 'react'

type Tab = 'diamond' | 'graphite' | 'fullerene' | 'silicon'
type Vec = [number, number, number]
interface Model {
  atoms: Vec[]
  bonds: [number, number][]
  /** слабые связи между слоями (пунктир) */
  weak: [number, number][]
  /** номер слоя атома (для графита) */
  layer: number[]
  scale: number
  r: number
  color: string
  stroke: string
}

const dist = (p: Vec, q: Vec) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])

function bondsWithin(atoms: Vec[], len: number, tol = 0.06): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) if (Math.abs(dist(atoms[i], atoms[j]) - len) < tol) out.push([i, j])
  return out
}

/** Фрагмент алмазной решётки (так же устроен кристалл кремния): шар вокруг атома, ребро ячейки = 1 */
function diamondLattice(): { atoms: Vec[]; bonds: [number, number][] } {
  const basis: Vec[] = [
    [0, 0, 0],
    [0, 0.5, 0.5],
    [0.5, 0, 0.5],
    [0.5, 0.5, 0],
  ]
  const pts: Vec[] = []
  for (let i = -2; i <= 2; i++)
    for (let j = -2; j <= 2; j++)
      for (let k = -2; k <= 2; k++)
        for (const b of basis)
          for (const off of [0, 0.25]) {
            const p: Vec = [i + b[0] + off, j + b[1] + off, k + b[2] + off]
            if (Math.hypot(...p) <= 1.08) pts.push(p)
          }
  const len = Math.sqrt(3) / 4
  let bonds = bondsWithin(pts, len, 0.02)
  // атомы с одной связью «висят» — убираем их
  const deg = pts.map((_, i) => bonds.filter(([a, b]) => a === i || b === i).length)
  const keep = pts.map((_, i) => deg[i] >= 2)
  const idx = new Map<number, number>()
  const atoms: Vec[] = []
  pts.forEach((p, i) => {
    if (keep[i]) {
      idx.set(i, atoms.length)
      atoms.push(p)
    }
  })
  bonds = bonds.filter(([a, b]) => keep[a] && keep[b]).map(([a, b]) => [idx.get(a)!, idx.get(b)!])
  return { atoms, bonds }
}

/** Три слоя графита (длина связи = 1, расстояние между слоями ≈ 2,36) */
function graphiteLayers(): { atoms: Vec[]; bonds: [number, number][]; weak: [number, number][]; layer: number[] } {
  const atoms: Vec[] = []
  const layer: number[] = []
  const S3 = Math.sqrt(3)
  ;[-1, 0, 1].forEach((L) => {
    const shift = L === 0 ? 1 : 0
    for (let i = -5; i <= 5; i++)
      for (let j = -5; j <= 5; j++) {
        const ax = i * S3 + j * (S3 / 2)
        const az = j * 1.5
        for (const [x, z] of [
          [ax, az],
          [ax, az + 1],
        ]) {
          const zz = z + shift - 0.5
          if (Math.hypot(x, zz) <= 3.3) {
            atoms.push([x, L * 2.36, zz])
            layer.push(L)
          }
        }
      }
  })
  const bonds = bondsWithin(atoms, 1, 0.03).filter(([a, b]) => layer[a] === layer[b])
  const weak: [number, number][] = []
  for (let i = 0; i < atoms.length; i++)
    for (let j = 0; j < atoms.length; j++)
      if (layer[j] === layer[i] + 1 && Math.hypot(atoms[i][0] - atoms[j][0], atoms[i][2] - atoms[j][2]) < 0.05) weak.push([i, j])
  return { atoms, bonds, weak, layer }
}

/** Фуллерен C₆₀ (усечённый икосаэдр, ребро = 2) */
function fullerene(): { atoms: Vec[]; bonds: [number, number][] } {
  const f = (1 + Math.sqrt(5)) / 2
  const seeds: Vec[] = [
    [0, 1, 3 * f],
    [1, 2 + f, 2 * f],
    [f, 2, 2 * f + 1],
  ]
  const atoms: Vec[] = []
  for (const s of seeds) {
    for (const sx of [1, -1])
      for (const sy of [1, -1])
        for (const sz of [1, -1]) {
          const p: Vec = [s[0] * sx, s[1] * sy, s[2] * sz]
          for (const q of [p, [p[1], p[2], p[0]] as Vec, [p[2], p[0], p[1]] as Vec]) {
            if (!atoms.some((a) => dist(a, q) < 1e-6)) atoms.push(q)
          }
        }
  }
  return { atoms, bonds: bondsWithin(atoms, 2, 0.05) }
}

function buildModels(): Record<Tab, Model> {
  const d = diamondLattice()
  const g = graphiteLayers()
  const c60 = fullerene()
  return {
    diamond: { ...d, weak: [], layer: [], scale: 115, r: 8, color: '#bfe6ff', stroke: '#5fb4e8' },
    silicon: { ...d, weak: [], layer: [], scale: 115, r: 10, color: '#8ea3c4', stroke: '#c9d3e6' },
    graphite: { ...g, scale: 26, r: 6.5, color: '#4b5163', stroke: '#9aa3bb' },
    fullerene: { ...c60, weak: [], layer: [], scale: 21, r: 6, color: '#3a4056', stroke: '#9aa3bb' },
  }
}

type TestId = 'current' | 'paper' | 'glass'
type Level = 'yes' | 'weak' | 'no'
const TESTS: { id: TestId; label: string; q: string }[] = [
  { id: 'current', label: '🔌 Проводит ток?', q: 'Подключили к батарейке с лампочкой' },
  { id: 'paper', label: '✏️ Провести по бумаге', q: 'Провели кусочком по бумаге' },
  { id: 'glass', label: '🪟 Царапнуть стекло', q: 'Попробовали поцарапать стекло' },
]

const RESULTS: Record<Exclude<Tab, 'fullerene'>, Record<TestId, { level: Level; text: string }>> = {
  diamond: {
    current: { level: 'no', text: 'Лампочка не горит. Все 4 внешних электрона каждого атома заняты в связях с соседями — свободных электронов нет.' },
    paper: { level: 'no', text: 'Следа нет: алмаз слишком твёрдый, он не «стирается» о бумагу.' },
    glass: { level: 'yes', text: 'На стекле глубокая царапина. Алмаз — самое твёрдое природное вещество: им режут стекло и бурят горные породы.' },
  },
  graphite: {
    current: { level: 'yes', text: 'Лампочка горит! Каждый атом связан только с тремя соседями, четвёртый электрон свободно движется вдоль слоя — поэтому графит проводит ток.' },
    paper: { level: 'yes', text: 'Остаётся серый след: слои легко отслаиваются и остаются на бумаге. Так пишет грифель карандаша.' },
    glass: { level: 'no', text: 'Царапины нет: графит мягкий — слои скользят друг по другу (нажмите «Сдвинуть слои»).' },
  },
  silicon: {
    current: { level: 'weak', text: 'Лампочка едва светится: кремний — полупроводник. При нагревании или освещении проводимость растёт (нажмите «Нагреть»).' },
    paper: { level: 'no', text: 'Следа нет: кремний твёрдый.' },
    glass: { level: 'yes', text: 'Царапина есть: кремний твёрдый, почти как кварц. Но он хрупкий — от удара раскалывается.' },
  },
}

const INFO: Record<Tab, { title: string; tag: string; items: string[] }> = {
  diamond: {
    title: 'Алмаз',
    tag: 'C · атомная решётка',
    items: ['каждый атом C связан с **4** соседями — тетраэдр', 'прочный трёхмерный каркас', 'бесцветный, прозрачный, сильно преломляет свет', 'самый твёрдый в природе, не проводит ток'],
  },
  graphite: {
    title: 'Графит',
    tag: 'C · слоистая решётка',
    items: ['каждый атом C связан с **3** соседями в слое', 'слои из шестиугольников связаны слабо (пунктир)', 'серо-чёрный, с металлическим блеском, жирный на ощупь', 'мягкий, проводит ток и тепло'],
  },
  fullerene: {
    title: 'Фуллерен C₆₀',
    tag: 'молекулярная решётка',
    items: ['молекула из **60** атомов — «футбольный мяч»', '12 пятиугольников и 20 шестиугольников', 'открыт в 1985 году, за это дали Нобелевскую премию', 'в ОГЭ — только для общего представления'],
  },
  silicon: {
    title: 'Кристаллический кремний',
    tag: 'Si · атомная решётка',
    items: ['решётка **как у алмаза**: каждый Si связан с 4 соседями', 'связи Si–Si длиннее и слабее, чем C–C', 'тёмно-серый с металлическим блеском, твёрдый, хрупкий', 't пл. = 1415 °C; **полупроводник**'],
  },
}

const TABS: [Tab, string][] = [
  ['diamond', 'Алмаз'],
  ['graphite', 'Графит'],
  ['fullerene', 'Фуллерен C₆₀'],
  ['silicon', 'Кремний'],
]

const bold = (s: string) => s.split(/\*\*/).map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))

/** Строение простых веществ: алмаз, графит, фуллерен и кремний — вращающиеся модели и «опыты» со свойствами */
export default function CarbonAllotropes() {
  const models = useMemo(() => buildModels(), [])
  const [tab, setTab] = useState<Tab>('diamond')
  const [test, setTest] = useState<TestId | null>(null)
  const [hot, setHot] = useState(false)
  const [spin, setSpin] = useState(true)
  const [slid, setSlid] = useState(false)
  const [pose, setPose] = useState({ angle: 0.6, offset: 0 })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = slid ? 1.7 : 0
      setPose((p) => ({
        angle: spin && !reduced ? p.angle + dt * 0.45 : p.angle,
        offset: reduced ? target : p.offset + (target - p.offset) * Math.min(1, dt * 4),
      }))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [spin, slid])

  const pickTab = (t: Tab) => {
    setTab(t)
    setTest(null)
    setHot(false)
    setSlid(false)
  }

  const m = models[tab]
  const th = pose.angle
  const tilt = tab === 'graphite' ? 0.42 : 0.32
  const proj = m.atoms.map((p, i) => {
    const x0 = p[0] + (tab === 'graphite' && m.layer[i] === 1 ? pose.offset : 0)
    const x = x0 * Math.cos(th) + p[2] * Math.sin(th)
    const z = -x0 * Math.sin(th) + p[2] * Math.cos(th)
    const y = p[1] * Math.cos(tilt) - z * Math.sin(tilt)
    const depth = p[1] * Math.sin(tilt) + z * Math.cos(tilt)
    return { X: 270 + x * m.scale, Y: 150 - y * m.scale, depth }
  })
  const maxD = Math.max(...proj.map((p) => Math.abs(p.depth))) || 1
  const k = (d: number) => 0.55 + 0.45 * ((d / maxD + 1) / 2)

  const items: { d: number; el: React.ReactNode }[] = []
  m.bonds.forEach(([a, b], n) => {
    const d = (proj[a].depth + proj[b].depth) / 2
    items.push({
      d: d - 0.001,
      el: <line key={`b${n}`} x1={proj[a].X} y1={proj[a].Y} x2={proj[b].X} y2={proj[b].Y} stroke={m.stroke} strokeWidth={2.6 * k(d)} strokeOpacity={k(d)} strokeLinecap="round" />,
    })
  })
  m.weak.forEach(([a, b], n) => {
    const d = (proj[a].depth + proj[b].depth) / 2
    items.push({
      d: d - 0.002,
      el: <line key={`w${n}`} x1={proj[a].X} y1={proj[a].Y} x2={proj[b].X} y2={proj[b].Y} stroke="#b9a7ff" strokeWidth={1.4} strokeDasharray="3 4" strokeOpacity={0.55 * k(d) * (1 - Math.min(1, pose.offset))} />,
    })
  })
  proj.forEach((p, n) => {
    const kk = k(p.depth)
    items.push({
      d: p.depth,
      el: <circle key={`a${n}`} cx={p.X} cy={p.Y} r={m.r * kk} fill={m.color} stroke="#fff" strokeWidth={1} opacity={0.35 + 0.65 * kk} />,
    })
  })
  items.sort((x, y) => x.d - y.d)

  const info = INFO[tab]
  const res = tab !== 'fullerene' && test ? RESULTS[tab][test] : null
  const level: Level | null = res ? (tab === 'silicon' && test === 'current' && hot ? 'yes' : res.level) : null

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => pickTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${tab === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,270px)]">
        <div>
          <svg viewBox="0 0 540 300" className="w-full rounded-xl bg-white/5" role="img" aria-label={`${info.title}: модель строения. ${info.items.join('; ').replace(/\*\*/g, '')}`}>
            {items.map((x) => x.el)}
            <text x={16} y={286} fontSize={12} fill="#fff" opacity={0.6}>
              {tab === 'graphite' ? 'внутри слоя — прочные связи, между слоями — слабые' : tab === 'fullerene' ? 'атомы углерода на поверхности полого шара' : 'каждый атом — в центре тетраэдра из четырёх соседей'}
            </text>
          </svg>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setSpin((v) => !v)} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
              {spin ? '⏸ Остановить' : '▶ Вращать'}
            </button>
            {tab === 'graphite' && (
              <button onClick={() => setSlid((v) => !v)} aria-pressed={slid} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${slid ? 'bg-[#b9a7ff] text-navy' : 'bg-orange text-navy hover:brightness-110'}`}>
                {slid ? '↺ Вернуть слой' : '👆 Сдвинуть верхний слой'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="rounded-xl bg-white/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-bold">{info.title}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">{info.tag}</span>
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-white/85">
              {info.items.map((x) => (
                <li key={x}>{bold(x)}</li>
              ))}
            </ul>
          </div>
          {tab === 'graphite' && slid && (
            <p className="rounded-xl bg-white/10 p-3 leading-relaxed text-white/90">
              Верхний слой легко <b>сдвинулся</b>: между слоями связи слабые. Поэтому графит мягкий, жирный на ощупь и оставляет след на бумаге.
            </p>
          )}
        </div>
      </div>

      {tab !== 'fullerene' ? (
        <div className="mt-4 rounded-xl bg-white/10 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-white/60">Опыты: проверьте свойства</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {TESTS.map((x) => (
              <button
                key={x.id}
                onClick={() => setTest(x.id)}
                aria-pressed={test === x.id}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${test === x.id ? 'bg-teal text-white' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {x.label}
              </button>
            ))}
          </div>
          {res && level && (
            <div key={`${tab}-${test}`} className="mt-3 grid items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)]" style={{ animation: 'fade-up .4s ease-out both' }} aria-live="polite">
              <TestPicture test={test!} level={level} />
              <div>
                <div className="text-xs text-white/60">{TESTS.find((x) => x.id === test)!.q}</div>
                <div className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-sm font-bold ${level === 'yes' ? 'bg-[#6ee7c4] text-navy' : level === 'weak' ? 'bg-[#ffd54a] text-navy' : 'bg-[#ff8a8f] text-navy'}`}>
                  {level === 'yes' ? 'да' : level === 'weak' ? 'слабо' : 'нет'}
                </div>
                <p className="mt-1 leading-relaxed text-white/90">
                  {tab === 'silicon' && test === 'current' && hot ? 'Кремний нагрели — лампочка разгорелась. У полупроводника, в отличие от металла, проводимость при нагревании растёт: часть электронов освобождается из связей. На этом основаны микросхемы и солнечные батареи.' : res.text}
                </p>
                {tab === 'silicon' && test === 'current' && (
                  <button onClick={() => setHot((v) => !v)} aria-pressed={hot} className={`mt-2 rounded-lg px-3 py-1.5 text-sm font-bold transition ${hot ? 'bg-white/10 hover:bg-white/20' : 'bg-orange text-navy hover:brightness-110'}`}>
                    {hot ? '↺ Остудить' : '🔥 Нагреть кремний'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
          В алмазе и графите атомы образуют огромный каркас или слои, а фуллерен состоит из отдельных <b>молекул</b> C₆₀. Поэтому у него <b>молекулярная</b> решётка. Сгорая в кислороде, все модификации углерода дают одно и то же вещество — CO₂.
        </p>
      )}
      <p className="mt-2 text-xs text-white/60">Модели условные: показан небольшой фрагмент кристалла. Размер атомов уменьшен, чтобы были видны связи.</p>
    </div>
  )
}

function TestPicture({ test, level }: { test: TestId; level: Level }) {
  if (test === 'current') {
    const glow = level === 'yes' ? 1 : level === 'weak' ? 0.3 : 0
    return (
      <svg viewBox="0 0 110 100" className="w-[110px]" aria-hidden>
        {glow > 0 && <circle cx={55} cy={36} r={34} fill="#ffd54a" opacity={glow * 0.45} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1.6s ease-in-out infinite' }} />}
        <circle cx={55} cy={36} r={20} fill={glow ? `rgba(255,213,74,${0.35 + glow * 0.65})` : 'rgba(255,255,255,.12)'} stroke="#fff" strokeWidth={2} />
        <path d="M 47 54 H 63 V 66 H 47 Z" fill="#9aa3bb" />
        <path d="M 49 40 L 53 32 L 57 40 L 61 32" fill="none" stroke={glow ? '#a35a00' : '#fff'} strokeWidth={1.6} />
        <path d="M 55 66 V 84 H 15 M 55 84 H 95" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.7} />
        <rect x={6} y={78} width={18} height={12} rx={2} fill="#f5a623" />
        <rect x={86} y={78} width={18} height={12} rx={2} fill="#6b7387" />
      </svg>
    )
  }
  if (test === 'paper') {
    return (
      <svg viewBox="0 0 110 100" className="w-[110px]" aria-hidden>
        <rect x={10} y={14} width={90} height={72} rx={4} fill="#fbfaf5" />
        {level === 'yes' ? (
          <path d="M 20 60 C 35 30, 50 75, 65 45 S 90 40, 92 30" fill="none" stroke="#4b5163" strokeWidth={4} strokeLinecap="round" strokeDasharray="160" style={{ animation: 'fade-up .6s ease-out both' }} />
        ) : (
          <text x={55} y={56} textAnchor="middle" fontSize={12} fill="#9aa3bb">
            следа нет
          </text>
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 110 100" className="w-[110px]" aria-hidden>
      <rect x={10} y={14} width={90} height={72} rx={4} fill="rgba(180,220,255,.35)" stroke="#cfe6ff" />
      <path d="M 16 22 L 30 22" stroke="#fff" strokeWidth={2} opacity={0.6} />
      {level === 'yes' ? (
        <path d="M 22 74 L 88 28" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <text x={55} y={56} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.8}>
          царапины нет
        </text>
      )}
    </svg>
  )
}
