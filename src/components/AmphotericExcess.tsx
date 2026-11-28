import { useState } from 'react'
import { EXCESS_CASES } from '../lib/qualitative'
import { tex } from './RichText'
import { TestTube } from './TestTube'

/** Амфотерный гидроксид и избыток щёлочи: капаем NaOH и смотрим на осадок */
export default function AmphotericExcess() {
  const [i, setI] = useState(0)
  const [k, setK] = useState(0)
  const c = EXCESS_CASES[i]
  const last = c.stages.length - 1
  const st = c.stages[k]
  const excess = k >= 4
  const dissolved = c.amphoteric && k === last

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите ион и добавляйте раствор щёлочи NaOH по каплям.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXCESS_CASES.map((x, j) => (
          <button
            key={x.ion}
            onClick={() => {
              setI(j)
              setK(0)
            }}
            aria-pressed={j === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${j === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.ion}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-center gap-6">
        <div className="relative">
          <div className="flex h-12 items-end justify-center">
            {k > 0 && k < last + (c.amphoteric ? 0 : 1) && (
              <span key={k} className="block h-3.5 w-3.5 rounded-full bg-[#ffd29f]" style={{ animation: 'drip-down .9s ease-in both' }} aria-hidden />
            )}
          </div>
          <TestTube className="h-44 w-[74px]" liquid="rgba(255,255,255,.14)" precip={c.color} precipH={st.precip} label={c.sample} />
        </div>
        <div className="flex flex-col gap-2 pb-6 text-sm">
          <div className="text-white/70">Добавлено капель NaOH</div>
          <div className="flex gap-1.5" aria-label={`Капель: ${k}`}>
            {Array.from({ length: last }, (_, j) => (
              <span
                key={j}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${j < k ? (j >= 3 ? 'bg-pink text-white' : 'bg-orange text-navy') : 'bg-white/10 text-white/40'}`}
              >
                {j + 1}
              </span>
            ))}
          </div>
          <div className={`font-semibold ${excess ? 'text-pink' : 'text-white/60'}`}>{excess ? 'щёлочь в избытке' : k === 0 ? 'щёлочи нет' : 'щёлочи не хватает или в самый раз'}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setK((v) => Math.min(v + 1, last))}
          disabled={k === last}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-bold text-navy transition hover:brightness-110 disabled:opacity-40"
        >
          Добавить каплю NaOH
        </button>
        <button onClick={() => setK(0)} disabled={k === 0} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-40">
          ↺ Заново
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <div key={`${i}-${k}`} style={{ animation: 'pop .3s ease-out both' }}>
          <p className={dissolved ? 'font-bold text-orange' : ''}>{st.text}</p>
          {st.eq && <div className="mt-1 overflow-x-auto text-center text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${st.eq}}`, true) }} />}
        </div>
      </div>
    </div>
  )
}
