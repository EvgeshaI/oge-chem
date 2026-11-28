import { useState } from 'react'
import { OX_REAGENTS, OXIDE_ROWS, type OxideNature, type OxReagentId } from '../lib/oxides'
import { RichText, tex } from './RichText'

const MARK_CLS = {
  '+': 'bg-teal text-white',
  '−': 'bg-white/10 text-white/70',
  t: 'bg-orange text-navy',
} as const

const NATURE_CLS: Record<OxideNature, string> = {
  основный: 'text-[#8ab8ff]',
  амфотерный: 'text-[#b9a5ff]',
  кислотный: 'text-orange',
  несолеобразующий: 'text-white/60',
}

/** Сводная таблица «с чем реагирует оксид»: нажмите на клетку — увидите уравнение и причину */
export default function OxideMatrix() {
  const [sel, setSel] = useState<{ i: number; r: OxReagentId }>({ i: 3, r: 'alkali' })
  const row = OXIDE_ROWS[sel.i]
  const cell = row.cells[sel.r]
  const reagent = OX_REAGENTS.find((r) => r.id === sel.r)!

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Нажмите на клетку: покажем, идёт ли реакция, почему, и запишем уравнение.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] table-fixed border-separate border-spacing-0.5 text-center sm:border-spacing-1">
          <thead>
            <tr>
              <th className="w-[22%] px-1 py-1 text-left text-[11px] font-semibold text-white/60 sm:text-xs">Оксид</th>
              {OX_REAGENTS.map((r) => (
                <th key={r.id} className={`px-0.5 py-1 align-bottom text-[11px] font-semibold leading-tight sm:text-xs ${r.id === sel.r ? 'text-orange' : 'text-white/70'}`}>
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OXIDE_ROWS.map((o, i) => (
              <tr key={o.f}>
                <th className="px-1 py-0.5 text-left leading-tight">
                  <span className={`block text-sm font-bold sm:text-base ${i === sel.i ? 'text-orange' : ''}`}>{o.f}</span>
                  <span className={`block text-[10px] font-semibold sm:text-[11px] ${NATURE_CLS[o.nature]}`}>{o.nature.replace('несоле', 'несоле\u00ad')}</span>
                </th>
                {OX_REAGENTS.map((r) => {
                  const c = o.cells[r.id]
                  const on = sel.i === i && sel.r === r.id
                  return (
                    <td key={r.id}>
                      <button
                        onClick={() => setSel({ i, r: r.id })}
                        aria-pressed={on}
                        aria-label={`${o.f} и ${r.label}: ${c.mark === '+' ? 'реагирует' : c.mark === '−' ? 'не реагирует' : 'реагирует при нагревании'}`}
                        className={`h-9 w-full rounded-lg text-base font-bold transition ${MARK_CLS[c.mark]} ${on ? 'ring-4 ring-white' : 'hover:brightness-110'}`}
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
        <span><b className="rounded bg-orange px-1.5 text-navy">t</b> только при нагревании или сплавлении</span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite" key={`${sel.i}-${sel.r}`} style={{ animation: 'pop .25s ease-out both' }}>
        <div className="font-bold text-orange">
          {row.f} ({row.nature}) + {reagent.label}
        </div>
        <div className="mt-1 text-[15px] text-white/90">
          {cell.mark === '+' ? '✓ Реакция идёт.' : cell.mark === '−' ? '✗ Реакция не идёт.' : '≈ Реакция идёт только при нагревании.'}{' '}
          <RichText text={cell.why} />
        </div>
        {cell.eq && <div className="mt-1 overflow-x-auto text-lg" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${cell.eq}}`) }} />}
      </div>
    </div>
  )
}
