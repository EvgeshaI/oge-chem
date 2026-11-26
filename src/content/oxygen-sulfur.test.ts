import { describe, expect, it } from 'vitest'
import { isBalanced } from '../lib/balance'
import { BURN_COMPLEX, BURN_SIMPLE, CHALCOGENS, SULFUR_REACTIONS } from '../lib/chalcogens'
import { CHAL_SCENES, chalScenesOf, type ChalGroup } from '../lib/chalcogenScenes'
import { excitedElements, stateAt, unpaired } from '../lib/excited'
import { GROUP_TITLES } from '../lib/mechanisms'
import { catalog } from './catalog'
import content from './topics/oxygen-sulfur'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())
/** полное уравнение (в заданиях бывают «заготовки» вида «Mg + O2 ->» — их не проверяем) */
const isReaction = (e: string) => {
  const parts = e.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  return parts.length === 2 && parts[1].trim() !== '' && !e.includes('e-')
}

describe('тема «Кислород и сера»: структура', () => {
  const meta = catalog.find((t) => t.id === 'oxygen-sulfur')!
  it('есть в каталоге, счётчик заданий верный', () => {
    expect(meta).toBeDefined()
    expect(meta.theoryOnly).toBeFalsy()
    expect(meta.totalTasks).toBe(content.practice.length + content.exam.reduce((a, v) => a + v.tasks.length, 0))
  })
  it('уроки, тренировка и два варианта по 10 заданий', () => {
    expect(content.lessons.length).toBeGreaterThanOrEqual(10)
    expect(content.practice.length).toBeGreaterThanOrEqual(15)
    expect(content.exam).toHaveLength(2)
    for (const v of content.exam) expect(v.tasks).toHaveLength(10)
  })
  it('тренировка — без тестовых форматов, варианты — в формате заданий 8–10', () => {
    for (const t of content.practice) expect(['digits', 'single', 'match', 'order'], t.id).not.toContain(t.type)
    for (const v of content.exam) for (const t of v.tasks) expect(['digits', 'match'], t.id).toContain(t.type)
  })
  it('в теме есть анимации и иллюстрации', () => {
    const kinds = content.lessons.flatMap((l) => l.blocks.map((b) => b.kind))
    expect(kinds).toContain('animation')
    expect(kinds).toContain('image')
  })
  it('формулы $…$ не вложены в жирный **…** (RichText их не разбирает)', () => {
    const bad = strings(content).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
  it('нет реакций за пределами программы (озон с иодидом, сера с галогенами и щелочами)', () => {
    const all = strings(content).join('\n')
    expect(all).not.toMatch(/O3 \+ 2?KI|KI \+ O3/)
    expect(all).not.toMatch(/S \+ (3)?F2|S \+ Cl2|S \+ (6)?NaOH/)
  })
})

describe('тема «Кислород и сера»: уравнения уравнены', () => {
  const fromLessons = strings(content.lessons).flatMap(equationsIn)
  const fromTasks = strings([content.practice, content.exam]).flatMap(equationsIn)
  const fromData = [...BURN_SIMPLE, ...BURN_COMPLEX, ...SULFUR_REACTIONS].map((x) => x.eq)
  const eqs = [...new Set([...fromLessons, ...fromTasks, ...fromData])].filter(isReaction)
  it('уравнений достаточно', () => {
    expect(eqs.length).toBeGreaterThan(40)
  })
  for (const e of eqs) {
    it(`уравнено: ${e}`, () => {
      expect(isBalanced(e) ?? true, e).toBe(true)
    })
  }
})

describe('данные о кислороде и сере', () => {
  it('6 внешних электронов, сумма электронов = заряд ядра, закономерности O → S', () => {
    for (const c of CHALCOGENS) {
      expect(c.shells[c.shells.length - 1], c.sym).toBe(6)
      expect(c.shells.reduce((a, b) => a + b, 0), c.sym).toBe(c.z)
    }
    const [o, s] = CHALCOGENS
    expect(s.r).toBeGreaterThan(o.r)
    expect(s.eo).toBeLessThan(o.eo)
  })
  it('возбуждённые состояния: у O — только II, у S — II, IV, VI', () => {
    const O = excitedElements.find((e) => e.sym === 'O')!
    const S = excitedElements.find((e) => e.sym === 'S')!
    expect(O.moves).toHaveLength(0)
    expect(unpaired(stateAt(O, 0))).toBe(2)
    expect([0, 1, 2].map((k) => unpaired(stateAt(S, k)))).toEqual([2, 4, 6])
  })
  it('роли серы согласованы со степенью окисления', () => {
    for (const r of SULFUR_REACTIONS) expect(r.role, r.id).toBe(r.to === '−2' ? 'окислитель' : 'восстановитель')
  })
})

describe('механизмы реакций кислорода и серы', () => {
  const groups = Object.keys(GROUP_TITLES).filter((g) => g.startsWith('chal-')) as ChalGroup[]
  it('в каждой группе есть сцены, id уникальны', () => {
    expect(groups).toHaveLength(2)
    for (const g of groups) expect(chalScenesOf(g).length, g).toBeGreaterThan(0)
    expect(new Set(CHAL_SCENES.map((s) => s.id)).size).toBe(CHAL_SCENES.length)
  })
  for (const sc of CHAL_SCENES) {
    describe(sc.id, () => {
      it('уравнение уравнено', () => {
        expect(isBalanced(sc.eq) ?? true, sc.eq).toBe(true)
      })
      it('электроны: сумма перелётов = electrons, перелёты на втором шаге', () => {
        const total = sc.steps.flatMap((s) => s.e ?? []).reduce((a, f) => a + f.n, 0)
        expect(total).toBe(sc.electrons)
        expect(sc.steps[1].e?.length).toBeGreaterThan(0)
      })
      it('перелёты ссылаются на частицы шага', () => {
        for (const s of sc.steps) for (const f of s.e ?? []) {
          expect(s.sp[f.from], `${sc.id}: нет ${f.from}`).toBeDefined()
          expect(s.sp[f.to], `${sc.id}: нет ${f.to}`).toBeDefined()
        }
      })
      it('роли: окислитель и восстановитель', () => {
        expect(sc.roles.map((r) => r.role).sort()).toEqual(['восстановитель', 'окислитель'])
      })
      it('частицы не обрезаются полем 640×260 и есть на каждом шаге', () => {
        const ids = new Set(sc.steps.flatMap((s) => Object.keys(s.sp)))
        for (const s of sc.steps) {
          expect(Object.keys(s.sp).length, sc.id).toBe(ids.size)
          for (const [id, p] of Object.entries(s.sp)) {
            expect(p.x, `${sc.id}/${id}.x`).toBeGreaterThanOrEqual(24)
            expect(p.x, `${sc.id}/${id}.x`).toBeLessThanOrEqual(616)
            expect(p.y, `${sc.id}/${id}.y`).toBeGreaterThanOrEqual(p.ox ? 45 : 24)
            expect(p.y, `${sc.id}/${id}.y`).toBeLessThanOrEqual(236)
          }
        }
      })
    })
  }
})
