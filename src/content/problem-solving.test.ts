import { describe, expect, it } from 'vitest'
import { isBalanced } from '../lib/balance'
import { AR, parseFormula } from '../lib/massFraction'
import { BRIDGE, BRIDGE_REACTIONS, PROBLEMS, SOLUTION_EXAMPLE, num } from '../lib/problems'
import { catalog } from './catalog'
import content from './topics/problem-solving'

const M = (formula: string) => parseFormula(formula).reduce((s, p) => s + AR[p.el] * p.n, 0)
const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g

describe('тема «Решение задач»', () => {
  const blocks = content.lessons.flatMap((l) => l.blocks)

  it('идёт после «Массовой доли», пока только теория', () => {
    const ids = catalog.map((t) => t.id)
    expect(ids.indexOf('problem-solving')).toBe(ids.indexOf('mass-fraction') + 1)
    expect(catalog.find((t) => t.id === 'problem-solving')!.theoryOnly).toBe(true)
    expect(content.practice).toEqual([])
    expect(content.exam).toEqual([])
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
