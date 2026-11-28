import { describe, expect, it } from 'vitest'
import { OPS, SUBSTANCES, applyOp, elementFraction, molarMass, parseFormula, solutionFraction, solutionMass } from '../lib/massFraction'
import { catalog } from './catalog'
import content from './topics/mass-fraction'
import { practice } from './topics/mass-fraction.practice'
import { checkTask, fieldsOf } from '../lib/check'

describe('тема «Массовая доля»', () => {
  it('в каталоге, есть тренировка из 20 задач, анимации и таблицы', () => {
    const meta = catalog.find((t) => t.id === 'mass-fraction')!
    expect(meta.theoryOnly).toBeFalsy()
    expect(meta.totalTasks).toBe(20)
    expect(content.practice).toHaveLength(20)
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


  it('задачи: в каждой указано округление, ответ совпадает с расчётом по формулам', () => {
    const r = (x: number, d: number) => x.toFixed(d).replace('.', ',')
    const el: [string, string, number][] = [
      ['NaOH', 'Na', 1], ['Al2O3', 'O', 1], ['H2SO4', 'S', 1], ['(NH4)2SO4', 'N', 0], ['CaCl2', 'Cl', 0],
      ['CaCO3', 'C', 0], ['FeSO4', 'Fe', 1], ['H2O', 'H', 1], ['K2CO3', 'K', 1], ['Mg(OH)2', 'O', 0],
    ]
    const expected = [
      ...el.map(([f, e, d]) => r(elementFraction(f, e), d)),
      r((elementFraction('Ca3(PO4)2', 'P') / 100) * 62, 1),
      r((25 / 200) * 100, 1), r(0.08 * 250, 0), r(400 - 0.15 * 400, 0), r(18 / 0.12, 0),
      r((0.15 * 200) / 300 * 100, 0), r((0.1 * 250) / 200 * 100, 1), r((0.2 * 150 + 50) / 200 * 100, 0),
      r((0.2 * 150 + 0.1 * 350) / 500 * 100, 0), r((0.3 * 200) / 0.12 - 200, 0),
    ]
    expect(expected).toHaveLength(20)
    practice.forEach((t, i) => {
      expect(t.type).toBe('cells')
      if (t.type !== 'cells') return
      expect(t.question, t.id).toMatch(/округлите до (целых|десятых)/i)
      expect(fieldsOf(t)[0].accept[0], t.id).toBe(expected[i])
      expect(checkTask(t, [expected[i]]).correct, t.id).toBe(true)
      expect(checkTask(t, [expected[i].replace(',', '.')]).correct, t.id).toBe(true)
    })
  })
})
