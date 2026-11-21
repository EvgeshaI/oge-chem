import { useState } from 'react'

const MEDIA = [
  { id: 'acid', title: 'кислота (HCl)', env: 'кислой среде' },
  { id: 'neutral', title: 'вода', env: 'нейтральной среде' },
  { id: 'alkali', title: 'щёлочь (NaOH)', env: 'щелочной среде' },
] as const

type Env = (typeof MEDIA)[number]['id']

const INDICATORS: { id: string; title: string; colors: Record<Env, [string, string]> }[] = [
  { id: 'litmus', title: 'лакмус', colors: { acid: ['красный', '#e5484d'], neutral: ['фиолетовый', '#8b5cf6'], alkali: ['синий', '#2f7fec'] } },
  { id: 'methyl', title: 'метилоранж', colors: { acid: ['розовый', '#f472b6'], neutral: ['оранжевый', '#fb923c'], alkali: ['жёлтый', '#facc15'] } },
  { id: 'phenol', title: 'фенолфталеин', colors: { acid: ['бесцветный', '#dbeafe'], neutral: ['бесцветный', '#dbeafe'], alkali: ['малиновый', '#d6336c'] } },
]

/** Индикаторы: цвет в кислой, нейтральной и щелочной среде */
export default function Indicators() {
  const [env, setEnv] = useState<Env>('acid')
  const [ind, setInd] = useState(0)
  const [added, setAdded] = useState(false)
  const I = INDICATORS[ind]
  const [name, color] = I.colors[env]
  const medium = MEDIA.find((m) => m.id === env)!

  const reset = () => setAdded(false)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm text-white/75">1. Что в стакане</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {MEDIA.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setEnv(m.id)
                  reset()
                }}
                aria-pressed={env === m.id}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${env === m.id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-white/75">2. Какой индикатор</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {INDICATORS.map((x, k) => (
              <button
                key={x.id}
                onClick={() => {
                  setInd(k)
                  reset()
                }}
                aria-pressed={ind === k}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${ind === k ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {x.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center rounded-xl bg-white/5 p-3">
        <svg viewBox="0 0 160 150" className="w-40" role="img" aria-label={`Стакан: ${added ? name : 'бесцветный раствор'}`}>
          <defs>
            <clipPath id="beaker">
              <path d="M40 20 L46 128 a8 8 0 0 0 8 8 H106 a8 8 0 0 0 8 -8 L120 20 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#beaker)">
            <rect x={30} y={60} width={100} height={90} fill={added ? color : '#dbeafe'} fillOpacity={added ? 0.9 : 0.55} style={{ transition: 'fill 1.2s ease, fill-opacity 1.2s ease' }} />
          </g>
          <path d="M40 20 L46 128 a8 8 0 0 0 8 8 H106 a8 8 0 0 0 8 -8 L120 20" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {added && <circle key={`${env}-${ind}`} cx={80} cy={28} r={5} fill="#fff" style={{ animation: 'drop .6s ease-in both' }} />}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setAdded(true)}
          disabled={added}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-105 disabled:opacity-40"
        >
          Добавить {I.title}
        </button>
        {added && (
          <button onClick={reset} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
            ↺ Сначала
          </button>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        {added ? (
          <p style={{ animation: 'pop .35s ease-out both' }}>
            {I.title[0].toUpperCase() + I.title.slice(1)} в {medium.env}:{' '}
            <b className="text-orange">{name}</b>.
          </p>
        ) : (
          <p className="text-white/80">Нажмите «Добавить», чтобы увидеть цвет.</p>
        )}
      </div>
    </div>
  )
}
