import { useState } from 'react'
import { tex } from './RichText'
import { TestTube } from './TestTube'

interface Anion {
  sym: 'F' | 'Cl' | 'Br' | 'I'
  salt: string
  precip: string | null
  name: string
  color: string
  look: string
}

const ANIONS: Anion[] = [
  { sym: 'F', salt: 'NaF', precip: 'AgF', name: 'фторид', color: '', look: 'AgF растворим — осадка нет' },
  { sym: 'Cl', salt: 'NaCl', precip: 'AgCl', name: 'хлорид', color: '#f6f6f0', look: 'белый творожистый осадок' },
  { sym: 'Br', salt: 'NaBr', precip: 'AgBr', name: 'бромид', color: '#eee6a6', look: 'бледно-жёлтый осадок' },
  { sym: 'I', salt: 'NaI', precip: 'AgI', name: 'иодид', color: '#f2d93c', look: 'жёлтый осадок' },
]

/** Качественные реакции на Cl⁻, Br⁻, I⁻: нитрат серебра даёт осадки разного цвета */
export default function HalideTest() {
  const [i, setI] = useState(1)
  const [added, setAdded] = useState(false)
  const a = ANIONS[i]
  const has = a.color !== ''

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите раствор соли и добавьте к нему раствор нитрата серебра.</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ANIONS.map((x, k) => (
          <button
            key={x.sym}
            onClick={() => {
              setI(k)
              setAdded(false)
            }}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.salt} ({x.sym}⁻)
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-center gap-4 sm:gap-8">
        <TestTube className="h-40 w-16 sm:h-44 sm:w-[70px]" liquid="rgba(255,255,255,.14)" label={`${a.salt} (р-р)`} />
        <span className="pb-16 text-2xl font-bold text-orange">+ AgNO₃ →</span>
        <TestTube
          className="h-40 w-16 sm:h-44 sm:w-[70px]"
          liquid={added && has ? 'rgba(235,235,235,.35)' : 'rgba(255,255,255,.14)'}
          precip={has ? a.color : undefined}
          precipH={added && has ? 0.34 : 0}
          label={added ? 'после' : 'до'}
        />
      </div>

      <div className="mt-3 flex justify-center">
        {!added ? (
          <button onClick={() => setAdded(true)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Добавить AgNO₃
          </button>
        ) : (
          <button onClick={() => setAdded(false)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Заново
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        {added ? (
          <>
            <div className="font-bold text-teal">{has ? a.look : 'Осадок не выпадает'}</div>
            <div className="mt-2 overflow-x-auto text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(has ? `\\ce{Ag+ + ${a.sym}- -> Ag${a.sym} v}` : `\\ce{Ag+ + F- -> AgF}\\;(\\text{растворим})`, true) }} />
          </>
        ) : (
          <div className="text-white/70">Сначала добавьте реактив.</div>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="text-white/70">
              <th className="px-3 py-1.5 font-semibold">Ион</th>
              <th className="px-3 py-1.5 font-semibold">Осадок с Ag⁺</th>
              <th className="px-3 py-1.5 font-semibold">Цвет</th>
            </tr>
          </thead>
          <tbody>
            {ANIONS.filter((x) => x.color).map((x) => (
              <tr key={x.sym} className="border-t border-white/10">
                <td className="px-3 py-1.5 font-bold">{x.sym}⁻</td>
                <td className="px-3 py-1.5">{x.precip}</td>
                <td className="px-3 py-1.5">
                  <span className="mr-2 inline-block h-3 w-3 rounded-full border border-white/60 align-middle" style={{ background: x.color }} />
                  {x.look.replace(' осадок', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
