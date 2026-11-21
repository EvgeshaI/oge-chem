import { useSyncExternalStore } from 'react'
import type { TopicMeta } from '../content/types'

/**
 * ЗАГЛУШКА доступа. Сейчас «покупка» хранится в localStorage — это только для разработки.
 * При подключении оплаты:
 *  1. вход по email (Supabase Auth),
 *  2. таблица purchases + вебхук платёжной системы,
 *  3. платные уроки отдаёт сервер (RLS), а не бандл — иначе их можно достать из JS.
 */
const KEY = 'oge-chem:entitlement:v1'
const listeners = new Set<() => void>()

export function hasFullAccess(): boolean {
  try {
    return localStorage.getItem(KEY) === 'full'
  } catch {
    return false
  }
}

export function setDevAccess(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, 'full')
    else localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function canAccess(meta: Pick<TopicMeta, 'free'>): boolean {
  return meta.free || hasFullAccess()
}

export function useFullAccess(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    hasFullAccess,
  )
}

export class AccessError extends Error {
  constructor() {
    super('Тема доступна после оплаты')
  }
}
