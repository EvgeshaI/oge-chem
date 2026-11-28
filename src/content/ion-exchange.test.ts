import { describe, expect, it } from 'vitest'
import { isIonBalanced } from '../lib/balance'
import { REACTIONS, equationCe, shortItems, sideCharge, sideItems } from '../lib/ionEquations'
import { catalog } from './catalog'
import content from './topics/ion-exchange'

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const strings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}
const isReaction = (e: string) => e.split(/(?:<=>|->)(?:\[[^\]]*\])*/).length === 2 && !e.includes('-/->')

describe('тема «Реакции ионного обмена»', () => {
  const meta = catalog.find((t) => t.id === 'ion-exchange')!
  it('стоит после диссоциации и перед ОВР, есть 10 заданий тренировки', () => {
    const ids = catalog.map((t) => t.id)
    expect(ids.indexOf('ion-exchange')).toBe(ids.indexOf('dissociation') + 1)
    expect(ids.indexOf('redox')).toBe(ids.indexOf('ion-exchange') + 1)
    expect(meta.theoryOnly).toBeUndefined()
    expect(meta.totalTasks).toBe(30)
    expect(content.exam).toHaveLength(2)
    for (const v of content.exam) expect(v.tasks).toHaveLength(10)
    expect(content.practice).toHaveLength(10)
    expect(content.practice.every((t) => ['fill', 'classify', 'cells', 'open'].includes(t.type))).toBe(true)
  })
  it('есть все четыре анимации', () => {
    const anims = content.lessons.flatMap((l) => l.blocks).flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(['exchange-mechanism', 'exchange-conditions', 'exchange-writing', 'exchange-equations'])
  })
  it('цвета ячеек совпадают по размеру с таблицей', () => {
    for (const b of content.lessons.flatMap((l) => l.blocks))
      if (b.kind === 'table' && b.cellColors) {
        expect(b.cellColors).toHaveLength(b.rows.length)
        for (const row of b.cellColors) expect(row).toHaveLength(b.head.length)
      }
  })
  it('формулы $…$ не вложены в жирный **…**', () => {
    const bad = strings(content).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
  it('уравнения в \\ce{…} уравнены', () => {
    const eqs = [...new Set(strings(content.lessons).flatMap((s) => [...s.matchAll(CE)].map((m) => m[1].trim())))].filter(isReaction)
    expect(eqs.length).toBeGreaterThan(20)
    for (const e of eqs) expect(isIonBalanced(e), e).toBe(true)
  })
})

describe('данные уравнений', () => {
  for (const r of REACTIONS) {
    it(`${r.id}: молекулярное, полное и сокращённое уравнены`, () => {
      const mol = equationCe(sideItems(r.left, 'L', false), sideItems(r.right, 'R', false))
      const full = [sideItems(r.left, 'L', true), sideItems(r.right, 'R', true)] as const
      expect(isIonBalanced(mol), mol).toBe(true)
      expect(isIonBalanced(equationCe(...full)), equationCe(...full)).toBe(true)
      if (r.kind !== 'none') {
        const short = equationCe(shortItems(full[0]), shortItems(full[1]))
        expect(isIonBalanced(short), short).toBe(true)
        expect(sideCharge(shortItems(full[0]))).toBe(sideCharge(shortItems(full[1])))
      } else {
        expect(shortItems(full[0])).toEqual([])
      }
    })
    it(`${r.id}: ионы-наблюдатели одинаковы слева и справа`, () => {
      if (r.kind === 'none') return
      const count = (items: ReturnType<typeof sideItems>) =>
        items.filter((i) => i.spec).reduce<Record<string, number>>((a, i) => ({ ...a, [i.segs.map((s) => s[0]).join('')]: (a[i.segs.map((s) => s[0]).join('')] ?? 0) + i.coef }), {})
      expect(count(sideItems(r.left, 'L', true))).toEqual(count(sideItems(r.right, 'R', true)))
    })
  }
})
