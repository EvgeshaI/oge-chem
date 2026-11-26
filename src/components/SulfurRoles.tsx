import { useState } from 'react'
import { SULFUR_LEVELS, SULFUR_REACTIONS } from '../lib/chalcogens'
import { tex } from './RichText'

const Y: Record<string, number> = { '+6': 40, '+4': 105, '0': 170, '−2': 235 }

/** «Лестница» степеней окисления серы: с кем сера — окислитель, а с кем — восстановитель */
export default function SulfurRoles() {
  const [id, setId] = useState<string | null>(null)
  const r = SULFUR_REACTIONS.find((x) => x.id === id)
  const down = r?.to === '−2'
  const color = down ? '#6ee7c4' : '#ffb15c'

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите, с чем реагирует сера, — и посмотрите, куда «шагает» её степень окисления.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#6ee7c4]">Сера — окислитель (принимает ē)</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {SULFUR_REACTIONS.filter((x) => x.role === 'окислитель').map((x) => (
              <button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? 'bg-[#6ee7c4] text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
                S + {x.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#ffb15c]">Сера — восстановитель (отдаёт ē)</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {SULFUR_REACTIONS.filter((x) => x.role === 'восстановитель').map((x) => (
              <button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? 'bg-[#ffb15c] text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
                S + {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid items-start gap-3 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 270" className="w-full rounded-xl bg-white/5" role="img" aria-label="Степени окисления серы: −2, 0, +4, +6">
          <line x1={60} y1={30} x2={60} y2={248} stroke="#fff" strokeOpacity={0.3} strokeWidth={3} />
          {SULFUR_LEVELS.map((l) => {
            const active = l.ox === '0' || l.ox === r?.to
            return (
              <g key={l.ox} style={{ opacity: active || !r ? 1 : 0.45, transition: 'opacity .4s' }}>
                <circle cx={60} cy={Y[l.ox]} r={20} fill={l.ox === '0' ? '#f7d94c' : l.ox === r?.to ? color : '#2a3560'} stroke="#fff" strokeWidth={1.6} style={{ transition: 'fill .4s' }} />
                <text x={60} y={Y[l.ox] + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={l.ox === '0' || l.ox === r?.to ? '#1b2445' : '#fff'}>
                  {l.ox}
                </text>
                <text x={92} y={Y[l.ox] + 5} fontSize={13} fill="#fff" opacity={0.9}>
                  {l.examples}
                </text>
              </g>
            )
          })}
          {r && (
            <g key={r.id} style={{ animation: 'fade-up .4s ease-out both' }}>
              <path
                d={down ? `M 34 ${Y['0'] + 12} C 14 ${Y['0'] + 30} 14 ${Y['−2'] - 30} 34 ${Y['−2'] - 12}` : `M 34 ${Y['0'] - 12} C 10 ${Y['0'] - 40} 10 ${Y[r.to] + 40} 34 ${Y[r.to] + 12}`}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeDasharray="6 5"
                style={{ animation: 'dash-flow .8s linear infinite' }}
              />
              <text x={2} y={down ? Y['0'] + 40 : (Y['0'] + Y['+4']) / 2 + 4} fontSize={12} fontWeight={800} fill={color}>
                {down ? '+2ē' : r.to === '+4' ? '−4ē' : '−6ē'}
              </text>
            </g>
          )}
        </svg>

        <div className="space-y-2" aria-live="polite">
          {r ? (
            <>
              <div className="overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${r.eq}}`, true) }} />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-white/10 px-3 py-2">
                  <div className="text-xs text-white/60">Продукт</div>
                  <div className="font-bold">{r.product}</div>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2">
                  <div className="text-xs text-white/60">Условия</div>
                  <div className="font-bold">{r.cond}</div>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2">
                  <div className="text-xs text-white/60">Степень окисления серы</div>
                  <div className="text-lg font-bold">0 → {r.to}</div>
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: down ? 'rgba(110,231,196,.22)' : 'rgba(255,177,92,.25)' }}>
                  <div className="text-xs text-white/60">Роль серы</div>
                  <div className="text-lg font-bold">{r.role}</div>
                </div>
              </div>
              <p className="rounded-xl bg-white/10 p-3 text-sm leading-relaxed text-white/90">
                {down ? (
                  <>
                    Партнёр — <b>металл или водород</b>: он отдаёт электроны, а сера их <b>принимает</b> (0 → −2). Сера — окислитель.
                  </>
                ) : (
                  <>
                    Партнёр — <b>более сильный окислитель</b> ({r.id === 'o2' ? 'кислород' : 'концентрированная кислота'}): он отнимает электроны у серы (0 → {r.to}). Сера — восстановитель.
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
              Степень окисления серы в простом веществе — <b>0</b>. Это промежуточное значение: сера может и <b>опуститься</b> до −2 (принять электроны), и <b>подняться</b> до +4 или +6 (отдать электроны). Поэтому сера бывает и окислителем, и восстановителем. У кислорода «вверх» дороги почти нет — он почти всегда окислитель.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
