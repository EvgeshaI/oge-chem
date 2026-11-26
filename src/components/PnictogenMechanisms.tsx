import { pnScenesOf, type PnGroup } from '../lib/pnictogenScenes'
import ReactionMechanism from './ReactionMechanism'

const HINT: Record<PnGroup, string> = {
  'pn-nitrogen': 'Сравните сцены: с водородом и магнием азот принимает электроны, а с кислородом — отдаёт.',
  'pn-phosphorus': 'С металлом фосфор принимает электроны, с хлором — отдаёт.',
}

/** Механизмы реакций азота или фосфора (по группе) */
export default function PnictogenMechanisms({ only }: { only: PnGroup }) {
  return (
    <div id={`nitrogen-phosphorus.mechs-${only.slice(3)}`} className="min-w-0 scroll-mt-24 overflow-x-clip rounded-2xl bg-navy p-3 text-white sm:p-5">
      <p className="text-sm text-white/75">Пройдите механизм по шагам: куда смещаются электроны и что на что меняется.</p>
      <p className="mt-2 text-sm text-white/70">{HINT[only]}</p>
      <div className="mt-3 min-w-0">
        <ReactionMechanism key={only} scenes={pnScenesOf(only)} embedded />
      </div>
    </div>
  )
}
