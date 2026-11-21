import { describe, expect, it } from 'vitest'
import type { DigitsTask, FillTask, MatchTask, OpenTask, OrderTask } from '../content/types'
import { checkTask, gradeFromShare, maxScore, normalizeDigits } from './check'

const digits: DigitsTask = {
  id: 't.d', type: 'digits', question: '', options: ['a', 'b', 'c', 'd', 'e'], answer: '14', explanation: '',
}
const match: MatchTask = {
  id: 't.m', type: 'match', question: '', rows: ['a', 'b', 'c'], choices: ['1', '2', '3', '4'], answer: '312', explanation: '',
}
const order: OrderTask = {
  id: 't.r', type: 'order', question: '', options: ['a', 'b', 'c'], answer: '312', explanation: '',
}
const fill: FillTask = {
  id: 't.f', type: 'fill', text: '{1} {2}', bank: ['x', 'y'], answers: ['x', 'y'], explanation: '',
}
const open: OpenTask = {
  id: 't.o', type: 'open', question: '', solution: '', explanation: '',
  criteria: [{ text: 'a', points: 1 }, { text: 'b', points: 2 }],
}

describe('digits', () => {
  it('порядок и разделители не важны', () => {
    expect(checkTask(digits, '41').correct).toBe(true)
    expect(checkTask(digits, '1, 4').correct).toBe(true)
    expect(checkTask(digits, '1 4 ').correct).toBe(true)
  })
  it('повторы не помогают угадать', () => {
    expect(checkTask(digits, '114').correct).toBe(true) // нормализуется к 14
    expect(checkTask(digits, '1').correct).toBe(false)
    expect(checkTask(digits, '145').correct).toBe(false)
    expect(checkTask(digits, '').correct).toBe(false)
  })
})

describe('match', () => {
  it('порядок важен', () => {
    expect(checkTask(match, '312').correct).toBe(true)
    expect(checkTask(match, '321').correct).toBe(false)
    expect(checkTask(match, '31').correct).toBe(false)
  })
})

describe('fill', () => {
  it('считает каждый пропуск', () => {
    expect(checkTask(fill, ['x', 'y'])).toMatchObject({ score: 2, max: 2, correct: true, gaps: [true, true] })
    expect(checkTask(fill, ['x', 'x'])).toMatchObject({ score: 1, correct: false, gaps: [true, false] })
    expect(checkTask(fill, ['', ''])).toMatchObject({ score: 0 })
  })
})

describe('open', () => {
  it('баллы по отмеченным критериям', () => {
    expect(maxScore(open)).toBe(3)
    expect(checkTask(open, { text: '', ticked: [true, false] }).score).toBe(1)
    expect(checkTask(open, { text: '', ticked: [true, true] })).toMatchObject({ score: 3, correct: true })
  })
})

describe('утилиты', () => {
  it('normalizeDigits', () => {
    expect(normalizeDigits('3-1-2', false)).toBe('312')
    expect(normalizeDigits('3-1-2', true)).toBe('123')
  })
  it('gradeFromShare', () => {
    expect(gradeFromShare(1)).toBe(5)
    expect(gradeFromShare(0.7)).toBe(4)
    expect(gradeFromShare(0.5)).toBe(3)
    expect(gradeFromShare(0.1)).toBe(2)
  })
})

import { fieldsOf, norm } from './check'
import type { CellsTask, ClassifyTask, ModelsTask, SchemesTask, SingleTask } from '../content/types'

describe('single', () => {
  const t: SingleTask = { id: 't.s', type: 'single', question: '', options: ['a', 'b', 'c', 'd'], answer: 3, explanation: '' }
  it('один верный', () => {
    expect(checkTask(t, '3').correct).toBe(true)
    expect(checkTask(t, '2').correct).toBe(false)
    expect(checkTask(t, '').correct).toBe(false)
  })
})

