import { describe, expect, it } from 'vitest'
import { OPS, SUBSTANCES, applyOp, elementFraction, molarMass, parseFormula, solutionFraction, solutionMass } from '../lib/massFraction'
import { catalog } from './catalog'
import content from './topics/mass-fraction'

describe('тема «Массовая доля»', () => {
  it('в каталоге, только теория, есть анимации и таблицы', () => {
    const meta = catalog.find((t) => t.id === 'mass-fraction')!
    expect(meta.theoryOnly).toBe(true)
    expect(content.practice).toEqual([])
    const blocks = content.lessons.flatMap((l) => l.blocks)
    const anims = blocks.flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(['element-fraction', 'solution-mixer', 'fraction-triangle', 'solution-changes'])
    for (const b of blocks)
      if (b.kind === 'table' && b.cellColors) {
        expect(b.cellColors).toHaveLength(b.rows.length)
        for (const r of b.cellColors) expect(r).toHaveLength(b.head.length)
      }
  })

  it('разбор формул со скобками', () => {
    expect(parseFormula('Ca3(PO4)2')).toEqual([
      { el: 'Ca', n: 3 },
      { el: 'P', n: 2 },
      { el: 'O', n: 8 },
    ])
    expect(parseFormula('NH4NO3')).toEqual([
      { el: 'N', n: 2 },
      { el: 'H', n: 4 },
      { el: 'O', n: 3 },
    ])
    expect(molarMass(parseFormula('Al2(SO4)3'))).toBe(342)
  })

  it('числа в разобранных примерах верны', () => {
    const r1 = (x: number) => Math.round(x * 10) / 10
    expect(r1(elementFraction('H2O', 'O'))).toBe(88.9)
    expect(r1(elementFraction('H2SO4', 'O'))).toBe(65.3)
    expect(elementFraction('Ca3(PO4)2', 'P')).toBe(20)
    expect(elementFraction('NH4NO3', 'N')).toBe(35)
    expect(elementFraction('Fe2O3', 'Fe')).toBe(70)
    expect(r1(elementFraction('NH3', 'N'))).toBe(82.4)
    expect(r1(elementFraction('NH4Cl', 'N'))).toBe(26.2)
    expect(r1(elementFraction('HNO3', 'N'))).toBe(22.2)
    for (const s of SUBSTANCES) {
      const sum = parseFormula(s.formula).reduce((a, p) => a + elementFraction(s.formula, p.el), 0)
      expect(sum).toBeCloseTo(100)
    }
  })

  it('операции с растворами', () => {
    const res = Object.fromEntries(OPS.map((o) => [o.id, solutionFraction(applyOp(o))]))
    expect(res).toEqual({ water: 8, evaporate: 20, salt: 20, mix: 22 })
    for (const o of OPS) expect(solutionFraction(o.start)).toBe(10)
    expect(solutionMass(applyOp(OPS[3]))).toBe(500)
  })

})
