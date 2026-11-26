import { useState } from 'react'
import { BURN_CASES, type BurnCase } from '../lib/carbonSilicon'
import { tex } from './RichText'

const LOOK = {
  C: { fill: '#3a4056', text: '#ffffff' },
  O: { fill: '#ff8a8a', text: '#4a0f14' },
}

function Atom({ x, y, el, r = 15 }: { x: number; y: number; el: keyof typeof LOOK; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={LOOK[el].fill} stroke="#fff" strokeWidth={1.4} />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={LOOK[el].text}>
        {el}
      </text>
    </g>
  )
}

/** Молекула CO₂ (O=C=O) или CO (C≡O) */
function Molecule({ x, y, co2 }: { x: number; y: number; co2: boolean }) {
  const bonds = (x1: number, x2: number, n: number) =>
    Array.from({ length: n }, (_, k) => <line key={`${x1}-${k}`} x1={x1} y1={y + (k - (n - 1) / 2) * 6} x2={x2} y2={y + (k - (n - 1) / 2) * 6} stroke="#ffd54a" strokeWidth={2.4} />)
  return co2 ? (
    <g>
      {bonds(x - 30, x, 2)}
      {bonds(x, x + 30, 2)}
      <Atom x={x - 30} y={y} el="O" r={13} />
      <Atom x={x + 30} y={y} el="O" r={13} />
      <Atom x={x} y={y} el="C" />
    </g>
  ) : (
    <g>
      {bonds(x - 15, x + 15, 3)}
      <Atom x={x - 15} y={y} el="C" />
      <Atom x={x + 15} y={y} el="O" r={13} />
    </g>
  )
}

function Before({ c }: { c: BurnCase }) {
  const cs = Array.from({ length: c.atomsC }, (_, k) => k)
  return (
    <g>
      {cs.map((k) => (
        <Atom key={`c${k}`} x={60} y={125 + (k - (c.atomsC - 1) / 2) * 46} el="C" r={17} />
      ))}
      <text x={108} y={130} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" opacity={0.8}>
        +
      </text>
      {c.oxidizer.formula === 'O₂' ? (
        <g>
          <line x1={150} y1={119} x2={180} y2={119} stroke="#ffd54a" strokeWidth={2.4} />
          <line x1={150} y1={131} x2={180} y2={131} stroke="#ffd54a" strokeWidth={2.4} />
          <Atom x={150} y={125} el="O" r={14} />
          <Atom x={180} y={125} el="O" r={14} />
        </g>
      ) : (
        <Molecule x={168} y={125} co2 />
      )}
    </g>
  )
}

/** Горение углерода: много кислорода — CO₂, мало — CO; CO₂ над раскалённым углём — тоже CO */
export default function CarbonBurning() {
  const [id, setId] = useState<BurnCase['id']>('excess')
  const c = BURN_CASES.find((x) => x.id === id)!
  const co2 = c.product === 'CO₂'
  const mols = Array.from({ length: c.molecules }, (_, k) => k)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Условия">
        {BURN_CASES.map((x) => (
          <button key={x.id} role="radio" aria-checked={x.id === id} onClick={() => setId(x.id)} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {x.label}
          </button>
        ))}
      </div>

      <svg key={id} viewBox="0 0 560 240" className="mt-3 w-full rounded-xl bg-white/5" role="img" aria-label={`${c.eq.replace(/->\[t\]|->/, '→')}: получается ${c.product}`}>
        <text x={120} y={26} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.7}>
          было
        </text>
        <Before c={c} />
        {/* пламя / раскалённый уголь */}
        <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .6s ease-in-out infinite' }}>
          <path d="M 270 200 C 248 180 256 156 270 140 C 284 156 292 180 270 200 Z" fill={id === 'lack' ? '#ff9a3d' : '#ffb347'} />
          <path d="M 270 200 C 260 188 264 174 270 166 C 276 174 280 188 270 200 Z" fill={id === 'co2' ? '#ff6b3d' : '#ffe08a'} />
        </g>
        <path d="M 236 112 H 300" stroke="#f5a623" strokeWidth={3} />
        <path d="M 292 104 L 302 112 L 292 120" stroke="#f5a623" strokeWidth={3} fill="none" />
        <text x={270} y={226} textAnchor="middle" fontSize={11.5} fill="#fff" opacity={0.7}>
          {id === 'co2' ? 't ≈ 1000 °C' : 'поджигание'}
        </text>
        <text x={440} y={26} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.7}>
          стало
        </text>
        {mols.map((k) => (
          <g key={k} style={{ animation: `pop .5s ease-out ${0.2 + k * 0.15}s both`, transformBox: 'fill-box', transformOrigin: 'center' }}>
            <Molecule x={440} y={112 + (k - (c.molecules - 1) / 2) * 54} co2={co2} />
          </g>
        ))}
        <text x={440} y={196} textAnchor="middle" fontSize={15} fontWeight={800} fill={co2 ? '#6ee7c4' : '#ffb15c'}>
          {c.molecules > 1 ? `${c.molecules} ` : ''}
          {c.product}
        </text>
        <text x={440} y={216} textAnchor="middle" fontSize={11.5} fill="#fff" opacity={0.75}>
          {c.name}
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${c.eq}}`, true) }} />
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Степень окисления углерода</div>
          <div className="text-lg font-bold">{id === 'co2' ? '0 и +4 → +2' : `0 → ${c.cOx}`}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Атом C (уголь) отдаёт</div>
          <div className="text-lg font-bold">{c.cOx === '+4' ? '4 электрона' : '2 электрона'}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Роль угля</div>
          <div className="text-lg font-bold">восстановитель</div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90" aria-live="polite">
        {id === 'excess' && (
          <>
            Кислорода <b>много</b> — он забирает у углерода все <b>4</b> внешних электрона. Получается <b>углекислый газ</b> CO₂ — продукт полного сгорания угля, дров, бензина.
          </>
        )}
        {id === 'lack' && (
          <>
            Кислорода <b>мало</b> — его хватает, только чтобы забрать <b>2</b> электрона. Получается <b>угарный газ</b> CO — без цвета и запаха и <b>очень ядовит</b>. Поэтому опасно рано закрывать заслонку печи.
          </>
        )}
        {id === 'co2' && (
          <>
            Углекислый газ проходит над <b>раскалённым углём</b>: углерод угля отдаёт 2 электрона (0 → +2), а углерод из CO₂ принимает 2 (+4 → +2). Оба становятся +2 — получается <b>угарный газ</b>. Так в печи сначала образуется CO₂, а в верхнем слое угля — CO.
          </>
        )}
      </p>
    </div>
  )
}
