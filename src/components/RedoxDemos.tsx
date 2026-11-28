import { useState } from 'react'
import {
  BALANCE_CASES,
  COMPLEX_CASES,
  SCALE_ELEMENTS,
  SCALE_MAX,
  SCALE_MIN,
  SHIFT_ELEMENTS,
  TRANSFERS,
  chargeText,
  coText,
  complexCe,
  complexSo,
  lcm,
  roleOf,
  sideAtoms,
  type Role,
} from '../lib/redox'
import { tex } from './RichText'

/* Цвета: восстановитель (отдаёт ē) — оранжевый, окислитель (принимает ē) — голубой, «и то и другое» — сиреневый */
const RED = '#f5a623'
const OX = '#5aa9ff'
const BOTH = '#b79bff'
const ROLE_COLOR: Record<Role, string> = { red: RED, ox: OX, both: BOTH }
const ROLE_TITLE: Record<Role, string> = {
  red: 'только восстановитель',
  ox: 'только окислитель',
  both: 'и окислитель, и восстановитель',
}
const GOLD = '#ffd966'

function T({ s }: { s: string }) {
  return <span dangerouslySetInnerHTML={{ __html: tex(s) }} />
}

/** Уравнение mhchem, где коэффициенты-множители выделены жёлтым */
function hlCe(ce: string): string {
  return ce
    .split(/(\s\+\s|\s->\s)/)
    .map((p) => {
      if (p.trim() === '+') return ' + '
      if (p.trim() === '->') return '\\;\\ce{->}\\;'
      const m = p.match(/^(\d+)(.*)$/)
      return m ? `\\textcolor{${GOLD}}{\\mathbf{${m[1]}}}\\,\\ce{${m[2]}}` : `\\ce{${p}}`
    })
    .join('')
}

const chip = (on: boolean) =>
  `rounded-md px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`
const btn = 'rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-40'

/* ================================================================== 1. Передача электронов */

