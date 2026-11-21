import { useState } from 'react'
import { ELEMENTS, KIND_LABEL, shells, type El } from '../lib/elements'

type Mode = 'radius' | 'metal' | 'eo' | 'nonmetal'

const GROUPS = ['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA', 'VIIIA']

/** Электроотрицательность по Полингу (Ne и Ar — не указывают) */
const EO: Record<string, number | null> = {
  Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Ne: null,
  Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.9, P: 2.19, S: 2.58, Cl: 3.16, Ar: null,
  K: 0.82, Ca: 1.0,
}
/** Расчётный радиус атома, пм (для наглядности: в периодах строго убывает) */
const RADIUS: Record<string, number> = {
  Li: 167, Be: 112, B: 87, C: 67, N: 56, O: 48, F: 42, Ne: 38,
  Na: 190, Mg: 145, Al: 118, Si: 111, P: 98, S: 88, Cl: 79, Ar: 71,
  K: 243, Ca: 194,
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'radius', label: 'Радиус атома' },
  { id: 'eo', label: 'Электроотрицательность' },
  { id: 'metal', label: 'Металлические свойства' },
  { id: 'nonmetal', label: 'Неметаллические свойства' },
]

const RULES: Record<Mode, { period: string; group: string; note: string }> = {
  radius: {
    period: 'в периоде → радиус уменьшается',
    group: 'в группе ↓ радиус увеличивается',
    note: 'В периоде число слоёв одно и то же, а заряд ядра растёт — ядро сильнее притягивает электроны. В группе с каждым периодом добавляется слой.',
  },
  eo: {
    period: 'в периоде → ЭО увеличивается',
    group: 'в группе ↓ ЭО уменьшается',
    note: 'Чем правее и выше элемент (без благородных газов), тем сильнее его атомы притягивают электроны. Рекордсмен — фтор F.',
  },
  metal: {
    period: 'в периоде → металлические свойства ослабевают',
    group: 'в группе ↓ металлические свойства усиливаются',
    note: 'Металлические свойства — это способность отдавать электроны (восстановительные свойства). Они меняются так же, как радиус: растут ← и ↓.',
  },
  nonmetal: {
    period: 'в периоде → неметаллические свойства усиливаются',
    group: 'в группе ↓ неметаллические свойства ослабевают',
    note: 'Неметаллические свойства — это способность принимать электроны (окислительные свойства). Они меняются так же, как ЭО: растут → и ↑. Самый активный неметалл — фтор F.',
  },
}

const fmt = (n: number) => String(n).replace('.', ',')
const cell = (period: number, group: number): El | undefined =>
  ELEMENTS.find((e) => e.period === period && e.group === group)

const MIN_R = 38
const MAX_R = 243

