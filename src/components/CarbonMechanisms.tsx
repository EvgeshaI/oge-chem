import { csScenesOf, type CsGroup } from '../lib/carbonScenes'
import ReactionMechanism from './ReactionMechanism'

const HINT: Record<CsGroup, string> = {
  'cs-carbon': 'Сравните сцены: с кислородом и оксидом меди углерод отдаёт электроны, а с алюминием — принимает.',
  'cs-silicon': 'С кислородом и щёлочью кремний отдаёт электроны, с магнием — принимает.',
}

/** Механизмы реакций углерода или кремния (по группе) */
export default function CarbonMechanisms({ only }: { only: CsGroup }) {
  return (
    <div id={`carbon-silicon.mechs-${only.slice(3)}`} className="min-w-0 scroll-mt-24 overflow-x-clip rounded-2xl bg-navy p-3 text-white sm:p-5">
      <p className="text-sm text-white/75">Пройдите механизм по шагам: куда смещаются электроны и что на что меняется.</p>
      <p className="mt-2 text-sm text-white/70">{HINT[only]}</p>
      <div className="mt-3 min-w-0">
        <ReactionMechanism key={only} scenes={csScenesOf(only)} embedded />
      </div>
    </div>
  )
}
