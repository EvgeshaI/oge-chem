import { useState } from 'react'
import { ELEMENTS } from '../lib/elements'

const SUBS = [
  { name: '1s', cells: 1 },
  { name: '2s', cells: 1 },
  { name: '2p', cells: 3 },
  { name: '3s', cells: 1 },
  { name: '3p', cells: 3 },
  { name: '4s', cells: 1 },
]
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('')

/** Заполнение ячеек: порядок 1s→2s→2p→3s→3p→4s, правило Хунда, принцип Паули */
export function fillCells(z: number) {
  let left = z
  return SUBS.map((s) => {
    const k = Math.min(left, s.cells * 2)
    left -= k
    const cells = Array.from({ length: s.cells }, (_, j) => ({
      up: j < k,
      down: k > s.cells && j < k - s.cells,
    }))
    const unpaired = k <= s.cells ? k : 2 * s.cells - k
    return { ...s, k, cells, unpaired }
  })
}

export default function OrbitalCells() {
  const [z, setZ] = useState(8)
  const el = ELEMENTS[z - 1]
  const sub = fillCells(z)
  const formula = sub.filter((s) => s.k > 0).map((s) => `${s.name}${sup(s.k)}`).join('')
  const unpaired = sub.reduce((a, s) => a + s.unpaired, 0)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-2xl font-bold">
          {el.symbol} <span className="text-base font-medium text-white/70">{el.name}, Z = {z}</span>
        </div>
        <div className="text-lg font-semibold text-orange" aria-label="Электронная формула">{formula}</div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-4" key={z}>
        {sub.filter((s) => s.k > 0).map((s) => (
          <div key={s.name}>
            <div className="mb-1 text-center text-sm font-semibold text-white/80">{s.name}</div>
            <div className="flex gap-1">
              {s.cells.map((c, j) => (
                <div key={j} className="flex h-14 w-10 items-center justify-center rounded-md border-2 border-white/40 bg-white/5 text-2xl font-bold leading-none">
                  <span className="text-orange" style={{ animation: c.up ? 'pop .35s ease-out both' : undefined, animationDelay: `${(j * 2) * 120}ms`, opacity: c.up ? 1 : 0 }}>↑</span>
                  <span className="text-teal" style={{ animation: c.down ? 'pop .35s ease-out both' : undefined, animationDelay: `${(j * 2 + 1) * 120}ms`, opacity: c.down ? 1 : 0 }}>↓</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-white/10 px-3 py-1">Неспаренных ē: <b>{unpaired}</b></span>
        <span className="rounded-full bg-white/10 px-3 py-1">Всего ē: <b>{z}</b></span>
        {z >= 19 && <span className="rounded-full bg-white/10 px-3 py-1">4s заполняется раньше 3d</span>}
      </div>

      <label className="mt-4 block text-sm">
        <span className="mb-1 block text-white/70">Выберите элемент (№ 1–20)</span>
        <input type="range" min={1} max={20} value={z} onChange={(e) => setZ(Number(e.target.value))} className="w-full accent-orange" aria-label="Порядковый номер элемента" />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        {ELEMENTS.map((e) => (
          <button key={e.symbol} onClick={() => setZ(e.z)} className={`h-8 w-9 rounded-md text-xs font-semibold transition ${e.z === z ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {e.symbol}
          </button>
        ))}
      </div>
    </div>
  )
}
