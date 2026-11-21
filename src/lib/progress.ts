import { useSyncExternalStore } from 'react'

export interface TaskRecord {
  score: number
  max: number
  at: number
}
export interface ProgressState {
  tasks: Record<string, TaskRecord>
}

const KEY = 'oge-chem:progress:v1'
let state: ProgressState = load()
const listeners = new Set<() => void>()

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p.tasks === 'object') return p as ProgressState
    }
  } catch {
    /* localStorage может быть недоступен */
  }
  return { tasks: {} }
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function recordResult(taskId: string, score: number, max: number) {
  state = { tasks: { ...state.tasks, [taskId]: { score, max, at: Date.now() } } }
  emit()
}

export function resetProgress() {
  state = { tasks: {} }
  emit()
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
  )
}

/** Сколько заданий темы решено полностью верно */
export function topicSolved(p: ProgressState, topicId: string): number {
  return Object.entries(p.tasks).filter(
    ([id, r]) => id.startsWith(topicId + '.') && r.score === r.max,
  ).length
}
