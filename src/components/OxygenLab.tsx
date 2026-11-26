import { useEffect, useRef, useState } from 'react'
import { tex } from './RichText'

type Method = 'kmno4' | 'h2o2' | 'kclo3'
type Collect = 'up' | 'down' | 'water'

const METHODS: { id: Method; label: string; eq: string; text: string; heat: boolean }[] = [
  {
    id: 'kmno4',
    label: 'KMnO₄, нагревание',
    eq: '2KMnO4 ->[t] K2MnO4 + MnO2 + O2 ^',
    text: 'Перманганат калия (тёмно-фиолетовые кристаллы, в быту — «марганцовка») при нагревании разлагается и выделяет кислород.',
    heat: true,
  },
  {
    id: 'h2o2',
    label: 'H₂O₂ + MnO₂',
    eq: '2H2O2 ->[MnO2] 2H2O + O2 ^',
    text: 'Пероксид водорода разлагается без нагревания, если добавить **катализатор** — оксид марганца(IV) $\\ce{MnO2}$. Сам катализатор при этом не расходуется.',
    heat: false,
  },
  {
    id: 'kclo3',
    label: 'KClO₃, t, MnO₂',
    eq: '2KClO3 ->[t, MnO2] 2KCl + 3O2 ^',
    text: 'Хлорат калия (бертолетова соль) при нагревании с катализатором $\\ce{MnO2}$ разлагается на хлорид калия и кислород.',
    heat: true,
  },
]

const COLLECT: { id: Collect; label: string; ok: boolean; why: string }[] = [
  {
    id: 'up',
    label: 'Сосуд отверстием вверх',
    ok: true,
    why: 'Можно. Кислород **немного тяжелее воздуха** (M(O₂) = 32 г/моль, воздуха — 29 г/моль): он опускается на дно и вытесняет воздух вверх. Трубку опускают до самого дна.',
  },
  {
    id: 'down',
    label: 'Сосуд отверстием вниз',
    ok: false,
    why: 'Нельзя. Кислород тяжелее воздуха и **вытекает вниз** из перевёрнутого сосуда. Так собирают только лёгкие газы — водород, аммиак.',
  },
  {
    id: 'water',
    label: 'Вытеснением воды',
    ok: true,
    why: 'Можно. Кислород **мало растворим в воде**: пузырьки поднимаются в перевёрнутый цилиндр и вытесняют из него воду. Так получают самый чистый кислород. Заполненный цилиндр закрывают под водой стеклянной пластинкой и вынимают.',
  },
]

const GAS = '#9cc2ff'

