import { useState } from 'react'
import { H_INDEX, SALTS, SERIES, displacement, posOf, withAcid, withWater } from '../lib/activity'
import { tex } from './RichText'

type Mode = 'acid' | 'water' | 'salt'

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'acid', label: 'Металл + кислота', hint: 'Выберите металл и посмотрите, вытеснит ли он водород из соляной кислоты.' },
  { id: 'water', label: 'Металл + вода', hint: 'Выберите металл: как он ведёт себя в воде?' },
  { id: 'salt', label: 'Металл + раствор соли', hint: 'Выберите металл и соль: вытеснит ли металл другой металл из раствора?' },
]

type Item = { sym: string; h?: boolean }
const ITEMS: Item[] = [...SERIES.slice(0, H_INDEX).map((m) => ({ sym: m.sym })), { sym: 'H₂', h: true }, ...SERIES.slice(H_INDEX).map((m) => ({ sym: m.sym }))]

const zoneOf = (idx: number) => (idx < 5 ? 'a' : idx < H_INDEX ? 'b' : 'c')
const ZONE_CLS = { a: 'bg-orange text-navy', b: 'bg-teal text-white', c: 'bg-white/20 text-white' }

const eqHtml = (eq: string) => tex(`\\ce{${eq}}`)
const Eq = ({ eq }: { eq: string }) => <span className="inline-block text-lg" dangerouslySetInnerHTML={{ __html: eqHtml(eq) }} />

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 ${ok ? 'bg-teal/20' : 'bg-red/20'}`} style={{ animation: 'pop .3s ease-out both' }}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold ${ok ? 'bg-teal text-white' : 'bg-red text-white'}`}>{ok ? '✓' : '✗'}</span>
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  )
}

function Result({ mode, sym, saltId }: { mode: Mode; sym: string; saltId: string }) {
  const m = SERIES[posOf(sym)]
  if (mode === 'acid') {
    const eq = withAcid(sym)
    return eq ? (
      <Verdict ok>
        <b>{sym}</b> стоит <b>левее водорода</b> — вытесняет H₂ из кислоты.
        <div className="mt-1 overflow-x-auto"><Eq eq={eq} /></div>
        {sym === 'Fe' && <div className="mt-1 text-sm text-white/80">Железо даёт соль железа(II): FeCl₂, а не FeCl₃.</div>}
      </Verdict>
    ) : (
      <Verdict ok={false}>
        <b>{sym}</b> стоит <b>правее водорода</b> — водород из кислот не вытесняет. Реакции нет.
      </Verdict>
    )
  }
  if (mode === 'water') {
    const w = withWater(sym)
    const text = {
      cold: ['Реагирует при обычных условиях: образуются щёлочь и водород.', true],
      hot: ['Только при нагревании: холодную воду магний «не замечает».', true],
      steam: ['Только с раскалённым паром и при нагревании. При обычных условиях — реакции нет.', true],
      film: ['При обычных условиях не реагирует: мешает защитная плёнка оксида Al₂O₃. Без плёнки реакция возможна.', false],
      no: ['С водой не реагирует.', false],
    } as const
    const [msg, ok] = text[w.mode]
    return (
      <Verdict ok={ok}>
        <b>{sym}</b> ({m.name}). {msg}
        {w.eq && <div className="mt-1 overflow-x-auto"><Eq eq={w.eq} /></div>}
      </Verdict>
    )
  }
  const salt = SALTS.find((s) => s.id === saltId) ?? SALTS[0]
  const sm = posOf(salt.metal)
  if (m.water === 'cold')
    return (
      <Verdict ok={false}>
        <b>{sym}</b> слишком активен: он не вытесняет {salt.metal} из соли, а <b>реагирует с водой раствора</b>.
        <div className="mt-1 overflow-x-auto"><Eq eq={withWater(sym).eq ?? ''} /></div>
        <div className="mt-1 text-sm text-white/80">Образовавшаяся щёлочь затем реагирует с солью (обмен), но чистого металла {salt.metal} не появится.</div>
      </Verdict>
    )
  if (sym === salt.metal)
    return (
      <Verdict ok={false}>
        Металл и металл в соли — одно и то же: вытеснять нечего.
      </Verdict>
    )
  const eq = displacement(sym, salt)
  return eq ? (
    <Verdict ok>
      <b>{sym}</b> стоит левее <b>{salt.metal}</b> (позиция {posOf(sym) + 1} против {sm + 1}) — активнее, поэтому вытесняет его из раствора.
      <div className="mt-1 overflow-x-auto"><Eq eq={eq} /></div>
      {(sym === 'Fe' || salt.metal === 'Fe') && <div className="mt-1 text-sm text-white/80">Железо всегда даёт соль железа(II).</div>}
    </Verdict>
  ) : (
    <Verdict ok={false}>
      <b>{sym}</b> стоит <b>правее</b> {salt.metal} — менее активен, вытеснить его из соли не может. Реакции нет.
    </Verdict>
  )
}

