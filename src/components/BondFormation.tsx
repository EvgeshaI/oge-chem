import { useMemo, useState } from 'react'
import { ELEMENTS, geometry, shellsOf, substances, unpairedOf, valenceOf, type ElSym, type Shell } from '../lib/bonds'

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const COLORS: Record<ElSym, { fill: string; stroke: string }> = {
  H: { fill: '#ffb3cf', stroke: '#e0508a' },
  C: { fill: '#aab2c0', stroke: '#6b7387' },
  N: { fill: '#8bb8ff', stroke: '#3f7fe0' },
  O: { fill: '#ff9d9d', stroke: '#e5484d' },
}
const MOVE = 'transform 1.4s ease-in-out'

const bonds = (n: number) => `${n} ${n === 1 ? 'связь' : n < 5 ? 'связи' : 'связей'}`

function Cells({ shells, bonded }: { shells: Shell[]; bonded: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {shells.map((s) => (
        <div key={s.sub}>
          <div className="mb-1 text-center text-xs font-semibold text-white/70">{s.sub}</div>
          <div className="flex gap-1">
            {s.cells.map((n, j) => (
              <div
                key={j}
                className={`flex h-11 w-9 items-center justify-center rounded-md border-2 bg-white/5 text-xl font-bold leading-none transition-colors ${
                  n === 1 ? (bonded ? 'border-teal bg-teal/15' : 'border-orange bg-orange/15') : 'border-white/30'
                }`}
              >
                <span className="text-orange" style={{ opacity: n >= 1 ? 1 : 0, animation: n >= 1 ? 'pop .35s ease-out both' : undefined }}>↑</span>
                <span className="text-teal" style={{ opacity: n >= 2 ? 1 : 0, animation: n >= 2 ? 'pop .35s ease-out both' : undefined }}>↓</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const sup = (n: number) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')
const label = (shells: Shell[]) => shells.map((s) => `${s.sub}${sup(s.cells.reduce((a, b) => a + b, 0))}`).join('')

/** Как неспаренные электроны образуют общие пары: H₂, O₂, N₂, NH₃, CH₄, CO₂ */
export default function BondFormation() {
  const [si, setSi] = useState(3)
  const [bonded, setBonded] = useState(false)
  const [excited, setExcited] = useState(false)
  const sub = substances[si]
  const geo = useMemo(() => geometry(sub), [sub])

  const needsExcite = sub.atoms.some((a) => a.el === 'C')
  const exc = (el: ElSym) => (el === 'C' ? excited : false)
  const blocked = needsExcite && !excited
  const elements = [...new Set(sub.atoms.map((a) => a.el))]

  const pick = (i: number) => {
    setSi(i)
    setBonded(false)
    setExcited(false)
  }
  const toggleExcite = (v: boolean) => {
    setExcited(v)
    setBonded(false)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        {substances.map((s, i) => (
          <button
            key={s.id}
            onClick={() => pick(i)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${i === si ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {s.formula} <span className="font-normal opacity-80">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-orange">1. Электроны во внешнем слое (в ячейках)</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {elements.map((el) => {
            const sh = shellsOf(el, exc(el))
            const un = unpairedOf(sh)
            const info = ELEMENTS[el]
            return (
              <div key={el} className="rounded-xl bg-white/10 p-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-bold">
                    Атом {info.genitive} {el}
                  </div>
                  <div className="text-sm font-semibold text-orange">{label(sh)}</div>
                </div>
                <div key={`${el}-${exc(el)}`}>
                  <Cells shells={sh} bonded={bonded} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white/10 px-3 py-1">Неспаренных ē: <b className="text-orange">{un}</b></span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Может образовать связей: <b className="text-orange">{un}</b></span>
                </div>
                {el === 'C' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleExcite(false)}
                      aria-pressed={!excited}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${!excited ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Основное состояние
                    </button>
                    <button
                      onClick={() => toggleExcite(true)}
                      aria-pressed={excited}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${excited ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Возбуждённое состояние
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {needsExcite && (
          <p className="mt-2 text-sm text-white/80">
            {excited
              ? 'Электрон с 2s перешёл на свободную 2p-ячейку: пара распарилась, неспаренных электронов стало 4.'
              : 'В основном состоянии у углерода только 2 неспаренных электрона, а нужно 4 связи — сначала переведите атом в возбуждённое состояние.'}
          </p>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-orange">2. Образование связей</div>
        <div className="rounded-xl bg-white/5 p-2">
          <svg viewBox="0 0 360 240" className="mx-auto w-full max-w-[460px]" role="img" aria-label={`Схема образования связей в молекуле ${sub.formula}`}>
            {sub.atoms.map((a, i) => {
              const g = geo.atoms[i]
              const c = COLORS[a.el]
              const v = valenceOf(sub, i)
              return (
                <g key={i} style={{ transform: `translate(${bonded ? g.x : g.sx}px, ${bonded ? g.y : g.sy}px)`, transition: MOVE }}>
                  <circle r={g.r} fill={c.fill} fillOpacity={0.28} stroke={c.stroke} strokeWidth={2.5} />
                  <text y={a.el === 'H' ? -1 : -2} textAnchor="middle" fontSize={a.el === 'H' ? 16 : 20} fontWeight={800} fill="#fff">{a.el}</text>
                  <text y={a.el === 'H' ? 13 : 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#f5a623" style={{ opacity: bonded ? 1 : 0, transition: 'opacity .6s ease 1.2s' }}>
                    {ROMAN[v]}
                  </text>
                  {geo.lone.filter((l) => l.atom === i).map((l, k) => (
                    <g key={k}>
                      {l.dots.map((d, m) => (
                        <circle key={m} cx={d.x} cy={d.y} r={3.8} fill="#ffffff" fillOpacity={0.75} />
                      ))}
                    </g>
                  ))}
                </g>
              )
            })}
            {geo.pairs.map((p, i) => (
              <g key={i}>
                <ellipse
                  cx={0}
                  cy={0}
                  rx={13}
                  ry={8.5}
                  fill="none"
                  stroke="#16a58c"
                  strokeWidth={2}
                  style={{ transform: `translate(${p.center.x}px, ${p.center.y}px) rotate(${p.angle}deg)`, opacity: bonded ? 1 : 0, transition: 'opacity .6s ease 1.3s' }}
                />
                {p.to.map((to, k) => {
                  const from = p.from[k]
                  const at = bonded ? to : from
                  return <circle key={k} cx={0} cy={0} r={4.8} fill="#f5a623" stroke="#fff" strokeWidth={1} style={{ transform: `translate(${at.x}px, ${at.y}px)`, transition: MOVE }} />
                })}
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setBonded((v) => !v)}
            disabled={blocked}
            className="rounded-xl bg-orange px-4 py-2 font-semibold text-navy transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {bonded ? '↺ Разъединить атомы' : 'Образовать связи →'}
          </button>
          {blocked && <span className="text-sm text-white/80">Сначала переведите атом углерода в возбуждённое состояние.</span>}
          <span className="flex flex-wrap gap-3 text-xs text-white/75">
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-orange" /> неспаренный электрон</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-white/75" /> неподелённая пара</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-4 rounded-full border-2 border-teal" /> общая пара = связь</span>
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90" aria-live="polite">
        {!bonded && (
          <p>
            Каждый <b className="text-orange">неспаренный электрон</b> может образовать с неспаренным электроном другого атома <b>общую пару</b> — это и есть одна химическая связь. Нажмите «Образовать связи».
          </p>
        )}
        {bonded && (
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <pre className="rounded-lg bg-navy/60 px-4 py-2 font-mono text-lg leading-tight text-white">{sub.struct}</pre>
            <div className="space-y-1">
              <p>
                <b className="text-white">{sub.formula}</b> — общих пар: <b className="text-teal">{sub.bonds.reduce((a, b) => a + b.order, 0)}</b>. Структурная формула показывает каждую пару чёрточкой.
              </p>
              {elements.map((el) => {
                const i = sub.atoms.findIndex((a) => a.el === el)
                const v = valenceOf(sub, i)
                return (
                  <p key={el}>
                    <b className="text-white">{el}</b> образует {bonds(v)} → <b className="text-orange">валентность {ROMAN[v]}</b>
                  </p>
                )
              })}
              <p className="text-sm text-white/75">
                Степень окисления (условный заряд): <b>{sub.oxidation}</b>. Валентность — число связей, у неё нет знака, поэтому с. о. может не совпадать с ней.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
