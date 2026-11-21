import { useState } from 'react'
import { MATRIX, METALS, REAGENTS, type MetalId, type ReagentId } from '../lib/matrix'
import { RichText, tex } from './RichText'

const MARK_CLS = {
  '+': 'bg-teal text-white',
  '−': 'bg-white/10 text-white/70',
  В: 'bg-orange text-navy',
} as const

/** Сводная таблица «реагирует ли металл»: нажмите на клетку — увидите уравнение и причину */
export default function ReactionMatrix() {
  const [sel, setSel] = useState<{ m: MetalId; r: ReagentId }>({ m: 'Fe', r: 'cl2' })
  const cell = MATRIX[sel.m][sel.r]
  const reagent = REAGENTS.find((r) => r.id === sel.r)!

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Нажмите на любую клетку: покажем, идёт ли реакция, и запишем уравнение.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[340px] table-fixed border-separate border-spacing-0.5 text-center sm:border-spacing-1">
          <thead>
            <tr>
              <th className="w-[12%] px-1 py-1 text-left text-[11px] font-semibold text-white/60 sm:text-xs">Металл</th>
              {REAGENTS.map((r) => (
                <th key={r.id} className={`px-0.5 py-1 align-bottom text-[11px] font-semibold leading-tight sm:text-xs ${r.id === sel.r ? 'text-orange' : 'text-white/70'}`}>
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METALS.map((m) => (
              <tr key={m}>
                <th className={`px-2 py-1 text-left text-base font-bold ${m === sel.m ? 'text-orange' : ''}`}>{m}</th>
                {REAGENTS.map((r) => {
                  const c = MATRIX[m][r.id]
                  const on = sel.m === m && sel.r === r.id
                  return (
                    <td key={r.id}>
                      <button
                        onClick={() => setSel({ m, r: r.id })}
                        aria-pressed={on}
                        aria-label={`${m} и ${r.label}: ${c.mark === '+' ? 'реагирует' : c.mark === '−' ? 'не реагирует' : 'реагирует с водой раствора'}`}
                        className={`h-10 w-full rounded-lg text-lg font-bold transition ${MARK_CLS[c.mark]} ${on ? 'ring-4 ring-white' : 'hover:brightness-110'}`}
                      >
                        {c.mark}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/70">
        <span><b className="rounded bg-teal px-1.5 text-white">+</b> реакция идёт</span>
        <span><b className="rounded bg-white/20 px-1.5">−</b> не идёт</span>
        <span><b className="rounded bg-orange px-1.5 text-navy">В</b> реагирует не с веществом, а с водой раствора</span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite" key={`${sel.m}-${sel.r}`} style={{ animation: 'pop .25s ease-out both' }}>
        <div className="font-bold text-orange">
          {sel.m} + {reagent.label}
        </div>
        <div className="mt-1 text-[15px] text-white/90">
          {cell.mark === '+' ? '✓ Реакция идёт.' : cell.mark === '−' ? '✗ Реакция не идёт.' : '≈ Идёт реакция с водой раствора.'}{' '}
          <RichText text={cell.why} />
        </div>
        {cell.eq?.map((e, i) => (
          <div key={i} className="mt-1 overflow-x-auto text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${e}}`) }} />
        ))}
      </div>
    </div>
  )
}