export function TransferDemo() {
  const [i, setI] = useState(0)
  const [done, setDone] = useState(false)
  const t = TRANSFERS[i]
  const n = t.n
  // координаты: слева восстановитель, справа окислитель
  const L = { x: 120, y: 125 }
  const R = { x: 520, y: 125 }
  const RAD = 62
  const angles = n === 1 ? [0] : n === 2 ? [-24, 24] : [-42, 0, 42]
  const rad = (d: number) => (d * Math.PI) / 180
  const start = angles.map((a) => ({ x: L.x + RAD * Math.cos(rad(a)), y: L.y + RAD * Math.sin(rad(a)) }))
  const slot = angles.map((a) => ({ x: R.x - RAD * Math.cos(rad(a)), y: R.y + RAD * Math.sin(rad(a)) }))

  const pick = (k: number) => {
    setI(k)
    setDone(false)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/75">Реакция:</span>
        {TRANSFERS.map((x, k) => (
          <button key={k} onClick={() => pick(k)} aria-pressed={k === i} className={chip(k === i)}>
            {x.red.sym} + {x.ox.sym}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 640 250" className="mt-3 w-full" role="img" aria-label="Передача электронов от восстановителя к окислителю">
        {/* атомы */}
        {[
          { c: L, color: RED, sym: t.red.sym, co: done ? n : 0, ch: done ? n : 0, title: 'восстановитель' },
          { c: R, color: OX, sym: t.ox.sym, co: done ? -n : 0, ch: done ? -n : 0, title: 'окислитель' },
        ].map((a, k) => (
          <g key={k}>
            <circle cx={a.c.x} cy={a.c.y} r={RAD} fill={a.color} fillOpacity={0.18} stroke={a.color} strokeWidth={3} style={{ transition: 'fill-opacity .8s' }} />
            <text x={a.c.x} y={a.c.y + 12} textAnchor="middle" fontSize={36} fontWeight={800} fill="#fff">
              {chargeText(a.sym, a.ch)}
            </text>
            <g transform={`translate(${a.c.x},${a.c.y - RAD - 26})`}>
              <rect x={-52} y={-16} width={104} height={28} rx={14} fill="#fff" fillOpacity={0.12} />
              <text x={0} y={4} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
                СО {coText(a.co)}
              </text>
            </g>
          </g>
        ))}

        {/* свободные места на внешнем слое окислителя */}
        {slot.map((p, k) => (
          <circle key={k} cx={p.x} cy={p.y} r={10} fill="none" stroke={OX} strokeDasharray="4 3" strokeWidth={2} opacity={done ? 0 : 0.9} style={{ transition: 'opacity .4s' }} />
        ))}

        {/* электроны */}
        {start.map((p, k) => (
          <g
            key={k}
            style={{
              transform: done ? `translate(${slot[k].x - p.x}px, ${slot[k].y - p.y}px)` : 'translate(0px,0px)',
              transition: done ? `transform 1.3s ease-in-out ${k * 0.3}s` : 'transform .3s',
            }}
          >
            <circle cx={p.x} cy={p.y} r={10} fill={GOLD} stroke="#fff" strokeWidth={2} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1b2445">
              ē
            </text>
          </g>
        ))}

        <text x={320} y={118} textAnchor="middle" fontSize={34} fill="#fff" fillOpacity={0.5}>
          →
        </text>
        <text x={320} y={146} textAnchor="middle" fontSize={14} fill="#fff" fillOpacity={0.7}>
          {n} ē
        </text>

        <text x={L.x} y={225} textAnchor="middle" fontSize={15} fill={RED} fontWeight={700} opacity={done ? 1 : 0.35} style={{ transition: 'opacity .6s' }}>
          восстановитель
        </text>
        <text x={R.x} y={225} textAnchor="middle" fontSize={15} fill={OX} fontWeight={700} opacity={done ? 1 : 0.35} style={{ transition: 'opacity .6s' }}>
          окислитель
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={() => setDone(true)} disabled={done} className={`${btn} bg-orange text-navy`}>
          ▶ Передать электрон{n > 1 ? 'ы' : ''}
        </button>
        <button onClick={() => setDone(false)} disabled={!done} className={`${btn} bg-white/10 hover:bg-white/20`}>
          ↺ Заново
        </button>
      </div>

      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2" aria-live="polite">
        <div className="rounded-xl bg-white/10 p-3" style={{ borderLeft: `4px solid ${RED}` }}>
          <b style={{ color: RED }}>{t.red.sym} — восстановитель.</b>{' '}
          {done ? (
            <>
              Отдал {n} ē → стал {chargeText(t.red.sym, n)}. Степень окисления <b>выросла: 0 → {coText(n)}</b>. Атом <b>окислился</b>.
            </>
          ) : (
            <>На внешнем слое мало электронов ({t.red.name} легко их отдаёт).</>
          )}
        </div>
        <div className="rounded-xl bg-white/10 p-3" style={{ borderLeft: `4px solid ${OX}` }}>
          <b style={{ color: OX }}>{t.ox.sym} — окислитель.</b>{' '}
          {done ? (
            <>
              Принял {n} ē → стал {chargeText(t.ox.sym, -n)}. Степень окисления <b>уменьшилась: 0 → {coText(-n)}</b>. Атом <b>восстановился</b>.
            </>
          ) : (
            <>До завершённого слоя не хватает {n} ē ({t.ox.name} стремится их принять).</>
          )}
        </div>
      </div>
      {done && (
        <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-white/90">
          Противоположно заряженные частицы притягиваются и образуют вещество <b>{t.product}</b>. Сколько электронов отдал восстановитель — столько же принял окислитель.
        </p>
      )}
    </div>
  )
}

/* ================================================================== 2. Сдвиг степени окисления */

type Last = { kind: 'give' | 'take'; from: number; n: number } | null

export function ShiftDemo() {
  const [k, setK] = useState(5)
  const [co, setCo] = useState(0)
  const [last, setLast] = useState<Last>(null)
  const [tick, setTick] = useState(0)
  const el = SHIFT_ELEMENTS[k]
  const electrons = el.z - co
  const outer = el.group - co
  const pos = (v: number) => ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100

  const choose = (idx: number) => {
    setK(idx)
    setCo(0)
    setLast(null)
  }
  // можно переходить только между реальными степенями окисления элемента
  const up = el.states.find((v) => v > co)
  const down = [...el.states].reverse().find((v) => v < co)
  const give = () => {
    if (up === undefined) return
    setLast({ kind: 'give', from: co, n: up - co })
    setCo(up)
    setTick((x) => x + 1)
  }
  const take = () => {
    if (down === undefined) return
    setLast({ kind: 'take', from: co, n: co - down })
    setCo(down)
    setTick((x) => x + 1)
  }
  const ein = (n: number) => (n === 1 ? '1 ē' : `${n} ē`)
  const reset = () => {
    setCo(0)
    setLast(null)
  }

  const ticks = Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i)

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/75">Элемент:</span>
        {SHIFT_ELEMENTS.map((x, i) => (
          <button key={x.sym} onClick={() => choose(i)} aria-pressed={i === k} className={chip(i === k)}>
            {x.sym}
          </button>
        ))}
      </div>

      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[auto_1fr]">
        {/* частица */}
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-white/30 bg-white/10">
          <div className="text-center">
            <div className="text-4xl font-extrabold">{el.sym}</div>
            <div className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-sm font-bold">СО {coText(co)}</div>
          </div>
          {last &&
            Array.from({ length: last.n }, (_, d) => (
              <span
                key={`${tick}-${d}`}
                className="absolute flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-extrabold text-navy"
                style={{
                  background: GOLD,
                  animation: `${last.kind === 'give' ? 'electron-out' : 'electron-in'} .9s ease-in-out ${d * 0.15}s both`,
                  left: last.kind === 'give' ? '88%' : '12%',
                  top: `${14 + d * 9}%`,
                }}
              >
                ē
              </span>
            ))}
        </div>

        <div className="space-y-2 text-sm">
          <div className="rounded-xl bg-white/10 p-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                протоны <b>p⁺</b> в ядре: <b className="text-lg">+{el.z}</b>
              </span>
              <span>
                электроны <b>ē</b>: <b className="text-lg">−{electrons}</b>
              </span>
            </div>
            <div className="mt-1 text-white/90">
              Заряд = +{el.z} − {electrons} = <b className="text-lg" style={{ color: GOLD }}>{coText(co)}</b>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <div className="mb-1 text-white/80">Внешний слой{outer <= 0 ? ' (электроны внешнего слоя закончились)' : ''}:</div>
            <div className="flex flex-wrap gap-1.5" aria-label={`на внешнем слое ${Math.max(outer, 0)} электронов`}>
              {Array.from({ length: 8 }, (_, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-all duration-500"
                  style={
                    i < outer
                      ? { background: GOLD, borderColor: '#fff', color: '#1b2445' }
                      : { borderColor: 'rgba(255,255,255,.3)', borderStyle: 'dashed', color: 'transparent' }
                  }
                >
                  ē
                </span>
              ))}
            </div>
            <div className="mt-1 text-white/75">
              {outer >= 8 ? 'слой заполнен — 8 ē' : outer <= 0 ? 'отдавать больше нечего' : `${outer} ē`}
            </div>
          </div>
        </div>
      </div>

      {/* шкала */}
      <div className="mt-5 overflow-x-auto">
        <div className="relative mx-3 h-24 min-w-[520px]">
          <div className="absolute left-0 right-0 top-9 h-2 rounded bg-white/15" />
          {/* недоступные области */}
          <div className="absolute top-9 h-2 rounded-l bg-black/40" style={{ left: 0, width: `${pos(el.min)}%` }} />
          <div className="absolute top-9 h-2 rounded-r bg-black/40" style={{ left: `${pos(el.max)}%`, right: 0 }} />
          {ticks.map((v) => (
            <div key={v} className="absolute top-6" style={{ left: `${pos(v)}%`, transform: 'translateX(-50%)' }}>
              <div className={`mx-auto h-5 w-0.5 ${el.states.includes(v) ? 'bg-white' : 'bg-white/15'}`} />
              <div className={`mt-1 text-center text-xs font-semibold ${el.states.includes(v) ? 'text-white' : 'text-white/25'}`}>{coText(v)}</div>
            </div>
          ))}
          {/* маркер */}
          <div
            className="absolute top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-sm font-extrabold text-navy"
            style={{ left: `${pos(co)}%`, transform: 'translateX(-50%)', background: GOLD, transition: 'left .7s cubic-bezier(.4,1.4,.5,1)' }}
          >
            {el.sym}
          </div>
          <div className="absolute left-0 top-16 text-xs font-bold" style={{ color: OX }}>
            ◀ принимает ē: СО уменьшается
          </div>
          <div className="absolute right-0 top-16 text-xs font-bold" style={{ color: RED }}>
            отдаёт ē: СО растёт ▶
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={take} disabled={down === undefined} className={`${btn}`} style={{ background: OX, color: '#1b2445' }}>
          ◀ Принять{down !== undefined ? ` ${ein(co - down)}` : ''}
        </button>
        <button onClick={give} disabled={up === undefined} className={`${btn}`} style={{ background: RED, color: '#1b2445' }}>
          Отдать{up !== undefined ? ` ${ein(up - co)}` : ''} ▶
        </button>
        <button onClick={reset} disabled={co === 0} className={`${btn} bg-white/10 hover:bg-white/20`}>
          ↺ К нулю
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm" aria-live="polite">
        {!last && (
          <>
            Сейчас у атома столько же электронов, сколько протонов: <b>СО 0</b>. Электрон заряжен <b>отрицательно (−)</b>. Нажимайте «Отдать» или «Принять»: атом переходит к следующей реально существующей степени окисления (отмечены яркими делениями шкалы), поэтому электронов может уходить сразу несколько.
          </>
        )}
        {last?.kind === 'give' && (
          <>
            <b style={{ color: RED }}>Отдал {ein(last.n)}.</b> Ушло «минусов»: {last.n}, а плюсов (протонов) столько же. Частица стала <b>более положительной</b>: СО{' '}
            <b>{coText(last.from)} → {coText(co)}</b> (выросла). Это <b>окисление</b>.
          </>
        )}
        {last?.kind === 'take' && (
          <>
            <b style={{ color: OX }}>Принял {ein(last.n)}.</b> Добавилось «минусов»: {last.n}, — частица стала <b>более отрицательной</b>: СО <b>{coText(last.from)} → {coText(co)}</b> (уменьшилась). Это <b>восстановление</b>.
          </>
        )}
        {up === undefined && <div className="mt-1 text-white/80">▶ Дальше отдавать нельзя: все электроны внешнего слоя уже отданы. Это <b>высшая СО</b> элемента.</div>}
        {down === undefined && el.min < 0 && <div className="mt-1 text-white/80">◀ Дальше принимать нельзя: внешний слой заполнен (8 ē). Это <b>низшая СО</b> элемента.</div>}
        {down === undefined && el.min === 0 && <div className="mt-1 text-white/80">◀ Металл не принимает электроны: ниже нуля у него степени окисления не бывает.</div>}
      </div>
    </div>
  )
}

/* ================================================================== 3. Шкала: кто окислитель, кто восстановитель */

export function ScaleDemo() {
  const [e, setE] = useState(2)
  const [s, setS] = useState(1)
  const el = SCALE_ELEMENTS[e]
  const st = el.states[Math.min(s, el.states.length - 1)]
  const si = el.states.indexOf(st)
  const role = roleOf(el, si)
  const pos = (v: number) => ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100
  const ticks = Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i)
  const lowest = el.states[0].co
  const highest = el.states[el.states.length - 1].co

  const pickEl = (i: number) => {
    setE(i)
    setS(0)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/75">Элемент:</span>
        {SCALE_ELEMENTS.map((x, i) => (
          <button key={x.sym} onClick={() => pickEl(i)} aria-pressed={i === e} className={chip(i === e)}>
            {x.sym}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-white/85">{el.intro}</p>

      <div className="mt-3 overflow-x-auto">
        <div className="relative mx-6 h-40 min-w-[600px]">
          {/* ось */}
          <div className="absolute left-0 right-0 top-14 h-2 rounded bg-white/15" />
          {/* куда может двигаться выбранное состояние */}
          {si > 0 && (
            <div
              className="absolute top-14 h-2 rounded-l"
              style={{ left: `${pos(lowest)}%`, width: `${pos(st.co) - pos(lowest)}%`, background: OX, opacity: 0.8 }}
            />
          )}
          {si < el.states.length - 1 && (
            <div
              className="absolute top-14 h-2 rounded-r"
              style={{ left: `${pos(st.co)}%`, width: `${pos(highest) - pos(st.co)}%`, background: RED, opacity: 0.8 }}
            />
          )}
          {ticks.map((v) => (
            <div key={v} className="absolute top-[68px]" style={{ left: `${pos(v)}%`, transform: 'translateX(-50%)' }}>
              <div className="mx-auto h-2 w-0.5 bg-white/40" />
              <div className={`text-center text-xs font-semibold ${v === 0 ? 'text-white' : 'text-white/55'}`}>{coText(v)}</div>
            </div>
          ))}
          {/* состояния */}
          {el.states.map((x, i) => {
            const r = roleOf(el, i)
            const on = i === si
            return (
              <button
                key={x.co}
                onClick={() => setS(i)}
                aria-pressed={on}
                aria-label={`${x.name}, степень окисления ${coText(x.co)}`}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${pos(x.co)}%` }}
              >
                <span className="mb-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-sm font-bold" style={{ background: on ? '#fff' : 'rgba(255,255,255,.12)', color: on ? '#1b2445' : '#fff' }}>
                  <T s={`\\ce{${x.form}}`} />
                </span>
                <span
                  className="h-8 w-8 rounded-full border-[3px] transition-transform"
                  style={{ background: ROLE_COLOR[r], borderColor: on ? '#fff' : 'rgba(255,255,255,.35)', transform: on ? 'scale(1.25)' : 'scale(1)' }}
                />
              </button>
            )
          })}
          <div className="absolute left-0 top-[106px] text-xs font-bold" style={{ color: OX }}>
            ◀ принять ē → СО ниже → окислитель
          </div>
          <div className="absolute right-0 top-[106px] text-xs font-bold" style={{ color: RED }}>
            отдать ē → СО выше → восстановитель ▶
          </div>
          <div className="absolute left-0 top-[126px] text-xs text-white/60">
            Низшая СО: {coText(lowest)} · высшая СО: {coText(highest)}
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/80">
        {(['red', 'both', 'ox'] as Role[]).map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <i className="inline-block h-3 w-3 rounded-full" style={{ background: ROLE_COLOR[r] }} />
            {ROLE_TITLE[r]}
          </span>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3" key={`${e}-${si}`} style={{ animation: 'fade-up .35s ease-out both' }} aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold">
            {el.sym} в степени окисления {coText(st.co)}
          </span>
          <span className="text-white/75">
            (<T s={`\\ce{${st.form}}`} />, {st.name})
          </span>
        </div>
        <div className="mt-1">
          Вердикт: <b className="rounded-md px-2 py-0.5 text-navy" style={{ background: ROLE_COLOR[role] }}>{ROLE_TITLE[role]}</b>
        </div>
        <p className="mt-1 text-sm text-white/85">
          {role === 'red' && 'Это низшая степень окисления: принимать электроны уже некуда — остаётся только отдавать.'}
          {role === 'ox' && 'Это высшая степень окисления: отдавать электроны уже нечего — остаётся только принимать.'}
          {role === 'both' && 'Это промежуточная степень окисления: есть и куда расти (отдать ē), и куда падать (принять ē). Роль зависит от партнёра по реакции.'}
        </p>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-white/10 p-3" style={{ borderLeft: `4px solid ${OX}` }}>
            <div className="font-bold" style={{ color: OX }}>Принимает ē → окислитель</div>
            {st.ox ? (
              <Example co={st.co} move={st.ox} sym={el.sym} />
            ) : si === 0 ? (
              <div className="mt-1 text-white/75">Нельзя: СО уже самая низкая.</div>
            ) : (
              <div className="mt-1 text-white/75">{st.note ?? 'Примера в школьной программе нет.'}</div>
            )}
          </div>
          <div className="rounded-lg bg-white/10 p-3" style={{ borderLeft: `4px solid ${RED}` }}>
            <div className="font-bold" style={{ color: RED }}>Отдаёт ē → восстановитель</div>
            {st.red ? (
              <Example co={st.co} move={st.red} sym={el.sym} />
            ) : si === el.states.length - 1 ? (
              <div className="mt-1 text-white/75">{st.note ?? 'Нельзя: СО уже самая высокая.'}</div>
            ) : (
              <div className="mt-1 text-white/75">{st.note ?? 'Примера в школьной программе нет.'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Example({ co, move, sym }: { co: number; move: { to: number; ce: string; text?: string }; sym: string }) {
  return (
    <div className="mt-1">
      <div className="text-white/85">
        {sym}: {coText(co)} → {coText(move.to)}
      </div>
      <div className="mt-1 overflow-x-auto text-base">
        <T s={`\\ce{${move.ce}}`} />
      </div>
      {move.text && <div className="text-xs text-white/65">({move.text})</div>}
    </div>
  )
}

const Dots = ({ groups, per, color }: { groups: number; per: number; color: string }) => (
  <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
    {Array.from({ length: groups }, (_, g) => (
      <span key={g} className="inline-flex gap-1 rounded-full bg-white/10 px-1.5 py-1">
        {Array.from({ length: per }, (_, d) => (
          <span key={d} className="h-3.5 w-3.5 rounded-full border border-white" style={{ background: color }} />
        ))}
      </span>
    ))}
  </span>
)

/* ================================================================== 4. Электронный баланс по шагам */

const BAL_STEPS = [
  'Расставьте степени окисления',
  'Найдите элементы, у которых СО изменилась',
  'Составьте электронные уравнения',
  'Найдите множители (НОК)',
  'Подставьте множители в уравнение',
  'Уравняйте остальное и проверьте',
]

export function BalanceDemo() {
  const [i, setI] = useState(0)
  const [step, setStep] = useState(0)
  const c = BALANCE_CASES[i]
  const L = lcm(c.redN, c.oxN)
  const redK = L / c.redN
  const oxK = L / c.oxN
  const [la, ra] = sideAtoms(c.final)
  const els = Object.keys(la)

  const pick = (k: number) => {
    setI(k)
    setStep(0)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/75">Реакция:</span>
        {BALANCE_CASES.map((x, k) => (
          <button key={x.id} onClick={() => pick(k)} aria-pressed={k === i} className={chip(k === i)}>
            {x.title}
          </button>
        ))}
      </div>

      {/* индикатор шагов */}
      <div className="mt-3 flex gap-1.5">
        {BAL_STEPS.map((t, k) => (
          <button
            key={k}
            onClick={() => setStep(k)}
            aria-label={`Шаг ${k + 1}: ${t}`}
            className="h-2 flex-1 rounded-full transition"
            style={{ background: k <= step ? RED : 'rgba(255,255,255,.2)' }}
          />
        ))}
      </div>

      <div className="mt-3 space-y-3" key={`${i}-${step}`}>
        <div className="text-sm font-bold text-white/70">
          Шаг {step + 1} из {BAL_STEPS.length}
        </div>
        <div className="text-xl font-extrabold">{BAL_STEPS[step]}</div>

        {step === 0 && (
          <div className="rounded-xl bg-white/10 p-4 text-center text-xl" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="overflow-x-auto"><T s={c.scheme} /></div>
            <div className="mt-2 text-sm text-white/75">Вспомните правила: у простых веществ СО = 0, сумма СО в молекуле = 0.</div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="overflow-x-auto rounded-xl bg-white/10 p-3 text-center"><T s={c.scheme} /></div>
            <ul className="space-y-1 rounded-xl bg-white/10 p-3 text-sm">
              {c.changed.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-3" style={{ borderLeft: `4px solid ${RED}` }}>СО выросла → отдаёт ē → <b style={{ color: RED }}>восстановитель</b></div>
              <div className="rounded-xl bg-white/10 p-3" style={{ borderLeft: `4px solid ${OX}` }}>СО уменьшилась → принимает ē → <b style={{ color: OX }}>окислитель</b></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="overflow-x-auto rounded-xl bg-white/10 p-3 text-center text-lg" style={{ borderLeft: `4px solid ${RED}` }}>
              <T s={c.red} />
              <div className="mt-1 text-sm" style={{ color: RED }}>отдал {c.redN} ē · <b>окисление</b> · {c.redWho}</div>
            </div>
            <div className="overflow-x-auto rounded-xl bg-white/10 p-3 text-center text-lg" style={{ borderLeft: `4px solid ${OX}` }}>
              <T s={c.ox} />
              <div className="mt-1 text-sm" style={{ color: OX }}>принял {c.oxN} ē · <b>восстановление</b> · {c.oxWho}</div>
            </div>
            <div className="text-sm text-white/75">Электроны пишем в уравнении: отданные — со знаком «−» слева, принятые — со знаком «+» слева.</div>
          </div>
        )}

        {step >= 3 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <div className="mb-2">
                Отдано <b>{c.redN}</b> ē, принято <b>{c.oxN}</b> ē. Находим НОК: <b style={{ color: GOLD }}>НОК({c.redN}; {c.oxN}) = {L}</b>. Делим на каждое число — получаем множители:
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white/10 p-2" style={{ borderLeft: `4px solid ${RED}` }}>
                  <b style={{ color: RED }}>{c.redWho.split(' — ')[0]}</b> · {L} : {c.redN} = <b className="text-lg" style={{ color: RED }}>{redK}</b>
                  <div className="mt-1 overflow-x-auto text-base"><T s={c.red} /></div>
                  <div className="mt-1"><Dots groups={redK} per={c.redN} color={RED} /></div>
                  <div className="mt-1 text-xs text-white/70">отдано: {redK} × {c.redN} = {L} ē</div>
                  <div className="mt-1 text-sm">Коэффициент <b style={{ color: RED }}>{redK}</b> ставим перед: <b>{c.redFor}</b></div>
                </div>
                <div className="rounded-lg bg-white/10 p-2" style={{ borderLeft: `4px solid ${OX}` }}>
                  <b style={{ color: OX }}>{c.oxWho.split(' — ')[0]}</b> · {L} : {c.oxN} = <b className="text-lg" style={{ color: OX }}>{oxK}</b>
                  <div className="mt-1 overflow-x-auto text-base"><T s={c.ox} /></div>
                  <div className="mt-1"><Dots groups={oxK} per={c.oxN} color={OX} /></div>
                  <div className="mt-1 text-xs text-white/70">принято: {oxK} × {c.oxN} = {L} ē</div>
                  <div className="mt-1 text-sm">Коэффициент <b style={{ color: OX }}>{oxK}</b> ставим перед: <b>{c.oxFor}</b></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className="rounded-xl bg-white/10 p-3 text-center text-xl" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="mb-1 text-left text-sm text-white/75">Множители (выделены <b style={{ color: GOLD }}>жёлтым</b>) — коэффициенты перед веществами с этими элементами:</div>
            <div className="overflow-x-auto"><T s={hlCe(c.partial)} /></div>
          </div>
        )}

        {step >= 5 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="rounded-xl bg-white/10 p-3 text-sm">{c.rest}</div>
            <div className="overflow-x-auto rounded-xl border-2 p-3 text-center text-xl" style={{ borderColor: '#16a58c', background: 'rgba(22,165,140,.15)' }}>
              <T s={c.finalSo} />
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <div className="mb-1 font-bold">Проверка по атомам:</div>
              <div className="flex flex-wrap gap-2">
                {els.map((x) => (
                  <span key={x} className="rounded-md bg-white/10 px-2 py-1">
                    {x}: {la[x]} = {ra[x]} <span style={{ color: '#7fe0c0' }}>✓</span>
                  </span>
                ))}
              </div>
              <div className="mt-2 text-white/85">
                <b style={{ color: RED }}>Восстановитель:</b> {c.redWho.split(' — ')[0]} · <b style={{ color: OX }}>окислитель:</b> {c.oxWho.split(' — ')[0]}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`${btn} bg-white/10 hover:bg-white/20`}>
          ← Назад
        </button>
        <button onClick={() => setStep(Math.min(BAL_STEPS.length - 1, step + 1))} disabled={step === BAL_STEPS.length - 1} className={`${btn} bg-orange text-navy`}>
          Дальше →
        </button>
        <button onClick={() => setStep(0)} disabled={step === 0} className={`${btn} bg-white/10 hover:bg-white/20`}>
          ↺ Сначала
        </button>
      </div>
    </div>
  )
}

/* ================================================================== 5. Сложные уравнения (часть 2 ОГЭ) */

const CX_STEPS = [
  'Расставьте степени окисления',
  'Найдите элементы, у которых СО изменилась',
  'Составьте электронные уравнения',
  'Найдите НОК и множители',
  'Подставьте множители в уравнение',
  'Уравняйте остальные элементы',
  'Проверьте и запишите ответ',
]

export function ComplexDemo() {
  const [i, setI] = useState(0)
  const [step, setStep] = useState(0)
  const c = COMPLEX_CASES[i]
  const L = lcm(c.redN, c.oxN)
  const redK = L / c.redN
  const oxK = L / c.oxN
  const ones = c.coef.map(() => 1)
  const finalCe = complexCe(c, c.coef)
  const [la, ra] = sideAtoms(finalCe)
  const pick = (k: number) => {
    setI(k)
    setStep(0)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/75">Реакция:</span>
        {COMPLEX_CASES.map((x, k) => (
          <button key={x.id} onClick={() => pick(k)} aria-pressed={k === i} className={chip(k === i)}>
            {x.title}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-1.5">
        {CX_STEPS.map((t, k) => (
          <button key={k} onClick={() => setStep(k)} aria-label={`Шаг ${k + 1}: ${t}`} className="h-2 flex-1 rounded-full transition" style={{ background: k <= step ? RED : 'rgba(255,255,255,.2)' }} />
        ))}
      </div>

      <div className="mt-3 space-y-3" key={`${i}-${step}`}>
        <div className="text-sm font-bold text-white/70">
          Шаг {step + 1} из {CX_STEPS.length}
        </div>
        <div className="text-xl font-extrabold">{CX_STEPS[step]}</div>

        {step <= 1 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="overflow-x-auto rounded-xl bg-white/10 p-4 text-center text-lg">
              <T s={complexSo(c, ones)} />
            </div>
            {step === 0 && <div className="text-sm text-white/75">Расставьте СО у каждого элемента в каждой формуле. Помните: у простых веществ СО = 0, сумма СО в молекуле = 0, у кислорода обычно −2, у водорода +1, у калия +1.</div>}
            {step === 1 && (
              <>
                <ul className="space-y-1 rounded-xl bg-white/10 p-3 text-sm">
                  {c.changed.map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-white/10 p-3" style={{ borderLeft: `4px solid ${RED}` }}>СО выросла → отдаёт ē → <b style={{ color: RED }}>восстановитель</b></div>
                  <div className="rounded-xl bg-white/10 p-3" style={{ borderLeft: `4px solid ${OX}` }}>СО уменьшилась → принимает ē → <b style={{ color: OX }}>окислитель</b></div>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="overflow-x-auto rounded-xl bg-white/10 p-3 text-center text-lg" style={{ borderLeft: `4px solid ${RED}` }}>
              <T s={c.red} />
              <div className="mt-1 text-sm" style={{ color: RED }}>отдал {c.redN} ē · <b>окисление</b> · {c.redWho}</div>
            </div>
            <div className="overflow-x-auto rounded-xl bg-white/10 p-3 text-center text-lg" style={{ borderLeft: `4px solid ${OX}` }}>
              <T s={c.ox} />
              <div className="mt-1 text-sm" style={{ color: OX }}>принял {c.oxN} ē · <b>восстановление</b> · {c.oxWho}</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl bg-white/10 p-3 text-sm" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="mb-2">
              Отдано <b>{c.redN}</b> ē, принято <b>{c.oxN}</b> ē. <b style={{ color: GOLD }}>НОК({c.redN}; {c.oxN}) = {L}</b>.
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-white/10 p-2" style={{ borderLeft: `4px solid ${RED}` }}>
                {L} : {c.redN} = <b className="text-lg" style={{ color: RED }}>{redK}</b>
                <div className="mt-1 overflow-x-auto text-base"><T s={c.red} /></div>
                <div className="mt-1"><Dots groups={redK} per={c.redN} color={RED} /></div>
                <div className="mt-1">Коэффициент <b style={{ color: RED }}>{redK}</b> ставим перед: <b>{c.redFor}</b></div>
              </div>
              <div className="rounded-lg bg-white/10 p-2" style={{ borderLeft: `4px solid ${OX}` }}>
                {L} : {c.oxN} = <b className="text-lg" style={{ color: OX }}>{oxK}</b>
                <div className="mt-1 overflow-x-auto text-base"><T s={c.ox} /></div>
                <div className="mt-1"><Dots groups={oxK} per={c.oxN} color={OX} /></div>
                <div className="mt-1">Коэффициент <b style={{ color: OX }}>{oxK}</b> ставим перед: <b>{c.oxFor}</b></div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl bg-white/10 p-4 text-center text-xl" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="mb-1 text-left text-sm text-white/75">Ставим множители (<b style={{ color: GOLD }}>жёлтые</b> числа). Вещества, где элемент степень не менял, пока оставляем без коэффициента:</div>
            <div className="overflow-x-auto"><T s={hlCe(complexCe(c, c.partial))} /></div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="text-sm text-white/80">Порядок: металлы (K, Na…), затем кислотный остаток или хлор, затем водород, кислород — проверка.</div>
            {c.rest.map((r, k) => (
              <div key={k} className="rounded-xl bg-white/10 p-3">
                <div className="text-sm"><b style={{ color: GOLD }}>{k + 1}.</b> {r.text}</div>
                <div className="mt-1 overflow-x-auto text-center text-lg"><T s={`\\ce{${complexCe(c, r.coef)}}`} /></div>
              </div>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-2" style={{ animation: 'fade-up .4s ease-out both' }}>
            <div className="overflow-x-auto rounded-xl border-2 p-3 text-center text-lg" style={{ borderColor: '#16a58c', background: 'rgba(22,165,140,.15)' }}>
              <T s={complexSo(c, c.coef)} />
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <div className="mb-1 font-bold">Проверка по атомам (кислород — в последнюю очередь):</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(la).map((x) => (
                  <span key={x} className="rounded-md bg-white/10 px-2 py-1">
                    {x}: {la[x]} = {ra[x]} <span style={{ color: '#7fe0c0' }}>✓</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <b>Ответ:</b> <span style={{ color: OX }}>{c.answer.split(',')[0]}</span>,
              <span style={{ color: RED }}>{c.answer.split(',')[1]}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`${btn} bg-white/10 hover:bg-white/20`}>
          ← Назад
        </button>
        <button onClick={() => setStep(Math.min(CX_STEPS.length - 1, step + 1))} disabled={step === CX_STEPS.length - 1} className={`${btn} bg-orange text-navy`}>
          Дальше →
        </button>
        <button onClick={() => setStep(0)} disabled={step === 0} className={`${btn} bg-white/10 hover:bg-white/20`}>
          ↺ Сначала
        </button>
      </div>
    </div>
  )
}
