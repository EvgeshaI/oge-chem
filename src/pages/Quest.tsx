import { useState } from 'react'
import { Hub } from '../components/quest/Hub'
import { Play } from '../components/quest/Play'
import { Report } from '../components/quest/Report'
import { resetQuest, useQuest } from '../lib/quest'

type View = { kind: 'hub' } | { kind: 'play'; index: number; run: number } | { kind: 'report' }

export default function QuestPage() {
  const state = useQuest()
  const [view, setView] = useState<View>({ kind: 'hub' })
  const [run, setRun] = useState(0)

  const go = (v: View) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }
  const play = (index: number) => {
    setRun((r) => r + 1)
    go({ kind: 'play', index, run: run + 1 })
  }
  const hub = () => go({ kind: 'hub' })

  if (view.kind === 'play')
    return (
      <Play
        key={`${view.index}-${view.run}`}
        index={view.index}
        onExit={hub}
        onRestart={() => play(view.index)}
        onPlay={play}
        onReport={() => go({ kind: 'report' })}
      />
    )
  if (view.kind === 'report')
    return <Report state={state} onBack={hub} onReset={() => { resetQuest(); hub() }} onPlay={play} />
  return <Hub state={state} onPlay={play} onReport={() => go({ kind: 'report' })} />
}
