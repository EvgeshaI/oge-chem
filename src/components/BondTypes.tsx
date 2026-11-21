import { useState } from 'react'

type Kind = 'cl2' | 'hcl' | 'nacl' | 'metal'

interface Scene {
  id: Kind
  tab: string
  kind: string
  examples: string
  before: string
  after: string
  btnOn: string
  btnOff: string
}

const SCENES: Scene[] = [
  {
    id: 'cl2',
    tab: 'Cl–Cl',
    kind: 'ковалентная неполярная',
    examples: 'H₂, O₂, N₂, Cl₂, O₃, P₄, алмаз',
    before: 'Два атома хлора. У каждого 7 внешних электронов, из них один неспаренный.',
    after:
      'Неспаренные электроны образовали общую пару. Электроотрицательность атомов одинакова, поэтому пара лежит ровно посередине и зарядов на атомах нет. У каждого Cl стало 8 электронов, как у аргона. Структурная формула Cl–Cl, степень окисления 0.',
    btnOff: 'Образовать связь →',
    btnOn: '↺ Разъединить',
  },
  {
    id: 'hcl',
    tab: 'H–Cl',
    kind: 'ковалентная полярная',
    examples: 'HCl, H₂O, NH₃, CO₂, CH₄, SiO₂, H₂SO₄',
    before: 'Атом водорода (1 электрон) и атом хлора (7 внешних электронов, один неспаренный).',
    after:
      'Общая пара образовалась, но хлор электроотрицательнее водорода, и пара смещена к Cl. На хлоре частичный заряд δ−, на водороде δ+. Степени окисления: H +1, Cl −1.',
    btnOff: 'Образовать связь →',
    btnOn: '↺ Разъединить',
  },
  {
    id: 'nacl',
    tab: 'Na⁺Cl⁻',
    kind: 'ионная',
    examples: 'NaCl, CaO, K₂S, MgCl₂, NaOH, K₂SO₄',
    before: 'Na — металл, на внешнем слое 1 электрон (2·8·1). Cl — неметалл, на внешнем слое 7 электронов (2·8·7).',
    after:
      'Электроотрицательность хлора намного больше, чем у натрия: электрон не делится, а переходит к хлору целиком. Получились ионы Na⁺ (2·8) и Cl⁻ (2·8·8), они притягиваются. Степени окисления: Na +1, Cl −1.',
    btnOff: 'Передать электрон →',
    btnOn: '↺ Вернуть электрон',
  },
  {
    id: 'metal',
    tab: 'Металл Na',
    kind: 'металлическая',
    examples: 'Na, Fe, Cu, Al, Zn, бронза, сталь',
    before: '',
    after:
      'Атомы металла легко отдают внешние электроны и превращаются в катионы. Отданные электроны не принадлежат одному атому, а свободно движутся по всему кристаллу — это «электронный газ». Он удерживает катионы вместе. Благодаря ему металлы блестят, проводят ток и тепло, ковкие.',
    btnOff: '',
    btnOn: '',
  },
]

const MOVE = 'transform 1.4s ease-in-out'
const CY = 100
const rad = (d: number) => (d * Math.PI) / 180
const edge = (cx: number, r: number, deg: number) => ({ x: cx + r * Math.cos(rad(deg)), y: CY + r * Math.sin(rad(deg)) })

/** Неподелённые пары по окружности атома (углы, центр пары) */
function Lone({ r, angles }: { r: number; angles: number[] }) {
  return (
    <>
      {angles.flatMap((a) =>
        [-11, 11].map((o) => {
          const p = { x: r * Math.cos(rad(a + o)), y: r * Math.sin(rad(a + o)) }
          return <circle key={`${a}${o}`} cx={p.x} cy={p.y} r={3.6} fill="#fff" fillOpacity={0.8} />
        }),
      )}
    </>
  )
}

function Dot({ at, color = '#f5a623' }: { at: { x: number; y: number }; color?: string }) {
  return <circle cx={0} cy={0} r={4.6} fill={color} stroke="#fff" strokeWidth={1} style={{ transform: `translate(${at.x}px, ${at.y}px)`, transition: MOVE }} />
}

function Atom({ x, children }: { x: number; children: React.ReactNode }) {
  return <g style={{ transform: `translate(${x}px, ${CY}px)`, transition: MOVE }}>{children}</g>
}

const LABEL = { textAnchor: 'middle' as const, fill: '#fff', fontWeight: 800 }

