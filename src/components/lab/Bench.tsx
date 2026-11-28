import { useState } from 'react'
import { RACK_SIZE, react, type Contents, type Flask, type Rack, type Tube } from '../../lib/lab'
import { CLEAR, OBSERVATIONS, SOLUTIONS, type ChemId, type Experiment } from '../../lib/labData'
import { TestTube } from '../TestTube'
import { Bottle } from './Bottle'

interface Props {
  experiment: Experiment
  contents: Contents
  /** реактивы, выбранные на этапе планирования */
  plan: ChemId[]
  rack: Rack
  onPour: (flask: Flask) => void
  onAdd: (reagent: ChemId) => void
  onSelect: (id: number) => void
  onClear: () => void
}

const bottleBtn =
  'flex w-full flex-col items-center rounded-xl py-1 text-center text-[11px] font-semibold leading-tight transition enabled:hover:bg-white/10 enabled:active:scale-95 disabled:opacity-40 sm:p-2 sm:text-xs'
/** на телефоне склянки мелкие: весь стол должен помещаться на экране, чтобы было видно пробирки */
const bottleSize = 'h-[68px] w-11 sm:h-28 sm:w-[72px]'
const panel = 'rounded-xl bg-white/5 p-1 sm:p-2'
const panelTitle = 'px-1 text-[11px] font-semibold uppercase tracking-wide text-white/60 sm:text-xs'
const smallBtn = 'rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition enabled:hover:bg-white/20 disabled:opacity-40'

/** Три капли, падающие в пробирку при каждом приливании */
function Drops() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute left-1/2 top-0 -ml-1 block h-2.5 w-2 rounded-full bg-[#cfe8ff]"
          style={{ opacity: 0, animation: `drip-down .7s ease-in ${i * 0.2}s forwards` }}
          aria-hidden
        />
      ))}
    </>
  )
}

interface TubeProps {
  tube: Tube
  experiment: Experiment
  contents: Contents
  selected: boolean
  onSelect: () => void
}

function RackTube({ tube, experiment, contents, selected, onSelect }: TubeProps) {
  const look = tube.reagent ? react(experiment, contents[tube.flask], tube.reagent) : null
  const added = tube.reagent ? SOLUTIONS[tube.reagent].formula : null
  const name = `Пробирка: вещество из склянки № ${tube.flask + 1}${added ? ` и ${added}. ${OBSERVATIONS[look!.obs]}` : ', реактив не добавлен'}`
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={name}
      className={`flex w-full flex-col items-center rounded-xl border-2 px-0.5 pb-2 transition ${selected ? 'border-orange bg-white/10' : 'border-transparent hover:bg-white/5'}`}
    >
      <span className="relative block h-12 w-full">
        <Drops key={tube.reagent ?? 'sample'} />
      </span>
      <TestTube
        className="h-32 w-12 sm:h-44 sm:w-[66px]"
        liquid={look?.liquid ?? CLEAR}
        level={look ? 0.58 : 0.32}
        precip={look?.precip ?? 'transparent'}
        precipH={look?.precipH ?? 0}
        bubbles={look?.bubbles}
      />
      <span className="text-sm font-bold">№ {tube.flask + 1}</span>
      <span className={`text-xs ${added ? 'font-semibold text-orange' : 'text-white/60'}`}>{added ? `+ ${added}` : 'проба'}</span>
    </button>
  )
}

function hint(rack: Rack, plan: ChemId[]): string {
  const target = rack.tubes.find((t) => t.id === rack.selected)
  if (!target) return 'Нажмите на склянку № 1 или № 2 — проба нальётся в чистую пробирку.'
  if (plan.length < 2) return 'Чтобы приливать реактивы, сначала выберите два из них на шаге 1.'
  if (!target.reagent) return `Выбрана проба из склянки № ${target.flask + 1}. Нажмите на реактив, чтобы прилить его.`
  if (rack.tubes.length < RACK_SIZE) return 'Понаблюдайте за пробиркой и запишите признак в таблицу. Затем возьмите новую пробу.'
  return 'Все четыре пробирки заняты. Сравните их и заполните таблицу; чтобы повторить опыты, уберите пробирки.'
}

