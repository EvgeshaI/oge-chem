import { describe, expect, it } from 'vitest'
import { CELLS_IN, LAYER_SUBS, electronsIn, excitedElements, formulaOf, stateAt, unpaired } from './excited'

const VALENCES: Record<string, number[]> = {
  Be: [0, 2], B: [1, 3], C: [2, 4], N: [3], O: [2], F: [1], Al: [1, 3], Si: [2, 4], P: [3, 5], S: [2, 4, 6], Cl: [1, 3, 5, 7],
}

describe('возбуждённые состояния', () => {
  for (const el of excitedElements) {
    it(`${el.sym}: конфигурации корректны`, () => {
      const inner = el.layer === 2 ? 2 : 10
      for (let k = 0; k <= el.moves.length; k++) {
        const s = stateAt(el, k)
        for (const sub of LAYER_SUBS[el.layer]) {
          const cells = s[sub]!
          expect(cells.length, `${el.sym} ${sub}`).toBe(CELLS_IN[sub[1]])
          for (const n of cells) expect(n >= 0 && n <= 2, `${el.sym} k=${k} ${sub}`).toBe(true)
        }
        expect(electronsIn(s) + inner, `${el.sym} k=${k}: сумма электронов = Z`).toBe(el.z)
      }
    })
    it(`${el.sym}: число неспаренных электронов`, () => {
      const got = Array.from({ length: el.moves.length + 1 }, (_, k) => unpaired(stateAt(el, k)))
      expect(got).toEqual(VALENCES[el.sym])
    })
    it(`${el.sym}: переходы идут с занятых ячеек на свободные`, () => {
      let s = stateAt(el, 0)
      el.moves.forEach(([fs, fc, ts, tc], i) => {
        expect(s[fs]![fc], `${el.sym} переход ${i + 1}: источник`).toBeGreaterThan(0)
        expect(s[ts]![tc], `${el.sym} переход ${i + 1}: приёмник`).toBe(0)
        s = stateAt(el, i + 1)
      })
    })
  }
  it('формулы', () => {
    const s = excitedElements.find((e) => e.sym === 'S')!
    expect(formulaOf(s, stateAt(s, 0))).toBe('1s²2s²2p⁶3s²3p⁴')
    expect(formulaOf(s, stateAt(s, 2))).toBe('1s²2s²2p⁶3s¹3p³3d²')
  })
})
