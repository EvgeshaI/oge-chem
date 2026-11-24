import { useState } from 'react'
import { HALOGENS } from '../lib/halogens'

type Mode = 'r' | 'eo' | 'ox' | 't'

const MODES: { id: Mode; label: string }[] = [
  { id: 'r', label: 'Радиус атома' },
  { id: 'eo', label: 'Электроотрицательность' },
  { id: 'ox', label: 'Окислительные свойства' },
  { id: 't', label: 't кипения' },
]

const OX_LABEL = ['самый сильный', 'сильный', 'средний', 'слабый']

const INFO: Record<Mode, { dir: '↑' | '↓'; title: string; why: string }> = {
  r: {
    dir: '↑',
    title: 'Радиус атома растёт от F к I',
    why: 'От фтора к иоду добавляется по одному электронному слою — атом становится больше. Число внешних электронов (7) остаётся прежним.',
  },
  eo: {
    dir: '↓',
    title: 'Электроотрицательность падает от F к I',
    why: 'Чем больше радиус, тем дальше внешние электроны от ядра и тем слабее ядро притягивает электроны — своих и чужих. Фтор — самый электроотрицательный элемент.',
  },
  ox: {
    dir: '↓',
    title: 'Окислительные свойства ослабевают от F к I',
    why: 'Окислитель принимает электроны. Чем меньше атом, тем сильнее ядро «втягивает» чужой электрон на внешний слой. Поэтому активность падает так же, как электроотрицательность.',
  },
  t: {
    dir: '↑',
    title: 'Температуры плавления и кипения растут от F₂ к I₂',
    why: 'Молекулы Г₂ неполярны и связаны слабым межмолекулярным притяжением. Чем тяжелее и крупнее молекула, тем сильнее притяжение, поэтому нужно больше энергии, чтобы оторвать молекулы друг от друга.',
  },
}

const fmt = (n: number) => String(n).replace('.', ',')

/** Столбчатая диаграмма: как меняются свойства галогенов сверху вниз по группе */
export default function HalogenTrends() {
  const [mode, setMode] = useState<Mode>('r')

  const value = (k: number) => {
    const h = HALOGENS[k]
    if (mode === 'r') return h.r
    if (mode === 'eo') return h.eo
    if (mode === 'ox') return 4 - k
    return h.bp
  }
  const label = (k: number) => {
    const h = HALOGENS[k]
    if (mode === 'r') return `${h.r} пм`
    if (mode === 'eo') return fmt(h.eo)
    if (mode === 'ox') return OX_LABEL[k]
    return `${h.bp} °C`
  }
  const vals = HALOGENS.map((_, k) => value(k))
  const lo = mode === 't' ? -200 : 0
  const hi = Math.max(...vals) * (mode === 'r' ? 1.1 : mode === 'eo' ? 1.05 : mode === 'ox' ? 1.0 : 1.05)
  const frac = (v: number) => Math.max(0.04, (v - lo) / (hi - lo))
  const info = INFO[mode]

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 font-bold">Как меняются свойства галогенов в группе</div>
      <div role="tablist" aria-label="Свойство" className="mb-4 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${mode === m.id ? 'bg-navy text-white' : 'bg-paper text-navy hover:bg-navy/10'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-3 rounded-xl bg-paper px-3 pb-3 pt-6 sm:gap-6" style={{ height: 270 }} role="img" aria-label={info.title}>
        {HALOGENS.map((h, k) => {
          const f = frac(value(k))
          const size = mode === 'r' ? 14 + (h.r / 133) * 34 : 0
          return (
            <div key={h.sym} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              <div className="mb-1 text-center text-xs font-bold text-navy sm:text-sm">{label(k)}</div>
              <div
                className="flex w-full max-w-[84px] items-start justify-center rounded-t-lg border-2"
                style={{
                  height: `${f * 175}px`,
                  background: h.fill,
                  borderColor: h.stroke,
                  transition: 'height .7s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {mode === 'r' && (
                  <span
                    className="mt-1 rounded-full border-2"
                    style={{ width: size, height: size, background: 'rgba(122,92,224,.25)', borderColor: '#7a5ce0', transition: 'all .7s' }}
                  />
                )}
              </div>
              <div className="mt-1 text-lg font-extrabold text-navy">{h.sym}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted" aria-hidden>
        <span className="font-semibold">F</span>
        <div className="relative h-1 flex-1 rounded-full bg-navy/20">
          <span className="absolute -right-1 -top-1.5 text-navy">▶</span>
        </div>
        <span className="font-semibold">I</span>
        <span className="ml-1 font-semibold text-navy">
          {info.dir === '↑' ? 'растёт' : 'падает'} {info.dir}
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-paper p-3 text-[15px] leading-relaxed" aria-live="polite">
        <div className="font-bold text-navy">{info.title}</div>
        <p className="mt-1">{info.why}</p>
      </div>
      {mode === 't' && (
        <p className="mt-2 text-xs text-muted">Для наглядности столбцы отсчитаны от −200 °C. F₂: −188 °C, Cl₂: −34 °C, Br₂: 59 °C, I₂: 184 °C.</p>
      )}
    </div>
  )
}
