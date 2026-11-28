import { describe, expect, it } from 'vitest'
import { isBalanced } from '../lib/balance'
import { checkTask, fieldsOf } from '../lib/check'
import { AR, parseFormula } from '../lib/massFraction'
import { BRIDGE, BRIDGE_REACTIONS, PROBLEMS, SOLUTION_EXAMPLE, num } from '../lib/problems'
import { catalog } from './catalog'
import content from './topics/problem-solving'

const M = (formula: string) => parseFormula(formula).reduce((s, p) => s + AR[p.el] * p.n, 0)
const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g

describe('тема «Решение задач»', () => {
  const blocks = content.lessons.flatMap((l) => l.blocks)

  it('идёт после «Массовой доли», есть тренировка из 20 задач, вариантов ОГЭ нет', () => {
    const ids = catalog.map((t) => t.id)
    const meta = catalog.find((t) => t.id === 'problem-solving')!
    expect(ids.indexOf('problem-solving')).toBe(ids.indexOf('mass-fraction') + 1)
    expect(meta.theoryOnly).toBeFalsy()
    expect(meta.totalTasks).toBe(20)
    expect(content.practice).toHaveLength(20)
    expect(content.exam).toEqual([])
  })

  it('тренировка: одно поле ответа, указано округление, ответ совпадает с расчётом', () => {
    // моли вещества в растворе массой m с массовой долей w (в процентах)
    const sol = (m: number, w: number, formula: string) => (m * w) / 100 / M(formula)
    const values = [
      49 / M('H2SO4'),
      0.25 * M('CaCO3'),
      (11 / M('CO2')) * 22.4,
      sol(150, 8, 'NaOH'),
      0.6 / 2,
      (4.8 / AR.Mg) * M('MgO'),
      (13 / AR.Zn) * 22.4,
      (((6.72 / 22.4) * 2) / 3) * AR.Al,
      sol(208, 10, 'BaCl2') * M('BaSO4'),
      sol(150, 11.1, 'CaCl2') * M('CaCO3'),
      sol(80, 20, 'CuSO4') * M('Cu(OH)2'),
      sol(106, 5, 'Na2CO3') * 22.4,
      (sol(150, 14.6, 'HCl') / 2) * 22.4,
      (((28.7 / M('AgCl') / 2) * M('CaCl2')) / 150) * 100,
      (((46.6 / M('BaSO4')) * M('H2SO4')) / 196) * 100,
      (((3.36 / 22.4) * M('Na2CO3')) / 80) * 100,
      (sol(98, 10, 'H2SO4') * 2 * M('NaOH')) / 0.1,
      ((8 / M('CuO')) * 2 * M('HCl')) / 0.073,
      (((6.5 / AR.Zn) * M('ZnCl2')) / (6.5 + 100 - (6.5 / AR.Zn) * M('H2'))) * 100,
      ((sol(100, 16, 'CuSO4') * M('Na2SO4')) / (100 + 80 - sol(100, 16, 'CuSO4') * M('Cu(OH)2'))) * 100,
    ]
    // в последней задаче щёлочи ровно вдвое больше по молям, чем сульфата меди
    expect(sol(80, 10, 'NaOH')).toBeCloseTo(2 * sol(100, 16, 'CuSO4'))
    const DIGITS: Record<string, number> = { целых: 0, десятых: 1, сотых: 2 }
    expect(values).toHaveLength(content.practice.length)
    content.practice.forEach((t, i) => {
      expect(t.type, t.id).toBe('cells')
      if (t.type !== 'cells') return
      const round = t.question.match(/округлите до (целых|десятых|сотых)\.$/)
      expect(round, `${t.id}: не указано округление`).not.toBeNull()
      const expected = values[i].toFixed(DIGITS[round![1]]).replace('.', ',')
      const fields = fieldsOf(t)
      expect(fields, t.id).toHaveLength(1)
      expect(fields[0].accept, t.id).toEqual([expected])
      expect(checkTask(t, [expected]).correct, t.id).toBe(true)
      expect(checkTask(t, [expected.replace(',', '.')]).correct, t.id).toBe(true)
      expect(checkTask(t, [expected.replace(',', '')]).correct, `${t.id}: запятая важна`).toBe(!expected.includes(','))
      expect(t.explanation, t.id).toContain(`Ответ: **${expected}`)
    })
  })

  it('пять разобранных задач, у каждой своя анимация', () => {
    expect(PROBLEMS).toHaveLength(5)
    const anims = blocks.flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(['mole-bridge', 'solution-substance', ...[1, 2, 3, 4, 5].map((n) => `problem-chain-${n}`)])
    expect(content.lessons.filter((l) => /\.task\d$/.test(l.id))).toHaveLength(5)
  })

  it('цвета ячеек по размеру таблицы', () => {
    for (const b of blocks) {
      if (b.kind !== 'table') continue
      for (const r of b.rows) expect(r).toHaveLength(b.head.length)
      if (!b.cellColors) continue
      expect(b.cellColors).toHaveLength(b.rows.length)
      for (const r of b.cellColors) expect(r).toHaveLength(b.head.length)
    }
  })

  it('все уравнения уравнены', () => {
    const eqs = [
      ...[...JSON.stringify(content).replaceAll('\\\\', '\\').matchAll(CE)].map((m) => m[1]),
      ...PROBLEMS.map((p) => p.eq),
      ...BRIDGE_REACTIONS.map((r) => r.eq),
    ].filter((e) => e.includes('->'))
    expect(eqs.length).toBeGreaterThanOrEqual(12)
    for (const e of eqs) expect(isBalanced(e), e).toBe(true)
  })

  it('мост через моли: молярные массы, коэффициенты и сохранение массы', () => {
    for (const r of BRIDGE_REACTIONS) {
      for (const s of r.species) {
        expect(M(s.f), s.f).toBe(s.M)
        expect(r.eq).toContain(`${s.k > 1 ? s.k : ''}${s.f}`)
      }
      const side = (list: typeof r.species) => list.reduce((a, s) => a + s.k * s.M, 0)
      expect(side(r.species.slice(0, r.nLeft))).toBeCloseTo(side(r.species.slice(r.nLeft)))
    }
  })

  it('ответы задач совпадают с расчётом', () => {
    const answers = [
      // 1: масса осадка
      `${num(((200 * 0.106) / M('Na2CO3')) * M('CaCO3'))} г`,
      // 2: объём газа, HCl : CO2 = 2 : 1
      `${num(((73 * 0.1) / M('HCl') / 2) * 22.4)} л`,
      // 3: массовая доля по осадку
      `${num((((14.35 / M('AgCl')) * M('AgNO3')) / 170) * 100)}%`,
      // 4: масса раствора щёлочи, NaOH : CuSO4 = 2 : 1
      `${num((((160 * 0.2) / M('CuSO4')) * 2 * M('NaOH')) / 0.2)} г`,
      // 5: массовая доля в полученном растворе
      `${num((((10 / M('CaCO3')) * M('CaCl2')) / (10 + 94.4 - (10 / M('CaCO3')) * M('CO2'))) * 100, 1)}%`,
    ]
    expect(answers).toEqual(['20 г', '2,24 л', '10%', '80 г', '11,1%'])
    PROBLEMS.forEach((p, i) => {
      expect(p.answer, p.id).toContain(answers[i])
      expect(p.rows.at(-1)!.links.at(-1)!.box, p.id).toContain(answers[i])
    })
  })

  it('между разными веществами — только переход по уравнению, от молей к молям', () => {
    for (const p of PROBLEMS)
      for (const row of p.rows) {
        const prevRows = p.rows.slice(0, p.rows.indexOf(row)).flatMap((r) => r.links)
        row.links.forEach((link, i) => {
          if (link.how !== BRIDGE) return
          expect(link.kind, `${p.id}: ${link.box}`).toBe('amount')
          const before = i > 0 ? [row.links[i - 1]] : prevRows
          expect(before.some((b) => b.kind === 'amount'), `${p.id}: ${link.box}`).toBe(true)
        })
      }
  })

  it('пример «раствор или вещество»', () => {
    const { mSolution, w, M: molar, productM } = SOLUTION_EXAMPLE
    expect(molar).toBe(M('Na2CO3'))
    expect(productM).toBe(M('CaCO3'))
    expect(((mSolution * w) / molar) * productM).toBeCloseTo(20)
  })
})
