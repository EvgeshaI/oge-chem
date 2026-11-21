import { useState } from 'react'
import { ELEMENTS } from '../lib/elements'
import { ShellsSvg } from './ShellsSvg'

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const ions = [
  { z: 11, charge: 1 },
  { z: 12, charge: 2 },
  { z: 13, charge: 3 },
  { z: 17, charge: -1 },
  { z: 8, charge: -2 },
  { z: 16, charge: -2 },
]

const ionLabel = (sym: string, ch: number) =>
  `${sym}${Math.abs(ch) > 1 ? SUP[Math.abs(ch)] : ''}${ch > 0 ? '⁺' : '⁻'}`

/** Атом → ион: число протонов не меняется, меняется число электронов */
export default function IonFormation() {
  const [i, setI] = useState(0)
  const { z, charge } = ions[i]
  const el = ELEMENTS[z - 1]
  const e1 = z
  const e2 = z - charge
  const n = Math.abs(charge)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <div className="text-center">
          <ShellsSvg z={z} electrons={e1} className="mx-auto w-full max-w-[220px]" label={`Атом ${el.name}`} />
          <div className="text-xl font-bold">{el.symbol}⁰ <span className="text-sm font-normal text-white/70">атом</span></div>
          <div className="text-sm text-white/80">{z} p⁺, {e1} ē</div>
        </div>
        <div className="text-center">
          <div className="text-3xl text-orange">→</div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
            {charge > 0 ? `отдал ${n} ē` : `принял ${n} ē`}
          </div>
        </div>
        <div className="text-center">
          <ShellsSvg key={`${z}-${charge}`} z={z} electrons={e2} className="mx-auto w-full max-w-[220px]" label={`Ион ${ionLabel(el.symbol, charge)}`} />
          <div className="text-xl font-bold">{ionLabel(el.symbol, charge)} <span className="text-sm font-normal text-white/70">{charge > 0 ? 'катион' : 'анион'}</span></div>
          <div className="text-sm text-white/80">{z} p⁺, {e2} ē</div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-white/80">
        Число протонов не меняется (<b>{z}</b>), меняется только число электронов: <b>{e1} → {e2}</b>.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {ions.map((x, k) => (
          <button key={k} onClick={() => setI(k)} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {ionLabel(ELEMENTS[x.z - 1].symbol, x.charge)}
          </button>
        ))}
      </div>
    </div>
  )
}