/** Интерактивный ряд напряжений: что умеет металл с водой, кислотой и солью */
export default function ActivitySeries() {
  const [mode, setMode] = useState<Mode>('acid')
  const [sym, setSym] = useState('Mg')
  const [saltId, setSaltId] = useState('cuso4')
  const salt = SALTS.find((s) => s.id === saltId) ?? SALTS[0]
  const info = MODES.find((x) => x.id === mode)!

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-navy p-3 text-white sm:p-5">
      <div className="flex flex-wrap gap-2">
        {MODES.map((x) => (
          <button
            key={x.id}
            onClick={() => setMode(x.id)}
            aria-pressed={x.id === mode}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${x.id === mode ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-white/75">{info.hint}</p>

      <div className="mt-3 overflow-x-auto pb-1">
        <div className="min-w-[640px]">
          <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
            <span>самые активные</span>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-orange via-white/60 to-white/10" />
            <span>активность уменьшается →</span>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-white/10 to-white/40" />
            <span>малоактивные</span>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }} role="group" aria-label="Электрохимический ряд напряжений металлов">
            {ITEMS.map((it, idx) => {
              if (it.h)
                return (
                  <div key="H" className="flex h-12 items-center justify-center rounded-lg bg-pink text-sm font-bold text-white" title="водород — граница ряда">
                    H₂
                  </div>
                )
              const mIdx = SERIES.findIndex((m) => m.sym === it.sym)
              const oge = SERIES[mIdx].oge
              const sel = it.sym === sym
              const saltMetal = mode === 'salt' && it.sym === salt.metal
              return (
                <button
                  key={it.sym}
                  onClick={() => setSym(it.sym)}
                  aria-pressed={sel}
                  title={`${SERIES[mIdx].name}${oge ? ' (кодификатор ОГЭ)' : ''}`}
                  className={`relative flex h-12 items-center justify-center rounded-lg text-sm font-bold transition ${ZONE_CLS[zoneOf(idx)]} ${sel ? 'scale-110 ring-4 ring-white' : 'hover:brightness-110'} ${saltMetal ? 'ring-4 ring-blue' : ''}`}
                >
                  {it.sym}
                  {oge && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-navy/70 ring-1 ring-white/80" />}
                  {saltMetal && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-blue px-1.5 text-[10px]">в соли</span>}
                </button>
              )
            })}
          </div>
          <div className="mt-6 grid gap-1 text-center text-[11px] leading-tight" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
            <div className="rounded-md bg-orange/25 px-1 py-1" style={{ gridColumn: 'span 5' }}>
              с водой при н. у.: щёлочь + H₂
            </div>
            <div className="rounded-md bg-teal/25 px-1 py-1" style={{ gridColumn: 'span 7' }}>
              вытесняют H₂ из растворов кислот
            </div>
            <div className="rounded-md bg-pink/25 px-1 py-1" style={{ gridColumn: 'span 1' }}>
              H₂
            </div>
            <div className="rounded-md bg-white/10 px-1 py-1" style={{ gridColumn: 'span 5' }}>
              H₂ из кислот не вытесняют
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-white/60">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-navy/70 ring-1 ring-white/80" /> — металлы из кодификатора ОГЭ (Na, K, Ca, Mg, Al, Fe).
      </p>

      {mode === 'salt' && (
        <div className="mt-3">
          <div className="mb-1 text-sm text-white/75">Раствор соли:</div>
          <div className="flex flex-wrap gap-2">
            {SALTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSaltId(s.id)}
                aria-pressed={s.id === saltId}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${s.id === saltId ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4" aria-live="polite">
        <div className="mb-2 text-base font-bold text-orange">
          {mode === 'salt' ? `${sym} + ${salt.label}` : mode === 'acid' ? `${sym} + HCl (р-р)` : `${sym} + H₂O`}
        </div>
        <Result key={`${mode}-${sym}-${saltId}`} mode={mode} sym={sym} saltId={saltId} />
      </div>
      {mode === 'salt' && (
        <p className="mt-2 text-xs text-white/60">Правило: металл вытесняет из раствора соли только тех, кто стоит правее него в ряду. Na, K, Ca сначала реагируют с водой.</p>
      )}
    </div>
  )
}