function Cl2({ on }: { on: boolean }) {
  const r = 32
  const ax = on ? 140 : 90
  const bx = on ? 220 : 270
  const a = on ? { x: 175, y: CY } : edge(90, r, 0)
  const b = on ? { x: 185, y: CY } : edge(270, r, 180)
  return (
    <>
      <Atom x={ax}>
        <circle r={r} fill="#c9e46a" fillOpacity={0.3} stroke="#9fc22e" strokeWidth={2.5} />
        <text y={6} fontSize={20} {...LABEL}>Cl</text>
        <Lone r={r} angles={[90, 180, 270]} />
      </Atom>
      <Atom x={bx}>
        <circle r={r} fill="#c9e46a" fillOpacity={0.3} stroke="#9fc22e" strokeWidth={2.5} />
        <text y={6} fontSize={20} {...LABEL}>Cl</text>
        <Lone r={r} angles={[270, 0, 90]} />
      </Atom>
      <ellipse cx={180} cy={CY} rx={16} ry={9} fill="none" stroke="#16a58c" strokeWidth={2} style={{ opacity: on ? 1 : 0, transition: 'opacity .6s ease 1.2s' }} />
      <Dot at={a} />
      <Dot at={b} />
      <text x={180} y={168} textAnchor="middle" fontSize={13} fill="#fff" fillOpacity={0.85} style={{ opacity: on ? 1 : 0, transition: 'opacity .6s ease 1.3s' }}>
        ЭО одинакова — пара посередине
      </text>
    </>
  )
}

function HCl({ on }: { on: boolean }) {
  const hx = on ? 140 : 80
  const cx = on ? 222 : 270
  const a = on ? { x: 180, y: CY } : edge(80, 20, 0)
  const b = on ? { x: 188, y: CY } : edge(270, 32, 180)
  const fade = { opacity: on ? 1 : 0, transition: 'opacity .6s ease 1.3s' }
  return (
    <>
      <Atom x={hx}>
        <circle r={20} fill="#ffb3cf" fillOpacity={0.28} stroke="#e0508a" strokeWidth={2.5} />
        <text y={6} fontSize={17} {...LABEL}>H</text>
      </Atom>
      <Atom x={cx}>
        <circle r={32} fill="#c9e46a" fillOpacity={0.3} stroke="#9fc22e" strokeWidth={2.5} />
        <text y={6} fontSize={20} {...LABEL}>Cl</text>
        <Lone r={32} angles={[270, 0, 90]} />
      </Atom>
      <ellipse cx={184} cy={CY} rx={16} ry={9} fill="none" stroke="#16a58c" strokeWidth={2} style={fade} />
      <Dot at={a} />
      <Dot at={b} />
      <g style={fade}>
        <text x={140} y={58} textAnchor="middle" fontSize={16} fontWeight={800} fill="#ffb3cf">δ+</text>
        <text x={222} y={50} textAnchor="middle" fontSize={16} fontWeight={800} fill="#c9e46a">δ−</text>
        <line x1={140} y1={152} x2={216} y2={152} stroke="#f5a623" strokeWidth={3} strokeLinecap="round" />
        <path d="M216 152 l-9 -6 v12 z" fill="#f5a623" />
        <text x={180} y={176} textAnchor="middle" fontSize={13} fill="#fff" fillOpacity={0.85}>пара смещена к более ЭО атому</text>
      </g>
    </>
  )
}

