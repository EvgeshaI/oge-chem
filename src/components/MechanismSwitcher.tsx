import { useEffect, useState } from 'react'
import type { GroupId } from '../lib/mechanisms'
import ReactionMechanism from './ReactionMechanism'

const TABS: { id: GroupId; label: string; hint: string }[] = [
  { id: 'acids', label: 'С кислотами', hint: 'Металл отдаёт электроны ионам H⁺. Слева от водорода — реакция идёт, справа — нет.' },
  { id: 'water', label: 'С водой', hint: 'Самые активные металлы (Na, K, Ca) реагируют с водой: щёлочь + водород.' },
  { id: 'salts', label: 'С растворами солей', hint: 'Более активный металл вытесняет менее активный из раствора соли.' },
  { id: 'nonmetals', label: 'С неметаллами', hint: 'Металл отдаёт электроны неметаллу: образуются оксид, хлорид, сульфид…' },
]

const fromHash = (): GroupId | null => {
  const m = /^metals\.mechs(?:-(acids|water|salts|nonmetals))?$/.exec(window.location.hash.slice(1))
  return (m?.[1] as GroupId | undefined) ?? (m ? 'acids' : null)
}

/** Переключатель: вода / кислоты / соли / неметаллы → уже готовый механизм реакций */
export default function MechanismSwitcher() {
  const [group, setGroup] = useState<GroupId>(() => fromHash() ?? 'acids')
  const tab = TABS.find((t) => t.id === group)!

  useEffect(() => {
    const onHash = () => {
      const g = fromHash()
      if (g) setGroup(g)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const pick = (id: GroupId) => {
    setGroup(id)
    history.replaceState(null, '', `#metals.mechs-${id}`)
  }

  return (
    <div id="metals.mechs" className="min-w-0 scroll-mt-24 overflow-x-clip rounded-2xl bg-navy p-3 text-white sm:p-5">
      <p className="text-sm text-white/75">Выберите тип реакции — и пройдите механизм по шагам: куда уходят электроны и что на что меняется.</p>
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Тип реакции">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === group}
            onClick={() => pick(t.id)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${t.id === group ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-white/70">{tab.hint}</p>
      <div className="mt-3 min-w-0" role="tabpanel">
        <ReactionMechanism key={group} group={group} embedded />
      </div>
    </div>
  )
}
