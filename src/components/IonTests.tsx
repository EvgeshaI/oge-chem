import { useState } from 'react'
import { ION_TESTS } from '../lib/acidsBasesSalts'
import { tex } from './RichText'
import { TestTube } from './TestTube'

const CLEAR = 'rgba(255,255,255,.14)'

/** Качественные реакции на ионы: выбираем ион, добавляем реактив, смотрим признак */
export default function IonTests() {
  const [i, setI] = useState(0)
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const t = ION_TESTS[i]
  const start = t.liquid ?? CLEAR

  const liquid = step > 0 && t.effect === 'color' ? t.color : step > 0 && t.effect === 'precip' && step === 1 ? 'rgba(235,235,235,.3)' : start
  const precipH = t.effect === 'precip' && step === 1 ? 0.32 : 0

  const pick = (k: number) => {
    setI(k)
    setStep(0)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите ион, который нужно обнаружить, и добавьте реактив.</div>
      {(['anion', 'cation'] as const).map((g) => (
        <div key={g} className="mt-3 flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs font-semibold tracking-wide text-white/60 uppercase">{g === 'anion' ? 'анионы' : 'катионы'}</span>
          {ION_TESTS.map((x, k) =>
            x.group === g ? (
              <button
                key={x.ion}
                onClick={() => pick(k)}
                aria-pressed={k === i}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {x.ion}
              </button>
            ) : null,
          )}
        </div>
      ))}

      <div className="mt-4 flex items-end justify-center gap-4 sm:gap-8">
        <TestTube className="h-40 w-16 sm:h-44 sm:w-[70px]" liquid={start} label={`${t.sample} (р-р)`} />
        <span className="pb-16 text-xl font-bold text-orange sm:text-2xl">+ {t.reagent} →</span>
        <div className="relative">
          <TestTube className="h-40 w-16 sm:h-44 sm:w-[70px]" liquid={liquid} precip={t.effect === 'precip' ? t.color : undefined} precipH={precipH} label={step ? 'после' : 'до'} />
          {t.effect === 'gas' && step > 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((b) => (
                <span key={b} className="block h-2.5 w-2.5 rounded-full border-2 border-white/80" style={{ animation: `rise 1.4s ease-out ${b * 0.3}s infinite` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {step === 0 && (
          <button onClick={() => setStep(1)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Добавить {t.reagent.replace(', t', '')}
            {t.reagent.includes(', t') ? ' и нагреть' : ''}
          </button>
        )}
        {step === 1 && t.excess && (
          <button onClick={() => setStep(2)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Добавить избыток NaOH
          </button>
        )}
        {step > 0 && (
          <button onClick={() => setStep(0)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Заново
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        {step === 0 ? (
          <div className="text-white/70">Сначала добавьте реактив.</div>
        ) : (
          <>
            <div className="font-bold text-teal">{step === 2 && t.excess ? t.excess.look : t.look[0].toUpperCase() + t.look.slice(1)}</div>
            {(step === 2 && t.excess ? t.excess.eq : t.eq) && (
              <div className="mt-2 overflow-x-auto text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${step === 2 && t.excess ? t.excess.eq : t.eq}}`, true) }} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
