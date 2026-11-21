import { useState } from 'react'
import { ELEMENTS, shells } from '../lib/elements'
import { ShellsSvg } from './ShellsSvg'

export default function AtomShells() {
  const [z, setZ] = useState(8)
  const el = ELEMENTS[z - 1]
  const sh = shells(z)
  const outer = sh[sh.length - 1]

  return (
    <div className="grid gap-4 rounded-2xl bg-navy p-4 text-white sm:grid-cols-[320px_1fr] sm:p-6">
      <ShellsSvg z={z} label={`Модель атома ${el.name}`} className="mx-auto w-full max-w-[320px]" />

      <div className="flex flex-col justify-center gap-3">
        <div>
          <div className="text-3xl font-bold">
            {el.symbol} <span className="text-lg font-medium text-white/70">{el.name}</span>
          </div>
          <div className="mt-1 text-sm text-white/80">Порядковый номер {z} · заряд ядра +{z} · электронов {z}</div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1">Слоёв: {sh.length}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Распределение: {sh.join(', ')}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">На внешнем слое: {outer}</span>
        </div>
        <label className="mt-1 block text-sm">
          <span className="mb-1 block text-white/70">Выберите элемент (№ 1–20)</span>
          <input
            type="range"
            min={1}
            max={20}
            value={z}
            onChange={(e) => setZ(Number(e.target.value))}
            className="w-full accent-orange"
            aria-label="Порядковый номер элемента"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {ELEMENTS.map((e) => (
            <button
              key={e.symbol}
              onClick={() => setZ(e.z)}
              className={`h-8 w-9 rounded-md text-xs font-semibold transition ${
                e.z === z ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {e.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