describe('norm', () => {
  it('индексы, регистр, минусы, разделители схем', () => {
    expect(norm('H₂')).toBe(norm('h2'))
    expect(norm('Mg²⁺')).toBe(norm('Mg2+'))
    expect(norm('O²⁻')).toBe(norm('o2-'))
    expect(norm('O²⁻')).toBe(norm('O2−'))
    expect(norm('2·8·1')).toBe(norm('2 8 1'))
    expect(norm('2·8·1')).toBe(norm('2,8,1'))
    expect(norm('2·8·1')).not.toBe(norm('281'))
    expect(norm('+16')).toBe(norm('16'))
    expect(norm('1ē')).toBe(norm('1e'))
    expect(norm('СаСО3')).toBe(norm('CaCO3'))
    expect(norm('ёлка')).toBe(norm('елка'))
  })
})

describe('classify / cells / models / schemes', () => {
  const cl: ClassifyTask = { id: 't.c', type: 'classify', question: '', options: ['Э', 'ПВ'], items: [{ text: '', answer: 'Э' }, { text: '', answer: 'ПВ' }], explanation: '' }
  it('classify: по полю на пункт', () => {
    expect(checkTask(cl, ['Э', 'ПВ'])).toMatchObject({ score: 2, max: 2, correct: true })
    expect(checkTask(cl, ['Э', 'Э'])).toMatchObject({ score: 1, gaps: [true, false] })
  })
  const ce: CellsTask = { id: 't.t', type: 'cells', question: '', rows: [['x', { a: ['S', 'S₈'] }], [{ a: 'Na⁺' }]], explanation: '' }
  it('cells: допустимые варианты и индексы', () => {
    expect(fieldsOf(ce)).toHaveLength(2)
    expect(checkTask(ce, ['s8', 'na+']).correct).toBe(true)
    expect(checkTask(ce, ['S', 'Na']).score).toBe(1)
  })
  const mo: ModelsTask = {
    id: 't.m', type: 'models', question: '', kinds: ['смесь'], explanation: '',
    models: [{ label: 'в)', particles: [{ kind: 'O2', count: 1 }], elements: 2, substances: 2, kind: 'смесь', formulas: 'O₂ и H₂' }],
  }
  it('models: формулы — набор, порядок не важен', () => {
    expect(checkTask(mo, ['2', '2', 'смесь', 'H2, O2']).correct).toBe(true)
    expect(checkTask(mo, ['2', '2', 'смесь', 'H2 и H2']).correct).toBe(false)
    expect(checkTask(mo, ['2', '2', 'смесь', 'O2 H2']).correct).toBe(true)
    expect(checkTask(mo, ['2', '2', 'смесь', 'H₂,O₂']).correct).toBe(true)
    expect(checkTask(mo, ['2', '2', 'смесь', 'O2  и  H2']).correct).toBe(true)
    expect(checkTask(mo, ['2', '2', 'смесь', 'O2']).correct).toBe(false)
  })
  const sc: SchemesTask = {
    id: 't.sc', type: 'schemes', question: '', kinds: ['металл'], explanation: '',
    schemes: [{ label: 'г)', layers: 2, shells: [2, 8], given: true, charge: 10, outer: 8, kind: 'металл', element: 'Ne' }],
  }
  it('schemes: порядок полей элемент, заряд, внешние, тип', () => {
    expect(fieldsOf(sc)).toHaveLength(4)
    expect(checkTask(sc, ['ne', '+10', '8', 'металл']).correct).toBe(true)
  })
})

describe('order', () => {
  it('порядок важен', () => {
    expect(checkTask(order, '312').correct).toBe(true)
    expect(checkTask(order, '3 1 2').correct).toBe(true)
    expect(checkTask(order, '321').correct).toBe(false)
    expect(checkTask(order, '').correct).toBe(false)
  })
  it('один балл', () => {
    expect(maxScore(order)).toBe(1)
  })
})
