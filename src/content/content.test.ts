import { describe, expect, it } from 'vitest'
import { checkTask, emptyValue, fieldsOf } from '../lib/check'
import { catalog } from './catalog'
import atom from './topics/atom'
import bonds from './topics/bonds'
import classes from './topics/classes'
import concepts from './topics/concepts'
import halogens from './topics/halogens'
import oxygenSulfur from './topics/oxygen-sulfur'
import nitrogenPhosphorus from './topics/nitrogen-phosphorus'
import carbonSilicon from './topics/carbon-silicon'
import dissociation from './topics/dissociation'
import ionExchange from './topics/ion-exchange'
import acidsBasesSalts from './topics/acids-bases-salts'
import redox from './topics/redox'
import qualitative from './topics/qualitative'
import massFraction from './topics/mass-fraction'
import metals from './topics/metals'
import oxidation from './topics/oxidation'
import periodic from './topics/periodic'
import type { Task, TopicContent } from './types'

const all: Record<string, TopicContent> = { atom, bonds, classes, concepts, halogens, metals, oxidation, periodic, 'oxygen-sulfur': oxygenSulfur, 'nitrogen-phosphorus': nitrogenPhosphorus, 'carbon-silicon': carbonSilicon, dissociation, 'ion-exchange': ionExchange, redox, 'acids-bases-salts': acidsBasesSalts, qualitative, 'mass-fraction': massFraction }
const tasksOf = (c: TopicContent): Task[] => [...c.practice, ...c.exam.flatMap((v) => v.tasks)]

describe('каталог', () => {
  it('для каждой темы есть контент и верный счётчик заданий', () => {
    for (const m of catalog) {
      const c = all[m.id]
      expect(c, `нет контента для ${m.id}`).toBeDefined()
      expect(tasksOf(c).length, `totalTasks у ${m.id}`).toBe(m.totalTasks)
    }
  })
  it('id тем уникальны', () => {
    expect(new Set(catalog.map((m) => m.id)).size).toBe(catalog.length)
  })
  it('id уроков уникальны и начинаются с id темы', () => {
    for (const [id, c] of Object.entries(all)) {
      for (const l of c.lessons) expect(l.id.startsWith(id + '.'), l.id).toBe(true)
      expect(new Set(c.lessons.map((l) => l.id)).size).toBe(c.lessons.length)
    }
  })
})

const arr = (a: string | string[]) => (Array.isArray(a) ? a : [a])

