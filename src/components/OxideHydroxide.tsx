import { useState } from 'react'

type Kind = 'base' | 'amph' | 'acid'

const KINDS: Record<Kind, { label: string; tile: string }> = {
  base: { label: 'основание', tile: 'bg-blue text-white' },
  amph: { label: 'амфотерный гидроксид', tile: 'bg-purple text-white' },
  acid: { label: 'кислота', tile: 'bg-orange text-navy' },
}

interface Item {
  oxide: [string, boolean][]
  hydroxide: [string, boolean][]
  el: string
  ox: string
  kind: Kind
  /** Проверка: сумма степеней окисления в гидроксиде равна 0 */
  check: string
}

const ITEMS: Item[] = [
  { oxide: [['Na₂', true], ['O', false]], hydroxide: [['Na', true], ['OH', false]], el: 'Na', ox: '+1', kind: 'base', check: '(+1) + 1·(−1) = 0' },
  { oxide: [['Ca', true], ['O', false]], hydroxide: [['Ca', true], ['(OH)₂', false]], el: 'Ca', ox: '+2', kind: 'base', check: '(+2) + 2·(−1) = 0' },
  { oxide: [['Cu', true], ['O', false]], hydroxide: [['Cu', true], ['(OH)₂', false]], el: 'Cu', ox: '+2', kind: 'base', check: '(+2) + 2·(−1) = 0' },
  { oxide: [['Zn', true], ['O', false]], hydroxide: [['Zn', true], ['(OH)₂', false]], el: 'Zn', ox: '+2', kind: 'amph', check: '(+2) + 2·(−1) = 0' },
  { oxide: [['Al₂', true], ['O₃', false]], hydroxide: [['Al', true], ['(OH)₃', false]], el: 'Al', ox: '+3', kind: 'amph', check: '(+3) + 3·(−1) = 0' },
  { oxide: [['Be', true], ['O', false]], hydroxide: [['Be', true], ['(OH)₂', false]], el: 'Be', ox: '+2', kind: 'amph', check: '(+2) + 2·(−1) = 0' },
  { oxide: [['S', true], ['O₃', false]], hydroxide: [['H₂', false], ['S', true], ['O₄', false]], el: 'S', ox: '+6', kind: 'acid', check: '2·(+1) + (+6) + 4·(−2) = 0' },
  { oxide: [['N₂', true], ['O₅', false]], hydroxide: [['H', false], ['N', true], ['O₃', false]], el: 'N', ox: '+5', kind: 'acid', check: '(+1) + (+5) + 3·(−2) = 0' },
  { oxide: [['P₂', true], ['O₅', false]], hydroxide: [['H₃', false], ['P', true], ['O₄', false]], el: 'P', ox: '+5', kind: 'acid', check: '3·(+1) + (+5) + 4·(−2) = 0' },
]

const plain = (parts: [string, boolean][]) => parts.map((p) => p[0]).join('')

function Formula({ parts, item, showBadge, label }: { parts: [string, boolean][]; item: Item; showBadge: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-1">
        {parts.map(([t, isEl], k) => (
          <div key={k} className="relative">
            {isEl && (
              <span
                key={String(showBadge)}
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 text-xs font-bold text-navy shadow"
                style={{ opacity: showBadge ? 1 : 0, animation: showBadge ? 'pop .45s ease-out both' : undefined }}
              >
                {item.ox}
              </span>
            )}
            <div
              className={`flex h-14 min-w-14 items-center justify-center rounded-xl px-3 text-2xl font-bold ${
                isEl ? KINDS[item.kind].tile : 'bg-white/15 text-white'
              }`}
            >
              {t}
            </div>
          </div>
        ))}
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  )
}

function Demo({ item }: { item: Item }) {
  const [stage, setStage] = useState(0)
  return (
    <>
      <div className="mt-4 rounded-xl bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 pt-3">
          <Formula parts={item.oxide} item={item} showBadge label="оксид" />
          <div className="text-center text-sm text-white/80">
            <div className="text-2xl">→</div>
            <div>та же с. о.</div>
          </div>
          {stage >= 1 ? (
            <div style={{ animation: 'pop .4s ease-out both' }}>
              <Formula parts={item.hydroxide} item={item} showBadge label={KINDS[item.kind].label} />
            </div>
          ) : (
            <div className="flex h-14 min-w-28 items-center justify-center rounded-xl border-2 border-dashed border-white/30 text-2xl text-white/40">?</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStage(1)}
          disabled={stage >= 1}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-105 disabled:opacity-40"
        >
          {stage >= 1 ? 'Гидроксид составлен' : 'Составить гидроксид'}
        </button>
        {stage >= 1 && (
          <button onClick={() => setStage(0)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
            ↺ Сначала
          </button>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        {stage >= 1 ? (
          <div style={{ animation: 'pop .4s ease-out both' }}>
            <p>
              В оксиде и в гидроксиде {item.el} имеет с. о. <b className="text-orange">{item.ox}</b>. {plain(item.oxide)} → <b>{plain(item.hydroxide)}</b>:{' '}
              {KINDS[item.kind].label}.
            </p>
            <p className="mt-1 text-sm text-white/85">
              Проверка по степеням окисления в {plain(item.hydroxide)}: {item.check}.
              {item.kind !== 'acid' ? ' Число групп OH равно степени окисления металла.' : ''}
            </p>
          </div>
        ) : (
          <p className="text-white/80">Над элементом показана его степень окисления. Нажмите кнопку — гидроксид сохранит её.</p>
        )}
      </div>
    </>
  )
}

/** Оксид и его гидроксид: элемент сохраняет степень окисления */
export default function OxideHydroxide() {
  const [i, setI] = useState(0)
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите оксид — и подберите к нему гидроксид.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ITEMS.map((x, k) => (
          <button
            key={plain(x.oxide)}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {plain(x.oxide)}
          </button>
        ))}
      </div>
      <Demo key={plain(ITEMS[i].oxide)} item={ITEMS[i]} />
    </div>
  )
}