/** Лабораторный стол: склянки с веществами и реактивами, штатив на четыре пробирки */
export function Bench({ experiment, contents, plan, rack, onPour, onAdd, onSelect, onClear }: Props) {
  /** пробирка, у которой проверили запах */
  const [sniffed, setSniffed] = useState<number | null>(null)
  const target = rack.tubes.find((t) => t.id === rack.selected)
  const full = rack.tubes.length >= RACK_SIZE
  const smelled = target?.reagent && target.id === sniffed ? react(experiment, contents[target.flask], target.reagent) : null
  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="min-h-10 text-sm text-white/85" aria-live="polite">
        {hint(rack, plan)}
      </p>

      <div className="mt-3 grid grid-cols-[2fr_3fr] gap-1.5 sm:gap-3">
        <div className={panel}>
          <div className={panelTitle}>Вещества</div>
          <div className="mt-1 grid grid-cols-2">
            {([0, 1] as const).map((f) => (
              <button key={f} type="button" onClick={() => onPour(f)} disabled={full} className={bottleBtn} aria-label={`Отобрать пробу из склянки № ${f + 1}`}>
                <Bottle label={`№ ${f + 1}`} liquid={CLEAR} className={bottleSize} />
                <span className="mt-1">взять пробу</span>
              </button>
            ))}
          </div>
        </div>
        <div className={panel}>
          <div className={panelTitle}>Реактивы</div>
          <div className="mt-1 grid grid-cols-3">
            {experiment.reagents.map((id) => {
              const r = SOLUTIONS[id]
              const chosen = plan.includes(id)
              const ready = chosen && plan.length === 2 && !!target && !target.reagent
              return (
                <button key={id} type="button" onClick={() => onAdd(id)} disabled={!ready} className={bottleBtn} aria-label={`Прилить ${r.name} ${r.formula}`}>
                  <Bottle label={r.formula} liquid={r.liquid} className={bottleSize} />
                  <span className="mt-1">{chosen ? 'прилить' : 'не выбран'}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-4 items-end gap-1 sm:mx-auto sm:max-w-lg sm:gap-3">
          {Array.from({ length: RACK_SIZE }, (_, i) => {
            const tube = rack.tubes[i]
            return tube ? (
              <RackTube
                key={tube.id}
                tube={tube}
                experiment={experiment}
                contents={contents}
                selected={tube.id === rack.selected}
                onSelect={() => onSelect(tube.id)}
              />
            ) : (
              <div key={`empty-${i}`} className="flex flex-col items-center border-2 border-transparent px-0.5 pb-2">
                <span className="block h-12" />
                <TestTube className="h-32 w-12 opacity-25 sm:h-44 sm:w-[66px]" liquid="transparent" level={0} />
                <span className="text-sm text-white/40">—</span>
                <span className="text-xs text-white/40">чистая</span>
              </div>
            )
          })}
        </div>
        {/* полка штатива */}
        <div className="mx-auto -mt-1 h-2 max-w-xl rounded-full bg-[#8d97b8]/50" aria-hidden />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setSniffed(target!.id)} disabled={!target?.reagent} className={smallBtn}>
          👃 Проверить запах
        </button>
        <button
          type="button"
          onClick={() => {
            setSniffed(null)
            onClear()
          }}
          disabled={rack.tubes.length === 0}
          className={smallBtn}
        >
          ↺ Убрать пробирки
        </button>
      </div>
      <p className="mt-2 min-h-5 text-center text-sm font-semibold text-orange" aria-live="polite">
        {smelled &&
          `№ ${target!.flask + 1} + ${SOLUTIONS[target!.reagent!].formula}: ${smelled.obs === 'smell' ? 'чувствуется резкий запах' : 'запаха нет'}.`}
      </p>
    </div>
  )
}