/** Получение кислорода в лаборатории, способы собирания и распознавание тлеющей лучинкой */
export default function OxygenLab() {
  const [method, setMethod] = useState<Method>('kmno4')
  const [collect, setCollect] = useState<Collect>('up')
  const [run, setRun] = useState(0) // ключ запуска заполнения
  const [splint, setSplint] = useState(false)
  const timer = useRef<number>(0)
  const m = METHODS.find((x) => x.id === method)!
  const c = COLLECT.find((x) => x.id === collect)!

  useEffect(() => () => clearTimeout(timer.current), [])

  const restart = () => {
    setSplint(false)
    setRun((r) => r + 1)
  }
  const pickMethod = (id: Method) => {
    setMethod(id)
    restart()
  }
  const pickCollect = (id: Collect) => {
    setCollect(id)
    restart()
  }
  const test = () => {
    setSplint(false)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSplint(true), 60)
  }

  const pipe = (d: string) => (
    <>
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={GAS} strokeWidth={3} strokeDasharray="7 7" strokeLinejoin="round" style={{ animation: 'dash-flow 1s linear infinite' }} />
    </>
  )

  const flare = splint && c.ok

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-xs font-bold uppercase tracking-wide text-white/60">1. Чем получить</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {METHODS.map((x) => (
          <button key={x.id} onClick={() => pickMethod(x.id)} aria-pressed={x.id === method} className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${x.id === method ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs font-bold uppercase tracking-wide text-white/60">2. Как собрать</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {COLLECT.map((x) => (
          <button key={x.id} onClick={() => pickCollect(x.id)} aria-pressed={x.id === collect} className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${x.id === collect ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <svg viewBox="0 0 700 310" className="mx-auto block w-full min-w-[520px] rounded-xl bg-white/5" role="img" aria-label={`Получение кислорода: ${m.label}; собирание: ${c.label}`}>
          {/* ---------- прибор для получения ---------- */}
          {method === 'h2o2' ? (
            <g>
              <defs>
                <clipPath id="ol-flask">
                  <circle cx={130} cy={210} r={58} />
                </clipPath>
              </defs>
              <rect x={116} y={120} width={28} height={40} fill="none" stroke="#fff" strokeWidth={2.4} />
              <circle cx={130} cy={210} r={58} fill="rgba(255,255,255,.04)" stroke="#fff" strokeWidth={2.4} />
              <g clipPath="url(#ol-flask)">
                <rect x={70} y={205} width={120} height={70} fill="#cfe4ff" opacity={0.45} />
                <rect x={70} y={258} width={120} height={14} fill="#26262e" />
              </g>
              {Array.from({ length: 5 }, (_, i) => (
                <circle key={`${run}-${i}`} cx={108 + i * 11} cy={250} r={3 + (i % 2)} fill="#fff" opacity={0} style={{ animation: `rise ${1.4 + i * 0.25}s linear ${i * 0.3}s infinite` }} />
              ))}
              <rect x={112} y={110} width={36} height={14} rx={3} fill="#c9a06a" />
              <text x={130} y={232} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1b2445">H₂O₂</text>
              <text x={130} y={290} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.85}>MnO₂ — катализатор</text>
            </g>
          ) : (
            <g>
              <defs>
                <clipPath id="ol-tube">
                  <path d="M 112 110 V 230 A 18 18 0 0 0 148 230 V 110 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#ol-tube)">
                <rect x={108} y={212} width={44} height={40} fill={method === 'kmno4' ? '#4a1f5e' : '#eeeeee'} />
                {method === 'kclo3' && Array.from({ length: 6 }, (_, i) => <circle key={i} cx={118 + (i % 3) * 11} cy={222 + Math.floor(i / 3) * 10} r={2.6} fill="#26262e" />)}
              </g>
              <path d="M 112 110 V 230 A 18 18 0 0 0 148 230 V 110" fill="none" stroke="#fff" strokeWidth={2.4} />
              <rect x={108} y={100} width={44} height={14} rx={3} fill="#c9a06a" />
              <rect x={148} y={150} width={60} height={8} rx={3} fill="#a07a4a" />
              <text x={104} y={232} textAnchor="end" fontSize={11} fontWeight={700} fill="#fff">{method === 'kmno4' ? 'KMnO₄' : 'KClO₃ + MnO₂'}</text>
              <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
                <path d="M 130 300 C 112 286 120 268 130 258 C 140 268 148 286 130 300 Z" fill="#ffb347" />
                <path d="M 130 300 C 122 292 126 280 130 276 C 134 280 138 292 130 300 Z" fill="#5b8cff" />
              </g>
            </g>
          )}

          {/* ---------- газоотводная трубка ---------- */}
          {collect === 'up' && pipe('M 130 104 V 50 H 470 V 268')}
          {collect === 'down' && pipe('M 130 104 V 50 H 360 V 296 H 470 V 110')}
          {collect === 'water' && pipe('M 130 104 V 50 H 400 V 284 H 470 V 250')}

          {/* ---------- сосуд для собирания ---------- */}
          {collect === 'up' && (
            <g>
              <defs>
                <clipPath id="ol-jar-up">
                  <rect x={420} y={110} width={100} height={170} rx={8} />
                </clipPath>
              </defs>
              <g clipPath="url(#ol-jar-up)">
                <rect key={`f-${run}`} x={420} y={110} width={100} height={170} fill={GAS} opacity={0.45} style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'fill-up 3.2s ease-out both' }} />
              </g>
              <path d="M 420 104 V 272 Q 420 280 428 280 H 512 Q 520 280 520 272 V 104" fill="none" stroke="#fff" strokeWidth={2.4} />
              <path d="M 500 140 V 96" stroke="#fff" strokeWidth={2} />
              <path d="M 495 102 L 500 94 L 505 102" stroke="#fff" strokeWidth={2} fill="none" />
              <text x={540} y={110} fontSize={11} fill="#fff" opacity={0.85}>воздух ↑</text>
              <text x={470} y={300} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.85}>O₂ заполняет снизу</text>
            </g>
          )}
          {collect === 'down' && (
            <g>
              <path d="M 420 250 V 82 Q 420 74 428 74 H 512 Q 520 74 520 82 V 250" fill="none" stroke="#fff" strokeWidth={2.4} />
              {Array.from({ length: 4 }, (_, i) => (
                <circle key={`${run}-${i}`} cx={440 + i * 22} cy={240} r={4} fill={GAS} style={{ animation: `drip-down ${1.4 + i * 0.2}s linear ${i * 0.35}s infinite` }} />
              ))}
              <text x={470} y={300} textAnchor="middle" fontSize={11} fill="#ff9d9d">O₂ вытекает вниз ↓</text>
            </g>
          )}
          {collect === 'water' && (
            <g>
              <path d="M 380 190 V 290 Q 380 298 388 298 H 592 Q 600 298 600 290 V 190" fill="rgba(143,196,255,.06)" stroke="#fff" strokeWidth={2.4} />
              <rect x={382} y={214} width={216} height={82} rx={6} fill="#8fc4ff" opacity={0.35} />
              <defs>
                <clipPath id="ol-cyl">
                  <rect x={440} y={86} width={70} height={190} />
                </clipPath>
              </defs>
              <g clipPath="url(#ol-cyl)">
                <rect x={440} y={86} width={70} height={190} fill="#8fc4ff" opacity={0.35} />
                <rect key={`w-${run}`} x={440} y={86} width={70} height={110} fill="#1e2a52" style={{ transformBox: 'fill-box', transformOrigin: 'top', animation: 'fill-up 3.2s ease-out both' }} />
                <rect key={`g-${run}`} x={440} y={86} width={70} height={110} fill={GAS} opacity={0.3} style={{ transformBox: 'fill-box', transformOrigin: 'top', animation: 'fill-up 3.2s ease-out both' }} />
              </g>
              <path d="M 440 276 V 94 Q 440 86 448 86 H 502 Q 510 86 510 94 V 276" fill="none" stroke="#fff" strokeWidth={2.4} />
              {Array.from({ length: 4 }, (_, i) => (
                <circle key={`${run}-${i}`} cx={466 + (i % 2) * 8} cy={246} r={3.5} fill="#fff" opacity={0} style={{ animation: `rise ${1.3 + i * 0.2}s linear ${i * 0.3}s infinite` }} />
              ))}
              <text x={620} y={150} fontSize={11} fill="#fff" opacity={0.85}>вода</text>
              <text x={620} y={164} fontSize={11} fill="#fff" opacity={0.85}>вытесняется</text>
            </g>
          )}

          {/* ---------- лучинка ---------- */}
          {splint && (
            <g style={{ animation: 'fade-up .4s ease-out both' }}>
              <line x1={640} y1={40} x2={collect === 'down' ? 480 : 490} y2={collect === 'down' ? 230 : collect === 'water' ? 92 : 112} stroke="#c89b5a" strokeWidth={5} strokeLinecap="round" />
              {flare ? (
                <g transform={`translate(${collect === 'down' ? 480 : 490} ${collect === 'down' ? 230 : collect === 'water' ? 92 : 112})`}>
                  <circle r={22} fill="#ffcf6b" opacity={0.35} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glow 1s ease-in-out infinite' }} />
                  <path d="M 0 6 C -12 -6 -6 -22 0 -32 C 6 -22 12 -6 0 6 Z" fill="#ffb347" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .4s ease-in-out infinite' }} />
                  <path d="M 0 6 C -6 0 -3 -10 0 -16 C 3 -10 6 0 0 6 Z" fill="#fff3b0" />
                </g>
              ) : (
                <circle cx={collect === 'down' ? 480 : 490} cy={collect === 'down' ? 230 : collect === 'water' ? 92 : 112} r={4} fill="#ff6b3d" />
              )}
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-white/60">Реакция</div>
          <div className="overflow-x-auto py-1 text-center text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${m.eq}}`, true) }} />
          <p className="text-sm leading-relaxed text-white/85" dangerouslySetInnerHTML={{ __html: rich(m.text) }} />
        </div>
        <div className={`rounded-xl p-3 ${c.ok ? 'bg-teal/25' : 'bg-[#e5484d]/25'}`} aria-live="polite">
          <div className="text-xs font-bold uppercase tracking-wide text-white/60">Собирание</div>
          <p className="mt-1 text-sm leading-relaxed text-white/90" dangerouslySetInnerHTML={{ __html: rich(c.why) }} />
          <button onClick={test} className="mt-2 rounded-lg bg-orange px-3 py-1.5 text-sm font-bold text-navy hover:brightness-110">
            🔥 Внести тлеющую лучинку
          </button>
          {splint && (
            <p className="mt-2 text-sm font-semibold">
              {flare ? 'Лучинка ярко вспыхнула — в сосуде кислород!' : 'Лучинка только тлеет: кислород из сосуда вытек.'}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-white/60">Схема упрощена. Тлеющая лучинка вспыхивает в кислороде — так кислород распознают и проверяют, заполнен ли сосуд.</p>
    </div>
  )
}

function rich(text: string) {
  return text.replace(/\$([^$]+)\$/g, (_, f: string) => tex(f)).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}
