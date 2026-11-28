import { Fragment, useEffect, useRef, useState } from 'react'
import {
  chargeOf,
  reactionById,
  shortItems,
  sideCharge,
  sideItems,
  segsText,
  type Item,
  type Kind,
  type Reaction,
  type Seg,
} from '../lib/ionEquations'

/* Цвета на тёмном фоне: катион — синий, анион — красный, индекс/коэффициент — оранжевый */
const COL: Record<Kind, string> = {
  cat: '#7fb3ff',
  an: '#ff8a8e',
  k: '#f7a93b',
  plain: '#ffffff',
  solid: '#ffd966',
  gas: '#7fe0c0',
  water: '#7fd8f0',
}
const BLUE = '#2f7fec'
const RED = '#e5484d'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Segs({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map(([t, k], i) => (
        <span key={i} style={{ color: COL[k] }}>
          {t}
        </span>
      ))}
    </>
  )
}

function ItemView({ it, strike }: { it: Item; strike?: boolean }) {
  const off = strike && it.spec
  return (
    <span className="relative inline-block whitespace-nowrap transition-opacity duration-500" style={{ opacity: off ? 0.4 : 1 }}>
      {it.coef > 1 && <span style={{ color: COL.k }}>{it.coef}</span>}
      <Segs segs={it.segs} />
      {it.mark && <span style={{ color: it.mark === '↓' ? COL.solid : COL.gas }}>{it.mark}</span>}
      <i
        className="absolute left-0 right-0 top-1/2 h-[3px] origin-left rounded bg-white"
        style={{ transform: `scaleX(${off ? 1 : 0})`, transition: 'transform .6s ease' }}
      />
    </span>
  )
}

function Side({ items, strike }: { items: Item[]; strike?: boolean }) {
  return (
    <>
      {items.map((it, i) => (
        <Fragment key={it.id}>
          {i > 0 && <span className="mx-1 text-white/55">+</span>}
          <ItemView it={it} strike={strike} />
        </Fragment>
      ))}
    </>
  )
}

function Eq({ left, right, strike, arrow = '→' }: { left: Item[]; right: Item[]; strike?: boolean; arrow?: string }) {
  return (
    <div className="overflow-x-auto py-1 text-lg font-bold sm:text-xl">
      <div className="flex w-max min-w-full flex-wrap items-baseline gap-y-1 sm:flex-nowrap">
        <Side items={left} strike={strike} />
        <span className="mx-2 text-white/70">{arrow}</span>
        <Side items={right} strike={strike} />
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/75">
      <span><b style={{ color: COL.cat }}>●</b> катион</span>
      <span><b style={{ color: COL.an }}>●</b> анион</span>
      <span><b style={{ color: COL.k }}>●</b> индекс / коэффициент</span>
    </div>
  )
}

const beaker = (cx: number, w: number, top: number) =>
  `M ${cx - w / 2} ${top} L ${cx - w / 2 + 6} 248 q 0 10 10 10 H ${cx + w / 2 - 16} q 10 0 10 -10 L ${cx + w / 2} ${top}`

const moleculeName = (r: Reaction, i: number) => `${r.left[i].coef > 1 ? r.left[i].coef : ''}${segsText(r.left[i].mol)}`

/* ======================================================================= */
/* 1. Механизм: ионы меняются партнёрами                                    */
/* ======================================================================= */

const MECH = reactionById('water')
type P = [number, number]

/** Na⁺, OH⁻ | H⁺, Cl⁻ — позиции ионов по шагам */
const MECH_POS: P[][] = [
  [[130, 150], [190, 195], [450, 150], [510, 195]],
  [[260, 150], [390, 135], [330, 205], [440, 215]],
  [[350, 195], [290, 135], [240, 135], [400, 195]],
  [[255, 165], [320, 200], [320, 200], [405, 165]],
]
const MECH_POS_LAST = MECH_POS[3]
/** ионы, которые связываются в воду: OH⁻ и H⁺ */
const MECH_REACT = [1, 2]

