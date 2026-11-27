import { describe, expect, it } from 'vitest'
import { EXCHANGES, ION_TESTS, type Ion } from '../lib/acidsBasesSalts'
import { isIonBalanced } from '../lib/balance'
import { catalog } from './catalog'
import content from './topics/acids-bases-salts'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())
const isReaction = (e: string) => {
  const parts = e.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  return parts.length === 2 && parts[1].trim() !== ''
}

const SUP: Record<string, string> = { '²': '2', '³': '3' }
/** Заряд иона по подписи «SO₄²⁻» */
const chargeOf = (ion: Ion) => {
  const m = ion.label.match(/([²³]?)[⁺⁻]$/)!
  return (m[1] ? Number(SUP[m[1]]) : 1) * (ion.sign === '+' ? 1 : -1)
}

describe('тема «Свойства кислот, оснований и солей»: структура', () => {
  const meta = catalog.find((t) => t.id === 'acids-bases-salts')!
  it('есть в каталоге как тема «только теория»', () => {
    expect(meta).toBeDefined()
    expect(meta.theoryOnly).toBe(true)
    expect(meta.totalTasks).toBe(0)
    expect(content.practice).toEqual([])
    expect(content.exam).toEqual([])
  })
  it('уроки с уникальными id и префиксом темы', () => {
    expect(content.lessons.length).toBeGreaterThanOrEqual(8)
    const ids = content.lessons.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('acids-bases-salts.'), id).toBe(true)
  })
  it('есть анимации, схема и таблицы', () => {
    const blocks = content.lessons.flatMap((l) => l.blocks)
    const anims = blocks.flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(expect.arrayContaining(['ion-exchange', 'ion-tests', 'indicators']))
    expect(blocks.some((b) => b.kind === 'image')).toBe(true)
    expect(blocks.filter((b) => b.kind === 'table').length).toBeGreaterThan(8)
  })
  it('цвета ячеек совпадают по размеру с таблицей', () => {
    for (const b of content.lessons.flatMap((l) => l.blocks))
      if (b.kind === 'table' && b.cellColors) {
        expect(b.cellColors).toHaveLength(b.rows.length)
        for (const row of b.cellColors) expect(row).toHaveLength(b.head.length)
      }
  })
  it('формулы $…$ не вложены в жирный **…** (RichText их не разбирает)', () => {
    const bad = strings(content).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
})

describe('тема «Свойства кислот, оснований и солей»: уравнения уравнены', () => {
  const fromLessons = strings(content.lessons).flatMap(equationsIn)
  const fromData = [
    ...EXCHANGES.flatMap((x) => [x.mol, x.full, x.short]),
    ...ION_TESTS.flatMap((t) => [t.eq, t.excess?.eq]),
  ].filter((x): x is string => !!x)
  const eqs = [...new Set([...fromLessons, ...fromData])].filter(isReaction)
  it('уравнений достаточно', () => {
    expect(eqs.length).toBeGreaterThan(60)
  })
  for (const e of eqs) {
    it(`уравнено: ${e}`, () => {
      expect(isIonBalanced(e), e).toBe(true)
    })
  }
})

describe('данные анимаций', () => {
  it('ионы в каждом растворе дают нейтральную сумму зарядов', () => {
    for (const ex of EXCHANGES)
      for (const side of [ex.left, ex.right]) expect(side.ions.reduce((a, ion) => a + chargeOf(ion) * ion.n, 0), `${ex.id}: ${side.name}`).toBe(0)
  })
  it('реакция идёт ⇔ есть связавшиеся ионы и уравнения', () => {
    for (const ex of EXCHANGES) {
      const reacting = [...ex.left.ions, ...ex.right.ions].filter((i) => i.reacts)
      expect(reacting.length > 0, ex.id).toBe(!!ex.product)
      expect(!!ex.short, ex.id).toBe(!!ex.product)
    }
  })
  it('у каждого иона ровно одна качественная реакция, амфотерные — с избытком щёлочи', () => {
    const ions = ION_TESTS.map((t) => t.ion)
    expect(new Set(ions).size).toBe(ions.length)
    expect(ION_TESTS.filter((t) => t.excess).map((t) => t.ion)).toEqual(['Al³⁺', 'Zn²⁺'])
  })
})
