import type { Cell, CellInput, Task } from '../content/types'

export interface OpenValue {
  text: string
  ticked: boolean[]
}
export type Value = string[] | string | OpenValue

export interface Result {
  score: number
  max: number
  /** Полностью верно */
  correct: boolean
  /** Для задач с полями: верность каждого поля (в порядке fieldsOf) */
  gaps?: boolean[]
}

/** Одно поле ввода: допустимые ответы и режим сравнения */
export interface Field {
  accept: string[]
  set?: boolean
}

const SUB: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', '−': '-', '–': '-', '—': '-', 'ē': 'e', 'ё': 'e',
  // кириллические «двойники» латинских букв: при вводе формул легко перепутать раскладку
  'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm', 'н': 'h', 'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'х': 'x', 'у': 'y',
}

/** Приводит ответ ученика и эталон к одному виду: без регистра, пробелов, индексов-«₂», разных минусов */
export function norm(s: string): string {
  let t = [...s.trim().toLowerCase()].map((c) => SUB[c] ?? c).join('')
  // 2·8·1, 2 8 1, 2,8,1, 2-8-1 → одинаково
  if (/^\d+([^\d\p{L}+]+\d+)+$/u.test(t)) t = t.split(/[^\d]+/).join('·')
  t = t.replace(/[\s^_*(){}.,]/g, '')
  return t.replace(/^\+(?=\d+$)/, '')
}

function normSet(s: string): string {
  return s
    .split(/\s*(?:\sи\s|,|;|\+|\/)\s*|\s+/)
    .filter((p) => p !== 'и')
    .map(norm)
    .filter(Boolean)
    .sort()
    .join('|')
}

const arr = (a: string | string[]) => (Array.isArray(a) ? a : [a])
const isInput = (c: Cell): c is CellInput => typeof c !== 'string'

/** Поля задачи в порядке отрисовки. Для задач без полей — пусто. */
export function fieldsOf(task: Task): Field[] {
  switch (task.type) {
    case 'fill':
      return task.answers.map((a) => ({ accept: arr(a) }))
    case 'classify':
      return task.items.map((i) => ({ accept: [i.answer] }))
    case 'cells':
      return task.rows.flat().filter(isInput).map((c) => ({ accept: arr(c.a), set: c.set }))
    case 'redox':
      return [
        // коэффициент 1 в уравнениях обычно не пишут — пустое поле тоже верно
        ...task.coef.map((k) => ({ accept: k === 1 ? ['1', ''] : [String(k)] })),
        { accept: [task.names[task.ox]] },
        { accept: [task.names[task.red]] },
        { accept: [String(task.halfRed.n)] },
        { accept: [String(task.halfOx.n)] },
      ]
    case 'models':
      return task.models.flatMap((m) => [
        { accept: [String(m.elements)] },
        { accept: [String(m.substances)] },
        { accept: [m.kind] },
        { accept: [m.formulas], set: true },
      ])
    case 'schemes':
      return task.schemes.flatMap((s) => [
        ...(s.element ? [{ accept: [s.element] }] : []),
        { accept: [String(s.charge)] },
        ...(s.given ? [] : s.shells.map((n) => ({ accept: [String(n)] }))),
        { accept: [String(s.outer)] },
        { accept: [s.kind] },
      ])
    default:
      return []
  }
}

export function fieldOk(f: Field, v: string): boolean {
  const t = v.trim()
  // пустое значение верно только если оно явно допущено (например, коэффициент 1 в ОВР)
  if (!t) return f.accept.some((a) => a === '')
  return f.set
    ? f.accept.some((a) => a !== '' && normSet(a) === normSet(v))
    : f.accept.some((a) => a !== '' && norm(a) === norm(v))
}

export function emptyValue(task: Task): Value {
  switch (task.type) {
    case 'digits':
    case 'single':
    case 'order':
      return ''
    case 'match':
      return ''
    case 'open':
      return { text: '', ticked: task.criteria.map(() => false) }
    default:
      return fieldsOf(task).map(() => '')
  }
}

export function maxScore(task: Task): number {
  switch (task.type) {
    case 'digits':
    case 'single':
    case 'match':
    case 'order':
      return 1
    case 'open':
      return task.criteria.reduce((s, c) => s + c.points, 0)
    default:
      return fieldsOf(task).length
  }
}

/** Оставляет только цифры; для digits сортирует и убирает повторы */
export function normalizeDigits(s: string, sort: boolean): string {
  const d = s.replace(/\D/g, '')
  return sort ? [...new Set(d.split(''))].sort().join('') : d
}

export function checkTask(task: Task, value: Value): Result {
  const max = maxScore(task)
  switch (task.type) {
    case 'digits': {
      const ok = normalizeDigits(value as string, true) === normalizeDigits(task.answer, true)
      return { score: ok ? 1 : 0, max, correct: ok }
    }
    case 'single': {
      const ok = (value as string) === String(task.answer)
      return { score: ok ? 1 : 0, max, correct: ok }
    }
    case 'order': {
      const ok = normalizeDigits(value as string, false) === task.answer
      return { score: ok ? 1 : 0, max, correct: ok }
    }
    case 'match': {
      const ok = normalizeDigits(value as string, false) === task.answer
      return { score: ok ? 1 : 0, max, correct: ok }
    }
    case 'open': {
      const v = value as OpenValue
      const score = task.criteria.reduce((s, c, i) => s + (v.ticked[i] ? c.points : 0), 0)
      return { score, max, correct: score === max }
    }
    default: {
      const v = value as string[]
      const gaps = fieldsOf(task).map((f, i) => fieldOk(f, v[i] ?? ''))
      const score = gaps.filter(Boolean).length
      return { score, max, correct: score === max, gaps }
    }
  }
}

/** Оценка по 5-балльной шкале из доли набранных баллов (условные пороги, настраиваются) */
export function gradeFromShare(share: number): 2 | 3 | 4 | 5 {
  if (share >= 0.85) return 5
  if (share >= 0.65) return 4
  if (share >= 0.4) return 3
  return 2
}