const MECH_TEXT = [
  'В каждом растворе вещество уже распалось на ионы: NaOH → Na⁺ и OH⁻, HCl → H⁺ и Cl⁻.',
  'Растворы слили. Теперь в одном сосуде все ионы вперемешку: они свободно движутся и сталкиваются.',
  'Ионы «пробуют» новых партнёров: катион из одного вещества встречает анион из другого. Получаются возможные пары H₂O (H⁺ и OH⁻) и NaCl (Na⁺ и Cl⁻).',
  'Проверяем каждую пару. Вода — слабый электролит, почти не распадается на ионы, поэтому H⁺ и OH⁻ связываются в молекулу H₂O. NaCl растворим — его ионы снова расходятся в раствор.',
  'Итог: реакция идёт, потому что ионы H⁺ и OH⁻ ушли из раствора и образовалась вода. Na⁺ и Cl⁻ остались в растворе, они в реакции не участвовали.',
]

export function MechanismDemo() {
  const [step, setStep] = useState(0)
  const ions = sideItems(MECH.left, 'L', true).flatMap((it) => Array.from({ length: it.coef }, (_, k) => ({ it, k })))
  const pos = MECH_POS[Math.min(step, 3)] ?? MECH_POS_LAST
  // 0 Na, 1 OH, 2 H, 3 Cl: новые пары H–OH и Na–Cl
  const links: [number, number][] = [[1, 2], [0, 3]]
  const last = step >= 3

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Нажимайте «Дальше» и следите, как ионы меняются партнёрами.</div>

      <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-lg font-bold sm:text-xl">
        <span style={{ color: COL.cat }}>A</span><span style={{ color: COL.an }}>B</span>
        <span className="mx-2 text-white/60">+</span>
        <span style={{ color: COL.cat }}>C</span><span style={{ color: COL.an }}>D</span>
        <span className="mx-3 text-white/70">→</span>
        <span style={{ color: COL.cat }}>A</span><span style={{ color: COL.an }}>D</span>
        <span className="mx-2 text-white/60">+</span>
        <span style={{ color: COL.cat }}>C</span><span style={{ color: COL.an }}>B</span>
        <div className="text-xs font-normal text-white/65">общая схема: катионы обмениваются анионами</div>
      </div>

      <svg viewBox="0 40 640 250" className="mt-3 w-full" role="img" aria-label="Механизм реакции ионного обмена между NaOH и HCl">
        <g style={{ opacity: step === 0 ? 1 : 0, transition: 'opacity .5s' }}>
          {[160, 480].map((cx, i) => (
            <g key={cx}>
              <path d={`${beaker(cx, 200, 110)} Z`} fill="rgba(140,190,255,.12)" />
              <path d={beaker(cx, 200, 95)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
              <text x={cx} y={282} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
                {moleculeName(MECH, i)} (р-р)
              </text>
            </g>
          ))}
          <text x={320} y={185} textAnchor="middle" fontSize={30} fontWeight={700} fill="#f7a93b">+</text>
        </g>
        <g style={{ opacity: step === 0 ? 0 : 1, transition: 'opacity .5s' }}>
          <path d={`${beaker(320, 380, 100)} Z`} fill="rgba(140,190,255,.12)" />
          <path d={beaker(320, 380, 80)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
          <text x={320} y={282} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
            {step === 1 ? 'после сливания' : step === 2 ? 'ищем новых партнёров' : 'результат'}
          </text>
        </g>

        {/* вода */}
        <g style={{ opacity: last ? 1 : 0, transition: 'opacity .8s ease .6s' }}>
          <rect x={282} y={178} width={76} height={40} rx={20} fill={COL.water} />
          <text x={320} y={204} textAnchor="middle" fontSize={18} fontWeight={700} fill="#1c2540">H₂O</text>
        </g>

        {/* связи между новыми партнёрами */}
        {step === 2 &&
          links.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={pos[a][0]}
              y1={pos[a][1]}
              x2={pos[b][0]}
              y2={pos[b][1]}
              stroke="#f7a93b"
              strokeWidth={4}
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
          ))}
        {step === 2 && (
          <g fontSize={14} fontWeight={700} textAnchor="middle">
            <text x={265} y={100} fill="#fff">H₂O ?</text>
            <text x={375} y={230} fill="#fff">NaCl ?</text>
          </g>
        )}

        {ions.map(({ it }, i) => {
          const [x, y] = pos[i]
          const plus = chargeOf(it.segs) > 0
          const vanish = last && MECH_REACT.includes(i)
          return (
            <g
              key={i}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                opacity: vanish ? 0 : 1,
                transition: vanish ? 'transform 1s ease-in, opacity .4s ease .7s' : 'transform 1.1s ease-in-out',
              }}
            >
              <circle r={21} fill={plus ? BLUE : RED} stroke={step >= 2 && step < 4 && MECH_REACT.includes(i) ? '#f7a93b' : 'none'} strokeWidth={3} />
              <text y={4.5} textAnchor="middle" fontSize={segsText(it.segs).length > 3 ? 11.5 : 13} fontWeight={700} fill="#fff">
                {segsText(it.segs)}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, 4))}
          disabled={step === 4}
          className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110 disabled:opacity-40"
        >
          Дальше →
        </button>
        <button onClick={() => setStep(0)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
          ↺ Заново
        </button>
        <span className="text-xs text-white/60">шаг {step + 1} из 5</span>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm" aria-live="polite">
        {MECH_TEXT[step]}
        {step === 4 && (
          <div className="mt-2">
            <Eq left={sideItems(MECH.left, 'L', false)} right={sideItems(MECH.right, 'R', false)} />
          </div>
        )}
      </div>
      <Legend />
    </div>
  )
}

