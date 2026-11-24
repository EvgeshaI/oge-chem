import { useState } from 'react'
import { halScenesOf, type HalGroup } from '../lib/halogenScenes'
import ReactionMechanism from './ReactionMechanism'

const TABS: { id: HalGroup; label: string; hint: string }[] = [
  { id: 'hal-metals', label: 'С металлами', hint: 'Металл отдаёт электроны галогену: образуется соль — галогенид.' },
  { id: 'hal-nonmetals', label: 'С водородом и фосфором', hint: 'С неметаллами общая электронная пара смещается к более электроотрицательному галогену.' },
  { id: 'hal-water', label: 'С водой и щёлочью', hint: 'Хлор — и окислитель, и восстановитель; фтор окисляет даже воду.' },
  { id: 'hal-displace', label: 'Вытеснение из солей', hint: 'Более активный галоген отнимает электроны у иона менее активного.' },
]

/** Переключатель механизмов реакций галогенов (по группам) */
export default function HalogenMechanisms({ only }: { only?: HalGroup } = {}) {
  const [group, setGroup] = useState<HalGroup>(only ?? 'hal-metals')
  const tab = TABS.find((t) => t.id === group)!

  return (
    <div id={only ? `halogens.mechs-${only.slice(4)}` : 'halogens.mechs'} className="min-w-0 scroll-mt-24 overflow-x-clip rounded-2xl bg-navy p-3 text-white sm:p-5">
      <p className="text-sm text-white/75">
        {only ? 'Пройдите механизм по шагам' : 'Выберите тип реакции — и пройдите механизм по шагам'}: куда уходят электроны и что на что меняется.
      </p>
      {!only && (
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Тип реакции">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === group}
            onClick={() => setGroup(t.id)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${t.id === group ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      )}
      <p className="mt-2 text-sm text-white/70">{tab.hint}</p>
      <div className="mt-3 min-w-0" role="tabpanel">
        <ReactionMechanism key={group} scenes={halScenesOf(group)} embedded />
      </div>
    </div>
  )
}
