import { chalScenesOf, type ChalGroup } from '../lib/chalcogenScenes'
import ReactionMechanism from './ReactionMechanism'

const HINT: Record<ChalGroup, string> = {
  'chal-oxygen': 'Кислород принимает электроны и у металла, и у неметалла: он почти всегда окислитель.',
  'chal-sulfur': 'Сравните сцены: с железом и водородом сера принимает электроны, а с кислородом — отдаёт.',
}

/** Механизмы реакций кислорода или серы (по группе) */
export default function ChalcogenMechanisms({ only }: { only: ChalGroup }) {
  return (
    <div id={`oxygen-sulfur.mechs-${only.slice(5)}`} className="min-w-0 scroll-mt-24 overflow-x-clip rounded-2xl bg-navy p-3 text-white sm:p-5">
      <p className="text-sm text-white/75">Пройдите механизм по шагам: куда смещаются электроны и что на что меняется.</p>
      <p className="mt-2 text-sm text-white/70">{HINT[only]}</p>
      <div className="mt-3 min-w-0">
        <ReactionMechanism key={only} scenes={chalScenesOf(only)} embedded />
      </div>
    </div>
  )
}
