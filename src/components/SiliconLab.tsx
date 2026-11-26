import { useState } from 'react'
import { LAB_CASES, LAB_REAGENTS, type LabReagent } from '../lib/carbonSilicon'
import { tex } from './RichText'

const X = [90, 230, 370, 510]
const TOP = 60
const BOTTOM = 210

/** Углерод и кремний в растворах: кремний — со щёлочью (H₂), углерод — с конц. азотной кислотой (NO₂) */
export default function SiliconLab() {
  const [el, setEl] = useState<'C' | 'Si'>('Si')
  const [added, setAdded] = useState<LabReagent[]>([])
  const [sel, setSel] = useState<LabReagent | null>(null)
  const pickEl = (e: 'C' | 'Si') => {
    setEl(e)
    setAdded([])
    setSel(null)
  }
  const add = (r: LabReagent) => {
    setAdded((a) => (a.includes(r) ? a : [...a, r]))
    setSel(r)
  }
  const cur = sel ? LAB_CASES.find((c) => c.el === el && c.reagent === sel)! : null
  const name = el === 'C' ? 'углерод (порошок угля)' : 'кремний (порошок)'

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/70">Вещество:</span>
        {(['Si', 'C'] as const).map((e) => (
          <button key={e} onClick={() => pickEl(e)} aria-pressed={e === el} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${e === el ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {e === 'Si' ? 'Si · кремний' : 'C · углерод'}
          </button>
        ))}
        <button onClick={() => LAB_REAGENTS.forEach((r) => add(r.id))} className="ml-auto rounded-md bg-teal px-3 py-1.5 text-sm font-semibold text-white transition hover:brightness-110">
          Добавить во все пробирки
        </button>
      </div>
      <p className="mt-2 text-sm text-white/75">Нажмите на пробирку, чтобы насыпать в неё {name}.</p>

      <svg viewBox="0 0 600 310" className="mt-2 w-full rounded-xl bg-white/5" role="img" aria-label={`${name} в растворах HCl, NaOH, HNO₃ и воде`}>
        {LAB_REAGENTS.map((r, k) => {
          const x = X[k]
          const c = LAB_CASES.find((z) => z.el === el && z.reagent === r.id)!
          const on = added.includes(r.id)
          const active = sel === r.id
          return (
            <g key={r.id} role="button" tabIndex={0} aria-label={`Добавить в пробирку с ${r.sub}`} onClick={() => add(r.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && add(r.id)} style={{ cursor: 'pointer', outline: 'none' }}>
              <rect x={x - 52} y={TOP - 34} width={104} height={252} rx={12} fill="none" stroke={active ? '#ffd54a' : 'transparent'} strokeWidth={1.4} />
              <clipPath id={`lab-${r.id}`}>
                <path d={`M ${x - 22} ${TOP} V ${BOTTOM} A 22 22 0 0 0 ${x + 22} ${BOTTOM} V ${TOP} Z`} />
              </clipPath>
              <g clipPath={`url(#lab-${r.id})`}>
                <rect x={x - 30} y={TOP + 50} width={60} height={200} fill={r.liquid} />
                {on && c.gas === 'NO2' && <rect x={x - 30} y={TOP} width={60} height={50} fill="#b5501f" opacity={0.55} style={{ animation: 'fade-up 1.2s ease-out both' }} />}
                {on && (
                  <rect
                    x={x - 30}
                    y={BOTTOM + 6}
                    width={60}
                    height={30}
                    fill={el === 'C' ? '#1d1f26' : '#6f7d96'}
                    style={{ opacity: c.reacts ? 0.55 : 1 }}
                  />
                )}
                {on &&
                  c.reacts &&
                  [0, 1, 2, 3, 4, 5].map((n) => (
                    <circle key={n} cx={x - 12 + (n % 3) * 12} cy={BOTTOM} r={c.gas === 'NO2' ? 4 : 3.5} fill={c.gas === 'NO2' ? '#d0743c' : '#ffffff'} opacity={0} style={{ animation: `rise ${1.6 + (n % 3) * 0.4}s linear ${n * 0.25}s infinite` }} />
                  ))}
              </g>
              <path d={`M ${x - 22} ${TOP} V ${BOTTOM} A 22 22 0 0 0 ${x + 22} ${BOTTOM} V ${TOP}`} fill="none" stroke="#fff" strokeWidth={2.2} strokeOpacity={0.9} />
              <path d={`M ${x - 26} ${TOP} H ${x + 26}`} stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
              {r.id === 'HNO3' && on && (
                <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
                  <path d={`M ${x} ${BOTTOM + 52} C ${x - 14} ${BOTTOM + 40} ${x - 6} ${BOTTOM + 32} ${x} ${BOTTOM + 28} C ${x + 6} ${BOTTOM + 32} ${x + 14} ${BOTTOM + 40} ${x} ${BOTTOM + 52} Z`} fill="#ffb347" />
                </g>
              )}
              {on && (
                <text x={x} y={TOP - 12} textAnchor="middle" fontSize={12} fontWeight={800} fill={c.reacts ? '#6ee7c4' : '#ff8a8f'}>
                  {c.reacts ? (c.gas === 'H2' ? 'H₂↑' : 'NO₂↑ бурый') : 'нет реакции'}
                </text>
              )}
              <text x={x} y={BOTTOM + 72} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff">
                {r.label}
              </text>
              <text x={x} y={BOTTOM + 92} textAnchor="middle" fontSize={14} fill="#fff" opacity={0.7}>
                {r.sub}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-3 space-y-2" aria-live="polite">
        {cur ? (
          <>
            {cur.eq && <div className="overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${cur.eq}}`, true) }} />}
            <p className="rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
              <b className={cur.reacts ? 'text-[#6ee7c4]' : 'text-[#ff8a8f]'}>{cur.reacts ? 'Реагирует' : 'Не реагирует'}:</b> {cur.sign}. {cur.why}
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
            Сравните углерод и кремний: один из них реагирует с <b>концентрированной азотной кислотой</b>, другой — со <b>щёлочью</b>. А с соляной кислотой и водой не реагирует ни тот, ни другой.
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-white/60">Рисунок схематичен. Опыты с концентрированной азотной кислотой проводят только в вытяжном шкафу.</p>
    </div>
  )
}
