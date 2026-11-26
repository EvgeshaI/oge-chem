import { useState } from 'react'
import { ACTIVITY, CARBON_LIMIT, REDUCTION_CASES } from '../lib/carbonSilicon'
import { tex } from './RichText'

const SPECKS = Array.from({ length: 16 }, (_, k) => ({ x: 158 + ((k * 37) % 64), y: 196 + ((k * 23) % 30) }))

/** Восстановление металлов из оксидов углём: идёт только для металлов правее алюминия в ряду активности */
export default function CarbonReduction() {
  const [i, setI] = useState(0)
  const [hot, setHot] = useState(false)
  const c = REDUCTION_CASES[i]
  const pos = ACTIVITY.indexOf(c.sym)
  const done = hot && c.reacts

  const pick = (k: number) => {
    setI(k)
    setHot(false)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите оксид металла, смешайте с углём и нагрейте.</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {REDUCTION_CASES.map((x, k) => (
          <button key={x.oxide} onClick={() => pick(k)} aria-pressed={k === i} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {x.oxide} + C
          </button>
        ))}
      </div>

      {/* ряд активности */}
      <div className="mt-3 overflow-x-auto">
        <div className="flex min-w-[560px] items-stretch gap-0.5 text-center text-sm font-bold">
          {ACTIVITY.map((m, k) => {
            const active = k <= CARBON_LIMIT
            const here = k === pos
            return (
              <div
                key={m}
                className={`flex-1 rounded-md px-1 py-1.5 transition ${here ? 'bg-orange text-navy ring-2 ring-white' : active ? 'bg-[#ff8a8f]/25 text-white/80' : m === 'H' ? 'bg-white/5 text-white/50' : 'bg-[#6ee7c4]/25 text-white/90'}`}
              >
                {m}
              </div>
            )
          })}
        </div>
        <div className="mt-1 flex min-w-[560px] text-xs text-white/70">
          <div className="text-[#ff8a8f]" style={{ width: `${((CARBON_LIMIT + 1) / ACTIVITY.length) * 100}%` }}>
            ← углём не восстановить (активные металлы)
          </div>
          <div className="text-[#6ee7c4]">углём восстанавливают →</div>
        </div>
      </div>

      <div className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <svg viewBox="0 0 380 280" className="w-full rounded-xl bg-white/5" role="img" aria-label={`${c.oxide} и уголь при нагревании: ${c.reacts ? `получается ${c.metal}` : 'реакция не идёт'}`}>
          {/* пробирка */}
          <clipPath id="red-tube">
            <path d="M 150 40 V 210 A 40 40 0 0 0 230 210 V 40 Z" />
          </clipPath>
          <g clipPath="url(#red-tube)" style={!c.reacts && hot ? { animation: 'shake .5s ease-in-out 3' } : undefined}>
            <rect x={140} y={190} width={100} height={70} fill={done ? c.to : c.from} style={{ transition: 'fill 2.4s ease 0.6s' }} />
            {SPECKS.map((s, k) => (
              <circle key={k} cx={s.x} cy={s.y} r={2.6} fill="#15161a" style={{ opacity: done ? 0 : 1, transition: 'opacity 2s ease 0.8s' }} />
            ))}
          </g>
          <path d="M 150 40 V 210 A 40 40 0 0 0 230 210 V 40" fill="none" stroke="#fff" strokeWidth={2.4} strokeOpacity={0.9} />
          <path d="M 144 40 H 236" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
          {/* газ CO */}
          {done &&
            [0, 1, 2, 3, 4].map((k) => (
              <circle key={k} cx={172 + k * 9} cy={180} r={5} fill="#cfd6f5" opacity={0} style={{ animation: `rise ${2 + (k % 3) * 0.4}s linear ${k * 0.35}s infinite` }} />
            ))}
          {done && (
            <text x={250} y={80} fontSize={14} fontWeight={800} fill="#cfd6f5">
              CO↑
            </text>
          )}
          {/* горелка */}
          {hot && (
            <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
              <path d="M 190 280 C 166 262 176 252 190 246 C 204 252 214 262 190 280 Z" fill="#ffb347" />
              <path d="M 190 280 C 180 270 184 262 190 258 C 196 262 200 270 190 280 Z" fill="#ff6b3d" />
            </g>
          )}
          <text x={300} y={214} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.8}>
            {done ? c.toName : c.fromName}
          </text>
          <text x={300} y={230} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.6}>
            {done ? '' : '+ уголь'}
          </text>
        </svg>

        <div className="space-y-2" aria-live="polite">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setHot(true)} disabled={hot} className="rounded-lg bg-orange px-4 py-2 text-sm font-bold text-navy transition hover:brightness-110 disabled:opacity-40">
              🔥 Нагреть
            </button>
            {hot && (
              <button onClick={() => setHot(false)} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20">
                ↺ Сначала
              </button>
            )}
          </div>
          {hot && c.reacts && c.eq && <div className="overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${c.eq}}`, true) }} />}
          <p className="rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
            {!hot ? (
              <>
                {c.oxide}: металл <b>{c.metal}</b> стоит в ряду активности {c.reacts ? <b>правее алюминия</b> : <b>левее цинка (до Al включительно)</b>}. Как вы думаете, восстановит ли его уголь?
              </>
            ) : c.reacts ? (
              <>
                Реакция идёт! Углерод забирает кислород у оксида и выделяется <b>угарный газ</b> CO, а в пробирке остаётся <b>{c.metal}</b>. Углерод — <b>восстановитель</b> (C⁰ → C⁺²), металл восстанавливается до степени окисления 0. Так в доменной печи получают чугун.
              </>
            ) : (
              <>
                <b>Реакция не идёт.</b> {c.metal[0].toUpperCase() + c.metal.slice(1)} — активный металл: он слишком прочно удерживает кислород, и углю его не «отнять». Такие металлы получают электролизом расплавов.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
