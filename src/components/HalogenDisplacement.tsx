import { useState } from 'react'
import { HALOGENS, displaces, sub, type Halogen } from '../lib/halogens'
import { tex } from './RichText'
import { TestTube } from './TestTube'

const WATER: Record<string, string> = { Cl: '#dcec8a', Br: '#f6c46a', I: '#e6cc96' }
const FINAL = { br: '#f09a2e', i: '#7a4a1e', starch: '#1b1d66', clWater: '#e6f0ac' }

const SALTS = HALOGENS // K + галогенид
const HALS = HALOGENS.filter((h) => h.sym !== 'F')

const OBS: Record<string, string> = {
  Br: 'раствор желтеет (образуется бром)',
  I: 'раствор буреет (образуется иод)',
}

/** Вытеснение галогенов из растворов их солей: выбор пары, «смешать», цвета, крахмал */
export default function HalogenDisplacement() {
  const [hs, setHs] = useState<Halogen['sym']>('Cl')
  const [ss, setSs] = useState<Halogen['sym']>('Br')
  const [mixed, setMixed] = useState(false)
  const [starch, setStarch] = useState(false)

  const pick = (h: Halogen['sym'], s: Halogen['sym']) => {
    setHs(h)
    setSs(s)
    setMixed(false)
    setStarch(false)
  }

  const hal = HALOGENS.find((x) => x.sym === hs)!
  const salt = HALOGENS.find((x) => x.sym === ss)!
  const reacts = displaces(hs, ss)
  const same = hs === ss

  // что есть в пробирке после смешивания
  const hasI2 = hs === 'I' || (reacts && ss === 'I')
  const hasBr2 = hs === 'Br' || (reacts && ss === 'Br')
  const finalColor = starch && hasI2 ? FINAL.starch : hasI2 ? FINAL.i : hasBr2 ? FINAL.br : FINAL.clWater
  const mixColor = mixed ? finalColor : `${WATER[hs]}`

  const eq = reacts
    ? tex(`\\ce{${hs}2 + 2K${ss} -> 2K${hs} + ${ss}2}`, true)
    : tex(`\\mathrm{${hs}_2 + 2K${ss}} \\;\\not\\longrightarrow`, true)

  let why: string
  if (same) why = `Это один и тот же галоген: вытеснять нечего, реакция не идёт.`
  else if (reacts) why = `${cap(hal.name)} стоит в ряду активности выше (${hal.sym}₂ — более сильный окислитель), чем ${salt.name}. Атомы ${hal.gen} отнимают электроны у ионов ${salt.sym}⁻: ${salt.sym}⁻ − 1ē → ${salt.sym}⁰ (в молекуле ${sub(salt.sym + '2')}), ${hal.sym}⁰ + 1ē → ${hal.sym}⁻.`
  else why = `${cap(hal.name)} — более слабый окислитель, чем ${salt.name}, и не может отнять электрон у иона ${salt.sym}⁻. Более слабый галоген более сильный не вытесняет.`

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите галоген и соль. Нажмите «Смешать» — и посмотрите, что произойдёт с раствором.</div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="w-24 text-sm font-semibold text-white/70">Галоген (р-р)</span>
        {HALS.map((h) => (
          <button
            key={h.sym}
            onClick={() => pick(h.sym, ss)}
            aria-pressed={hs === h.sym}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${hs === h.sym ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {sub(h.sym + '2')}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="w-24 text-sm font-semibold text-white/70">Соль (р-р)</span>
        {SALTS.map((h) => (
          <button
            key={h.sym}
            onClick={() => pick(hs, h.sym)}
            aria-pressed={ss === h.sym}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${ss === h.sym ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            K{h.sym}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-center gap-3 sm:gap-6">
        <TestTube className="h-40 w-16 sm:h-44 sm:w-[70px]" liquid={WATER[hs]} label={`${sub(hs + '2')} (р-р)`} />
        <span className="pb-16 text-2xl font-bold text-orange">+</span>
        <TestTube className="h-40 w-16 sm:h-44 sm:w-[70px]" liquid="rgba(255,255,255,.12)" label={`K${ss} (р-р)`} />
        <span className="pb-16 text-2xl font-bold text-orange">→</span>
        <TestTube
          className="h-40 w-16 sm:h-44 sm:w-[70px]"
          level={0.85}
          liquid={mixed ? mixColor : 'rgba(255,255,255,0)'}
          label={mixed ? 'после' : 'смесь'}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {!mixed ? (
          <button onClick={() => setMixed(true)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Смешать растворы
          </button>
        ) : (
          <button onClick={() => { setMixed(false); setStarch(false) }} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Заново
          </button>
        )}
        <button
          onClick={() => setStarch((v) => !v)}
          disabled={!mixed}
          aria-pressed={starch}
          className={`rounded-lg px-4 py-2 font-semibold transition disabled:opacity-40 ${starch ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {starch ? 'Крахмал добавлен' : 'Добавить крахмал'}
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        <div className={`font-bold ${mixed ? (reacts ? 'text-teal' : 'text-orange') : 'text-white/70'}`}>
          {!mixed ? 'Растворы ещё не смешаны' : reacts ? 'Реакция идёт' : 'Реакция не идёт'}
        </div>
        {mixed && (
          <p className="mt-1 text-[15px] leading-relaxed text-white/90">
            {reacts ? <b>{OBS[ss]}. </b> : <b>цвет не меняется (раствор лишь разбавился). </b>}
            {starch && (hasI2 ? <b className="text-[#9db4ff]">С крахмалом — синее окрашивание: в растворе есть иод. </b> : <b>С крахмалом окраски нет: иода в растворе нет. </b>)}
            {why}
          </p>
        )}
        {mixed && <div className="mt-2 overflow-x-auto text-center text-xl" dangerouslySetInnerHTML={{ __html: eq }} />}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[360px] border-separate border-spacing-1 text-center text-sm">
          <caption className="pb-1 text-left text-xs font-bold uppercase tracking-wide text-white/60">Все пары: идёт ли вытеснение (нажмите на клетку)</caption>
          <thead>
            <tr>
              <th />
              {SALTS.map((s) => (
                <th key={s.sym} className="font-semibold text-white/70">K{s.sym}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HALS.map((h) => (
              <tr key={h.sym}>
                <th className="pr-2 text-right font-semibold text-white/70">{sub(h.sym + '2')}</th>
                {SALTS.map((s) => {
                  const ok = displaces(h.sym, s.sym)
                  const on = hs === h.sym && ss === s.sym
                  return (
                    <td key={s.sym}>
                      <button
                        onClick={() => pick(h.sym, s.sym)}
                        aria-label={`${h.sym}₂ и K${s.sym}: ${ok ? 'идёт' : 'не идёт'}`}
                        className={`h-9 w-full rounded-md font-bold transition ${ok ? 'bg-teal/80' : 'bg-white/10'} ${on ? 'ring-2 ring-orange' : ''} hover:brightness-125`}
                      >
                        {ok ? '+' : h.sym === s.sym ? '=' : '−'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-white/60">Фтор в растворах не используют: он реагирует с водой. Активность: F₂ &gt; Cl₂ &gt; Br₂ &gt; I₂.</p>
      </div>
    </div>
  )
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
