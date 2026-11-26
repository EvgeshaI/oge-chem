import { useEffect, useRef, useState } from 'react'

type Tab = 'n2' | 'p'

/** Строение простых веществ: тройная связь N≡N и аллотропия фосфора (белый P₄ → красный) */
export default function PnictogenMolecules() {
  const [tab, setTab] = useState<Tab>('n2')
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            ['n2', 'N₂ — тройная связь'],
            ['p', 'Фосфор: белый → красный'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${tab === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'n2' ? <Nitrogen /> : <Phosphorus />}
    </div>
  )
}

/* ---------------------------------------------------------------- N₂ */

const BONDS = [
  { name: 'N≡N (азот)', e: 946, color: '#9fa8ff' },
  { name: 'O=O (кислород)', e: 498, color: '#ff8a8a' },
  { name: 'Cl–Cl (хлор)', e: 243, color: '#cfe56a' },
]

function Nitrogen() {
  const [cond, setCond] = useState<'room' | 'bolt' | null>(null)
  const broken = cond === 'bolt'
  const xL = broken ? 150 : 230
  const xR = broken ? 390 : 310
  return (
    <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
      <div>
        <svg viewBox="0 0 540 250" className="w-full rounded-xl bg-white/5" role="img" aria-label="Молекула азота: два атома связаны тройной связью">
          {broken && (
            <path key="bolt" d="M 282 6 L 254 92 L 278 92 L 250 170 L 310 74 L 284 74 L 306 6 Z" fill="#ffd54a" style={{ animation: 'flicker .3s ease-in-out 4' }} />
          )}
          {/* три общие пары */}
          {[-12, 0, 12].map((dy) => (
            <line key={dy} x1={262} y1={120 + dy} x2={278} y2={120 + dy} stroke="#ffd54a" strokeWidth={4} strokeLinecap="round" style={{ opacity: broken ? 0 : 1, transition: 'opacity .4s' }} />
          ))}
          {[
            { x: xL, side: -1 },
            { x: xR, side: 1 },
          ].map((n, k) => (
            <g key={k} style={{ transform: `translate(${n.x}px, 120px)`, transition: 'transform 1s ease-in-out' }}>
              <g style={cond === 'room' ? { animation: 'shake .5s ease-in-out 3' } : undefined}>
                <circle r={34} fill="#9fa8ff" stroke="#fff" strokeWidth={2} />
                <text textAnchor="middle" dy="0.35em" fontSize={24} fontWeight={800} fill="#16205a">
                  N
                </text>
                {/* неподелённая пара */}
                <circle cx={n.side * 46} cy={-6} r={4} fill="#fff" />
                <circle cx={n.side * 46} cy={6} r={4} fill="#fff" />
                {/* у разорванной молекулы — три неспаренных электрона */}
                {broken &&
                  [-14, 0, 14].map((dy) => <circle key={dy} cx={-n.side * 46} cy={dy} r={4} fill="#ffd54a" style={{ animation: 'pop .4s ease-out 1s both', transformBox: 'fill-box', transformOrigin: 'center' }} />)}
              </g>
            </g>
          ))}
          <text x={270} y={200} textAnchor="middle" fontSize={14} fontWeight={700} fill={broken ? '#6ee7c4' : cond === 'room' ? '#ff8a8f' : '#fff'}>
            {broken ? 'связь разорвана — атомы азота готовы реагировать' : cond === 'room' ? 'при 20 °C связь не рвётся: азот «молчит»' : 'N≡N: три общие электронные пары'}
          </text>
          <text x={270} y={226} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.65}>
            {broken ? 'например, в молнии: N₂ + O₂ → 2NO' : 'у каждого атома ещё одна неподелённая пара'}
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => setCond('room')} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${cond === 'room' ? 'bg-[#ff8a8f] text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            🌡 Обычные условия, 20 °C
          </button>
          <button onClick={() => setCond('bolt')} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${cond === 'bolt' ? 'bg-[#ffd54a] text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            ⚡ Разряд молнии, ≈ 2000 °C
          </button>
          {cond && (
            <button onClick={() => setCond(null)} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
              ↺ Сначала
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-white/60">Энергия связи, кДж/моль</div>
          {BONDS.map((b) => (
            <div key={b.name} className="mt-2">
              <div className="flex justify-between text-sm">
                <span>{b.name}</span>
                <b>{b.e}</b>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-white/10">
                <div className="h-2.5 rounded-full" style={{ width: `${(b.e / 946) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
        <p className="rounded-xl bg-white/10 p-3 text-sm leading-relaxed text-white/90">
          Чтобы азот вступил в реакцию, нужно разорвать <b>тройную</b> связь — она почти вдвое прочнее двойной связи в O₂. Поэтому азот реагирует только при <b>нагревании, давлении, с катализатором или в разряде</b>. Без нагревания — только с литием.
        </p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- фосфор */

/** Тетраэдр P₄ в проекции: вершина, левый и правый передние, задний */
const TETRA = [
  { x: 0, y: -46 },
  { x: -44, y: 24 },
  { x: 44, y: 24 },
  { x: 6, y: 2 },
]
const T_BONDS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]
const CENTERS = [110, 270, 430]
const WHITE_POS = CENTERS.flatMap((cx) => TETRA.map((p) => ({ x: cx + p.x, y: 120 + p.y })))
const WHITE_BONDS = CENTERS.flatMap((_, m) => T_BONDS.map(([i, j]) => [m * 4 + i, m * 4 + j] as [number, number]))
/** Красный фосфор: длинная зигзагообразная цепь (полимер) */
const RED_POS = Array.from({ length: 12 }, (_, i) => ({ x: 50 + i * 40, y: i % 2 ? 150 : 100 }))
const RED_BONDS = Array.from({ length: 11 }, (_, i) => [i, i + 1] as [number, number])
const HEAT_MS = 2200

const mix = (a: number, b: number, u: number) => a + (b - a) * u
function mixColor(c1: string, c2: string, u: number) {
  const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)
  return `rgb(${[0, 1, 2].map((i) => Math.round(mix(p(c1, i), p(c2, i), u))).join(',')})`
}

function Phosphorus() {
  const [u, setU] = useState(0)
  const [dark, setDark] = useState(false)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const heat = () => {
    cancelAnimationFrame(raf.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setU(1)
    const t0 = performance.now()
    const loop = (now: number) => {
      const k = Math.min(1, (now - t0) / HEAT_MS)
      setU(k)
      if (k < 1) raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
  }
  const reset = () => {
    cancelAnimationFrame(raf.current)
    setU(0)
  }

  const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
  const pos = WHITE_POS.map((w, i) => ({ x: mix(w.x, RED_POS[i].x, e), y: mix(w.y, RED_POS[i].y, e) }))
  const white = u === 0
  const red = u === 1
  const heating = !white && !red
  const atomColor = mixColor('#f3ecc8', '#c0392b', e)
  const glow = dark && u < 0.3

  return (
    <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
      <div>
        <svg viewBox="0 0 540 250" className="w-full rounded-xl" style={{ background: dark ? '#06091a' : 'rgba(255,255,255,.05)', transition: 'background .6s' }} role="img" aria-label="Белый фосфор — молекулы P4 в форме тетраэдра; при нагревании без воздуха переходит в красный фосфор — длинные цепи">
          {WHITE_BONDS.map(([i, j], k) => (
            <line key={`w${k}`} x1={pos[i].x} y1={pos[i].y} x2={pos[j].x} y2={pos[j].y} stroke="#e9e2c0" strokeWidth={3} opacity={Math.max(0, 1 - e * 2.5)} />
          ))}
          {RED_BONDS.map(([i, j], k) => (
            <line key={`r${k}`} x1={pos[i].x} y1={pos[i].y} x2={pos[j].x} y2={pos[j].y} stroke="#ff9a8a" strokeWidth={3} opacity={Math.max(0, e * 2 - 1)} />
          ))}
          {red && (
            <>
              <line x1={20} y1={115} x2={50} y2={100} stroke="#ff9a8a" strokeWidth={3} strokeDasharray="4 4" />
              <line x1={490} y1={150} x2={520} y2={135} stroke="#ff9a8a" strokeWidth={3} strokeDasharray="4 4" />
            </>
          )}
          {pos.map((p, i) => (
            <g key={i}>
              {glow && <circle cx={p.x} cy={p.y} r={22} fill="#7dffb0" opacity={0.35} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1.6s ease-in-out infinite' }} />}
              <circle cx={p.x} cy={p.y} r={i % 4 === 3 && e < 0.3 ? 13 : 15} fill={glow ? '#d8ffe6' : atomColor} stroke="#fff" strokeWidth={1.4} opacity={i % 4 === 3 && e < 0.3 ? 0.75 : 1} />
              <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize={12} fontWeight={800} fill={e > 0.5 ? '#fff' : '#4a3d10'}>
                P
              </text>
            </g>
          ))}
          {heating && (
            <g>
              {[120, 270, 420].map((x) => (
                <path key={x} d={`M ${x - 14} 246 Q ${x} 210 ${x + 14} 246 Z`} fill="#f5a623" opacity={0.8} style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'flicker .5s ease-in-out infinite' }} />
              ))}
            </g>
          )}
          <text x={270} y={226} textAnchor="middle" fontSize={13} fontWeight={700} fill={red ? '#ff9a8a' : dark ? '#7dffb0' : '#fff'}>
            {white ? (dark ? 'белый фосфор светится в темноте' : 'белый фосфор: молекулы P₄ — тетраэдры') : red ? 'красный фосфор: длинные цепи атомов P' : 'нагревание без доступа воздуха, ≈ 250 °C'}
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={heat} disabled={!white} className="rounded-lg bg-orange px-3 py-2 text-sm font-bold text-navy transition hover:brightness-110 disabled:opacity-40">
            🔥 Нагреть без воздуха (≈ 250 °C)
          </button>
          <button onClick={() => setDark((d) => !d)} aria-pressed={dark} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${dark ? 'bg-[#7dffb0] text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            🌙 Выключить свет
          </button>
          {!white && (
            <button onClick={reset} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
              ↺ Снова белый
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2 text-sm" aria-live="polite">
        {red ? (
          <>
            <Card title="Красный фосфор" tone="#c0392b" items={['порошок красно-бурого цвета', 'длинные цепи — полимер', 'не ядовит, не светится', 'на воздухе сам не загорается', 'тёрка спичечного коробка']} />
            <p className="rounded-xl bg-white/10 p-3 leading-relaxed text-white/90">
              Тетраэдры раскрылись и соединились в <b>цепи</b>. Связи больше не напряжены — поэтому красный фосфор <b>менее активен</b>. Элемент тот же, а простое вещество другое — это <b>аллотропия</b>.
            </p>
          </>
        ) : (
          <>
            <Card title="Белый фосфор P₄" tone="#e9e2c0" items={['мягкое воскообразное вещество', 'тетраэдр: углы 60°, связи напряжены', 'очень ядовит', 'светится в темноте', 'самовоспламеняется, хранят под водой']} />
            <p className="rounded-xl bg-white/10 p-3 leading-relaxed text-white/90">
              {dark ? (
                <>Белый фосфор медленно окисляется кислородом воздуха, и энергия выделяется в виде <b>света</b> — фосфор светится. Отсюда название: «светоносный».</>
              ) : (
                <>Нажмите «Выключить свет», а затем нагрейте белый фосфор <b>без доступа воздуха</b> — посмотрите, как молекулы P₄ превращаются в цепи красного фосфора.</>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Card({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="flex items-center gap-2 font-bold">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: tone }} />
        {title}
      </div>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-white/85">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  )
}
