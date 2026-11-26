import { describe, expect, it } from 'vitest'
import { isBalanced } from '../lib/balance'
import { CS_SCENES, csScenesOf, type CsGroup } from '../lib/carbonScenes'
import { BURN_CASES, CARBON_LIMIT, ACTIVITY, CS_LEVELS, CS_REACTIONS, LAB_CASES, REDUCTION_CASES, TETRELS } from '../lib/carbonSilicon'
import { excitedElements, stateAt, unpaired } from '../lib/excited'
import { GROUP_TITLES } from '../lib/mechanisms'
import { catalog } from './catalog'
import content from './topics/carbon-silicon'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())
/** полное уравнение (в заданиях бывают «заготовки» вида «C + O2 ->» — их не проверяем) */
const isReaction = (e: string) => {
  const parts = e.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  return parts.length === 2 && parts[1].trim() !== '' && !e.includes('e-')
}

describe('тема «Углерод и кремний»: структура', () => {
  const meta = catalog.find((t) => t.id === 'carbon-silicon')!
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
  it('нет реакций за пределами программы (Si с кислотами, C со щелочами, гидролиз карбидов)', () => {
    const eqs = strings(content).flatMap(equationsIn).filter(isReaction)
    expect(eqs.filter((e) => /^Si \+ \d*(HCl|H2SO4|HNO3|HF)/.test(e))).toEqual([])
    expect(eqs.filter((e) => /^C \+ \d*(NaOH|KOH|HCl)/.test(e))).toEqual([])
    expect(eqs.filter((e) => /(CaC2|Al4C3) \+ \d*H2O/.test(e))).toEqual([])
  })
})

describe('тема «Углерод и кремний»: уравнения уравнены', () => {
  const fromLessons = strings(content.lessons).flatMap(equationsIn)
  const fromTasks = strings([content.practice, content.exam]).flatMap(equationsIn)
  const fromData = [...CS_REACTIONS, ...BURN_CASES, ...REDUCTION_CASES, ...LAB_CASES].flatMap((x) => (x.eq ? [x.eq] : []))
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

describe('данные об углероде и кремнии', () => {
  it('4 внешних электрона, сумма электронов = заряд ядра, закономерности C → Si', () => {
    for (const c of TETRELS) {
      expect(c.shells[c.shells.length - 1], c.sym).toBe(4)
      expect(c.shells.reduce((a, b) => a + b, 0), c.sym).toBe(c.z)
    }
    const [c, si] = TETRELS
    expect(si.r).toBeGreaterThan(c.r)
    expect(si.eo).toBeLessThan(c.eo)
  })
  it('возбуждённые состояния: у C и Si валентность II → IV', () => {
    for (const sym of ['C', 'Si']) {
      const el = excitedElements.find((e) => e.sym === sym)!
      expect([0, 1].map((k) => unpaired(stateAt(el, k))), sym).toEqual([2, 4])
    }
  })
  it('роли согласованы со степенью окисления, ступени лестницы есть для каждой реакции', () => {
    for (const r of CS_REACTIONS) {
      expect(r.role, r.id).toBe(r.to.startsWith('−') ? 'окислитель' : 'восстановитель')
      expect(CS_LEVELS[r.el].map((l) => l.ox), r.id).toContain(r.to)
    }
  })
  it('горение: CO₂ → +4, CO → +2', () => {
    for (const b of BURN_CASES) expect(b.cOx, b.id).toBe(b.product === 'CO₂' ? '+4' : '+2')
  })
  it('углём восстанавливаются только металлы правее алюминия', () => {
    for (const r of REDUCTION_CASES) {
      expect(r.reacts, r.sym).toBe(ACTIVITY.indexOf(r.sym) > CARBON_LIMIT)
      expect(Boolean(r.eq), r.sym).toBe(r.reacts)
    }
  })
  it('опыт: углерод — только с HNO₃, кремний — только со щёлочью', () => {
    const reacting = LAB_CASES.filter((c) => c.reacts).map((c) => `${c.el}+${c.reagent}`)
    expect(reacting.sort()).toEqual(['C+HNO3', 'Si+NaOH'])
  })
})

describe('механизмы реакций углерода и кремния', () => {
  const groups = Object.keys(GROUP_TITLES).filter((g) => g.startsWith('cs-')) as CsGroup[]
  it('в каждой группе есть сцены, id уникальны', () => {
    expect(groups).toHaveLength(2)
    for (const g of groups) expect(csScenesOf(g).length, g).toBeGreaterThan(0)
    expect(new Set(CS_SCENES.map((s) => s.id)).size).toBe(CS_SCENES.length)
  })
  for (const sc of CS_SCENES) {
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
