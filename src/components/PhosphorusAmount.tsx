import { useState } from 'react'
import { AMOUNT_CASES } from '../lib/pnictogens'
import { tex } from './RichText'

const LOOK = {
  P: { fill: '#f4b183', text: '#4a2108' },
  O: { fill: '#ff8a8a', text: '#4a0f14' },
  Cl: { fill: '#cfe56a', text: '#2d3a05' },
}

function Atom({ x, y, el, r = 13 }: { x: number; y: number; el: keyof typeof LOOK; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={LOOK[el].fill} stroke="#fff" strokeWidth={1.3} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={el === 'Cl' ? 10 : 11.5} fontWeight={800} fill={LOOK[el].text}>
        {el}
      </text>
    </g>
  )
}

/** Молекула-продукт: атомы фосфора в центре, атомы окислителя — вокруг */
function Product({ cx, cy, ox, n }: { cx: number; cy: number; ox: 'O' | 'Cl'; n: number }) {
  const ps = ox === 'Cl' ? [{ x: cx, y: cy }] : [{ x: cx - 15, y: cy }, { x: cx + 15, y: cy }]
  const R = ox === 'Cl' ? 34 : 38
  const around = Array.from({ length: n }, (_, k) => {
    const a = -Math.PI / 2 + (2 * Math.PI * k) / n
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  })
  return (
    <g>
      {around.map((p, k) => (
        <line key={k} x1={ps[k % ps.length].x} y1={ps[k % ps.length].y} x2={p.x} y2={p.y} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
      ))}
      {around.map((p, k) => (
        <Atom key={k} x={p.x} y={p.y} el={ox} r={ox === 'Cl' ? 13 : 11} />
      ))}
      {ps.map((p, k) => (
        <Atom key={`p${k}`} x={p.x} y={p.y} el="P" r={14} />
      ))}
    </g>
  )
}

/** Фосфор + O₂ или Cl₂: избыток или недостаток окислителя определяет продукт (+3 или +5) */
export default function PhosphorusAmount() {
  const [ox, setOx] = useState<'O2' | 'Cl2'>('O2')
  const [lack, setLack] = useState(true)
  const c = AMOUNT_CASES.find((x) => x.ox === ox && x.lack === lack)!
  const el = ox === 'O2' ? 'O' : 'Cl'
  const nAround = ox === 'O2' ? (lack ? 3 : 5) : lack ? 3 : 5
  const pRows = Array.from({ length: c.atomsP }, (_, k) => k)
  const molRows = Array.from({ length: c.molecules }, (_, k) => k)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/70">Окислитель:</span>
        {(['O2', 'Cl2'] as const).map((o) => (
          <button key={o} onClick={() => setOx(o)} aria-pressed={o === ox} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${o === ox ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {o === 'O2' ? 'кислород O₂' : 'хлор Cl₂'}
          </button>
        ))}
        <span className="ml-2 text-sm text-white/70">Количество:</span>
        <div className="inline-flex overflow-hidden rounded-md bg-white/10" role="radiogroup">
          {[true, false].map((l) => (
            <button key={String(l)} role="radio" aria-checked={l === lack} onClick={() => setLack(l)} className={`px-3 py-1.5 text-sm font-semibold transition ${l === lack ? 'bg-[#6ee7c4] text-navy' : 'hover:bg-white/20'}`}>
              {l ? 'мало (недостаток)' : 'много (избыток)'}
            </button>
          ))}
        </div>
      </div>

      <svg key={`${ox}${lack}`} viewBox="0 0 560 250" className="mt-3 w-full rounded-xl bg-white/5" role="img" aria-label={`${c.atomsP} атома фосфора и ${c.molecules} молекул ${ox === 'O2' ? 'кислорода' : 'хлора'} дают ${c.product}`}>
        <text x={130} y={24} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.7}>
          было
        </text>
        {pRows.map((k) => (
          <Atom key={`p${k}`} x={44} y={125 + (k - (c.atomsP - 1) / 2) * 40} el="P" r={15} />
        ))}
        {molRows.map((k) => {
          const col = k % 2
          const row = Math.floor(k / 2)
          const rows = Math.ceil(c.molecules / 2)
          const x = 120 + col * 80
          const y = 125 + (row - (rows - 1) / 2) * 48
          return (
            <g key={`m${k}`} style={{ animation: `fade-up .4s ease-out ${k * 0.08}s both` }}>
              <Atom x={x} y={y} el={el} />
              <Atom x={x + 26} y={y} el={el} />
            </g>
          )
        })}
        <path d="M 250 125 H 300" stroke="#f5a623" strokeWidth={3} />
        <path d="M 292 117 L 302 125 L 292 133" stroke="#f5a623" strokeWidth={3} fill="none" />
        <text x={420} y={24} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.7}>
          стало
        </text>
        {[365, 475].map((x, k) => (
          <g key={x} style={{ animation: `pop .5s ease-out ${0.3 + k * 0.15}s both`, transformBox: 'fill-box', transformOrigin: 'center' }}>
            <Product cx={x} cy={118} ox={el} n={nAround} />
          </g>
        ))}
        <text x={420} y={200} textAnchor="middle" fontSize={15} fontWeight={800} fill="#6ee7c4">
          2 {c.product}
        </text>
        <text x={420} y={222} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.7}>
          {c.name}
        </text>
        <text x={130} y={236} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.75}>
          {c.atomsP} P + {c.molecules} {ox === 'O2' ? 'O₂' : 'Cl₂'}
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${c.eq}}`, true) }} />
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Степень окисления фосфора</div>
          <div className="text-lg font-bold">0 → {c.pOx}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Каждый атом P отдаёт</div>
          <div className="text-lg font-bold">{c.pOx === '+3' ? '3' : '5'} электронов</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Роль фосфора</div>
          <div className="text-lg font-bold">восстановитель</div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
        {lack ? (
          <>
            Окислителя <b>мало</b> — его хватает, только чтобы забрать у каждого атома фосфора <b>3</b> неспаренных электрона. Получается соединение фосфора(<b>III</b>): {c.product}.
          </>
        ) : (
          <>
            Окислителя <b>много</b> — у фосфора забираются все <b>5</b> внешних электронов (пара 3s распаривается). Получается соединение фосфора(<b>V</b>): {c.product} — высшая степень окисления.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-white/60">Рисунок молекул условный: показано только, сколько атомов {ox === 'O2' ? 'кислорода' : 'хлора'} приходится на фосфор.</p>
    </div>
  )
}
