import { describe, expect, it } from 'vitest'
import { SALTS, SERIES, displacement, posOf, withAcid, withWater } from '../lib/activity'
import { atomsOf, isBalanced } from '../lib/balance'
import { MATRIX, METALS, REAGENTS } from '../lib/matrix'
import { METAL_ATOMS, chargeOf, ionLabel } from '../lib/metalAtoms'
import { METAL_IDS, NONMETALS, REACTIONS } from '../lib/nonmetals'
import { GROUP_TITLES, SCENES, scenesOf, type GroupId } from '../lib/mechanisms'
import metals from './topics/metals'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())

describe('balance.ts', () => {
  it('считает атомы в сложных формулах', () => {
    expect(atomsOf('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 })
    expect(atomsOf('Na[Al(OH)4]')).toEqual({ Na: 1, Al: 1, O: 4, H: 4 })
  })
  it('отличает верное уравнение от неверного', () => {
    expect(isBalanced('2Al + 6HCl -> 2AlCl3 + 3H2 ^')).toBe(true)
    expect(isBalanced('Fe + 2HCl -> FeCl3 + H2 ^')).toBe(false)
    expect(isBalanced('Mg + 2H2O ->[t] Mg(OH)2 + H2 ^')).toBe(true)
  })
})

describe('тема «Металлы»: разметка', () => {
  it('формулы $…$ не вложены в жирный **…** (RichText их не разбирает)', () => {
    const bad = strings(metals).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
})

describe('тема «Металлы»: уравнения', () => {
  const texts = [
    ...strings(metals.lessons),
    ...metals.practice.map((t) => t.explanation),
    ...metals.exam.flatMap((v) => v.tasks.map((t) => t.explanation)),
  ]
  const eqs = [...new Set(texts.flatMap(equationsIn))].filter((e) => e.includes('->'))
  it('в теме есть уравнения', () => {
    expect(eqs.length).toBeGreaterThan(45)
  })
  for (const e of eqs) {
    it(`уравнено: ${e}`, () => {
      expect(isBalanced(e), e).toBe(true)
    })
  }
})

describe('механизмы реакций', () => {
  it('в каждой группе есть сцены', () => {
    for (const g of Object.keys(GROUP_TITLES) as GroupId[]) {
      if (g.startsWith('hal-') || g.startsWith('chal-')) continue // сцены галогенов и халькогенов — в своих тестах
      expect(scenesOf(g).length, g).toBeGreaterThan(0)
    }
  })
  it('id сцен уникальны', () => {
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(SCENES.length)
  })
  for (const sc of SCENES) {
    describe(sc.id, () => {
      it('уравнение уравнено', () => {
        if (!sc.eq.startsWith('\\')) expect(isBalanced(sc.eq), sc.eq).toBe(true)
      })
      it('электроны: отданные = принятые, есть перелёты на втором шаге', () => {
        const flights = sc.steps.flatMap((s) => s.e ?? [])
        const total = flights.reduce((a, f) => a + f.n, 0)
        expect(total).toBe(sc.electrons)
        if (sc.electrons > 0) expect(sc.steps[1].e?.length).toBeGreaterThan(0)
      })
      it('перелёты ссылаются на частицы шага', () => {
        for (const s of sc.steps) for (const f of s.e ?? []) {
          expect(s.sp[f.from], `${sc.id}: нет ${f.from}`).toBeDefined()
          expect(s.sp[f.to], `${sc.id}: нет ${f.to}`).toBeDefined()
        }
      })
      it('роли: у каждой сцены с реакцией есть окислитель и восстановитель', () => {
        if (sc.electrons === 0) return expect(sc.roles).toHaveLength(0)
        expect(sc.roles.map((r) => r.role).sort()).toEqual(['восстановитель', 'окислитель'])
      })
      it('на шагах есть заголовок и пояснение, 3–4 шага', () => {
        expect(sc.steps.length).toBeGreaterThanOrEqual(3)
        expect(sc.steps.length).toBeLessThanOrEqual(4)
        for (const s of sc.steps) {
          expect(s.title.length).toBeGreaterThan(0)
          expect(s.text.length).toBeGreaterThan(20)
        }
      })
      it('частицы и бейджи степеней окисления не обрезаются полем 640×260', () => {
        // радиус аниона 22 + бейдж сверху (12 + 9) ≈ запас 45 сверху; снизу радиус 22
        for (const s of sc.steps) for (const [id, p] of Object.entries(s.sp)) {
          expect(p.x, `${id}.x`).toBeGreaterThanOrEqual(24)
          expect(p.x, `${id}.x`).toBeLessThanOrEqual(616)
          expect(p.y, `${sc.id}/${id}.y=${p.y}`).toBeGreaterThanOrEqual(p.ox ? 45 : 24)
          expect(p.y, `${sc.id}/${id}.y=${p.y}`).toBeLessThanOrEqual(236)
        }
      })
    })
  }
})

describe('атомы металлов (анимация отдачи электронов)', () => {
  it('слои в сумме дают заряд ядра, отдаётся не больше, чем есть', () => {
    for (const m of METAL_ATOMS) {
      expect(m.sh.reduce((a, b) => a + b, 0), m.id).toBe(m.z)
      expect(m.take).toHaveLength(m.sh.length)
      m.take.forEach((t, i) => expect(t, `${m.id}[${i}]`).toBeLessThanOrEqual(m.sh[i]))
    }
  })
  it('заряды ионов: Na⁺, K⁺, Mg²⁺, Ca²⁺, Al³⁺, Fe²⁺, Fe³⁺', () => {
    expect(METAL_ATOMS.map((m) => ionLabel(m.sym, chargeOf(m)))).toEqual(['Na⁺', 'K⁺', 'Mg²⁺', 'Ca²⁺', 'Al³⁺', 'Fe²⁺', 'Fe³⁺'])
  })
})

describe('продукты реакций с неметаллами (интерактив)', () => {
  it('все уравнения уравнены, у каждой пары есть пояснение', () => {
    for (const m of METAL_IDS) for (const n of NONMETALS) {
      const r = REACTIONS[m][n.id]
      expect(r.note.length, `${m}+${n.id}`).toBeGreaterThan(10)
      if (r.eq) expect(isBalanced(r.eq), `${m}+${n.id}: ${r.eq}`).toBe(true)
    }
  })
  it('совпадает с таблицей в уроке: какие пары не реагируют', () => {
    const none = (m: (typeof METAL_IDS)[number]) => NONMETALS.filter((n) => !REACTIONS[m][n.id].eq).map((n) => n.id)
    expect(none('Na')).toEqual(['n2'])
    expect(none('K')).toEqual(['n2'])
    expect(none('Mg')).toEqual(['h2'])
    expect(none('Ca')).toEqual([])
    expect(none('Al')).toEqual(['h2', 'n2'])
    expect(none('Fe')).toEqual(['h2', 'n2'])
  })
  it('ловушки: Na/K с O₂, Fe с O₂, Cl₂ и S', () => {
    expect(REACTIONS.Fe.cl2.eq).toBe('2Fe + 3Cl2 -> 2FeCl3')
    expect(REACTIONS.Fe.s.eq).toBe('Fe + S -> FeS')
    expect(REACTIONS.Na.o2.eq).toBe('2Na + O2 -> Na2O2')
    expect(REACTIONS.Fe.cl2.trap && REACTIONS.Fe.s.trap && REACTIONS.Na.o2.trap).toBe(true)
  })
})

describe('ряд напряжений', () => {
  it('порядок: Na левее Mg, Fe левее Cu, водород между Pb и Cu', () => {
    expect(posOf('Na')).toBeLessThan(posOf('Mg'))
    expect(posOf('Fe')).toBeLessThan(posOf('Cu'))
    expect(SERIES[posOf('Pb') + 1].sym).toBe('Cu')
  })
  it('уравнения вытеснения уравнены', () => {
    for (const a of SERIES.filter((m) => m.water !== 'cold').map((m) => m.sym)) {
      for (const salt of SALTS) {
        const eq = displacement(a, salt)
        if (posOf(a) >= posOf(salt.metal)) expect(eq, `${a}+${salt.label}`).toBeNull()
        else expect(isBalanced(eq!), `${a}+${salt.label}: ${eq}`).toBe(true)
      }
    }
  })
  it('известные уравнения', () => {
    expect(displacement('Fe', SALTS[0])).toBe('Fe + CuSO4 -> FeSO4 + Cu')
    expect(displacement('Al', SALTS[0])).toBe('2Al + 3CuSO4 -> Al2(SO4)3 + 3Cu')
    expect(displacement('Cu', SALTS[4])).toBe('Cu + 2AgNO3 -> Cu(NO3)2 + 2Ag')
    expect(displacement('Mg', SALTS[1])).toBe('Mg + FeCl2 -> MgCl2 + Fe')
    expect(displacement('Cu', SALTS[1])).toBeNull()
  })
  it('уравнения с кислотой и водой уравнены', () => {
    for (const m of SERIES) {
      const acid = withAcid(m.sym)
      if (posOf(m.sym) < posOf('Cu')) expect(isBalanced(acid!), acid!).toBe(true)
      else expect(acid).toBeNull()
      const w = withWater(m.sym)
      if (w.eq) expect(isBalanced(w.eq), w.eq).toBe(true)
    }
    expect(withAcid('Al')).toBe('2Al + 6HCl -> 2AlCl3 + 3H2 ^')
    expect(withAcid('Fe')).toBe('Fe + 2HCl -> FeCl2 + H2 ^')
  })
})

describe('сводная таблица реакций', () => {
  it('уравнения в клетках уравнены', () => {
    for (const m of METALS) for (const r of REAGENTS) {
      const c = MATRIX[m][r.id]
      for (const e of c.eq ?? []) expect(isBalanced(e), `${m}/${r.id}: ${e}`).toBe(true)
    }
  })
  it('«+» и «В» имеют уравнения, кроме серы с медью', () => {
    for (const m of METALS) for (const r of REAGENTS) {
      const c = MATRIX[m][r.id]
      if (c.mark === '−') expect(c.eq, `${m}/${r.id}`).toBeUndefined()
      else if (!(m === 'Cu' && r.id === 's')) expect(c.eq?.length, `${m}/${r.id}`).toBeGreaterThan(0)
    }
  })
  it('совпадает с таблицей из листа: Na, Ca, Mg, Al, Fe, Cu', () => {
    const row = (m: (typeof METALS)[number]) => REAGENTS.map((r) => MATRIX[m][r.id].mark).join(' ')
    expect(row('Na')).toBe('+ + В В + +')
    expect(row('Ca')).toBe('+ + В В + +')
    expect(row('Mg')).toBe('− + − + + +')
    expect(row('Al')).toBe('− + + + + +')
    expect(row('Fe')).toBe('− + − + + +')
    expect(row('Cu')).toBe('− − − − + +')
  })
})

describe('экзамен по металлам', () => {
  it('ответы заданий 8 и ключи листа: 20 заданий в двух вариантах', () => {
    const answers = metals.exam.flatMap((v) => v.tasks.map((t) => ('answer' in t ? t.answer : '')))
    expect(answers).toEqual([
      '13', '24', '25', '23', '34',
      '431', '341', '241',
      '421', '234',
      '14', '24', '35', '25',
      '531', '325', '321',
      '431', '413', '341',
    ])
  })
})