/* ======================================================================= */
/* 2. Условия: осадок, газ, вода, «не идёт»                                 */
/* ======================================================================= */

const CASE_IDS = ['baso4', 'co2', 'water', 'none']
const TAB_LABEL: Record<string, string> = { baso4: 'Осадок ↓', co2: 'Газ ↑', water: 'Вода H₂O', none: 'Реакции нет' }

const SLOTS_BEFORE: P[] = [[-55, -30], [45, -40], [-35, 30], [55, 22]]
const SLOTS_MIXED: P[] = [[-130, -45], [-55, -60], [25, -50], [105, -62], [140, 5], [-110, 25], [70, 30], [-20, 15]]
const MIX_CX = 320
const MIX_CY = 175

interface Particle {
  key: string
  label: string
  plus: boolean
  react: boolean
  before: P
}

function particles(r: Reaction): Particle[] {
  const out: Particle[] = []
  r.left.forEach((t, ti) => {
    let k = 0
    for (const it of sideItems([t], 'L', true))
      for (let n = 0; n < it.coef; n++) {
        const [dx, dy] = SLOTS_BEFORE[k++ % SLOTS_BEFORE.length]
        out.push({ key: `${ti}.${it.id}.${n}`, label: segsText(it.segs), plus: chargeOf(it.segs) > 0, react: !it.spec, before: [(ti === 0 ? 160 : 480) + dx, 175 + dy] })
      }
  })
  return out
}

