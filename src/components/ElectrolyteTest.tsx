import { useState } from 'react'

interface Sub {
  id: string
  name: string
  formula: string
  bond: string
  conducts: boolean
  cation?: string
  anion?: string
  mol?: string
  why: string
}

const SUBS: Sub[] = [
  {
    id: 'nacl',
    name: 'Соль NaCl',
    formula: 'NaCl',
    bond: 'ионная связь',
    conducts: true,
    cation: 'Na⁺',
    anion: 'Cl⁻',
    why: 'В кристалле соли ионы уже есть, они просто «склеены» притяжением. Вода разрывает кристалл на свободные ионы, и они переносят ток.',
  },
  {
    id: 'naoh',
    name: 'Щёлочь NaOH',
    formula: 'NaOH',
    bond: 'ионная связь',
    conducts: true,
    cation: 'Na⁺',
    anion: 'OH⁻',
    why: 'Щёлочь тоже построена из ионов. В воде они расходятся, поэтому раствор проводит ток.',
  },
  {
    id: 'hcl',
    name: 'Кислота HCl',
    formula: 'HCl',
    bond: 'ковалентная сильнополярная связь',
    conducts: true,
    cation: 'H⁺',
    anion: 'Cl⁻',
    why: 'Молекула HCl полярная: электронная пара сильно смещена к хлору. Молекулы воды «растаскивают» её на ионы H⁺ и Cl⁻.',
  },
  {
    id: 'sugar',
    name: 'Сахар',
    formula: 'C₁₂H₂₂O₁₁',
    bond: 'ковалентные малополярные связи',
    conducts: false,
    mol: 'C₁₂H₂₂O₁₁',
    why: 'Связи в молекуле сахара почти неполярные, вода не может их разорвать. Молекулы остаются целыми, заряженных частиц нет, ток не идёт.',
  },
  {
    id: 'alcohol',
    name: 'Спирт',
    formula: 'C₂H₅OH',
    bond: 'ковалентные малополярные связи',
    conducts: false,
    mol: 'C₂H₅OH',
    why: 'Спирт растворяется в воде, но остаётся в виде молекул. Растворение ещё не значит диссоциация, ионов нет.',
  },
]

// 12 мест частиц в стакане: [x, y]
const SLOTS: [number, number][] = [
  [262, 168], [310, 190], [358, 166], [398, 196],
  [284, 226], [338, 232], [388, 240], [255, 250],
  [300, 160], [372, 214], [270, 200], [345, 198],
]
const WANDER = [
  ['8px', '-6px', '-5px', '8px', '6px', '5px'],
  ['-7px', '5px', '6px', '-6px', '-5px', '-8px'],
  ['5px', '8px', '-8px', '4px', '7px', '-5px'],
]

export default function ElectrolyteTest() {
  const [i, setI] = useState(0)
  const [on, setOn] = useState(false)
  const s = SUBS[i]
  const lit = on && s.conducts

  const parts = SLOTS.map((p, k) => {
    const cation = k % 2 === 0
    const label = s.mol ?? (cation ? s.cation! : s.anion!)
    let [x, y] = p
    if (on && s.conducts) {
      const n = Math.floor(k / 2)
      x = cation ? 250 + (n % 2) * 34 : 390 - (n % 2) * 34
      y = 160 + Math.floor(n / 2) * 40
    }
    return { k, cation, label, x, y }
  })

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите вещество, растворите его в воде и включите ток. Лампочка загорится, если в растворе есть свободные ионы.</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUBS.map((x, k) => (
          <button
            key={x.id}
            onClick={() => {
              setI(k)
              setOn(false)
            }}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 640 300" className="mt-4 w-full" role="img" aria-label={`Раствор вещества «${s.name}», лампочка ${lit ? 'горит' : 'не горит'}`}>
        {/* провода */}
        <path d="M 215 70 V 36 H 298 M 425 70 V 36 H 342" fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={3} />
        {/* лампочка */}
        {lit && <circle cx={320} cy={36} r={44} fill="#f5d94a" opacity={0.28} style={{ animation: 'pop .35s ease-out both', transformOrigin: '320px 36px' }} />}
        <circle cx={320} cy={36} r={22} fill={lit ? '#ffe45c' : '#3a4468'} stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} style={{ transition: 'fill .3s' }} />
        <path d="M 308 46 l 6 -14 l 6 10 l 6 -10 l 6 14" fill="none" stroke={lit ? '#b8740a' : '#8892b3'} strokeWidth={2} strokeLinejoin="round" />
        {/* стакан и раствор */}
        <path d="M 170 108 L 178 268 q 1 14 14 14 H 448 q 13 0 14 -14 L 470 108 Z" fill="rgba(140,190,255,.16)" />
        <path d="M 170 90 L 178 268 q 1 14 14 14 H 448 q 13 0 14 -14 L 470 90" fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
        {/* электроды */}
        <rect x={209} y={70} width={12} height={170} rx={3} fill="#cfd5e6" />
        <rect x={419} y={70} width={12} height={170} rx={3} fill="#cfd5e6" />
        <text x={215} y={62} textAnchor="middle" fontSize={20} fontWeight={800} fill="#6aa5ff">−</text>
        <text x={425} y={62} textAnchor="middle" fontSize={20} fontWeight={800} fill="#ff7a7e">+</text>
        {/* частицы */}
        {parts.map(({ k, cation, label, x, y }) => (
          <g key={`${s.id}-${k}`} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 1.4s ease-in-out' }}>
            <g
              style={
                {
                  animation: `wander ${3.4 + (k % 4) * 0.6}s ease-in-out ${k * -0.4}s infinite`,
                  '--a': WANDER[k % 3][0], '--b': WANDER[k % 3][1], '--c': WANDER[k % 3][2],
                  '--d': WANDER[k % 3][3], '--e': WANDER[k % 3][4], '--f': WANDER[k % 3][5],
                } as React.CSSProperties
              }
            >
              {s.mol ? (
                <>
                  <rect x={-27} y={-13} width={54} height={26} rx={13} fill="#8d97b8" />
                  <text y={4} textAnchor="middle" fontSize={s.mol.length > 7 ? 9 : 11} fontWeight={700} fill="#fff">{label}</text>
                </>
              ) : (
                <>
                  <circle r={15} fill={cation ? '#2f7fec' : '#e5484d'} />
                  <text y={4.5} textAnchor="middle" fontSize={label.length > 3 ? 11 : 13} fontWeight={700} fill="#fff">{label}</text>
                </>
              )}
            </g>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => setOn((v) => !v)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
          {on ? 'Выключить ток' : 'Включить ток'}
        </button>
        <span className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/70">
          {s.mol ? (
            <span className="flex items-center gap-1"><i className="inline-block h-3 w-5 rounded-full bg-[#8d97b8]" /> целые молекулы</span>
          ) : (
            <>
              <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-[#2f7fec]" /> катион</span>
              <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-[#e5484d]" /> анион</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        <div className={`font-bold ${s.conducts ? 'text-teal' : 'text-pink'}`}>
          {s.formula}: {s.conducts ? 'электролит' : 'неэлектролит'} · {s.bond}
        </div>
        <div className="mt-1 text-sm text-white/85">
          {on ? (s.conducts ? 'Лампочка горит: катионы идут к «−», анионы к «+», ток есть. ' : 'Лампочка не горит: переносить заряд некому. ') : ''}
          {s.why}
        </div>
      </div>
    </div>
  )
}
