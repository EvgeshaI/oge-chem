import { useState } from 'react'
import { BURN_COMPLEX, BURN_SIMPLE } from '../lib/chalcogens'
import { tex } from './RichText'

type Mode = 'simple' | 'complex'

const ELEMENT_COLOR: Record<string, string> = {
  C: '#3a4056',
  H: '#ffffff',
  S: '#f7d94c',
  N: '#7fb2ff',
  Zn: '#cdd5e8',
  Fe: '#e8924f',
}

/** Горение в кислороде: простые вещества (опыты) и сложные вещества (правило «каждый элемент → оксид») */
export default function OxygenBurning() {
  const [mode, setMode] = useState<Mode>('simple')
  const [id, setId] = useState(BURN_SIMPLE[0].id)
  const [cid, setCid] = useState(BURN_COMPLEX[0].id)
  const b = BURN_SIMPLE.find((x) => x.id === id)!
  const cx = BURN_COMPLEX.find((x) => x.id === cid)!

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {([
          ['simple', 'Простые вещества в кислороде'],
          ['complex', 'Сложные вещества: что получится?'],
        ] as const).map(([m, label]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${mode === m ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'simple' ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BURN_SIMPLE.map((x) => (
              <button key={x.id} onClick={() => setId(x.id)} aria-pressed={x.id === id} className={`min-w-11 rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === id ? 'bg-white text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid items-start gap-3 md:grid-cols-[260px_minmax(0,1fr)]">
            <Jar key={b.id} burn={b} />
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${b.eq}}`, true) }} />
              <p className="rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: rich(b.sight) }} />
              <p className="rounded-xl bg-teal/25 p-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: rich(b.rule) }} />
              {b.trap && <p className="rounded-xl bg-orange/25 p-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: '<b>Ловушка ОГЭ.</b> ' + rich(b.trap) }} />}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-white/75">
            Сгорая, сложное вещество превращается в <b>оксиды элементов</b>, из которых оно состоит: <b>C → CO₂, H → H₂O, S → SO₂, металл → оксид</b>. Исключение — азот: он выделяется в виде <b>N₂</b>.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BURN_COMPLEX.map((x) => (
              <button key={x.id} onClick={() => setCid(x.id)} aria-pressed={x.id === cid} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === cid ? 'bg-white text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
                {x.label}
              </button>
            ))}
          </div>
          <div key={cx.id} className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" style={{ animation: 'fade-up .4s ease-out both' }}>
            {cx.parts.map(([el, prod], k) => (
              <div key={el} className="flex items-center gap-3 rounded-xl bg-white/10 p-3" style={{ animation: `fade-up .4s ease-out ${0.15 + k * 0.25}s both` }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold" style={{ background: ELEMENT_COLOR[el] ?? '#cdd5e8', color: el === 'C' ? '#fff' : '#1b2445' }}>
                  {el}
                </span>
                <span className="text-2xl text-orange">→</span>
                <span className="text-2xl font-extrabold">{prod}</span>
                {prod === el && <span className="text-xs text-white/70">простое вещество</span>}
                {prod === 'N₂' && <span className="text-xs text-white/70">исключение</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl bg-white/10 px-2 py-3 text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(`\\ce{${cx.eq}}`, true) }} />
          <p className="mt-2 rounded-xl bg-teal/25 p-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: rich(cx.note) }} />
        </>
      )}
    </div>
  )
}

/** Банка с кислородом и ложечка для сжигания */
function Jar({ burn }: { burn: (typeof BURN_SIMPLE)[number] }) {
  const heatOnly = burn.flame === null
  const ix = 130
  const iy = 168 // где горит вещество
  return (
    <svg viewBox="0 0 260 280" className="w-full rounded-xl bg-white/5" role="img" aria-label={`Горение: ${burn.label}`}>
      {heatOnly ? (
        <g>
          {/* медная пластинка над пламенем горелки */}
          <rect x={70} y={120} width={120} height={10} rx={2} fill="#e8924f" />
          <rect x={70} y={120} width={120} height={10} rx={2} fill={burn.residue} style={{ animation: 'fade-up 2.4s ease-out .4s both' }} />
          <rect x={185} y={122} width={60} height={6} rx={2} fill="#a07a4a" />
          <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
            <path d="M 130 210 C 104 188 116 160 130 140 C 144 160 156 188 130 210 Z" fill="#5b8cff" opacity={0.85} />
            <path d="M 130 210 C 120 198 124 182 130 172 C 136 182 140 198 130 210 Z" fill="#bcd2ff" />
          </g>
          <rect x={116} y={210} width={28} height={50} rx={3} fill="#9aa3b8" />
          <text x={130} y={110} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.85}>медь чернеет: CuO</text>
          <text x={130} y={274} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.7}>нагревание на воздухе</text>
        </g>
      ) : (
        <g>
          {/* банка с кислородом */}
          <path d="M 60 70 V 250 Q 60 262 72 262 H 188 Q 200 262 200 250 V 70" fill="rgba(156,194,255,.12)" stroke="#fff" strokeWidth={2.4} />
          <rect x={64} y={240} width={132} height={18} rx={4} fill="#8fc4ff" opacity={0.35} />
          <text x={186} y={92} textAnchor="end" fontSize={12} fontWeight={700} fill="#9cc2ff">
            O₂
          </text>
          {/* крышка и ложечка */}
          <rect x={52} y={58} width={156} height={10} rx={3} fill="#c9a06a" />
          {burn.id === 'fe' ? (
            <path d="M 130 40 V 120 C 140 128 120 136 130 144 C 140 152 120 160 130 168" stroke="#bfc6d6" strokeWidth={3} fill="none" />
          ) : burn.id === 'h2' ? (
            <path d="M 130 30 V 160" stroke="#fff" strokeWidth={6} strokeOpacity={0.8} />
          ) : (
            <>
              <path d="M 130 30 V 168" stroke="#bfc6d6" strokeWidth={3} />
              <path d="M 116 168 Q 130 184 144 168 Z" fill="#bfc6d6" />
            </>
          )}
          {burn.residue && burn.id !== 'fe' && <ellipse cx={ix} cy={iy + 4} rx={11} ry={4} fill={burn.residue} />}
          {/* дым */}
          {burn.smoke &&
            Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={ix - 16 + i * 6} cy={iy - 40} r={10 + (i % 3) * 3} fill={burn.smoke} opacity={0} style={{ animation: `rise ${2.2 + i * 0.3}s linear ${i * 0.35}s infinite` }} />
            ))}
          {/* пламя */}
          <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .45s ease-in-out infinite' }}>
            <circle cx={ix} cy={iy - 14} r={30} fill={burn.flame!} opacity={0.18} />
            <path d={`M ${ix} ${iy} C ${ix - 22} ${iy - 16} ${ix - 10} ${iy - 40} ${ix} ${iy - 56} C ${ix + 10} ${iy - 40} ${ix + 22} ${iy - 16} ${ix} ${iy} Z`} fill={burn.flame!} opacity={0.9} />
            <path d={`M ${ix} ${iy} C ${ix - 9} ${iy - 8} ${ix - 4} ${iy - 22} ${ix} ${iy - 30} C ${ix + 4} ${iy - 22} ${ix + 9} ${iy - 8} ${ix} ${iy} Z`} fill="#fff" opacity={0.8} />
          </g>
          {/* искры железа */}
          {burn.id === 'fe' &&
            Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2
              return (
                <circle
                  key={i}
                  cx={ix}
                  cy={iy - 10}
                  r={2.4}
                  fill="#ffd27a"
                  style={{ ['--dx' as string]: `${Math.cos(a) * 55}px`, ['--dy' as string]: `${Math.sin(a) * 45 + 20}px`, animation: `spark ${0.7 + (i % 3) * 0.2}s ease-out ${i * 0.08}s infinite` }}
                />
              )
            })}
          {burn.id === 'fe' && (
            <g>
              <circle cx={118} cy={246} r={4} fill="#3b3b44" />
              <circle cx={140} cy={248} r={3} fill="#3b3b44" />
              <text x={130} y={276} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.75}>капли окалины Fe₃O₄</text>
            </g>
          )}
          {burn.id === 'h2' && (
            <text x={130} y={276} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.75}>
              капли воды на стенках
            </text>
          )}
        </g>
      )}
    </svg>
  )
}

function rich(text: string) {
  return text.replace(/\$([^$]+)\$/g, (_, f: string) => tex(f)).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}
