import { useState } from 'react'
import { ELEMENTS, KIND_LABEL, shells, type El } from '../lib/elements'
import { fillCells } from './OrbitalCells'

const GROUPS = ['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA', 'VIIIA']
const KIND_BG = { metal: '#dcebff', nonmetal: '#ffeccc', noble: '#e7e0ff' }
const KIND_FG = { metal: '#2f7fec', nonmetal: '#b8740a', noble: '#7a5ce0' }

/** Массовое число A (округлённая атомная масса; для Cl — самый распространённый изотоп ³⁵Cl) */
const MASS = [1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 40, 39, 40]

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('')

function cell(period: number, group: number): El | undefined {
  return ELEMENTS.find((e) => e.period === period && e.group === group)
}

/** Схема атома: слои-окружности и электроны (на внешнем слое — оранжевое кольцо) */
function AtomDiagram({ z }: { z: number }) {
  const sh = shells(z)
  const R = [28, 50, 72, 94]
  const c = 110
  const half = R[sh.length - 1] + 16
  return (
    <svg viewBox={`${c - half} ${c - half} ${half * 2} ${half * 2}`} className="mx-auto w-full" style={{ maxWidth: half * 2 * 0.8 }} role="img" aria-label={`Схема атома: ${sh.join(', ')} электронов по слоям`}>
      {sh.map((n, k) => {
        const outer = k === sh.length - 1
        return (
          <g key={k}>
            <circle cx={c} cy={c} r={R[k]} fill="none" stroke={outer ? '#f5a623' : '#9aa4c4'} strokeWidth={outer ? 3.5 : 2} />
            {Array.from({ length: n }, (_, i) => {
              const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n
              return <circle key={i} cx={c + R[k] * Math.cos(a)} cy={c + R[k] * Math.sin(a)} r={5} fill="#f5a623" stroke="#1c2340" strokeWidth={1.3} />
            })}
            <circle cx={c} cy={c - R[k]} r={9} fill="#2f7fec" stroke="#fff" strokeWidth={2} />
            <text x={c} y={c - R[k] + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{k + 1}</text>
          </g>
        )
      })}
      <circle cx={c} cy={c} r={z > 9 ? 17 : 15} fill="#e6559b" stroke="#1c2340" strokeWidth={2} />
      <text x={c} y={c + 4.5} textAnchor="middle" fontSize={z > 9 ? 12 : 13} fontWeight="800" fill="#fff">+{z}</text>
    </svg>
  )
}

/** Интерактивная карточка элемента № 1–20: p⁺, n⁰, ē, слои, ячейки, электронная конфигурация */
export default function ElementCard() {
  const [sel, setSel] = useState<El>(ELEMENTS[11])
  const z = sel.z
  const a = MASS[z - 1]
  const n = a - z
  const sh = shells(z)
  const sub = fillCells(z)
  const filled = sub.filter((s) => s.k > 0)
  const unpaired = sub.reduce((s, x) => s + x.unpaired, 0)
  const formula = filled.map((s) => `${s.name}${sup(s.k)}`).join(' ')

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold">Нажмите на элемент — откроется его карточка</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {(['metal', 'nonmetal', 'noble'] as const).map((k) => (
            <span key={k} className="rounded-full px-2 py-0.5 font-semibold" style={{ background: KIND_BG[k], color: KIND_FG[k] }}>
              {KIND_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[28px_repeat(8,1fr)] gap-1 text-center text-xs">
          <div />
          {GROUPS.map((g) => (
            <div key={g} className="py-1 font-semibold text-muted">{g}</div>
          ))}
          {[1, 2, 3, 4].map((p) => (
            <Row key={p} period={p} sel={sel} onSel={setSel} />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-paper p-3 sm:p-4" aria-live="polite" key={z}>
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-navy"
            style={{ background: KIND_BG[sel.kind] }}
          >
            <div className="text-[10px] font-semibold leading-none opacity-70">{z}</div>
            <div className="text-2xl font-extrabold leading-tight">{sel.symbol}</div>
          </div>
          <div>
            <div className="text-xl font-bold leading-tight">{sel.name}</div>
            <div className="text-sm text-muted">
              {KIND_LABEL[sel.kind]} · период {sel.period} · группа {GROUPS[sel.group - 1]}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="протоны p⁺" value={z} hint="p⁺ = Z" color="#e6559b" />
          <Stat label="нейтроны n⁰" value={n} hint={`A − Z = ${a} − ${z}`} color="#2f7fec" />
          <Stat label="электроны ē" value={z} hint="ē = Z (атом нейтрален)" color="#f5a623" />
          <Stat label="массовое число A" value={a} hint={z === 17 ? '³⁵Cl (в таблице 35,5)' : 'округлённая масса'} color="#6b7387" />
        </div>

        <div className="mt-3 grid items-center gap-3 sm:grid-cols-[150px_1fr]">
          <div>
            <AtomDiagram z={z} />
            
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="mb-1 text-sm font-semibold text-muted">Распределение электронов по слоям</div>
              <div className="flex flex-wrap items-center gap-2">
                {sh.map((e, k) => (
                  <div key={k} className="flex flex-col items-center">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl font-extrabold ${k === sh.length - 1 ? 'bg-orange text-navy' : 'bg-navy text-white'}`}>{e}</span>
                    <span className="text-[10px] text-muted">{k + 1}-й</span>
                  </div>
                ))}
                <span className="ml-2 text-base font-bold text-navy">{sh.join(' · ')}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                период {sel.period} → слоёв: {sh.length}; группа {GROUPS[sel.group - 1]} → ē на внешнем слое: {sh[sh.length - 1]}
              </p>
            </div>

            <div>
              <div className="mb-1 text-sm font-semibold text-muted">Электронная конфигурация</div>
              <div className="text-lg font-bold text-navy" aria-label="Электронная формула">{formula}</div>
              <p className="mt-0.5 text-xs text-muted">неспаренных ē: <b>{unpaired}</b></p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 text-sm font-semibold text-muted">Схема с ячейками (↑ и ↓ — противоположные спины)</div>
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
            {filled.map((s) => (
              <div key={s.name}>
                <div className="mb-1 text-center text-sm font-semibold">{s.name}</div>
                <div className="flex gap-1">
                  {s.cells.map((c, j) => (
                    <div key={j} className="flex h-10 w-9 items-center justify-center rounded-md border-2 border-navy/30 bg-white text-xl font-bold leading-none">
                      <span className="text-orange" style={{ animation: c.up ? 'pop .35s ease-out both' : undefined, animationDelay: `${j * 2 * 100}ms`, opacity: c.up ? 1 : 0 }}>↑</span>
                      <span className="text-teal" style={{ animation: c.down ? 'pop .35s ease-out both' : undefined, animationDelay: `${(j * 2 + 1) * 100}ms`, opacity: c.down ? 1 : 0 }}>↓</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, hint, color }: { label: string; value: number; hint: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-1.5 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="text-2xl font-extrabold leading-none">{value}</div>
      <div className="min-w-0 leading-tight">
        <div className="text-xs font-semibold">{label}</div>
        <div className="truncate text-[10px] text-muted" title={hint}>{hint}</div>
      </div>
    </div>
  )
}

function Row({ period, sel, onSel }: { period: number; sel: El; onSel: (e: El) => void }) {
  return (
    <>
      <div className="flex items-center justify-center font-semibold text-muted">{period}</div>
      {Array.from({ length: 8 }, (_, i) => {
        const e = cell(period, i + 1)
        if (!e) return <div key={i} />
        const active = e.z === sel.z
        return (
          <button
            key={i}
            onClick={() => onSel(e)}
            aria-label={`${e.name}, номер ${e.z}`}
            aria-pressed={active}
            className={`rounded-lg border-2 px-1 py-1.5 transition hover:scale-105 ${active ? 'border-navy shadow-md' : 'border-transparent'}`}
            style={{ background: KIND_BG[e.kind], color: '#1f2433' }}
          >
            <div className="text-[10px] opacity-70">{e.z}</div>
            <div className="text-base font-bold leading-none">{e.symbol}</div>
          </button>
        )
      })}
    </>
  )
}
