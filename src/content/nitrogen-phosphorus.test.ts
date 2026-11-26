import { describe, expect, it } from 'vitest'
import { isBalanced } from '../lib/balance'
import { excitedElements, stateAt, unpaired } from '../lib/excited'
import { GROUP_TITLES } from '../lib/mechanisms'
import { PN_SCENES, pnScenesOf, type PnGroup } from '../lib/pnictogenScenes'
import { AMOUNT_CASES, PN_LEVELS, PN_REACTIONS, PNICTOGENS } from '../lib/pnictogens'
import { catalog } from './catalog'
import content from './topics/nitrogen-phosphorus'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())
/** полное уравнение (в заданиях бывают «заготовки» вида «N2 + H2 ->» — их не проверяем) */
const isReaction = (e: string) => {
  const parts = e.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  return parts.length === 2 && parts[1].trim() !== '' && !e.includes('e-')
}

describe('тема «Азот и фосфор»: структура', () => {
  const meta = catalog.find((t) => t.id === 'nitrogen-phosphorus')!
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
  it('нет реакций за пределами программы (фосфор со щелочью, фосфор с водородом, азот с хлором как идущая реакция)', () => {
    const eqs = strings(content).flatMap(equationsIn).filter(isReaction)
    expect(eqs.filter((e) => /P4? \+ \d*NaOH|NaOH \+ P|P \+ \d*H2 ->|H2 \+ P/.test(e))).toEqual([])
    expect(eqs.filter((e) => /N2 \+ \d*Cl2|Cl2 \+ N2/.test(e))).toEqual([])
  })
})

describe('тема «Азот и фосфор»: уравнения уравнены', () => {
  const fromLessons = strings(content.lessons).flatMap(equationsIn)
  const fromTasks = strings([content.practice, content.exam]).flatMap(equationsIn)
  const fromData = [...PN_REACTIONS, ...AMOUNT_CASES].map((x) => x.eq)
  const eqs = [...new Set([...fromLessons, ...fromTasks, ...fromData])].filter(isReaction)
  it('уравнений достаточно', () => {
    expect(eqs.length).toBeGreaterThan(30)
  })
  for (const e of eqs) {
    it(`уравнено: ${e}`, () => {
      expect(isBalanced(e) ?? true, e).toBe(true)
    })
  }
})

describe('данные об азоте и фосфоре', () => {
  it('5 внешних электронов, сумма электронов = заряд ядра, закономерности N → P', () => {
    for (const c of PNICTOGENS) {
      expect(c.shells[c.shells.length - 1], c.sym).toBe(5)
      expect(c.shells.reduce((a, b) => a + b, 0), c.sym).toBe(c.z)
    }
    const [n, p] = PNICTOGENS
    expect(p.r).toBeGreaterThan(n.r)
    expect(p.eo).toBeLessThan(n.eo)
  })
  it('возбуждённые состояния: у N — только III, у P — III и V', () => {
    const N = excitedElements.find((e) => e.sym === 'N')!
    const P = excitedElements.find((e) => e.sym === 'P')!
    expect(N.moves).toHaveLength(0)
    expect(unpaired(stateAt(N, 0))).toBe(3)
    expect([0, 1].map((k) => unpaired(stateAt(P, k)))).toEqual([3, 5])
  })
  it('роли согласованы со степенью окисления, ступени лестницы есть для каждой реакции', () => {
    for (const r of PN_REACTIONS) {
      expect(r.role, r.id).toBe(r.to === '−3' ? 'окислитель' : 'восстановитель')
      expect(PN_LEVELS[r.el].map((l) => l.ox), r.id).toContain(r.to)
    }
  })
  it('избыток окислителя → +5, недостаток → +3; число молекул окислителя совпадает со с. о.', () => {
    for (const c of AMOUNT_CASES) {
      expect(c.pOx).toBe(c.lack ? '+3' : '+5')
      expect(c.molecules).toBe(c.lack ? 3 : 5)
    }
  })
})

describe('механизмы реакций азота и фосфора', () => {
  const groups = Object.keys(GROUP_TITLES).filter((g) => g.startsWith('pn-')) as PnGroup[]
  it('в каждой группе есть сцены, id уникальны', () => {
    expect(groups).toHaveLength(2)
    for (const g of groups) expect(pnScenesOf(g).length, g).toBeGreaterThan(0)
    expect(new Set(PN_SCENES.map((s) => s.id)).size).toBe(PN_SCENES.length)
  })
  for (const sc of PN_SCENES) {
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
