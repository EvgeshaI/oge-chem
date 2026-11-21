import { useState } from 'react'
import { ELEMENTS, KIND_LABEL, shells, type El } from '../lib/elements'

type Mode = 'electrons' | 'substances'

const GROUPS = ['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA', 'VIIIA']
const KIND_BG = { metal: '#dcebff', nonmetal: '#ffeccc', noble: '#e7e0ff' }
const KIND_FG = { metal: '#2f7fec', nonmetal: '#b8740a', noble: '#7a5ce0' }

function cell(period: number, group: number): El | undefined {
  return ELEMENTS.find((e) => e.period === period && e.group === group)
}

/** Таблица элементов 1–20: режим «электронные схемы» или «простые вещества» (цвет и состояние) */
export default function PeriodicTable({ mode }: { mode: Mode }) {
  const [sel, setSel] = useState<El>(ELEMENTS[10])
  const sh = shells(sel.z)

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold">
          {mode === 'electrons' ? 'Электронные схемы элементов № 1–20' : 'Простые вещества элементов № 1–20'}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {mode === 'electrons'
            ? (['metal', 'nonmetal', 'noble'] as const).map((k) => (
                <span key={k} className="rounded-full px-2 py-0.5 font-semibold" style={{ background: KIND_BG[k], color: KIND_FG[k] }}>
                  {KIND_LABEL[k]}
                </span>
              ))
            : (
              <span className="text-muted">цвет ячейки — цвет вещества · подпись — агрегатное состояние</span>
            )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[28px_repeat(8,1fr)] gap-1 text-center text-xs">
          <div />
          {GROUPS.map((g) => (
            <div key={g} className="py-1 font-semibold text-muted">{g}</div>
          ))}
          {[1, 2, 3, 4].map((p) => (
            <Row key={p} period={p} mode={mode} sel={sel} onSel={setSel} />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-paper p-4 text-sm" aria-live="polite">
        <div className="text-lg font-bold">
          {sel.symbol} · {sel.name} <span className="font-normal text-muted">№ {sel.z}</span>
        </div>
        {mode === 'electrons' ? (
          <ul className="mt-1 space-y-0.5">
            <li>Электронная схема: <b>{sh.join('·')}</b> (всего {sel.z} ē)</li>
            <li>Период {sel.period} → слоёв: <b>{sh.length}</b></li>
            <li>Группа {GROUPS[sel.group - 1]} → внешних ē: <b>{sh[sh.length - 1]}</b></li>
            <li>Тип: <b>{KIND_LABEL[sel.kind]}</b></li>
          </ul>
        ) : (
          <ul className="mt-1 space-y-0.5">
            <li>Простое вещество: <b>{sel.formula}</b></li>
            <li>При н. у.: <b>{sel.gas ? 'газ' : 'твёрдое'}</b>, {sel.look}</li>
          </ul>
        )}
      </div>
    </div>
  )
}

function Row({ period, mode, sel, onSel }: { period: number; mode: Mode; sel: El; onSel: (e: El) => void }) {
  return (
    <>
      <div className="flex items-center justify-center font-semibold text-muted">{period}</div>
      {Array.from({ length: 8 }, (_, i) => {
        const e = cell(period, i + 1)
        if (!e) return <div key={i} />
        const active = e.z === sel.z
        const bg = mode === 'electrons' ? KIND_BG[e.kind] : e.color
        const dark = mode === 'substances' && ['B', 'C', 'Si'].includes(e.symbol)
        return (
          <button
            key={i}
            onClick={() => onSel(e)}
            aria-label={`${e.name}, номер ${e.z}`}
            aria-pressed={active}
            className={`rounded-lg border-2 px-1 py-1.5 transition hover:scale-105 ${active ? 'border-navy shadow-md' : 'border-transparent'}`}
            style={{ background: bg, color: dark ? '#fff' : '#1f2433', outline: bg === '#f4f5f8' ? '1px solid #c9d0de' : undefined }}
          >
            <div className="text-[10px] opacity-70">{e.z}</div>
            <div className="text-base font-bold leading-none">{e.symbol}</div>
            <div className="mt-0.5 text-[10px]">
              {mode === 'electrons' ? shells(e.z).join('·') : e.gas ? 'газ' : 'тв.'}
            </div>
          </button>
        )
      })}
    </>
  )
}