/** Интерактивная таблица 2–4 периодов: радиус, ЭО, металлические и неметаллические свойства */
export default function PeriodicTrends() {
  const [mode, setMode] = useState<Mode>('radius')
  const [sel, setSel] = useState<El>(ELEMENTS.find((e) => e.symbol === 'Na')!)
  const rule = RULES[mode]

  const share = (e: El): number | null => {
    if (mode === 'radius' || mode === 'metal') {
      if (mode === 'metal' && e.kind === 'noble') return null
      return (RADIUS[e.symbol] - MIN_R) / (MAX_R - MIN_R)
    }
    const v = EO[e.symbol]
    return v == null ? null : (v - 0.8) / (3.98 - 0.8)
  }

  const bg = (e: El) => {
    const s = share(e)
    if (s == null) return '#eef0f5'
    if (mode === 'metal') return `rgba(47,127,236,${0.1 + s * 0.75})`
    if (mode === 'nonmetal' || mode === 'eo') return `rgba(245,166,35,${0.1 + s * 0.75})`
    return '#f4f5fb'
  }

  const label = (e: El) => {
    if (mode === 'radius') return `${RADIUS[e.symbol]} пм`
    if (mode === 'eo' || mode === 'nonmetal') return EO[e.symbol] == null ? '—' : fmt(EO[e.symbol]!)
    return e.kind === 'noble' ? '—' : `r ${RADIUS[e.symbol]}`
  }

  const sh = shells(sel.z)
  const eo = EO[sel.symbol]

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 font-bold">Как меняются свойства в Периодической системе (элементы 2–4 периодов)</div>
      <div role="tablist" aria-label="Что показать" className="mb-3 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              mode === m.id ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-navy/10'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="grid grid-cols-[24px_repeat(8,minmax(0,1fr))] gap-1 text-center text-xs">
            <div />
            {GROUPS.map((g) => (
              <div key={g} className="py-1 font-semibold text-muted">{g}</div>
            ))}
            {[2, 3, 4].map((p) => (
              <Row key={p} p={p} mode={mode} sel={sel} onSel={setSel} bg={bg} label={label} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-paper px-3 py-2 text-sm">
          <b className="text-navy">→ по периоду:</b> {rule.period}
        </div>
        <div className="rounded-lg bg-paper px-3 py-2 text-sm">
          <b className="text-navy">↓ по группе:</b> {rule.group}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{rule.note}</p>
      <p className="mt-1 text-xs text-muted">
        {mode === 'metal' && 'Чем насыщеннее синий — тем сильнее металлические свойства. Серые клетки — благородные газы. '}
        {mode === 'nonmetal' && 'Чем насыщеннее оранжевый — тем сильнее неметаллические свойства (показана ЭО). Серые клетки — благородные газы. '}
        {mode === 'radius' && 'Радиусы расчётные, в пикометрах (пм): важно сравнение, а не числа. '}
        {mode === 'eo' && 'ЭО по шкале Полинга; у благородных газов её обычно не указывают. '}
        Нажмите на элемент, чтобы увидеть подробности.
      </p>

      <div className="mt-3 rounded-xl bg-paper p-3 text-sm" aria-live="polite">
        <div className="text-lg font-bold">
          {sel.symbol} · {sel.name} <span className="font-normal text-muted">№ {sel.z}</span>
        </div>
        <ul className="mt-1 grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
          <li>Период {sel.period} → слоёв: <b>{sh.length}</b></li>
          <li>Группа {GROUPS[sel.group - 1]} → внешних ē: <b>{sh[sh.length - 1]}</b></li>
          <li>Радиус атома: <b>{RADIUS[sel.symbol]} пм</b></li>
          <li>ЭО: <b>{eo == null ? '— (благородный газ)' : fmt(eo)}</b></li>
          <li>Тип: <b>{KIND_LABEL[sel.kind]}</b></li>
        </ul>
      </div>
    </div>
  )
}

function Row({
  p, mode, sel, onSel, bg, label,
}: {
  p: number
  mode: Mode
  sel: El
  onSel: (e: El) => void
  bg: (e: El) => string
  label: (e: El) => string
}) {
  return (
    <>
      <div className="flex items-center justify-center font-semibold text-muted">{p}</div>
      {Array.from({ length: 8 }, (_, i) => {
        const e = cell(p, i + 1)
        if (!e) return <div key={i} />
        const active = e.z === sel.z
        const d = 10 + ((RADIUS[e.symbol] - MIN_R) / (MAX_R - MIN_R)) * 34
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSel(e)}
            aria-label={`${e.name}, номер ${e.z}`}
            aria-pressed={active}
            className={`flex flex-col items-center justify-between rounded-lg border-2 px-0.5 py-1 transition ${
              active ? 'border-navy' : 'border-transparent hover:border-navy/30'
            }`}
            style={{ background: mode === 'radius' ? '#f4f5fb' : bg(e), minHeight: mode === 'radius' ? 84 : 58 }}
          >
            {mode === 'radius' && (
              <span className="flex h-[46px] items-center justify-center">
                <span className="rounded-full" style={{ width: d, height: d, background: 'rgba(122,92,224,0.35)', border: '2px solid #7a5ce0' }} />
              </span>
            )}
            <span className="text-sm font-extrabold leading-none text-navy">{e.symbol}</span>
            <span className="text-[10px] leading-tight text-navy/80">{label(e)}</span>
          </button>
        )
      })}
    </>
  )
}
