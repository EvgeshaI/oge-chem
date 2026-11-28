import { useState } from 'react'
import { AR, EL_COLOR, OPS, SUBSTANCES, applyOp, fmt, molarMass, parseFormula, solutionFraction, solutionMass, type Solution } from '../lib/massFraction'

const btn = (on: boolean) => `rounded-md px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`
const textOn = (hex: string) => {
  const h = hex.replace('#', '')
  const l = 0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)
  return l > 150 ? '#1b2445' : '#fff'
}

/* ───────────── 1. Массовая доля элемента ───────────── */

export function ElementFractionDemo() {
  const [i, setI] = useState(3)
  const s = SUBSTANCES[i]
  const parts = parseFormula(s.formula)
  const [el, setEl] = useState(parts[parts.length - 1].el)
  const [step, setStep] = useState(3)
  const cur = parts.find((p) => p.el === el) ?? parts[0]
  const M = molarMass(parts)
  const atoms = parts.flatMap((p) => Array.from({ length: p.n }, () => p.el))
  const w = ((AR[cur.el] * cur.n) / M) * 100

  const pick = (k: number) => {
    setI(k)
    const ps = parseFormula(SUBSTANCES[k].formula)
    setEl(ps[ps.length - 1].el)
    setStep(1)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">
        Выберите вещество и элемент. Каждый «кирпичик» — один атом, его ширина пропорциональна массе атома. Доля элемента — это доля его кирпичиков в общей длине.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUBSTANCES.map((x, k) => (
          <button key={x.formula} onClick={() => pick(k)} aria-pressed={k === i} className={btn(k === i)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-white/70">
        {s.name}, <b className="text-white">{s.label}</b>
      </div>

      {/* полоса масс */}
      <div key={s.formula} className="mt-2 flex h-14 w-full overflow-hidden rounded-xl bg-white/5">
        {atoms.map((a, k) => {
          const on = a === cur.el
          return (
            <div key={k} className="h-full min-w-0 border-r border-navy transition-opacity" style={{ width: `${(AR[a] / M) * 100}%`, opacity: on ? 1 : 0.3 }} title={`${a}: ${AR[a]}`}>
              <div
                className="flex h-full items-center justify-center text-xs font-extrabold sm:text-sm"
                style={{ backgroundColor: EL_COLOR[a], color: textOn(EL_COLOR[a]), animation: `pop .35s ease-out ${k * 0.06}s both` }}
              >
                {AR[a] / M > 0.035 ? a : ''}
              </div>
            </div>
          )
        })}
      </div>

      {/* легенда-кнопки элементов */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {parts.map((p) => (
          <button
            key={p.el}
            onClick={() => setEl(p.el)}
            aria-pressed={p.el === cur.el}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${p.el === cur.el ? 'bg-white text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <i className="inline-block h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: EL_COLOR[p.el] }} />
            {p.el} × {p.n}
            <span className="font-normal opacity-70">{fmt(((AR[p.el] * p.n) / M) * 100)}%</span>
          </button>
        ))}
      </div>

      {/* пошаговый расчёт */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          {
            t: '1. Ar по таблице',
            body: parts.map((p) => `Ar(${p.el}) = ${fmt(AR[p.el])}`).join('; '),
          },
          {
            t: '2. Mr вещества',
            body: `Mr = ${parts.map((p) => (p.n > 1 ? `${p.n}·${fmt(AR[p.el])}` : fmt(AR[p.el]))).join(' + ')} = ${fmt(M)}`,
          },
          {
            t: `3. ω(${cur.el})`,
            body: `ω = ${cur.n > 1 ? `${cur.n}·` : ''}${fmt(AR[cur.el])} / ${fmt(M)} · 100% = ${fmt(w)}%`,
          },
        ].map((x, k) => (
          <div
            key={`${s.formula}-${k}-${k === 2 ? cur.el : ''}`}
            className={`rounded-xl p-3 transition ${k < step ? 'bg-white/10' : 'bg-white/5 opacity-40'}`}
            style={k < step ? { animation: 'pop .35s ease-out both' } : undefined}
          >
            <div className="text-sm font-bold text-orange">{x.t}</div>
            <div className="mt-1 text-[15px] leading-snug">{k < step ? x.body : '…'}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button onClick={() => setStep((v) => (v >= 3 ? 1 : v + 1))} className="rounded-md bg-teal px-4 py-1.5 text-sm font-semibold">
          {step >= 3 ? 'Сначала' : 'Следующий шаг →'}
        </button>
        <div className="text-sm text-white/70">Сумма долей всех элементов = 100%</div>
      </div>
    </div>
  )
}

/* ───────────── Стакан с раствором ───────────── */

/** Детерминированные «случайные» точки — частицы растворённого вещества */
const frac = (v: number) => v - Math.floor(v)
const DOTS = Array.from({ length: 60 }, (_, k) => ({ x: frac(Math.sin(k * 12.9898 + 1) * 43758.5453), y: frac(Math.sin(k * 78.233 + 2) * 43758.5453) }))

function Beaker({ s, max = 400, label, accent = '#9fd3ff' }: { s: Solution; max?: number; label?: string; accent?: string }) {
  const m = solutionMass(s)
  const w = m > 0 ? solutionFraction(s) : 0
  const H = 104
  const h = Math.max(4, Math.min(1, m / max) * H)
  const top = 132 - h
  const dots = Math.round(Math.min(60, w * 1.6))
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 120 150" className="h-40 w-32 sm:h-44 sm:w-36" aria-hidden>
        <rect x="18" y={top} width="84" height={h} rx="3" fill={accent} opacity=".55" style={{ transition: 'all .5s ease' }} />
        {DOTS.slice(0, dots).map((d, k) => (
          <circle key={k} cx={22 + d.x * 76} cy={top + 4 + d.y * Math.max(0, h - 8)} r="2.6" fill="#f7f9ff" style={{ transition: 'all .5s ease' }} />
        ))}
        <path d="M12 18 H108 M16 18 V132 Q16 138 22 138 H98 Q104 138 104 132 V18" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="16" x2="26" y1={132 - f * H} y2={132 - f * H} stroke="#fff" strokeOpacity=".4" strokeWidth="1.5" />
        ))}
      </svg>
      <figcaption className="text-center text-sm leading-tight">
        {label && <div className="text-white/70">{label}</div>}
        <div className="font-bold">{fmt(m)} г, ω = {fmt(w)}%</div>
      </figcaption>
    </figure>
  )
}

/* ───────────── 2. Приготовление раствора ───────────── */

function Slider({ label, value, set, min, max, step, color }: { label: string; value: number; set: (v: number) => void; min: number; max: number; step: number; color: string }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <b>{value} г</b>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full" style={{ accentColor: color }} />
    </label>
  )
}

export function SolutionMixerDemo() {
  const [solute, setSolute] = useState(20)
  const [water, setWater] = useState(180)
  const s = { solute, water }
  const m = solutionMass(s)
  const w = m > 0 ? solutionFraction(s) : 0

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Насыпьте соль и налейте воду. Смотрите, как меняются масса раствора и массовая доля соли. Белые точки — частицы соли: чем их гуще, тем раствор концентрированнее.</p>
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[auto_1fr]">
        <Beaker s={s} max={400} />
        <div className="space-y-3">
          <Slider label="Соль (растворённое вещество)" value={solute} set={setSolute} min={0} max={100} step={5} color="#f5a623" />
          <Slider label="Вода (растворитель)" value={water} set={setWater} min={0} max={300} step={10} color="#2f7fec" />
          <div className="flex h-7 overflow-hidden rounded-full bg-white/10 text-xs font-bold">
            <div className="flex items-center justify-center bg-orange text-navy" style={{ width: `${w}%`, transition: 'width .4s ease' }}>
              {w >= 12 ? 'соль' : ''}
            </div>
            <div className="flex flex-1 items-center justify-center bg-blue/80">{100 - w >= 12 ? 'вода' : ''}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-orange">масса раствора</div>
          <div className="mt-1 text-[15px]">
            m(р-ра) = m(соли) + m(воды) = {solute} + {water} = <b>{m} г</b>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-orange">массовая доля соли</div>
          <div className="mt-1 text-[15px]">
            {m > 0 ? (
              <>
                ω = {solute} / {m} · 100% = <b className="text-orange">{fmt(w)}%</b> <span className="text-white/60">(доля {fmt(w / 100, 3)})</span>
              </>
            ) : (
              'налейте воду или насыпьте соль'
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-white/70">
        Например, 20 г соли + 180 г воды = 200 г раствора, ω = 10%: в каждых 100 г раствора — 10 г соли.
      </p>
    </div>
  )
}

/* ───────────── 3. Треугольник формулы ───────────── */

type Key = 'm' | 'w' | 'M'
const TRI: Record<Key, { name: string; formula: string; example: string }> = {
  m: { name: 'm(в-ва)', formula: 'm(в-ва) = ω · m(р-ра)', example: 'Сколько соли в 250 г 8%-го раствора? m = 0,08 · 250 = 20 г' },
  w: { name: 'ω', formula: 'ω = m(в-ва) / m(р-ра)', example: '20 г соли в 250 г раствора: ω = 20 / 250 = 0,08 = 8%' },
  M: { name: 'm(р-ра)', formula: 'm(р-ра) = m(в-ва) / ω', example: 'Сколько 8%-го раствора выйдет из 20 г соли? m(р-ра) = 20 / 0,08 = 250 г' },
}

export function FractionTriangleDemo() {
  const [k, setK] = useState<Key>('w')
  const t = TRI[k]
  const cell = (key: Key, x: number, y: number) => {
    const on = key === k
    return (
      <g onClick={() => setK(key)} className="cursor-pointer" role="button" aria-pressed={on} aria-label={`Найти ${TRI[key].name}`}>
        <circle cx={x} cy={y} r="30" fill={on ? '#f5a623' : 'rgba(255,255,255,.08)'} style={{ transition: 'fill .3s' }} />
        <text x={x} y={y + 6} textAnchor="middle" fontSize={key === 'w' ? 22 : 15} fontWeight="800" fill={on ? '#1b2445' : '#fff'}>
          {on ? '?' : TRI[key].name}
        </text>
      </g>
    )
  }
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Нажмите на величину, которую нужно найти, — треугольник подскажет формулу. Сверху над чертой то, что делят; внизу — то, что перемножают.</p>
      <div className="mt-3 grid items-center gap-4 sm:grid-cols-[260px_1fr]">
        <svg viewBox="0 0 240 200" className="mx-auto w-full max-w-[260px]">
          <path d="M120 10 L230 190 H10 Z" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="58" x2="182" y1="112" y2="112" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" />
          <line x1="120" x2="120" y1="112" y2="190" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" />
          {cell('m', 120, 72)}
          {cell('w', 75, 155)}
          {cell('M', 165, 155)}
        </svg>
        <div key={k} style={{ animation: 'pop .35s ease-out both' }}>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TRI) as Key[]).map((x) => (
              <button key={x} onClick={() => setK(x)} aria-pressed={x === k} className={btn(x === k)}>
                найти {TRI[x].name}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-xl font-bold text-orange">{t.formula}</div>
          <div className="mt-2 text-[15px] text-white/85">{t.example}</div>
          <div className="mt-2 text-sm text-white/60">В формулу ω подставляют долей (8% = 0,08). Ответ в процентах — умножьте долю на 100.</div>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 4. Как меняется раствор ───────────── */

export function SolutionChangesDemo() {
  const [i, setI] = useState(0)
  const op = OPS[i]
  const a = op.start
  const b = applyOp(op)
  const row = (name: string, x: number, change: string, y: number, hl = false) => (
    <tr className="border-t border-white/10">
      <td className="py-1.5 pr-3 text-white/80">{name}</td>
      <td className="py-1.5 pr-3 text-right">{fmt(x)}</td>
      <td className={`py-1.5 pr-3 text-center ${change === 'не меняется' ? 'text-white/50' : 'font-semibold text-orange'}`}>{change}</td>
      <td className={`py-1.5 text-right font-bold ${hl ? 'text-orange' : ''}`}>{fmt(y)}</td>
    </tr>
  )
  const d = op.delta
  const changes: Record<string, [string, string, string]> = {
    water: ['не меняется', `+ ${d}`, `+ ${d}`],
    evaporate: ['не меняется', `− ${d}`, `− ${d}`],
    salt: [`+ ${d}`, 'не меняется', `+ ${d}`],
    mix: [`+ ${op.second?.solute}`, `+ ${op.second?.water}`, `+ ${op.second ? solutionMass(op.second) : 0}`],
  }
  const [c1, c2, c3] = changes[op.id]
  const action =
    op.id === 'water' ? `+ ${d} г воды` : op.id === 'evaporate' ? `− ${d} г воды` : op.id === 'salt' ? `+ ${d} г соли` : `+ раствор ${op.second ? solutionMass(op.second) : 0} г`

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите, что сделали с раствором. Следите, какие массы меняются, а какие — нет.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPS.map((x, k) => (
          <button key={x.id} onClick={() => setI(k)} aria-pressed={k === i} className={btn(k === i)}>
            {x.tab}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[15px]">{op.what}</p>

      <div key={op.id} className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <Beaker s={a} max={520} label="было" />
        {op.second && (
          <>
            <span className="text-2xl font-bold text-white/60">+</span>
            <Beaker s={op.second} max={520} label="второй раствор" accent="#c3b5ff" />
          </>
        )}
        <div className="flex flex-col items-center px-1 text-center">
          <span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-navy">{action}</span>
          <span className="mt-1 text-3xl text-white/70" style={{ animation: 'pop .5s ease-out .2s both' }}>
            →
          </span>
        </div>
        <div style={{ animation: 'pop .5s ease-out .4s both' }}>
          <Beaker s={b} max={520} label="стало" accent="#ffd58a" />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white/5 px-3 py-2">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-white/60">
              <th className="py-1 pr-3 font-semibold">масса, г</th>
              <th className="py-1 pr-3 text-right font-semibold">было</th>
              <th className="py-1 pr-3 text-center font-semibold">изменение</th>
              <th className="py-1 text-right font-semibold">стало</th>
            </tr>
          </thead>
          <tbody>
            {row('m(в-ва)', a.solute, c1, b.solute)}
            {row('m(воды)', a.water, c2, b.water)}
            {row('m(р-ра)', solutionMass(a), c3, solutionMass(b))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px]" style={{ animation: 'pop .35s ease-out both' }} key={`${op.id}-res`}>
        <b className="text-orange">
          ω = {fmt(b.solute)} / {fmt(solutionMass(b))} · 100% = {fmt(solutionFraction(b))}%
        </b>{' '}
        <span className="text-white/60">(было {fmt(solutionFraction(a))}%)</span>
        <div className="mt-1 text-white/85">{op.rule}</div>
      </div>
    </div>
  )
}
