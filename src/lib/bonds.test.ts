import { describe, expect, it } from 'vitest'
import { ELEMENTS, electronsOf, geometry, shellsOf, substances, unpairedOf, valenceOf } from './bonds'

describe('образование связей', () => {
  for (const s of substances) {
    it(`${s.formula}: валентность = число неспаренных электронов`, () => {
      s.atoms.forEach((a, i) => {
        const sh = shellsOf(a.el, !!a.excited)
        expect(unpairedOf(sh), `${s.formula} атом ${i} (${a.el})`).toBe(valenceOf(s, i))
      })
    })
    it(`${s.formula}: внешние электроны = неподелённые пары + валентность`, () => {
      s.atoms.forEach((a, i) => {
        const total = electronsOf(shellsOf(a.el, !!a.excited))
        expect(total, `${s.formula} ${a.el}`).toBe(2 * ELEMENTS[a.el].lonePairs + valenceOf(s, i))
      })
    })
    it(`${s.formula}: число общих пар = сумма кратностей, неподелённых пар достаточно`, () => {
      const g = geometry(s)
      expect(g.pairs.length).toBe(s.bonds.reduce((a, b) => a + b.order, 0))
      expect(g.lone.length).toBe(s.atoms.reduce((a, t) => a + ELEMENTS[t.el].lonePairs, 0))
    })
  }
  it('углерод возбуждается: 2 → 4 неспаренных', () => {
    expect(unpairedOf(shellsOf('C', false))).toBe(2)
    expect(unpairedOf(shellsOf('C', true))).toBe(4)
    expect(electronsOf(shellsOf('C', false))).toBe(electronsOf(shellsOf('C', true)))
  })
})