export function ConditionsDemo() {
  const [id, setId] = useState('baso4')
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  const timers = useRef<number[]>([])
  const r = reactionById(id)
  const list = particles(r)

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const reset = (next = id) => {
    timers.current.forEach(window.clearTimeout)
    setId(next)
    setPhase(0)
  }
  const products = r.right.filter((t) => !t.ions)
  const solid = products.find((t) => t.mol[0][1] === 'solid')
  const gas = products.find((t) => t.mol[0][1] === 'gas')
  const waterN = products.filter((t) => t.mol[0][1] === 'water').reduce((s, t) => s + t.coef, 0)
  /** для газа есть лишняя стадия: ионы → H₂CO₃ → H₂O + CO₂ */
  const final = gas ? 3 : 2
  const mix = () => {
    if (reducedMotion()) return setPhase(final)
    setPhase(1)
    timers.current = [window.setTimeout(() => setPhase(2), 1300), ...(final === 3 ? [window.setTimeout(() => setPhase(3), 3800)] : [])]
  }
  const target: P = solid ? [MIX_CX, 236] : gas ? [MIX_CX, 200] : [MIX_CX, MIX_CY]
  const left = sideItems(r.left, 'L', true)
  const right = sideItems(r.right, 'R', true)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите пару растворов и слейте их. Смотрите, что происходит с ионами.</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CASE_IDS.map((c) => (
          <button
            key={c}
            onClick={() => reset(c)}
            aria-pressed={c === id}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${c === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {TAB_LABEL[c]}
          </button>
        ))}
      </div>

      <svg viewBox="0 40 640 250" className="mt-4 w-full" role="img" aria-label={`Сливаем растворы: ${r.tab}`}>
        <g style={{ opacity: phase === 0 ? 1 : 0, transition: 'opacity .5s' }}>
          {[160, 480].map((cx, i) => (
            <g key={cx}>
              <path d={`${beaker(cx, 200, 110)} Z`} fill="rgba(140,190,255,.12)" />
              <path d={beaker(cx, 200, 95)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
              <text x={cx} y={282} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
                {moleculeName(r, i)} (р-р)
              </text>
            </g>
          ))}
          <text x={320} y={185} textAnchor="middle" fontSize={30} fontWeight={700} fill="#f7a93b">+</text>
        </g>
        <g style={{ opacity: phase === 0 ? 0 : 1, transition: 'opacity .5s' }}>
          <path d={`${beaker(MIX_CX, 380, 100)} Z`} fill="rgba(140,190,255,.12)" />
          <path d={beaker(MIX_CX, 380, 80)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} strokeLinejoin="round" />
          <text x={MIX_CX} y={282} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">после сливания</text>
        </g>

        {solid && (
          <g style={{ opacity: phase === final ? 1 : 0, transition: 'opacity .8s ease .5s' }}>
            <path d={`M ${MIX_CX - 110} 257 Q ${MIX_CX} 212 ${MIX_CX + 110} 257 Z`} fill={segsText(solid.mol).startsWith('Cu') ? '#7fc4f0' : '#f4f1e6'} />
            <text x={MIX_CX} y={250} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1c2540">{segsText(solid.mol)} ↓</text>
          </g>
        )}
        {gas && phase === 2 && (
          <g style={{ animation: 'pop .5s ease-out .5s both', transformBox: 'fill-box', transformOrigin: 'center' }}>
            <rect x={MIX_CX - 50} y={182} width={100} height={38} rx={19} fill="#c9b6ff" />
            <text x={MIX_CX} y={207} textAnchor="middle" fontSize={18} fontWeight={700} fill="#1c2540">H₂CO₃</text>
          </g>
        )}
        {gas && phase === 3 && (
          <g>
            {[-90, -40, 10, 60, 110].map((dx, i) => (
              <circle
                key={dx}
                cx={MIX_CX + dx}
                cy={230}
                r={5 + (i % 2) * 2}
                fill="none"
                stroke={COL.gas}
                strokeWidth={2}
                style={{ animation: `rise 1.6s ease-out ${i * 0.3}s infinite`, transformBox: 'fill-box' }}
              />
            ))}
            <text x={MIX_CX} y={62} textAnchor="middle" fontSize={17} fontWeight={700} fill="#f7a93b" style={{ animation: 'pop .4s ease-out both' }}>
              {segsText(gas.mol)} ↑
            </text>
          </g>
        )}
        {waterN > 0 &&
          phase === final &&
          Array.from({ length: waterN }, (_, i) => (
            <g key={i} transform={`translate(${MIX_CX - 40 * (waterN - 1) + i * 80} ${gas ? 135 : MIX_CY})`}>
              <g style={{ animation: 'pop .4s ease-out both', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <rect x={-28} y={-16} width={56} height={32} rx={16} fill={COL.water} />
                <text y={5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1c2540">H₂O</text>
              </g>
            </g>
          ))}

        {list.map((p, i) => {
          const [mx, my] = SLOTS_MIXED[i % SLOTS_MIXED.length]
          const goes = phase >= 2 && p.react && r.kind !== 'none'
          const [x, y] = phase === 0 ? p.before : goes ? target : [MIX_CX + mx, MIX_CY + my]
          return (
            <g
              key={`${r.id}-${p.key}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                opacity: goes ? 0 : 1,
                transition: goes ? 'transform .9s ease-in, opacity .3s ease .7s' : 'transform 1.1s ease-in-out',
              }}
            >
              <circle r={21} fill={p.plus ? BLUE : RED} stroke={phase > 0 && p.react && r.kind !== 'none' ? '#f7a93b' : 'none'} strokeWidth={3} />
              <text y={4.5} textAnchor="middle" fontSize={p.label.length > 3 ? 11.5 : 13} fontWeight={700} fill="#fff">{p.label}</text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {phase === 0 ? (
          <button onClick={mix} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">Слить растворы</button>
        ) : (
          <button onClick={() => reset()} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">↺ Заново</button>
        )}
        <span className="flex items-center gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-[#2f7fec]" /> катион</span>
          <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-[#e5484d]" /> анион</span>
          <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full border-2 border-[#f7a93b]" /> ион, который связывается</span>
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3" aria-live="polite">
        {phase < 2 ? (
          <div className="text-white/70">В растворах вещества уже распались на ионы. Слейте растворы.</div>
        ) : phase === 2 && gas ? (
          <>
            <div className="font-bold text-teal">Ионы связались в угольную кислоту H₂CO₃.</div>
            <div className="mt-1 text-sm text-white/85">
              Карбонат-ион <b style={{ color: COL.an }}>CO₃²⁻</b> присоединил два иона <b style={{ color: COL.cat }}>H⁺</b>. Угольная кислота слабая и неустойчивая, она сейчас распадётся…
            </div>
            <div className="mt-2 text-lg font-bold">
              <span style={{ color: COL.an }}>CO₃²⁻</span> + <span style={{ color: COL.k }}>2</span><span style={{ color: COL.cat }}>H⁺</span> → H₂CO₃
            </div>
          </>
        ) : (
          <>
            <div className="font-bold text-teal">{r.look}</div>
            <div className="mt-1 text-sm text-white/85">{r.condition}</div>
            {r.kind === 'none' ? (
              <div className="mt-2 text-sm text-white/85">
                Все ионы остались свободными. Ни один ион не ушёл из раствора, поэтому <b>реакция не идёт</b>.
              </div>
            ) : (
              <div className="mt-2">
                {gas && (
                  <div className="mb-2 text-sm text-white/85">
                    Сначала образовалась H₂CO₃, затем она распалась: <b>H₂CO₃ → H₂O + <span style={{ color: COL.gas }}>CO₂↑</span></b>
                  </div>
                )}
                <div className="text-xs text-white/65">Сокращённое ионное уравнение:</div>
                <Eq left={shortItems(left)} right={shortItems(right)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ======================================================================= */
/* 3. Как записывать вещества: ионами или формулой                          */
/* ======================================================================= */

type Group = 'ions' | 'solid' | 'gas' | 'weak' | 'other'

const GROUPS: Record<Group, { title: string; color: string; verdict: string }> = {
  ions: { title: 'Расписываем на ионы', color: '#16a58c', verdict: 'записываем ионами' },
  solid: { title: 'Осадки (нерастворимые)', color: '#d9a21b', verdict: 'формула, осадок ↓' },
  gas: { title: 'Газы', color: '#2fb58f', verdict: 'формула, газ ↑' },
  weak: { title: 'Малодиссоциирующие', color: '#2aa6c9', verdict: 'формула, слабый электролит' },
  other: { title: 'Оксиды и простые вещества', color: '#9a8cff', verdict: 'формула, неэлектролит' },
}

interface Sub {
  mol: Seg[]
  group: Group
  ions?: { n: number; seg: Seg[] }[]
  mark?: '↓' | '↑'
  why: string
}
const c = (t: string): Seg[] => [[t, 'cat']]
const a = (t: string): Seg[] => [[t, 'an']]

const SUBS: Sub[] = [
  { mol: [['Na', 'cat'], ['Cl', 'an']], group: 'ions', ions: [{ n: 1, seg: c('Na⁺') }, { n: 1, seg: a('Cl⁻') }], why: 'Растворимая соль — сильный электролит: в растворе полностью распадается на ионы.' },
  { mol: [['Na', 'cat'], ['₂', 'k'], ['SO₄', 'an']], group: 'ions', ions: [{ n: 2, seg: c('Na⁺') }, { n: 1, seg: a('SO₄²⁻') }], why: 'Растворимая соль. Индекс 2 при натрии стал коэффициентом перед ионом Na⁺. Остаток SO₄ остаётся целым.' },
  { mol: [['Ca', 'cat'], ['(NO₃)', 'an'], ['₂', 'k']], group: 'ions', ions: [{ n: 1, seg: c('Ca²⁺') }, { n: 2, seg: a('NO₃⁻') }], why: 'Растворимая соль (все нитраты растворимы). Индекс 2 за скобкой стал коэффициентом перед NO₃⁻.' },
  { mol: [['H', 'cat'], ['Cl', 'an']], group: 'ions', ions: [{ n: 1, seg: c('H⁺') }, { n: 1, seg: a('Cl⁻') }], why: 'Сильная кислота: в растворе полностью распадается на ионы.' },
  { mol: [['H', 'cat'], ['₂', 'k'], ['SO₄', 'an']], group: 'ions', ions: [{ n: 2, seg: c('H⁺') }, { n: 1, seg: a('SO₄²⁻') }], why: 'Сильная кислота. Индекс 2 при водороде стал коэффициентом перед H⁺.' },
  { mol: [['Ba', 'cat'], ['(OH)', 'an'], ['₂', 'k']], group: 'ions', ions: [{ n: 1, seg: c('Ba²⁺') }, { n: 2, seg: a('OH⁻') }], why: 'Щёлочь — сильный электролит. Индекс 2 за скобкой стал коэффициентом перед OH⁻.' },
  { mol: [['K', 'cat'], ['OH', 'an']], group: 'ions', ions: [{ n: 1, seg: c('K⁺') }, { n: 1, seg: a('OH⁻') }], why: 'Щёлочь — сильный электролит: распадается на катион металла и гидроксид-ион.' },

  { mol: [['BaSO₄', 'solid']], group: 'solid', mark: '↓', why: 'Нерастворимая соль: ионов в растворе почти нет, поэтому пишем формулой и ставим ↓.' },
  { mol: [['AgCl', 'solid']], group: 'solid', mark: '↓', why: 'Нерастворимый хлорид серебра (белый творожистый осадок). Записываем формулой.' },
  { mol: [['CaCO₃', 'solid']], group: 'solid', mark: '↓', why: 'Нерастворимый карбонат. Формулой, ↓. (Все карбонаты, кроме солей Na, K и NH₄, нерастворимы.)' },
  { mol: [['Cu(OH)₂', 'solid']], group: 'solid', mark: '↓', why: 'Нерастворимое основание — слабый электролит. Пишем формулой, а выпадает оно или растворяется, показывает стрелка.' },
  { mol: [['H₂SiO₃', 'solid']], group: 'solid', mark: '↓', why: 'Кремниевая кислота нерастворима и слабая: пишем формулой, ↓.' },

  { mol: [['CO₂', 'gas']], group: 'gas', mark: '↑', why: 'Газ. Выходит из раствора, поэтому пишем формулой и ставим ↑.' },
  { mol: [['SO₂', 'gas']], group: 'gas', mark: '↑', why: 'Газ (выделяется из сульфитов под действием кислот). Формула и ↑.' },
  { mol: [['H₂S', 'gas']], group: 'gas', mark: '↑', why: 'Сероводород — газ и слабая кислота. Пишем формулой, ↑.' },
  { mol: [['NH₃', 'gas']], group: 'gas', mark: '↑', why: 'Аммиак — газ. Выделяется из солей аммония при действии щёлочи. Формула и ↑.' },

  { mol: [['H₂O', 'water']], group: 'weak', why: 'Вода — очень слабый электролит. Почти не распадается на ионы, пишем формулой.' },
  { mol: [['H₂CO₃', 'water']], group: 'weak', why: 'Угольная кислота слабая и неустойчивая: она сразу разлагается, поэтому пишут CO₂↑ + H₂O.' },
  { mol: [['H₂SO₃', 'water']], group: 'weak', why: 'Сернистая кислота слабая и неустойчивая: разлагается на SO₂↑ + H₂O.' },

  { mol: [['CuO', 'plain']], group: 'other', why: 'Оксид — неэлектролит. Всегда формулой (даже если вступает в реакцию с кислотой).' },
  { mol: [['Mg', 'plain']], group: 'other', why: 'Простое вещество — металл. Формулой, ионов в таком виде нет.' },
]

const subName = (s: Sub) => segsText(s.mol)

export function WritingDemo() {
  const [i, setI] = useState(0)
  const s = SUBS[i]
  const g = GROUPS[s.group]
  const hasIndex = s.mol.some(([, k]) => k === 'k') || s.mol.some(([t]) => t.includes('('))

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите вещество и посмотрите, как его записывают в ионном уравнении.</div>
      <div className="mt-3 grid gap-3">
        {(Object.keys(GROUPS) as Group[]).map((gr) => (
          <div key={gr}>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: GROUPS[gr].color }}>{GROUPS[gr].title}</div>
            <div className="flex flex-wrap gap-2">
              {SUBS.map((x, k) =>
                x.group !== gr ? null : (
                  <button
                    key={k}
                    onClick={() => setI(k)}
                    aria-pressed={k === i}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
                    style={k === i ? undefined : { boxShadow: `inset 0 -3px 0 ${GROUPS[gr].color}` }}
                  >
                    {subName(x)}
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid items-center gap-3 rounded-xl bg-white/10 p-4 sm:grid-cols-[1fr_auto_1.4fr]" key={i}>
        <div className="text-center">
          <div className="text-xs text-white/65">в молекулярном уравнении</div>
          <div className="mt-1 text-3xl font-extrabold"><Segs segs={s.mol.map(([t, k]) => [t, k === 'plain' ? 'plain' : k] as Seg)} /></div>
        </div>
        <div className="text-center text-3xl text-white/60">→</div>
        <div className="text-center">
          <div className="text-xs text-white/65">в ионном уравнении</div>
          {s.ions ? (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-3xl font-extrabold">
              {s.ions.map((ion, k) => (
                <Fragment key={k}>
                  {k > 0 && <span className="text-white/55">+</span>}
                  <span style={{ animation: `pop .45s ease-out ${k * 0.18}s both` }}>
                    {ion.n > 1 && <span style={{ color: COL.k }}>{ion.n}</span>}
                    <Segs segs={ion.seg} />
                  </span>
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="mt-1 flex justify-center" style={{ animation: 'pop .45s ease-out both' }}>
              <span className="rounded-xl border-2 px-4 py-1 text-3xl font-extrabold" style={{ borderColor: g.color }}>
                <Segs segs={s.mol} />
                {s.mark && <span style={{ color: s.mark === '↓' ? COL.solid : COL.gas }}>{s.mark}</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm" aria-live="polite">
        <b style={{ color: g.color }}>{g.verdict[0].toUpperCase() + g.verdict.slice(1)}.</b> {s.why}
        {s.ions && hasIndex && s.ions.some((x) => x.n > 1) && (
          <div className="mt-1 text-white/75">
            <span style={{ color: COL.k }}>Оранжевый индекс</span> показывает число ионов, он становится <span style={{ color: COL.k }}>коэффициентом</span> перед ионом.
          </div>
        )}
      </div>
      <Legend />
    </div>
  )
}

/* ======================================================================= */
/* 4. Три вида уравнений по шагам                                           */
/* ======================================================================= */

const BUILDER_IDS = ['baso4', 'co2', 'water', 'cuoh2', 'cuoh2-acid']

const STEP_TEXT = [
  'Шаг 1. Молекулярное уравнение: формулы веществ целиком. Коэффициенты должны быть расставлены.',
  'Шаг 2. Решаем, что записывать ионами, а что оставить формулой. Ионами пишем только растворимые сильные электролиты.',
  'Шаг 3. Полное ионное уравнение. Каждая «зелёная» формула распалась на ионы. Индекс стал коэффициентом, а коэффициент перед формулой умножил число ионов.',
  'Шаг 4. Ищем одинаковые ионы слева и справа. Они не участвуют в реакции, поэтому вычёркиваем их.',
  'Шаг 5. Сокращённое ионное уравнение: остались только частицы, которые реально реагируют. Проверяем число атомов и заряд.',
]

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/10 p-3" style={{ animation: 'fade-up .45s ease-out both' }}>
      <div className="text-xs font-bold uppercase tracking-wide text-white/60">{title}</div>
      {children}
    </div>
  )
}

export function BuilderDemo() {
  const [id, setId] = useState('baso4')
  const [step, setStep] = useState(0)
  const r = reactionById(id)
  const mol = { l: sideItems(r.left, 'L', false), r: sideItems(r.right, 'R', false) }
  const full = { l: sideItems(r.left, 'L', true), r: sideItems(r.right, 'R', true) }
  const short = { l: shortItems(full.l), r: shortItems(full.r) }
  const ql = sideCharge(short.l)
  const qr = sideCharge(short.r)
  const fmt = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Выберите реакцию и нажимайте «Дальше»: уравнение превратится из молекулярного в сокращённое ионное.</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {BUILDER_IDS.map((b) => (
          <button
            key={b}
            onClick={() => {
              setId(b)
              setStep(0)
            }}
            aria-pressed={b === id}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${b === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {reactionById(b).tab}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2" key={id}>
        <Row title="Молекулярное уравнение">
          <Eq left={mol.l} right={mol.r} />
        </Row>

        {step >= 1 && (
          <Row title="Что расписываем на ионы?">
            <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
              {[...r.left, ...r.right].map((t, k) => (
                <div key={k} className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5 text-sm">
                  <span className="min-w-[4.5rem] shrink-0 text-base font-bold">
                    {t.coef > 1 && <span style={{ color: COL.k }}>{t.coef}</span>}
                    <Segs segs={t.mol} />
                    {t.mark && <span style={{ color: t.mark === '↓' ? COL.solid : COL.gas }}>{t.mark}</span>}
                  </span>
                  <span className={t.ions ? 'text-[#7fe0c0]' : 'text-[#ffd966]'}>{t.why}</span>
                </div>
              ))}
            </div>
          </Row>
        )}

        {step >= 2 && (
          <Row title="Полное ионное уравнение">
            <Eq left={full.l} right={full.r} strike={step >= 3} />
          </Row>
        )}

        {step >= 4 && (
          <Row title="Сокращённое ионное уравнение">
            {r.kind === 'none' ? null : <Eq left={short.l} right={short.r} />}
            <div className="mt-1 text-sm text-white/80">
              Заряд слева: <b>{fmt(ql)}</b>, справа: <b>{fmt(qr)}</b> — {ql === qr ? 'сходится.' : 'не сходится, ищите ошибку.'} Атомов каждого элемента слева и справа поровну.
            </div>
          </Row>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, 4))}
          disabled={step === 4}
          className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110 disabled:opacity-40"
        >
          Дальше →
        </button>
        <button onClick={() => setStep(0)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
          ↺ Заново
        </button>
        <span className="text-xs text-white/60">шаг {step + 1} из 5</span>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm" aria-live="polite">
        {STEP_TEXT[step]}
      </div>
      <Legend />
    </div>
  )
}
