import { describe, expect, it } from 'vitest'
import { isBalanced } from '../lib/balance'
import { HALOGENS, displaces, stateAtTemp } from '../lib/halogens'
import { HAL_SCENES, halScenesOf, type HalGroup } from '../lib/halogenScenes'
import { GROUP_TITLES } from '../lib/mechanisms'
import { catalog } from './catalog'
import halogens from './topics/halogens'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())

describe('тема «Галогены»: структура', () => {
  const meta = catalog.find((t) => t.id === 'halogens')!
  it('есть в каталоге, вкладки заданий не скрыты', () => {
    expect(meta).toBeDefined()
    expect(meta.theoryOnly).toBeFalsy()
    expect(meta.totalTasks).toBe(halogens.practice.length + halogens.exam.reduce((a, v) => a + v.tasks.length, 0))
  })
  it('есть уроки, тренировка и два варианта по 10 заданий', () => {
    expect(halogens.lessons.length).toBeGreaterThanOrEqual(10)
    expect(halogens.practice.length).toBeGreaterThanOrEqual(15)
    expect(halogens.exam).toHaveLength(2)
    for (const v of halogens.exam) expect(v.tasks).toHaveLength(10)
  })
  it('в каждом уроке есть блоки; в теме есть анимации и иллюстрации', () => {
    for (const l of halogens.lessons) expect(l.blocks.length, l.id).toBeGreaterThan(0)
    const kinds = halogens.lessons.flatMap((l) => l.blocks.map((b) => b.kind))
    expect(kinds).toContain('animation')
    expect(kinds).toContain('image')
  })
  it('формулы $…$ не вложены в жирный **…** (RichText их не разбирает)', () => {
    const bad = strings(halogens).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
})

describe('тема «Галогены»: уравнения', () => {
  const eqs = [...new Set(strings(halogens.lessons).flatMap(equationsIn))].filter((e) => e.includes('->') || e.includes('<=>'))
  it('в теме есть уравнения', () => {
    expect(eqs.length).toBeGreaterThan(15)
  })
  for (const e of eqs) {
    it(`уравнено: ${e}`, () => {
      expect(isBalanced(e) ?? true, e).toBe(true)
    })
  }
})

describe('данные о галогенах', () => {
  it('закономерности: радиус и t кипения растут, ЭО падает', () => {
    for (let i = 1; i < HALOGENS.length; i++) {
      expect(HALOGENS[i].r).toBeGreaterThan(HALOGENS[i - 1].r)
      expect(HALOGENS[i].eo).toBeLessThan(HALOGENS[i - 1].eo)
      expect(HALOGENS[i].bp).toBeGreaterThan(HALOGENS[i - 1].bp)
      expect(HALOGENS[i].mp).toBeGreaterThan(HALOGENS[i - 1].mp)
      expect(HALOGENS[i].bond).toBeGreaterThan(HALOGENS[i - 1].bond)
    }
  })
  it('на внешнем слое 7 электронов, заряд ядра = сумма электронов', () => {
    for (const h of HALOGENS) {
      expect(h.shells[h.shells.length - 1], h.sym).toBe(7)
      expect(h.shells.reduce((a, b) => a + b, 0), h.sym).toBe(h.z)
    }
  })
  it('агрегатное состояние при 20 °C совпадает с описанием', () => {
    for (const h of HALOGENS) expect(stateAtTemp(h, 20), h.sym).toBe(h.state)
  })
  it('вытеснение: сильный — слабый', () => {
    expect(displaces('Cl', 'Br')).toBe(true)
    expect(displaces('Cl', 'I')).toBe(true)
    expect(displaces('Br', 'I')).toBe(true)
    expect(displaces('I', 'Br')).toBe(false)
    expect(displaces('Br', 'Cl')).toBe(false)
    expect(displaces('Cl', 'F')).toBe(false)
    expect(displaces('Cl', 'Cl')).toBe(false)
  })
})

describe('механизмы реакций галогенов', () => {
  const groups = Object.keys(GROUP_TITLES).filter((g) => g.startsWith('hal-')) as HalGroup[]
  it('в каждой группе есть сцены', () => {
    expect(groups).toHaveLength(4)
    for (const g of groups) expect(halScenesOf(g).length, g).toBeGreaterThan(0)
  })
  it('id сцен внутри группы уникальны', () => {
    for (const g of groups) {
      const ids = halScenesOf(g).map((s) => s.id)
      expect(new Set(ids).size, g).toBe(ids.length)
    }
  })
  for (const sc of HAL_SCENES) {
    describe(sc.id, () => {
      it('уравнение уравнено', () => {
        if (!sc.eq.startsWith('\\')) expect(isBalanced(sc.eq) ?? true, sc.eq).toBe(true)
      })
      it('электроны: отданные = принятые, есть перелёты на втором шаге', () => {
        // общая электронная пара (H–Cl) — без «перелёта» электронов
        if (sc.id === 'h2-cl2') return
        const total = sc.steps.flatMap((s) => s.e ?? []).reduce((a, f) => a + f.n, 0)
        expect(total).toBe(sc.electrons)
        if (sc.electrons > 0) expect(sc.steps[1].e?.length).toBeGreaterThan(0)
      })
      it('перелёты ссылаются на частицы шага', () => {
        for (const s of sc.steps) for (const f of s.e ?? []) {
          expect(s.sp[f.from], `${sc.id}: нет ${f.from}`).toBeDefined()
          expect(s.sp[f.to], `${sc.id}: нет ${f.to}`).toBeDefined()
        }
      })
      it('роли: окислитель и восстановитель (или нет реакции)', () => {
        if (sc.electrons === 0) return expect(sc.roles).toHaveLength(0)
        expect(sc.roles.map((r) => r.role).sort()).toEqual(['восстановитель', 'окислитель'])
      })
      it('на шагах есть заголовок и пояснение, 2–5 шагов', () => {
        expect(sc.steps.length).toBeGreaterThanOrEqual(2)
        expect(sc.steps.length).toBeLessThanOrEqual(5)
        for (const s of sc.steps) {
          expect(s.title.length).toBeGreaterThan(0)
          expect(s.text.length).toBeGreaterThan(20)
        }
      })
      it('частицы и бейджи степеней окисления не обрезаются полем 640×260', () => {
        for (const s of sc.steps) for (const [id, p] of Object.entries(s.sp)) {
          expect(p.x, `${sc.id}/${id}.x=${p.x}`).toBeGreaterThanOrEqual(24)
          expect(p.x, `${sc.id}/${id}.x=${p.x}`).toBeLessThanOrEqual(616)
          expect(p.y, `${sc.id}/${id}.y=${p.y}`).toBeGreaterThanOrEqual(p.ox ? 45 : 24)
          expect(p.y, `${sc.id}/${id}.y=${p.y}`).toBeLessThanOrEqual(236)
        }
      })
      it('все частицы сцены есть на каждом шаге (иначе исчезают некрасиво)', () => {
        const ids = new Set(sc.steps.flatMap((s) => Object.keys(s.sp)))
        for (const s of sc.steps) expect(Object.keys(s.sp).length, `${sc.id}`).toBe(ids.size)
      })
    })
  }
})
