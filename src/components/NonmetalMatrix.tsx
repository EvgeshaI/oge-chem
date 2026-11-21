import { useState } from 'react'
import { METAL_IDS, NONMETALS, REACTIONS, type MetalId, type NonmetalId } from '../lib/nonmetals'
import { RichText, tex } from './RichText'

/** Продукты реакций металлов с неметаллами: выберите металл сверху и неметалл слева — в середине появится уравнение */
export default function NonmetalMatrix() {
  const [m, setM] = useState<MetalId>('Mg')
  const [n, setN] = useState<NonmetalId>('o2')
  const r = REACTIONS[m][n]
  const nm = NONMETALS.find((x) => x.id === n)!

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-navy p-3 text-white sm:p-5">
      <p className="text-sm text-white/75">Выберите металл сверху и неметалл слева — в середине появится уравнение реакции и пояснение.</p>

      <div className="mt-3 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2 sm:gap-x-3">
        <div className="self-end text-[10px] font-semibold leading-tight text-white/50">
          металл →<br />неметалл ↓
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {METAL_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setM(id)}
              aria-pressed={id === m}
              className={`rounded-lg px-1 py-2 text-base font-bold transition ${id === m ? 'bg-orange text-navy' : REACTIONS[id][n].eq ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 text-white/45 hover:bg-white/10'}`}
            >
              {id}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {NONMETALS.map((x) => (
            <button
              key={x.id}
              onClick={() => setN(x.id)}
              aria-pressed={x.id === n}
              className={`min-w-14 rounded-lg px-3 py-2 text-base font-bold transition ${x.id === n ? 'bg-purple text-white' : REACTIONS[m][x.id].eq ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 text-white/45 hover:bg-white/10'}`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="min-h-[220px] rounded-xl bg-white/10 p-4" aria-live="polite" key={`${m}-${n}`} style={{ animation: 'pop .25s ease-out both' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-orange">
              {m} + {nm.label}
            </span>
            <span className="text-sm text-white/65">
              металл + {nm.name}
            </span>
            {r.trap && <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-extrabold text-navy">ловушка ОГЭ</span>}
          </div>
          {r.eq ? (
            <div className="mt-3 overflow-x-auto rounded-lg bg-white/10 px-3 py-4 text-center text-2xl sm:text-3xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${r.eq}}`) }} />
          ) : (
            <div className="mt-3 rounded-lg bg-white/5 px-3 py-4 text-center text-xl text-white/70">
              {m} + {nm.label} → реакция не рассматривается
            </div>
          )}
          <p className="mt-3 text-[15px] leading-relaxed text-white/90">
            <RichText text={r.note} />
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs text-white/55">Тусклые кнопки — для выбранной пары реакция в ОГЭ не рассматривается.</p>
    </div>
  )
}
