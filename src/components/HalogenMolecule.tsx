import { useState } from 'react'
import { HALOGENS, sub } from '../lib/halogens'

const SCALE = 0.5 // пм → пикселей
const W = 640
const H = 260
const MID = W / 2

/** Точки (электроны) вокруг атома: три пары и один неспаренный электрон, обращённый к соседу */
function Dots({ r, side, bonded }: { r: number; side: 1 | -1; bonded: boolean }) {
  // side = 1 — атом слева (неспаренный электрон справа), -1 — атом справа
  const pairs = [
    [0, -r, 'v'],
    [0, r, 'v'],
    [-side * r, 0, 'h'],
  ] as const
  return (
    <>
      {pairs.map(([x, y, o], k) => (
        <g key={k}>
          <circle cx={o === 'v' ? x - 6 : x} cy={o === 'h' ? y - 6 : y} r={4.2} fill="#16a58c" stroke="#fff" strokeWidth={1} />
          <circle cx={o === 'v' ? x + 6 : x} cy={o === 'h' ? y + 6 : y} r={4.2} fill="#16a58c" stroke="#fff" strokeWidth={1} />
        </g>
      ))}
      {/* неспаренный электрон: уходит в общую пару */}
      <circle
        cx={side * r}
        cy={bonded ? side * -5 : 0}
        r={5}
        fill="#ffd54a"
        stroke="#fff"
        strokeWidth={1.2}
        style={{ transition: 'cx .9s ease-in-out .6s, cy .9s ease-in-out .6s' }}
      />
    </>
  )
}

/** Образование молекулы Г₂: общая электронная пара, длина связи, ковалентная неполярная связь */
export default function HalogenMolecule() {
  const [i, setI] = useState(1)
  const [bonded, setBonded] = useState(false)
  const h = HALOGENS[i]
  const r = h.r * SCALE
  const apart = 150 + r * 2 // расстояние центров до сближения
  const dist = bonded ? h.bond * SCALE : apart

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {HALOGENS.map((x, k) => (
          <button
            key={x.sym}
            onClick={() => {
              setI(k)
              setBonded(false)
            }}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {sub(x.sym + '2')}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-3 block w-full rounded-xl bg-white/5" role="img" aria-label={`Образование молекулы ${sub(h.sym + '2')}: общая электронная пара, длина связи ${h.bond} пм`}>
        {[-1, 1].map((s) => (
          <g key={s} style={{ transform: `translate(${MID + (s * dist) / 2}px, 112px)`, transition: 'transform 1.4s ease-in-out' }}>
            <circle r={r} fill={h.fill} stroke={h.stroke} strokeWidth={2.5} fillOpacity={0.55} />
            <text textAnchor="middle" dy="0.35em" fontSize={r > 40 ? 22 : 18} fontWeight={800} fill="#fff" opacity={0.9}>
              {h.sym}
            </text>
            <Dots r={r + 0} side={s === -1 ? 1 : -1} bonded={bonded} />
          </g>
        ))}

        {/* общая пара: подсветка и чёрточка связи */}
        <ellipse
          cx={MID}
          cy={112}
          rx={14}
          ry={22}
          fill="none"
          stroke="#ffd54a"
          strokeWidth={2}
          strokeDasharray="4 4"
          style={{ opacity: bonded ? 1 : 0, transition: 'opacity .6s ease 1.4s' }}
        />
        <text x={MID} y={bonded ? 76 : 76} textAnchor="middle" fontSize={13} fontWeight={700} fill="#ffd54a" style={{ opacity: bonded ? 1 : 0 }}>
          общая пара
        </text>

        {/* линейка длины связи */}
        <g style={{ opacity: bonded ? 1 : 0 }}>
          <line x1={MID - (h.bond * SCALE) / 2} y1={205} x2={MID + (h.bond * SCALE) / 2} y2={205} stroke="#fff" strokeWidth={1.5} />
          <line x1={MID - (h.bond * SCALE) / 2} y1={199} x2={MID - (h.bond * SCALE) / 2} y2={211} stroke="#fff" strokeWidth={1.5} />
          <line x1={MID + (h.bond * SCALE) / 2} y1={199} x2={MID + (h.bond * SCALE) / 2} y2={211} stroke="#fff" strokeWidth={1.5} />
          <text x={MID} y={232} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
            длина связи {h.bond} пм
          </text>
        </g>
        {!bonded && (
          <text x={MID} y={232} textAnchor="middle" fontSize={13} fill="#fff" opacity={0.7}>
            у каждого атома — один неспаренный электрон (жёлтый)
          </text>
        )}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {!bonded ? (
          <button onClick={() => setBonded(true)} className="rounded-lg bg-orange px-4 py-2 font-bold text-navy transition hover:brightness-110">
            Сблизить атомы →
          </button>
        ) : (
          <button onClick={() => setBonded(false)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20">
            ↺ Разделить
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/10 px-3 py-4 text-center text-2xl font-bold sm:text-3xl" aria-live="polite">
        <span className="text-orange">{h.sym}</span>
        <span className="text-yellow-300">·</span> + <span className="text-yellow-300">·</span>
        <span className="text-orange">{h.sym}</span> → <span className="text-orange">{h.sym}</span>
        <span className="text-yellow-300">:</span>
        <span className="text-orange">{h.sym}</span> = <span className="text-teal">{h.sym}–{h.sym}</span>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Тип связи</div>
          <div className="font-bold">ковалентная неполярная</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Общих пар / валентность</div>
          <div className="font-bold">1 пара · валентность I</div>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2">
          <div className="text-xs text-white/60">Степень окисления</div>
          <div className="font-bold">0 (простое вещество)</div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">
        Каждый атом хочет получить восьмой электрон. Но два одинаковых атома <b>одинаково</b> сильно притягивают электроны, поэтому ни один не может отнять электрон у другого. Выход — <b>обобществить</b> по одному электрону: образуется общая пара, которая принадлежит обоим атомам. Так как электроотрицательность одинакова, пара лежит <b>ровно посередине</b> — связь неполярная.
      </p>
      <p className="mt-2 text-xs text-white/60">Зелёные точки — неподелённые пары (по три у каждого атома), жёлтые — неспаренные электроны. Размеры атомов и длина связи показаны в одном масштабе.</p>
    </div>
  )
}
