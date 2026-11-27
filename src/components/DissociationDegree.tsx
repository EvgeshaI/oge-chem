import { useState } from 'react'
import { tex } from './RichText'

interface Sub {
  id: string
  name: string
  ce: string
  /** сколько из 20 «молекул» условно распалось (схема, не точные данные) */
  split: number
  strength: 'сильный' | 'слабый'
  note: string
}

const SUBS: Sub[] = [
  { id: 'hcl', name: 'HCl', ce: 'HCl -> H+ + Cl-', split: 20, strength: 'сильный', note: 'Сильная кислота: практически все молекулы распались на ионы.' },
  { id: 'naoh', name: 'NaOH', ce: 'NaOH -> Na+ + OH-', split: 20, strength: 'сильный', note: 'Щёлочь — сильное основание: распад почти полный.' },
  { id: 'nacl', name: 'NaCl', ce: 'NaCl -> Na+ + Cl-', split: 20, strength: 'сильный', note: 'Растворимые соли — сильные электролиты.' },
  { id: 'h2co3', name: 'H₂CO₃', ce: 'H2CO3 <=> H+ + HCO3-', split: 2, strength: 'слабый', note: 'Слабая кислота: ионов мало, большая часть молекул цела. Ставим знак ⇄.' },
  { id: 'h2s', name: 'H₂S', ce: 'H2S <=> H+ + HS-', split: 1, strength: 'слабый', note: 'Слабая кислота: распадается лишь малая доля молекул.' },
  { id: 'nh3', name: 'NH₃·H₂O', ce: 'NH3*H2O <=> NH4+ + OH-', split: 2, strength: 'слабый', note: 'Раствор аммиака — слабое основание.' },
]

const N = 20

export default function DissociationDegree() {
  const [i, setI] = useState(0)
  const s = SUBS[i]
  const alpha = Math.round((s.split / N) * 100)
  const strong = s.strength === 'сильный'

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Возьмём 20 частиц растворённого вещества. Посмотрим, сколько из них распалось на ионы. Это схема, а не точные данные.</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUBS.map((x, k) => (
          <button
            key={x.id}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" key={s.id}>
        {Array.from({ length: N }, (_, k) => {
          const split = k < s.split
          return (
            <div key={k} className="flex h-14 items-center justify-center rounded-xl bg-white/5">
              {split ? (
                <div className="flex items-center gap-0.5" style={{ animation: 'pop .4s ease-out both', animationDelay: `${k * 40}ms` }}>
                  <i className="inline-block h-4 w-4 rounded-full bg-[#2f7fec]" />
                  <i className="inline-block h-4 w-4 rounded-full bg-[#e5484d]" />
                </div>
              ) : (
                <div className="flex items-center">
                  <i className="inline-block h-4 w-4 rounded-l-full bg-[#2f7fec]" />
                  <i className="inline-block h-4 w-4 rounded-r-full bg-[#e5484d]" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
        <span className="flex items-center gap-1">
          <i className="inline-flex"><b className="inline-block h-3 w-3 rounded-l-full bg-[#2f7fec]" /><b className="inline-block h-3 w-3 rounded-r-full bg-[#e5484d]" /></i> целая молекула
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded-full bg-[#2f7fec]" />
          <i className="inline-block h-3 w-3 rounded-full bg-[#e5484d]" /> ионы (молекула распалась)
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
          <div className="text-sm text-white/70">степень диссоциации</div>
          <div className="text-2xl font-bold">α = {s.split} / {N} = <span className={strong ? 'text-teal' : 'text-pink'}>{alpha}%</span></div>
        </div>
        <div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${strong ? 'bg-teal' : 'bg-pink'}`} style={{ width: `${alpha}%`, transition: 'width .6s ease' }} />
          </div>
          <div className="mt-2 text-sm">
            <b className={strong ? 'text-teal' : 'text-pink'}>{s.strength} электролит.</b> <span className="text-white/85">{s.note}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-center text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${s.ce}}`) }} />
    </div>
  )
}
