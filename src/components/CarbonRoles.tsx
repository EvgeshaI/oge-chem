import { useState } from 'react'
import { CS_LEVELS, CS_REACTIONS } from '../lib/carbonSilicon'
import { tex } from './RichText'

const VAL: Record<string, number> = { '−4': -4, '−1': -1, '0': 0, '+2': 2, '+4': 4 }
const TOP = 30
const BOTTOM = 240

/** «Лестница» степеней окисления углерода и кремния: с кем элемент — окислитель, а с кем — восстановитель */
export default function CarbonRoles() {
  const [el, setEl] = useState<'C' | 'Si'>('C')
  const [id, setId] = useState<string | null>(null)
  const list = CS_REACTIONS.filter((x) => x.el === el)
  const r = list.find((x) => x.id === id)
  const down = r ? VAL[r.to] < 0 : false
  const color = down ? '#6ee7c4' : '#ffb15c'
  const name = el === 'C' ? 'углерод' : 'кремний'
  const Name = el === 'C' ? 'Углерод' : 'Кремний'
  const levels = CS_LEVELS[el]
  const yOf = (ox: string) => TOP + (levels.findIndex((l) => l.ox === ox) * (BOTTOM - TOP)) / (levels.length - 1)
  const y0 = yOf('0')

  const pickEl = (e: 'C' | 'Si') => {
    setEl(e)
    setId(null)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        {(['C', 'Si'] as const).map((e) => (
          <button key={e} onClick={() => pickEl(e)} aria-pressed={e === el} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${e === el ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {e === 'C' ? 'C · углерод' : 'Si · кремний'}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-white/75">Выберите, с чем реагирует {name}, — и посмотрите, куда «шагает» его степень окисления.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {(['восстановитель', 'окислитель'] as const).map((role) => (
          <div key={role}>
            <div className={`text-xs font-bold uppercase tracking-wide ${role === 'окислитель' ? 'text-[#6ee7c4]' : 'text-[#ffb15c]'}`}>
              {name} — {role} ({role === 'окислитель' ? 'принимает ē' : 'отдаёт ē'})
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {list
                .filter((x) => x.role === role)
                .map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setId(x.id)}
                    aria-pressed={x.id === id}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? (role === 'окислитель' ? 'bg-[#6ee7c4] text-navy' : 'bg-[#ffb15c] text-navy') : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {el} + {x.label}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid items-start gap-3 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <svg viewBox="0 0 320 270" className="w-full rounded-xl bg-white/5" role="img" aria-label={`Степени окисления: ${levels.map((l) => l.ox).join(', ')}`}>
          <line x1={60} y1={TOP} x2={60} y2={BOTTOM} stroke="#fff" strokeOpacity={0.3} strokeWidth={3} />
          {levels.map((l) => {
            const y = yOf(l.ox)
            const on = l.ox === '0' || l.ox === r?.to
            return (
              <g key={`${el}${l.ox}`} style={{ opacity: on || !r ? 1 : 0.45, transition: 'opacity .4s' }}>
                <circle cx={60} cy={y} r={19} fill={l.ox === '0' ? (el === 'C' ? '#9aa3bb' : '#8ea3c4') : l.ox === r?.to ? color : '#2a3560'} stroke="#fff" strokeWidth={1.6} style={{ transition: 'fill .4s' }} />
                <text x={60} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={on ? '#1b2445' : '#fff'}>
                  {l.ox}
                </text>
                <text x={92} y={y + 5} fontSize={13} fill="#fff" opacity={0.9}>
                  {l.examples}
                </text>
              </g>
            )
          })}
          {r && (
            <g key={r.id} style={{ animation: 'fade-up .4s ease-out both' }}>
              <path
                d={down ? `M 36 ${y0 + 12} C 14 ${y0 + 30} 14 ${yOf(r.to) - 30} 36 ${yOf(r.to) - 12}` : `M 36 ${y0 - 12} C 10 ${y0 - 40} 10 ${yOf(r.to) + 40} 36 ${yOf(r.to) + 12}`}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeDasharray="6 5"
                style={{ animation: 'dash-flow .8s linear infinite' }}
              />
              <text x={2} y={(y0 + yOf(r.to)) / 2 + 4} fontSize={12} fontWeight={800} fill={color}>
                {down ? `+${-VAL[r.to]}ē` : `−${VAL[r.to]}ē`}
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
                  <div className="text-xs text-white/60">Степень окисления {el === 'C' ? 'углерода' : 'кремния'}</div>
                  <div className="text-lg font-bold">0 → {r.to}</div>
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: down ? 'rgba(110,231,196,.22)' : 'rgba(255,177,92,.25)' }}>
                  <div className="text-xs text-white/60">Роль</div>
                  <div className="text-lg font-bold">{r.role}</div>
                </div>
              </div>
              <p className="rounded-xl bg-white/10 p-3 text-sm leading-relaxed text-white/90">
                {down ? (
                  <>
                    Партнёр — <b>металл или водород</b> (у них электроотрицательность меньше): он отдаёт электроны, а {name} их <b>принимает</b> (0 → {r.to}). {Name} — окислитель.
                    {r.id === 'c-si' && ' Углерод электроотрицательнее кремния, поэтому в карборунде SiC углерод −4, а кремний +4.'}
                  </>
                ) : (
                  <>
                    Партнёр — <b>более сильный окислитель</b>: кислород, хлор, кислота-окислитель, оксид металла или вода. Он отнимает электроны (0 → {r.to}). {Name} — восстановитель.
                    {r.id === 'si-naoh' && ' Электроны принимает водород из воды и щёлочи — выделяется газ H₂.'}
                    {r.id === 'c-co2' && ' Углерод из CO₂ при этом принимает 2 электрона (+4 → +2).'}
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
              В простом веществе степень окисления — <b>0</b>, посередине между −4 и +4. Поэтому {name} может и <b>опуститься</b> ниже нуля (принять электроны), и <b>подняться</b> выше нуля (отдать электроны). {el === 'C' ? 'Но чаще углерод — восстановитель: на этом основано горение угля и выплавка металлов.' : 'У кремния электроотрицательность меньше, чем у углерода, поэтому он ещё более сильный восстановитель.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
