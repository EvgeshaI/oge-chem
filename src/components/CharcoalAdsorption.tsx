import { useEffect, useState } from 'react'

type Tab = 'gas' | 'ink'

/** Адсорбция: активированный уголь поглощает молекулы газа и красителя поверхностью своих пор */
export default function CharcoalAdsorption() {
  const [tab, setTab] = useState<Tab>('gas')
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            ['gas', 'Противогаз: ядовитый газ'],
            ['ink', 'Опыт: раствор чернил через уголь'],
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
      {tab === 'gas' ? <Gas /> : <Ink />}
    </div>
  )
}

/* ---------------------------------------------------------------- газ */

const N = 18
const GRAIN = 'M 210 92 L 262 70 L 318 84 L 352 120 L 344 176 L 300 204 L 236 198 L 196 164 L 188 122 Z'
/** поры: ветвящиеся каналы внутри зерна угля */
const PORES = [
  'M 270 76 L 268 110 L 246 132 L 232 168',
  'M 268 110 L 300 128 L 322 162',
  'M 300 128 L 336 122',
  'M 246 132 L 204 128',
  'M 268 110 L 292 94',
  'M 280 196 L 284 160 L 300 128',
]
/** места на стенках пор, где «прилипают» молекулы */
const SITES_ACTIVE = [
  [269, 88], [268, 104], [258, 120], [244, 140], [238, 156], [233, 168],
  [284, 119], [298, 132], [310, 145], [320, 158], [316, 124], [332, 122],
  [226, 131], [208, 129], [280, 102], [288, 96], [282, 182], [284, 166],
]
const SITES_PLAIN = [
  [269, 88], [246, 134], [300, 130], [226, 131], [284, 172],
]
const seed = (i: number) => {
  const r = Math.sin(i * 12.9898 + 4.1) * 43758.5453
  return r - Math.floor(r)
}
const BASE = Array.from({ length: N }, (_, i) => {
  // молекулы — по всему сосуду, но не внутри зерна
  const left = i % 2 === 0
  return { x: left ? 40 + seed(i) * 130 : 380 + seed(i) * 130, y: 40 + seed(i + 50) * 190, w1: 0.6 + seed(i + 9) * 0.8, w2: 0.5 + seed(i + 17) * 0.8, ph: seed(i + 31) * 6.28 }
})

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)