function NaCl({ on }: { on: boolean }) {
  const nx = on ? 112 : 85
  const clx = on ? 248 : 275
  const rN = on ? 17 : 24
  const rCl = 34
  const stay = on ? edge(248, rCl, 171) : edge(275, rCl, 171)
  const come = on ? edge(248, rCl, 189) : edge(85, 24, 0)
  const fade = { opacity: on ? 1 : 0, transition: 'opacity .6s ease 1.3s' }
  return (
    <>
      <Atom x={nx}>
        <circle r={rN} fill={on ? '#ffb86b' : '#ffd9a0'} fillOpacity={0.35} stroke="#e08a1e" strokeWidth={2.5} style={{ transition: 'r 1.4s ease-in-out' }} />
        <text y={6} fontSize={on ? 14 : 17} {...LABEL}>{on ? 'Na⁺' : 'Na'}</text>
      </Atom>
      <Atom x={clx}>
        <circle r={rCl} fill="#c9e46a" fillOpacity={on ? 0.45 : 0.3} stroke="#9fc22e" strokeWidth={2.5} />
        <text y={6} fontSize={20} {...LABEL}>{on ? 'Cl⁻' : 'Cl'}</text>
        <Lone r={rCl} angles={[270, 0, 90]} />
      </Atom>
      <Dot at={stay} />
      <Dot at={come} color={on ? '#ff7a5c' : '#f5a623'} />
      <g style={fade}>
        <text x={112} y={58} textAnchor="middle" fontSize={15} fontWeight={800} fill="#ffb86b">+</text>
        <text x={248} y={50} textAnchor="middle" fontSize={15} fontWeight={800} fill="#c9e46a">−</text>
        <line x1={150} y1={152} x2={210} y2={152} stroke="#f5a623" strokeWidth={2.5} strokeDasharray="5 5" />
        <path d="M130 152 l9 -6 v12 z" fill="#f5a623" />
        <path d="M230 152 l-9 -6 v12 z" fill="#f5a623" />
        <text x={180} y={176} textAnchor="middle" fontSize={13} fill="#fff" fillOpacity={0.85}>притяжение ионов</text>
      </g>
    </>
  )
}

const WANDER = [
  [14, -10, -12, 14, 16, 12],
  [-16, 8, 10, -14, -8, 16],
  [12, 14, -14, -8, 6, -16],
  [-10, -14, 16, 10, -16, -6],
  [18, 6, -8, 16, -14, -10],
  [-12, 12, 14, -12, 10, 8],
  [8, -16, -16, 6, 14, -14],
  [-18, -6, 6, 16, -6, 14],
  [10, 10, -10, -10, 18, -4],
  [-8, 16, 16, -4, -12, -12],
  [14, -4, -6, -16, 8, 16],
  [-14, -12, 12, 8, 16, -8],
]

function Metal() {
  const cols = [86, 144, 202, 260]
  const rows = [56, 112, 168]
  const free: [number, number][] = [
    [115, 84], [173, 84], [231, 84], [115, 140], [173, 140], [231, 140],
    [86, 112], [144, 112], [202, 112], [260, 112], [144, 56], [202, 168],
  ]
  return (
    <>
      {rows.flatMap((y) =>
        cols.map((x) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={15} fill="#ffd9a0" fillOpacity={0.3} stroke="#e08a1e" strokeWidth={2} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff">+</text>
          </g>
        )),
      )}
      {free.map(([x, y], i) => {
        const w = WANDER[i]
        const style = {
          animation: `wander ${5 + (i % 4)}s ease-in-out ${-i}s infinite`,
          '--a': `${w[0]}px`, '--b': `${w[1]}px`, '--c': `${w[2]}px`, '--d': `${w[3]}px`, '--e': `${w[4]}px`, '--f': `${w[5]}px`,
        } as React.CSSProperties
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={4.4} fill="#2dd4b3" stroke="#fff" strokeWidth={1} style={style} />
          </g>
        )
      })}
    </>
  )
}

/** Четыре вида связи: как ведут себя электроны */
export default function BondTypes() {
  const [i, setI] = useState(0)
  const [on, setOn] = useState(false)
  const s = SCENES[i]
  const isMetal = s.id === 'metal'

  const pick = (k: number) => {
    setI(k)
    setOn(false)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        {SCENES.map((x, k) => (
          <button
            key={x.id}
            onClick={() => pick(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white/5 p-2">
        <svg viewBox="0 0 360 200" className="mx-auto w-full max-w-[520px]" role="img" aria-label={`Схема: ${s.kind} связь`}>
          {s.id === 'cl2' && <Cl2 on={on} />}
          {s.id === 'hcl' && <HCl on={on} />}
          {s.id === 'nacl' && <NaCl on={on} />}
          {isMetal && <Metal />}
        </svg>
      </div>

      {!isMetal && (
        <div className="mt-3">
          <button
            onClick={() => setOn((v) => !v)}
            className="rounded-xl bg-orange px-4 py-2 font-semibold text-navy transition hover:brightness-105"
          >
            {on ? s.btnOn : s.btnOff}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90" aria-live="polite">
        <p>{isMetal || on ? s.after : s.before}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1">
            Вид связи: <b className="text-orange">{s.kind}</b>
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">Примеры: {s.examples}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-white/75">
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-orange" /> электрон, который идёт в связь</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-white/75" /> неподелённая пара</span>
          {isMetal && <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-teal" /> свободный электрон</span>}
        </div>
      </div>
    </div>
  )
}
