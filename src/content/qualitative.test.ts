import { describe, expect, it } from 'vitest'
import { ION_TESTS } from '../lib/acidsBasesSalts'
import { isIonBalanced } from '../lib/balance'
import { EXCESS_CASES, QUAL_EXAMPLES } from '../lib/qualitative'
import { catalog } from './catalog'
import content from './topics/qualitative'

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}
const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const SUP: Record<string, number> = { '²': 2, '³': 3 }
const charge = (label: string) => {
  const m = label.match(/([²³]?)([⁺⁻])$/)!
  return (m[1] ? SUP[m[1]] : 1) * (m[2] === '⁺' ? 1 : -1)
}

describe('тема «Качественные реакции»', () => {
  const meta = catalog.find((t) => t.id === 'qualitative')!
  it('идёт после свойств веществ (углерод и кремний), перед массовой долей', () => {
    const ids = catalog.map((t) => t.id)
    expect(ids.indexOf('qualitative')).toBe(ids.indexOf('carbon-silicon') + 1)
    expect(ids.indexOf('mass-fraction')).toBe(ids.indexOf('qualitative') + 1)
  })
  it('есть тренировка разных типов и вариант в формате ОГЭ из 15 тестовых заданий', () => {
    expect(meta.theoryOnly).toBeFalsy()
    expect(content.practice.length).toBeGreaterThanOrEqual(10)
    expect(content.practice.length).toBeLessThanOrEqual(15)
    expect(new Set(content.practice.map((t) => t.type)).size).toBeGreaterThanOrEqual(5)
    expect(content.exam).toHaveLength(1)
    const tasks = content.exam[0].tasks
    expect(tasks).toHaveLength(15)
    for (const t of tasks) expect(['single', 'digits', 'match'], t.id).toContain(t.type)
    expect(meta.totalTasks).toBe(content.practice.length + tasks.length)
  })
  it('есть анимации и таблицы, цвета ячеек по размеру таблицы', () => {
    const blocks = content.lessons.flatMap((l) => l.blocks)
    const anims = blocks.flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(expect.arrayContaining(['ion-search', 'ion-tests', 'amphoteric-excess']))
    expect(blocks.filter((b) => b.kind === 'table').length).toBeGreaterThanOrEqual(3)
    for (const b of blocks)
      if (b.kind === 'table' && b.cellColors) {
        expect(b.cellColors).toHaveLength(b.rows.length)
        for (const r of b.cellColors) expect(r).toHaveLength(b.head.length)
      }
  })
  it('уравнения уравнены', () => {
    const eqs = [...new Set(strings(content).flatMap((s) => [...s.matchAll(CE)].map((m) => m[1].trim())))].filter((e) => /->|<=>/.test(e))
    expect(eqs.length).toBeGreaterThanOrEqual(15)
    for (const e of eqs) expect(isIonBalanced(e), e).toBe(true)
  })
  it('данные анимации: нейтральные растворы, есть реагирующая пара, ион из ION_TESTS', () => {
    for (const ex of QUAL_EXAMPLES) {
      expect(ION_TESTS.some((t) => t.ion === ex.ion), ex.ion).toBe(true)
      for (const side of [ex.sample, ex.reagent]) expect(side.ions.reduce((a, i) => a + charge(i.label) * i.n, 0), side.name).toBe(0)
      const reacting = [...ex.sample.ions, ...ex.reagent.ions].filter((i) => i.reacts)
      expect(reacting.length).toBe(2)
      expect(reacting.some((i) => i.label === ex.ion)).toBe(true)
    }
  })
  it('избыток щёлочи: амфотерные осадки растворяются, остальные нет; уравнения уравнены', () => {
    for (const c of EXCESS_CASES) {
      expect(c.stages.at(-1)!.precip === 0, c.ion).toBe(c.amphoteric)
      expect(Math.max(...c.stages.map((x) => x.precip))).toBe(c.stages[3].precip)
      for (const x of c.stages) if (x.eq) expect(isIonBalanced(x.eq), x.eq).toBe(true)
    }
  })
})
