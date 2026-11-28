import katex from 'katex'
import 'katex/contrib/mhchem'
import { describe, expect, it } from 'vitest'
import { isBalanced, isIonBalanced } from '../lib/balance'
import { BALANCE_CASES, COMPLEX_CASES, SCALE_ELEMENTS, complexCe, complexSo, lcm, roleOf, sideAtoms } from '../lib/redox'
import { catalog } from './catalog'
import content from './topics/redox'

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const strings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}
const isReaction = (e: string) =>
  e.split(/(?:<=>|->)(?:\[[^\]]*\])*/).length === 2 && e.split(/(?:<=>|->)/).every((p) => p.trim()) && !e.includes('-/->')
const render = (s: string) => katex.renderToString(s, { throwOnError: true, output: 'html' })

describe('тема «Окислительно-восстановительные реакции»', () => {
  const meta = catalog.find((t) => t.id === 'redox')!
  it('стоит после ионного обмена, только теория', () => {
    const ids = catalog.map((t) => t.id)
    expect(ids.indexOf('redox')).toBe(ids.indexOf('ion-exchange') + 1)
    expect(meta.theoryOnly).toBe(true)
    expect(meta.totalTasks).toBe(0)
    expect(content.practice).toEqual([])
    expect(content.exam).toEqual([])
  })
  it('есть все пять анимаций в логичном порядке', () => {
    const anims = content.lessons.flatMap((l) => l.blocks).flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(['redox-transfer', 'redox-shift', 'redox-scale', 'redox-balance', 'redox-complex'])
  })
  it('цвета ячеек совпадают по размеру с таблицей', () => {
    for (const b of content.lessons.flatMap((l) => l.blocks))
      if (b.kind === 'table' && b.cellColors) {
        expect(b.cellColors).toHaveLength(b.rows.length)
        for (const row of b.cellColors) expect(row).toHaveLength(b.head.length)
      }
  })
  it('формулы $…$ не вложены в жирный **…**', () => {
    const bad = strings(content).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
  it('все формулы в тексте и в данных анимаций рисуются KaTeX без ошибок', () => {
    const ones = (c: { coef: number[] }) => c.coef.map(() => 1)
    const all = [
      ...strings(content),
      ...BALANCE_CASES.flatMap((c) => [`$${c.scheme}$`, `$${c.red}$`, `$${c.ox}$`, `$${c.finalSo}$`, `$\\ce{${c.partial}}$`]),
      ...COMPLEX_CASES.flatMap((c) => [
        `$${c.red}$`,
        `$${c.ox}$`,
        `$${complexSo(c, c.coef)}$`,
        `$${complexSo(c, ones(c))}$`,
        `$\\ce{${complexCe(c, c.partial)}}$`,
        ...c.rest.map((r) => `$\\ce{${complexCe(c, r.coef)}}$`),
      ]),
    ]
    let n = 0
    for (const s of all)
      for (const m of s.matchAll(/\$([^$]+)\$/g)) {
        render(m[1])
        n++
      }
    expect(n).toBeGreaterThan(80)
    for (const e of strings(content).filter((s) => s.includes('begin{aligned}') || s.startsWith('\\overset'))) render(e)
  })
  it('уравнения в \\ce{…} уравнены', () => {
    const eqs = [...new Set(strings(content.lessons).flatMap((s) => [...s.matchAll(CE)].map((m) => m[1].trim())))].filter(isReaction)
    expect(eqs.length).toBeGreaterThan(15)
    for (const e of eqs) expect(isIonBalanced(e), e).toBe(true)
  })
  it('в теме нет ионных уравнений ОВР (чтобы не путать с обменом)', () => {
    expect(strings(content).some((s) => /сокращённое|полное ионное/i.test(s))).toBe(false)
  })
})

describe('данные анимаций ОВР', () => {
  it('электронный баланс: множители выравнивают отданные и принятые электроны, итог уравнен', () => {
    for (const c of BALANCE_CASES) {
      const L = lcm(c.redN, c.oxN)
      expect((L / c.redN) * c.redN, c.id).toBe((L / c.oxN) * c.oxN)
      expect(isBalanced(c.final), c.final).toBe(true)
      const [l, r] = sideAtoms(c.final)
      expect(l, c.id).toEqual(r)
    }
  })
  it('сложные уравнения: итог уравнен, шаги ведут к итогу', () => {
    for (const c of COMPLEX_CASES) {
      const fin = complexCe(c, c.coef)
      expect(isBalanced(fin), fin).toBe(true)
      const [l, r] = sideAtoms(fin)
      expect(l, c.id).toEqual(r)
      expect(c.ce).toHaveLength(c.so.length)
      expect(c.coef).toHaveLength(c.ce.length)
      expect(c.rest[c.rest.length - 1].coef, c.id).toEqual(c.coef)
      for (const p of [c.partial, ...c.rest.map((x) => x.coef)]) p.forEach((v, k) => expect(v === null || v === c.coef[k], c.id).toBe(true))
    }
  })
  it('шкала: все примеры уравнены, роли по положению на шкале', () => {
    for (const el of SCALE_ELEMENTS) {
      const cos = el.states.map((s) => s.co)
      expect(cos, el.sym).toEqual([...cos].sort((a, b) => a - b))
      expect(roleOf(el, 0)).toBe('red')
      expect(roleOf(el, el.states.length - 1)).toBe('ox')
      if (el.sym !== 'Fe') {
        expect(cos[cos.length - 1], el.sym).toBeLessThanOrEqual(el.group)
        if (el.sym !== 'H') expect(cos[0], el.sym).toBe(el.group - 8)
      }
      for (const st of el.states) {
        if (st.red) expect(st.red.to, `${el.sym} ${st.co} red`).toBeGreaterThan(st.co)
        if (st.ox) expect(st.ox.to, `${el.sym} ${st.co} ox`).toBeLessThan(st.co)
        for (const mv of [st.red, st.ox]) if (mv) expect(isIonBalanced(mv.ce), mv.ce).toBe(true)
      }
      expect(el.states[0].ox).toBeUndefined()
      expect(el.states[el.states.length - 1].red).toBeUndefined()
    }
  })
})