function validate(topicId: string, t: Task) {
  expect(t.id.startsWith(topicId + '.'), `id ${t.id}`).toBe(true)
  expect(t.explanation.trim().length, `${t.id}: пустое пояснение`).toBeGreaterThan(0)
  switch (t.type) {
    case 'fill': {
      const gaps = [...t.text.matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1]))
      expect(gaps, `${t.id}: нумерация пропусков`).toEqual(t.answers.map((_, i) => i + 1))
      for (const a of t.answers) for (const x of arr(a)) expect(t.bank, `${t.id}: «${x}» нет в банке`).toContain(x)
      expect(new Set(t.bank).size, `${t.id}: повторы в банке`).toBe(t.bank.length)
      if (!t.reuse) {
        const firsts = t.answers.map((a) => arr(a)[0])
        expect(new Set(firsts).size, `${t.id}: слово использовано дважды, но reuse не задан`).toBe(firsts.length)
      }
      break
    }
    case 'digits': {
      expect(t.options.length).toBeGreaterThanOrEqual(2)
      expect(t.answer).toMatch(/^\d+$/)
      for (const d of t.answer) {
        expect(Number(d), `${t.id}: ответ вне вариантов`).toBeGreaterThanOrEqual(1)
        expect(Number(d)).toBeLessThanOrEqual(t.options.length)
      }
      expect(new Set(t.answer.split('')).size, `${t.id}: повтор в ответе`).toBe(t.answer.length)
      break
    }
    case 'single': {
      expect(t.options.length, `${t.id}: вариантов`).toBe(4)
      expect(Number.isInteger(t.answer) && t.answer >= 1 && t.answer <= t.options.length, `${t.id}: ответ вне вариантов`).toBe(true)
      expect(new Set(t.options).size, `${t.id}: одинаковые варианты`).toBe(t.options.length)
      break
    }
    case 'match': {
      expect(t.answer.length, `${t.id}: длина ответа`).toBe(t.rows.length)
      expect(t.answer).toMatch(/^\d+$/)
      for (const d of t.answer) {
        expect(Number(d)).toBeGreaterThanOrEqual(1)
        expect(Number(d)).toBeLessThanOrEqual(t.choices.length)
      }
      break
    }
    case 'order': {
      expect(t.options.length, `${t.id}: вариантов`).toBeGreaterThanOrEqual(2)
      expect(t.answer.length, `${t.id}: длина ответа`).toBe(t.options.length)
      expect(new Set(t.answer.split('')).size, `${t.id}: повтор в ответе`).toBe(t.answer.length)
      for (const d of t.answer) {
        expect(Number(d), `${t.id}: ответ вне вариантов`).toBeGreaterThanOrEqual(1)
        expect(Number(d)).toBeLessThanOrEqual(t.options.length)
      }
      break
    }
    case 'open': {
      expect(t.criteria.length).toBeGreaterThan(0)
      expect(t.solution.trim().length).toBeGreaterThan(0)
      break
    }
    case 'classify': {
      expect(t.items.length).toBeGreaterThan(0)
      for (const i of t.items) expect(t.options, `${t.id}: «${i.answer}» нет в вариантах`).toContain(i.answer)
      break
    }
    case 'cells': {
      expect(fieldsOf(t).length, `${t.id}: нет полей`).toBeGreaterThan(0)
      for (const r of t.rows) for (const c of r) {
        if (typeof c !== 'string' && c.options) for (const a of arr(c.a)) expect(c.options, `${t.id}: ответ «${a}» нет в списке`).toContain(a)
      }
      if (t.head) for (const r of t.rows) expect(r.length, `${t.id}: ширина строки`).toBe(t.head.length)
      break
    }
    case 'models': {
      for (const m of t.models) {
        expect(t.kinds, `${t.id}: вид «${m.kind}»`).toContain(m.kind)
        expect(m.particles.length).toBeGreaterThan(0)
      }
      break
    }
    case 'schemes': {
      for (const s of t.schemes) {
        expect(s.shells.length, `${t.id} ${s.label}: число слоёв`).toBe(s.layers)
        expect(s.shells.reduce((a, b) => a + b, 0), `${t.id} ${s.label}: сумма электронов = заряд ядра`).toBe(s.charge)
        expect(s.outer, `${t.id} ${s.label}: внешних`).toBe(s.shells[s.shells.length - 1])
        expect(t.kinds).toContain(s.kind)
      }
      break
    }
  }
  // у каждого задания с полями пустое значение имеет нужную длину
  const f = fieldsOf(t)
  if (f.length) expect((emptyValue(t) as string[]).length).toBe(f.length)
}

describe('задания', () => {
  const ids = new Set<string>()
  for (const [topicId, c] of Object.entries(all)) {
    for (const t of tasksOf(c)) {
      it(`${t.id} корректно составлено`, () => {
        validate(topicId, t)
        expect(ids.has(t.id), `дубль id ${t.id}`).toBe(false)
        ids.add(t.id)
      })
    }
  }
})

describe('варианты ОГЭ', () => {
  it('по 10 заданий, id вариантов уникальны', () => {
    for (const c of [concepts, atom, periodic, oxidation, bonds, classes, metals, halogens, oxygenSulfur, nitrogenPhosphorus, carbonSilicon]) {
      expect(c.exam).toHaveLength(2)
      for (const v of c.exam) expect(v.tasks).toHaveLength(10)
    }
  })
})

describe('эталонные ответы', () => {
  for (const [topicId, c] of Object.entries(all)) {
    for (const t of tasksOf(c)) {
      const f = fieldsOf(t)
      if (!f.length) continue
      it(`${t.id}: эталон проходит проверку`, () => {
        const v = f.map((x) => x.accept[0])
        expect(checkTask(t, v).correct, `${topicId}: ${t.id}`).toBe(true)
      })
    }
  }
})
