import { useState } from 'react'
import { ION_TESTS } from '../lib/acidsBasesSalts'
import { QUAL_EXAMPLES, type QIon } from '../lib/qualitative'
import { tex } from './RichText'

const ionList = (ions: QIon[]) => ions.flatMap((i) => Array.from({ length: i.n }, (_, k) => ({ ...i, key: `${i.label}-${k}` })))

function Dot({ ion, glow, delay = 0 }: { ion: QIon; glow?: boolean; delay?: number }) {
  const cat = ion.sign === '+'
  return (
    <span
      className={`flex h-10 min-w-10 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white sm:h-11 sm:min-w-11 sm:text-sm ${cat ? 'bg-blue' : 'bg-pink'} ${glow ? 'ring-4 ring-orange' : ''}`}
      style={{ animation: glow ? `pop .5s ease-out ${delay}s both` : undefined }}
    >
      {ion.label}
    </span>
  )
}

function Beaker({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 rounded-xl border-2 border-white/20 bg-white/5 p-3">
      <div className="mb-2 text-center text-sm font-bold text-white/80">{title}</div>
      <div className="flex min-h-[5.5rem] flex-wrap content-center items-center justify-center gap-1.5">{children}</div>
    </div>
  )
}

/** Качественная реакция глазами ионов: смешиваем растворы, нужные ионы находят друг друга */
export default function IonSearch() {
  const [i, setI] = useState(0)
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const ex = QUAL_EXAMPLES[i]
  const test = ION_TESTS.find((t) => t.ion === ex.ion)!
  const all = [...ionList(ex.sample.ions), ...ionList(ex.reagent.ions)]

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите ион, который нужно обнаружить, и смешайте растворы — посмотрите, что происходит с ионами.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUAL_EXAMPLES.map((x, k) => (
          <button
            key={x.ion}
            onClick={() => {
              setI(k)
              setStep(0)
            }}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.ion}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {step === 0 ? (
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Beaker title={`${ex.sample.name} — проба`}>
              {ionList(ex.sample.ions).map((x) => <Dot key={x.key} ion={x} />)}
            </Beaker>
            <span className="text-center text-2xl font-bold text-orange">+</span>
            <Beaker title={`${ex.reagent.name} — реактив`}>
              {ionList(ex.reagent.ions).map((x) => <Dot key={x.key} ion={x} />)}
            </Beaker>
          </div>
        ) : (
          <Beaker title="После смешивания">
            {all
              .filter((x) => step === 1 || !x.reacts)
              .map((x, k) => <Dot key={`${x.key}-${k}`} ion={x} glow={step === 1 && x.reacts} delay={0.05 * k} />)}
            {step === 2 &&
              (ex.product.kind === 'solid' ? (
                <span
                  className="flex h-14 items-center rounded-2xl px-3 text-sm font-extrabold text-navy shadow-lg"
                  style={{ background: ex.product.color, animation: 'pop .6s ease-out both' }}
                >
                  {ex.product.label}
                </span>
              ) : (
                <span className="relative flex h-14 items-center rounded-2xl border-2 border-dashed border-white/60 px-3 text-sm font-extrabold" style={{ animation: 'pop .5s ease-out both' }}>
                  {ex.product.label}
                  {[0, 1, 2].map((b) => (
                    <span key={b} className="absolute -top-2 block h-2.5 w-2.5 rounded-full border-2 border-white/80" style={{ left: `${20 + b * 28}%`, animation: `rise 1.4s ease-out ${b * 0.35}s infinite` }} />
                  ))}
                </span>
              ))}
          </Beaker>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {step === 0 && (
          <button onClick={() => setStep(1)} className="rounded-xl bg-orange px-4 py-2 text-sm font-bold text-navy transition hover:brightness-110">
            Смешать растворы →
          </button>
        )}
        {step === 1 && (
          <button onClick={() => setStep(2)} className="rounded-xl bg-orange px-4 py-2 text-sm font-bold text-navy transition hover:brightness-110">
            Ионы связываются →
          </button>
        )}
        {step > 0 && (
          <button onClick={() => setStep(0)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
            ↺ Заново
          </button>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <div key={step} style={{ animation: 'pop .3s ease-out both' }}>
          {step === 0 && <p className="text-white/80">В каждом растворе ионы движутся свободно. Катионы — синие, анионы — розовые.</p>}
          {step === 1 && <p>Растворы смешаны. Ионы, которые подходят друг другу, <b className="text-orange">выделены оранжевым</b>. Остальные — «наблюдатели».</p>}
          {step === 2 && (
            <>
              <p><b className="text-teal">{ex.look}</b></p>
              <p className="mt-1 text-sm text-white/80">Остальные ионы остались в растворе — они в реакции не участвуют.</p>
              {test.eq && <div className="mt-1 overflow-x-auto text-center text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${test.eq}}`, true) }} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
