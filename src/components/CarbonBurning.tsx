import { useEffect, useRef, useState } from 'react'
import { BURN_CASES, type BurnCase } from '../lib/carbonSilicon'
import { tex } from './RichText'

/* Временная шкала опыта, с */
const MOVE = 1.5
const HEAT = 2.7
const BUBBLE = 3.4
const DONE = 9
/** начало каждого из четырёх этапов */
const STAGE_AT = [0, MOVE, BUBBLE, DONE]

const clamp = (u: number) => Math.max(0, Math.min(1, u))
const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a: string, b: string, u: number) => {
  const [x, y] = [hex(a), hex(b)]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * u)).join(',')})`
}

const LOOK: Record<BurnCase['id'], { hot: string; glow: string; feed: string; feedColor: string; dots: number; coal: string }> = {
  excess: { hot: '#fff3b0', glow: '#ffd54a', feed: 'много O₂', feedColor: '#ff8a8a', dots: 7, coal: 'уголь ярко горит' },
  lack: { hot: '#ff7a2f', glow: '#ff5a1f', feed: 'мало O₂', feedColor: '#ff8a8a', dots: 2, coal: 'уголь тлеет' },
  co2: { hot: '#ff5a2a', glow: '#ff3d1f', feed: 'CO₂', feedColor: '#9be7c9', dots: 5, coal: 'уголь раскалён' },
}

const CRIMSON = '#d61f69'
const CLEAR = '#e6eefb'
/** путь газа: от угля по трубке, вниз в раствор */
const PATH: [number, number][] = [
  [268, 110],
  [470, 110],
  [470, 262],
]
const SURFACE = 190

function along(s: number): [number, number] {
  const lens = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]))
  let d = s * lens.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const u = d / lens[i]
      return [PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * u, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * u]
    }
    d -= lens[i]
  }
  return PATH[PATH.length - 1]
}

function Flame({ x, y, h, outer, inner }: { x: number; y: number; h: number; outer: string; inner: string }) {
  return (
    <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .6s ease-in-out infinite' }}>
      <path d={`M ${x} ${y} C ${x - 22} ${y - h * 0.25} ${x - 12} ${y - h * 0.7} ${x} ${y - h} C ${x + 12} ${y - h * 0.7} ${x + 22} ${y - h * 0.25} ${x} ${y} Z`} fill={outer} />
      <path d={`M ${x} ${y} C ${x - 10} ${y - h * 0.2} ${x - 6} ${y - h * 0.45} ${x} ${y - h * 0.6} C ${x + 6} ${y - h * 0.45} ${x + 10} ${y - h * 0.2} ${x} ${y} Z`} fill={inner} />
    </g>
  )
}

/** Горение угля: уголь вносят в пламя, газ пропускают через раствор щёлочи с фенолфталеином */
export default function CarbonBurning() {
  const [id, setId] = useState<BurnCase['id']>('excess')
  const [run, setRun] = useState(0)
  const [t, setT] = useState(0)
  const [range, setRange] = useState<[number, number]>([0, Infinity])
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')
  const box = useRef<HTMLDivElement>(null)
  const c = BURN_CASES.find((x) => x.id === id)!
  const co2 = c.product === 'CO₂'
  const look = LOOK[id]

  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true)
        io.disconnect()
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!seen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const end = Number.isFinite(range[1]) ? range[1] - 0.001 : DONE + 1
      const raf = requestAnimationFrame(() => setT(end))
      return () => cancelAnimationFrame(raf)
    }
    const [from, until] = range
    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      const next = from + (now - start) / 1000
      setT(Math.min(next, until - 0.001))
      if (next < until) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [id, run, seen, range])

  const play = (from: number, until = Infinity) => {
    setT(from)
    setRange([from, until])
    setRun((r) => r + 1)
  }
  const pick = (x: BurnCase['id']) => {
    setId(x)
    play(0)
  }
  const replay = () => play(0)
  const goStage = (i: number) => {
    setSeen(true)
    play(STAGE_AT[i], STAGE_AT[i + 1] ?? Infinity)
  }

  const coalX = 140 + (245 - 140) * ease(clamp(t / MOVE))
  const heat = clamp((t - MOVE) / (HEAT - MOVE))
  const flowing = t >= HEAT
  const fade = co2 ? clamp((t - BUBBLE - 0.6) / 5) : 0
  const solution = mix(CRIMSON, CLEAR, fade)
  const ventFlame = !co2 && t > BUBBLE + 1
  const done = t >= DONE
  const stage = done ? 3 : t >= BUBBLE ? 2 : t >= MOVE ? 1 : 0
  const paused = range[1] - t < 0.01

  const gas = Array.from({ length: 12 }, (_, k) => {
    const p = t - HEAT - k * 0.24
    if (p < 0) return null
    const s = (p % 2.9) / 2.9
    if (s < 0.62) {
      const [x, y] = along(s / 0.62)
      return <circle key={k} cx={x} cy={y} r={3.6} fill={co2 ? '#9be7c9' : '#ffb15c'} />
    }
    const u = co2 ? (s - 0.62) / 0.38 : (s - 0.62) / 0.22
    if (u > 1) {
      const v = (s - 0.84) / 0.16
      return <circle key={k} cx={488} cy={150 - 84 * v} r={3} fill="#ffb15c" />
    }
    const y = 262 - (262 - SURFACE) * u
    const x = 470 + Math.sin(u * 9 + k) * 5
    const r = co2 ? 5.5 * (1 - clamp(u / 0.75)) : 5
    if (r <= 0.3) return null
    return <circle key={k} cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={1.4} />
  })

  const feed = Array.from({ length: look.dots }, (_, k) => {
    const s = ((t * 0.7 + k / look.dots) % 1 + 1) % 1
    return <circle key={k} cx={30 + s * (coalX - 50)} cy={110 + ((k % 3) - 1) * 6} r={3.4} fill={look.feedColor} opacity={t > 0.3 ? 0.95 : 0} />
  })

  const stages = ['Уголь в фарфоровой лодочке вносят в пламя горелки', `Уголь раскаляется: ${look.coal}`, `Газ пропускают через раствор щёлочи с фенолфталеином`, co2 ? 'Раствор обесцветился: CO₂ поглощён щёлочью' : 'Окраска не изменилась: CO со щёлочью не реагирует']

  return (
    <div ref={box} className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Условия">
        {BURN_CASES.map((x) => (
          <button key={x.id} role="radio" aria-checked={x.id === id} onClick={() => pick(x.id)} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {x.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 640 300" className="mt-3 w-full rounded-xl bg-white/5" role="img" aria-label={`Опыт: ${c.eq.replace(/->\[t\]|->/, '→')}. ${co2 ? 'Углекислый газ обесцвечивает раствор щёлочи с фенолфталеином' : 'Угарный газ не изменяет окраску раствора щёлочи и горит синим пламенем'}`}>
        {/* подача газа */}
        <text x={52} y={84} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={look.feedColor}>
          {look.feed}
        </text>
        <path d="M 22 92 H 82" stroke={look.feedColor} strokeWidth={id === 'lack' ? 1.5 : 3.5} />
        <path d="M 74 86 L 84 92 L 74 98" stroke={look.feedColor} strokeWidth={2.5} fill="none" />

        {/* стеклянная трубка */}
        <rect x={20} y={95} width={386} height={30} rx={14} fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.45)" strokeWidth={1.6} />
        {feed}

        {/* горелка */}
        <rect x={228} y={232} width={34} height={48} rx={4} fill="#5d6680" />
        <rect x={238} y={208} width={14} height={26} fill="#8590ab" />
        <Flame x={245} y={208} h={84} outer="#ff9a3d" inner="#7fb4ff" />
        <text x={245} y={294} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.65}>
          горелка
        </text>

        {/* лодочка с углём */}
        <g>
          {heat > 0 && <circle cx={coalX} cy={108} r={14 + 14 * heat} fill={look.glow} opacity={0.35 * heat} style={{ animation: 'glow 1.2s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />}
          <path d={`M ${coalX - 22} 112 Q ${coalX} 126 ${coalX + 22} 112 Z`} fill="#eef0f5" />
          <path d={`M ${coalX - 15} 112 L ${coalX - 11} 102 L ${coalX - 2} 99 L ${coalX + 8} 101 L ${coalX + 15} 112 Z`} fill={mix('#2b2f3a', look.hot, heat)} />
          <text x={coalX} y={86} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff" opacity={0.85}>
            {heat > 0.5 ? look.coal : 'уголь C'}
          </text>
        </g>

        {/* отвод газа и пробирка */}
        <path d="M 406 110 H 470 V 262" stroke="rgba(255,255,255,.45)" strokeWidth={7} fill="none" strokeLinejoin="round" />
        <path d="M 406 110 H 470 V 262" stroke="#1b2142" strokeWidth={3.5} fill="none" strokeLinejoin="round" />
        {flowing && (
          <text x={438} y={100} textAnchor="middle" fontSize={13} fontWeight={800} fill={co2 ? '#9be7c9' : '#ffb15c'}>
            {c.product}
          </text>
        )}
        <path d={`M 444 ${SURFACE} V 268 a 26 26 0 0 0 52 0 V ${SURFACE} Z`} fill={solution} opacity={0.9} />
        <path d="M 444 150 V 268 a 26 26 0 0 0 52 0 V 150" stroke="rgba(255,255,255,.55)" strokeWidth={2} fill="none" />
        <rect x={440} y={142} width={60} height={12} rx={3} fill="#8d6e63" />
        <path d="M 488 142 V 66" stroke="rgba(255,255,255,.45)" strokeWidth={6} fill="none" />
        <path d="M 488 142 V 66" stroke="#1b2142" strokeWidth={2.5} fill="none" />
        {gas}
        {ventFlame && <Flame x={488} y={64} h={34} outer="#4f8cff" inner="#b9d4ff" />}
        {ventFlame && (
          <text x={472} y={40} textAnchor="end" fontSize={11.5} fontWeight={700} fill="#9cc2ff">
            CO горит синим пламенем
          </text>
        )}
        <text x={560} y={210} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.75}>
          <tspan x={560} dy={0}>
            NaOH +
          </tspan>
          <tspan x={560} dy={14}>
            фенолфталеин
          </tspan>
          <tspan x={560} dy={14} fontWeight={800} fill={fade > 0.6 ? '#dfe7f5' : '#ff7eb3'}>
            {fade > 0.6 ? 'бесцветный' : 'малиновый'}
          </tspan>
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ol className="flex flex-1 flex-wrap gap-1.5 text-xs" aria-label="Этапы опыта">
          {stages.map((s, i) => (
            <li key={i}>
              <button onClick={() => goStage(i)} aria-current={i === stage ? 'step' : undefined} title="Показать этот этап" className={`rounded-md px-2 py-1 text-left transition ${i === stage ? 'bg-orange font-semibold text-navy' : i < stage ? 'bg-white/15 text-white/80 hover:bg-white/25' : 'bg-white/5 text-white/50 hover:bg-white/15 hover:text-white/80'}`}>
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>
        <button onClick={replay} className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">
          {paused ? '▶ Весь опыт' : '↻ Повторить опыт'}
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${c.eq}}`, true) }} />
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Степень окисления углерода</div>
          <div className="text-lg font-bold">{id === 'co2' ? '0 и +4 → +2' : `0 → ${c.cOx}`}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Атом C (уголь) отдаёт</div>
          <div className="text-lg font-bold">{c.cOx === '+4' ? '4 электрона' : '2 электрона'}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Газ и щёлочь</div>
          <div className="text-lg font-bold">{co2 ? 'реагирует' : 'не реагирует'}</div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90" aria-live="polite">
        {id === 'excess' && (
          <>
            Кислорода <b>много</b> — он забирает у углерода все <b>4</b> внешних электрона, получается <b>углекислый газ</b>. CO₂ — <b>кислотный оксид</b>, он реагирует со щёлочью: <span dangerouslySetInnerHTML={{ __html: tex('\\ce{CO2 + 2NaOH -> Na2CO3 + H2O}') }} />. Щёлочь расходуется, малиновая окраска фенолфталеина бледнеет, а при пропускании избытка CO₂ раствор обесцвечивается.
          </>
        )}
        {id === 'lack' && (
          <>
            Кислорода <b>мало</b> — его хватает, только чтобы забрать <b>2</b> электрона. Получается <b>угарный газ</b> CO — без цвета и запаха и <b>очень ядовит</b>. CO — <b>несолеобразующий</b> оксид: со щёлочью не реагирует, поэтому раствор остаётся малиновым. Зато CO горит синим пламенем: <span dangerouslySetInnerHTML={{ __html: tex('\\ce{2CO + O2 -> 2CO2}') }} />.
          </>
        )}
        {id === 'co2' && (
          <>
            Углекислый газ проходит над <b>раскалённым углём</b>: углерод угля отдаёт 2 электрона (0 → +2), а углерод из CO₂ принимает 2 (+4 → +2). Получается <b>угарный газ</b> — он проходит через щёлочь без изменений (раствор малиновый) и горит на выходе синим пламенем. Так в печи внизу образуется CO₂, а в верхнем слое угля — CO.
          </>
        )}
      </p>
    </div>
  )
}
