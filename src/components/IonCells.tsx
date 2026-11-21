import { useState } from 'react'
import { fillCells } from './OrbitalCells'

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('')

interface Case {
  sym: string
  name: string
  z: number
  /** заряд иона: +1 — отдал 1 ē, −1 — принял 1 ē */
  charge: number
  ion: string
  noble: string
  /** Почему атому выгодно именно так */
  why: string[]
  result: string
}

const CASES: Case[] = [
  {
    sym: 'Na',
    name: 'натрий',
    z: 11,
    charge: 1,
    ion: 'Na⁺',
    noble: 'неона',
    why: [
      'На внешнем (3-м) слое всего **один** электрон — он один в ячейке 3s.',
      'Отдать 1 ē гораздо проще, чем принять 7 ē, чтобы достроить слой до восьми.',
    ],
    result: 'После потери электрона внешним становится 2-й слой, а на нём уже 8 ē — устойчивая оболочка, как у неона.',
  },
  {
    sym: 'Cl',
    name: 'хлор',
    z: 17,
    charge: -1,
    ion: 'Cl⁻',
    noble: 'аргона',
    why: [
      'На внешнем (3-м) слое **семь** электронов; в 3p-подуровне одна ячейка заполнена наполовину.',
      'Принять 1 ē гораздо проще, чем отдать 7 ē.',
    ],
    result: 'После присоединения электрона на внешнем слое 8 ē (3s²3p⁶) — устойчивая оболочка, как у аргона.',
  },
]

const LAYERS = [2, 3]

const bold = (s: string) =>
  s.split('**').map((p, i) => (i % 2 ? <b key={i} className="text-white">{p}</b> : <span key={i}>{p}</span>))

/** Атом → ион в ячейках: куда уходит (откуда приходит) электрон и почему */
export default function IonCells() {
  const [i, setI] = useState(0)
  const [ion, setIon] = useState(false)
  const c = CASES[i]
  const electronsIon = c.z - c.charge
  const atom = fillCells(c.z)
  const after = fillCells(electronsIon)
  const cur = ion ? after : atom

  const formula = (sub: ReturnType<typeof fillCells>) =>
    sub.filter((s) => s.k > 0 && s.name !== '4s').map((s) => `${s.name}${sup(s.k)}`).join('')
  const outerOf = (sub: ReturnType<typeof fillCells>) => {
    const layer = Math.max(...sub.filter((s) => s.k > 0).map((s) => Number(s.name[0])))
    return { layer, n: sub.filter((s) => Number(s.name[0]) === layer).reduce((a, s) => a + s.k, 0) }
  }
  const outerAtom = outerOf(atom)
  const outerIon = outerOf(after)
  const outer = ion ? outerIon : outerAtom

  const arrow = (kind: 'up' | 'down', a: boolean, b: boolean) => {
    const color = kind === 'up' ? 'text-orange' : 'text-teal'
    const sym = kind === 'up' ? '↑' : '↓'
    if (!ion) return a ? <span className={color}>{sym}</span> : null
    if (a && b) return <span className={color}>{sym}</span>
    if (a && !b) return <span className="text-red" style={{ animation: 'electron-out 1.1s ease-in forwards' }}>{sym}</span>
    if (!a && b) return <span className="text-red" style={{ animation: 'electron-in 1.1s ease-out both' }}>{sym}</span>
    return null
  }

  const pick = (k: number) => {
    setI(k)
    setIon(false)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        {CASES.map((x, k) => (
          <button
            key={x.sym}
            onClick={() => pick(k)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.sym} — {x.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-2xl font-bold" key={`${c.sym}-${ion}`}>
          {ion ? c.ion : `${c.sym}⁰`}{' '}
          <span className="text-base font-medium text-white/70">{ion ? (c.charge > 0 ? 'катион' : 'анион') : 'атом'}</span>
        </div>
        <div className="text-base font-semibold text-orange" aria-label="Электронная формула">{formula(cur)}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3" key={`${c.sym}-${ion ? 'ion' : 'atom'}`}>
        {LAYERS.map((layer) => {
          const isOuter = layer === outer.layer
          return (
            <div
              key={layer}
              className={`rounded-xl border-2 p-2 transition ${isOuter ? 'border-orange bg-orange/10' : 'border-white/15'}`}
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold">
                <span className="text-white/80">{layer}-й слой</span>
                {isOuter && <span className="rounded-full bg-orange px-2 py-0.5 text-navy">внешний · {outer.n} ē</span>}
              </div>
              <div className="flex gap-3">
                {cur.filter((s) => Number(s.name[0]) === layer).map((s) => {
                  const a = atom.find((x) => x.name === s.name)!
                  const b = after.find((x) => x.name === s.name)!
                  return (
                    <div key={s.name}>
                      <div className="mb-1 text-center text-xs font-semibold text-white/70">{s.name}</div>
                      <div className="flex gap-1">
                        {s.cells.map((_, j) => (
                          <div
                            key={j}
                            className="flex h-12 w-9 items-center justify-center rounded-md border-2 border-white/40 bg-white/5 text-xl font-bold leading-none"
                          >
                            {arrow('up', a.cells[j].up, b.cells[j].up)}
                            {arrow('down', a.cells[j].down, b.cells[j].down)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIon((v) => !v)}
          className="rounded-xl bg-orange px-4 py-2 font-semibold text-navy transition hover:brightness-105"
        >
          {ion ? '↺ Вернуть атом' : c.charge > 0 ? `${c.name[0].toUpperCase() + c.name.slice(1)} отдаёт электрон →` : `${c.name[0].toUpperCase() + c.name.slice(1)} принимает электрон →`}
        </button>
        <span className="text-sm text-white/80" aria-live="polite">
          {ion
            ? `${c.z} p⁺, ${electronsIon} ē: заряд ${c.z} − ${electronsIon} = ${c.charge > 0 ? '+' : '−'}${Math.abs(c.charge)}`
            : `${c.z} p⁺, ${c.z} ē: заряд 0`}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed">
        <div className="mb-1 text-sm font-bold uppercase tracking-wide text-orange">
          Почему {c.name} {c.charge > 0 ? 'отдаёт' : 'принимает'} электрон
        </div>
        {c.why.map((t, k) => (
          <p key={k} className="text-white/90">{bold(t)}</p>
        ))}
        {ion && <p className="mt-1 font-semibold text-white">{c.result}</p>}
      </div>
    </div>
  )
}
