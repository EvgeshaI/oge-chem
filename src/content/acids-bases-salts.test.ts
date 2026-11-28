import { describe, expect, it } from 'vitest'
import { isIonBalanced } from '../lib/balance'
import { OX_REAGENTS, OXIDE_ROWS, RATIO_SERIES } from '../lib/oxides'
import { catalog } from './catalog'
import content from './topics/acids-bases-salts'

/** Все строки внутри значения (рекурсивно) */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

const CE = /\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g
const equationsIn = (text: string) => [...text.matchAll(CE)].map((m) => m[1].trim())
const isReaction = (e: string) => {
  const parts = e.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  return parts.length === 2 && parts[1].trim() !== ''
}

describe('тема «Свойства оксидов, кислот, оснований и солей»: структура', () => {
  const meta = catalog.find((t) => t.id === 'acids-bases-salts')!
  it('есть в каталоге, с тренировкой и вариантами ОГЭ', () => {
    expect(meta).toBeDefined()
    expect(meta.title).toBe('Свойства оксидов, кислот, оснований и солей')
    expect(meta.theoryOnly).toBeFalsy()
    expect(content.practice.length).toBe(10)
    expect(content.exam).toHaveLength(2)
    for (const v of content.exam) expect(v.tasks).toHaveLength(10)
  })
  it('сначала оксиды, потом кислоты, основания и соли; диссоциации, ионного обмена и качественных реакций нет', () => {
    const ids = content.lessons.map((l) => l.id.replace('acids-bases-salts.', ''))
    expect(ids.slice(0, 4)).toEqual(['principle', 'basic-oxides', 'acidic-oxides', 'amphoteric-oxides'])
    expect(ids.indexOf('acids')).toBeLessThan(ids.indexOf('bases'))
    expect(ids.indexOf('bases')).toBeLessThan(ids.indexOf('salts'))
    expect(ids).toContain('acid-basic-salts')
    expect(ids).not.toContain('dissociation')
    expect(ids).not.toContain('exchange')
    expect(ids).not.toContain('qualitative')
  })
  it('уроки с уникальными id и префиксом темы', () => {
    const ids = content.lessons.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('acids-bases-salts.'), id).toBe(true)
  })
  it('есть анимации, схема и таблицы', () => {
    const blocks = content.lessons.flatMap((l) => l.blocks)
    const anims = blocks.flatMap((b) => (b.kind === 'animation' ? [b.name] : []))
    expect(anims).toEqual(expect.arrayContaining(['oxide-matrix', 'salt-ratio', 'indicators']))
    expect(blocks.some((b) => b.kind === 'image')).toBe(true)
    expect(blocks.filter((b) => b.kind === 'table').length).toBeGreaterThan(8)
  })
  it('цвета ячеек совпадают по размеру с таблицей', () => {
    for (const b of content.lessons.flatMap((l) => l.blocks))
      if (b.kind === 'table' && b.cellColors) {
        expect(b.cellColors).toHaveLength(b.rows.length)
        for (const row of b.cellColors) expect(row).toHaveLength(b.head.length)
      }
  })
  it('формулы $…$ не вложены в жирный **…** (RichText их не разбирает)', () => {
    const bad = strings(content).filter((s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].some((m) => m[1].includes('$')))
    expect(bad).toEqual([])
  })
})

describe('тема «Свойства оксидов, кислот, оснований и солей»: уравнения уравнены', () => {
  const fromContent = strings(content).flatMap(equationsIn)
  const fromData = [
    ...OXIDE_ROWS.flatMap((r) => Object.values(r.cells).map((c) => c.eq)),
    ...RATIO_SERIES.flatMap((x) => x.steps.map((st) => st.eq)),
  ].filter((x): x is string => !!x)
  const eqs = [...new Set([...fromContent, ...fromData])].filter(isReaction)
  it('уравнений достаточно', () => {
    expect(eqs.length).toBeGreaterThan(100)
  })
  for (const e of eqs) {
    it(`уравнено: ${e}`, () => {
      expect(isIonBalanced(e), e).toBe(true)
    })
  }
})

describe('данные анимаций', () => {
  it('таблица оксидов: у каждой клетки есть причина, у идущих реакций — уравнение', () => {
    for (const row of OXIDE_ROWS)
      for (const r of OX_REAGENTS) {
        const c = row.cells[r.id]
        expect(c.why.length, `${row.f} + ${r.label}`).toBeGreaterThan(0)
        expect(!!c.eq, `${row.f} + ${r.label}`).toBe(c.mark !== '−')
      }
  })
  it('таблица оксидов следует правилу «основное + кислотное»', () => {
    for (const row of OXIDE_ROWS) {
      const c = row.cells
      if (row.nature === 'основный') expect([c.acid.mark, c.acidic.mark, c.alkali.mark, c.basic.mark]).toEqual(['+', '+', '−', '−'])
      if (row.nature === 'кислотный') {
        expect([c.acid.mark, c.acidic.mark]).toEqual(['−', '−'])
        expect(c.basic.mark).not.toBe('−')
      }
      if (row.nature === 'амфотерный') expect([c.acid.mark, c.alkali.mark, c.water.mark]).toEqual(['+', '+', '−'])
      if (row.nature === 'несолеобразующий') expect(Object.values(c).every((x) => x.mark === '−')).toBe(true)
    }
  })
  it('кислые и основные соли: последняя ступень — средняя соль, число шагов = числу H или OH', () => {
    for (const x of RATIO_SERIES) {
      expect(x.steps.map((st) => st.n)).toEqual(x.steps.map((_, i) => i + 1))
      expect(x.steps.at(-1)!.kind).toBe('средняя соль')
      for (const st of x.steps.slice(0, -1)) expect(st.kind).toBe(x.mode === 'acid' ? 'кислая соль' : 'основная соль')
    }
  })
})