function Gas() {
  const [activated, setActivated] = useState(true)
  const [on, setOn] = useState(false)
  const [t, setT] = useState(0)
  const [tOn, setTOn] = useState(0)

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

  const sites = activated ? SITES_ACTIVE : SITES_PLAIN
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = on ? (reduced ? 1 : Math.min(1, (t - tOn) / 1.6)) : 0
  const caught = on ? Math.min(sites.length, N) : 0
  const left = N - (u >= 1 ? caught : 0)

  const toggle = () => {
    setTOn(t)
    setOn((v) => !v)
  }
  const pickKind = (a: boolean) => {
    setActivated(a)
    setOn(false)
  }

  return (
    <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
      <div>
        <svg viewBox="0 0 540 260" className="w-full rounded-xl bg-white/5" role="img" aria-label="Молекулы ядовитого газа поглощаются порами активированного угля">
          <rect x={12} y={14} width={516} height={232} rx={16} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={1.5} strokeDasharray="6 6" />
          <path d={GRAIN} fill="#2a2d36" stroke="#6b7387" strokeWidth={2} />
          {(activated ? PORES : PORES.slice(0, 2)).map((d, k) => (
            <path key={k} d={d} fill="none" stroke="#4d5363" strokeWidth={activated ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {BASE.map((b, i) => {
            const wx = b.x + 28 * Math.sin(t * b.w1 + b.ph)
            const wy = b.y + 18 * Math.cos(t * b.w2 + b.ph)
            const s = i < caught ? sites[i] : null
            const k = s ? ease(u) : 0
            const x = s ? wx + (s[0] - wx) * k : wx
            const y = s ? wy + (s[1] - wy) * k : wy
            return (
              <g key={i}>
                <circle cx={x - 4} cy={y} r={5.5} fill="#c07ef0" stroke="#fff" strokeWidth={1} />
                <circle cx={x + 4} cy={y} r={5.5} fill="#c07ef0" stroke="#fff" strokeWidth={1} />
              </g>
            )
          })}
          <text x={270} y={236} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.75}>
            {activated ? 'зерно активированного угля: множество пор' : 'зерно обычного угля: пор мало'}
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md bg-white/10" role="radiogroup" aria-label="Какой уголь">
            {[true, false].map((a) => (
              <button key={String(a)} role="radio" aria-checked={a === activated} onClick={() => pickKind(a)} className={`px-3 py-1.5 text-sm font-semibold transition ${a === activated ? 'bg-[#6ee7c4] text-navy' : 'hover:bg-white/20'}`}>
                {a ? 'активированный уголь' : 'обычный уголь'}
              </button>
            ))}
          </div>
          <button onClick={toggle} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${on ? 'bg-white/10 hover:bg-white/20' : 'bg-orange text-navy hover:brightness-110'}`}>
            {on ? '↺ Сначала' : '▶ Пропустить воздух через уголь'}
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm" aria-live="polite">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs text-white/60">Молекул газа в воздухе</div>
          <div className="text-2xl font-extrabold">
            {left} <span className="text-base font-semibold text-white/60">из {N}</span>
          </div>
        </div>
        <p className="rounded-xl bg-white/10 p-3 leading-relaxed text-white/90">
          {!on ? (
            <>Фиолетовые частицы — молекулы ядовитого газа. Нажмите кнопку и посмотрите, куда они денутся.</>
          ) : activated ? (
            <>
              Молекулы газа <b>«прилипли»</b> к стенкам пор — уголь их <b>поглотил поверхностью</b>. Это <b>адсорбция</b>. У 1 г активированного угля поверхность пор до <b>1000 м²</b> — почти 4 теннисных корта! На этом основан противогаз Н. Д. Зелинского.
            </>
          ) : (
            <>Пор мало — поверхность небольшая, и уголь поглотил лишь часть газа. Уголь «активируют» — прогревают паром, чтобы открыть множество пор.</>
          )}
        </p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- раствор */

const INK = '#7b3fc4'

function Ink() {
  const [coal, setCoal] = useState(true)
  const [run, setRun] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!run) return
    const id = setTimeout(() => setDone(true), 3200)
    return () => clearTimeout(id)
  }, [run])
  const reset = () => {
    setRun(false)
    setDone(false)
  }
  const pick = (c: boolean) => {
    setCoal(c)
    reset()
  }
  const outColor = coal ? 'rgba(200,230,255,.35)' : INK
  return (
    <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
      <div>
        <svg viewBox="0 0 540 280" className="w-full rounded-xl bg-white/5" role="img" aria-label={coal ? 'Раствор чернил проходит через слой угля и выходит бесцветным' : 'Раствор чернил проходит через бумажный фильтр и остаётся окрашенным'}>
          {/* жидкость в воронке */}
          <clipPath id="funnel-clip">
            <path d="M 170 30 L 370 30 L 284 140 L 256 140 Z" />
          </clipPath>
          <g clipPath="url(#funnel-clip)">
            <rect x={160} y={run ? 96 : 40} width={220} height={120} fill={INK} opacity={0.85} style={{ transition: 'y 3s linear' }} />
            {coal && <rect x={160} y={104} width={220} height={40} fill="#23252d" />}
            {coal && Array.from({ length: 14 }, (_, k) => <circle key={k} cx={240 + (k % 7) * 10} cy={112 + Math.floor(k / 7) * 12} r={3} fill="#3b3f4a" />)}
          </g>
          <path d="M 170 30 L 256 140 V 178 M 370 30 L 284 140 V 178" fill="none" stroke="#fff" strokeWidth={2.4} strokeOpacity={0.9} />
          <path d="M 256 178 H 284" stroke="#fff" strokeWidth={2} strokeOpacity={0.5} />
          {coal && (
            <text x={392} y={128} fontSize={12} fill="#fff" opacity={0.8}>
              ← слой угля
            </text>
          )}
          {/* капли */}
          {run && !done && [0, 1, 2].map((k) => <circle key={k} cx={270} cy={184} r={4} fill={coal ? '#cfe6ff' : INK} style={{ animation: `drip-down 1s linear ${k * 0.33}s infinite` }} />)}
          {/* стакан */}
          <clipPath id="beaker-clip">
            <path d="M 206 196 V 262 Q 206 270 214 270 H 326 Q 334 270 334 262 V 196 Z" />
          </clipPath>
          <g clipPath="url(#beaker-clip)">
            <rect x={200} y={run ? 222 : 272} width={140} height={60} fill={outColor} style={{ transition: 'y 3.2s linear' }} />
          </g>
          <path d="M 206 196 V 262 Q 206 270 214 270 H 326 Q 334 270 334 262 V 196" fill="none" stroke="#fff" strokeWidth={2.4} strokeOpacity={0.9} />
          <text x={100} y={60} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.8}>
            раствор чернил
          </text>
          <text x={430} y={250} textAnchor="middle" fontSize={13} fontWeight={700} fill={done ? (coal ? '#6ee7c4' : '#ff8a8f') : '#fff'}>
            {done ? (coal ? 'фильтрат бесцветный!' : 'фильтрат окрашен') : 'фильтрат'}
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md bg-white/10" role="radiogroup" aria-label="Фильтр">
            {[true, false].map((c) => (
              <button key={String(c)} role="radio" aria-checked={c === coal} onClick={() => pick(c)} className={`px-3 py-1.5 text-sm font-semibold transition ${c === coal ? 'bg-[#6ee7c4] text-navy' : 'hover:bg-white/20'}`}>
                {c ? 'фильтр с углём' : 'фильтр без угля'}
              </button>
            ))}
          </div>
          <button onClick={run ? reset : () => setRun(true)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${run ? 'bg-white/10 hover:bg-white/20' : 'bg-orange text-navy hover:brightness-110'}`}>
            {run ? '↺ Сначала' : '▶ Профильтровать'}
          </button>
        </div>
      </div>
      <p className="rounded-xl bg-white/10 p-3 text-sm leading-relaxed text-white/90" aria-live="polite">
        {!done ? (
          <>Окрашенный раствор пропускают через воронку. Сравните: фильтр с измельчённым активированным углём и обычный бумажный фильтр.</>
        ) : coal ? (
          <>
            Молекулы красителя <b>задержались на поверхности угля</b> — из воронки вытекает бесцветная жидкость. Это <b>адсорбция</b>, а не химическая реакция: новых веществ не образуется. Так очищают воду, сахарный сироп, а таблетки угля помогают при отравлениях.
          </>
        ) : (
          <>Бумажный фильтр задерживает только нерастворимые частицы, а растворённый краситель проходит сквозь него — раствор остался окрашенным.</>
        )}
      </p>
    </div>
  )
}
