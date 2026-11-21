import { useSyncExternalStore } from 'react'
import { applyCase, applyStep, emptyQuest, type QuestState } from './questLogic'

const KEY = 'oge-chem:quest:v1'
let state: QuestState = load()
const listeners = new Set<() => void>()

function load(): QuestState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p.steps === 'object' && typeof p.cases === 'object') return { ...emptyQuest(), ...p } as QuestState
    }
  } catch {
    /* localStorage может быть недоступен */
  }
  return emptyQuest()
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function recordQuestStep(id: string, tries: number, solved: boolean) {
  state = applyStep(state, id, tries, solved)
  emit()
}

export function recordQuestCase(caseId: string, stars: number) {
  state = applyCase(state, caseId, stars)
  emit()
}

export function resetQuest() {
  state = emptyQuest()
  emit()
}

export function useQuest(): QuestState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
  )
}
