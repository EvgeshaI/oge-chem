import { describe, expect, it } from 'vitest'
import { isBalanced, isIonBalanced } from './balance'
import {
  RACK_SIZE,
  addReagent,
  conditionOf,
  detectionOf,
  emptyCells,
  emptyRack,
  emptyTable,
  modelTable,
  neededOf,
  pourSample,
  randomContents,
  react,
  scoreTable,
  type Contents,
  type LabTableValue,
} from './lab'
import { EXPERIMENTS, OBSERVATIONS, SOLUTIONS, type ChemId, type Experiment } from './labData'

const demo = EXPERIMENTS[0]
const orders = ({ substances: [a, b] }: Experiment): Contents[] => [
  [a, b],
  [b, a],
]

/** Ионы растворов — для независимой проверки, где признак реакции есть, а где его нет */
const IONS: Record<ChemId, string[]> = {
  KOH: ['K', 'OH'],
  NaOH: ['Na', 'OH'],
  HCl: ['H', 'Cl'],
  H2O2: [],
  Na2SO4: ['Na', 'SO4'],
  FeSO4: ['Fe2', 'SO4'],
  BaCl2: ['Ba', 'Cl'],
  'Ba(NO3)2': ['Ba', 'NO3'],
  K2CO3: ['K', 'CO3'],
  Na2CO3: ['Na', 'CO3'],
  MgCl2: ['Mg', 'Cl'],
  FeCl3: ['Fe3', 'Cl'],
  CuCl2: ['Cu', 'Cl'],
  NaCl: ['Na', 'Cl'],
  KCl: ['K', 'Cl'],
  KNO3: ['K', 'NO3'],
  NH4Cl: ['NH4', 'Cl'],
  Na2SiO3: ['Na', 'SiO3'],
  Na3PO4: ['Na', 'PO4'],
  'Ca(NO3)2': ['Ca', 'NO3'],
  AgNO3: ['Ag', 'NO3'],
}

/** Пары ионов, которые дают видимый признак (осадок или газ) по таблице растворимости 9 класса */
const VISIBLE = [
  'Ag+Cl', 'Ag+PO4', 'Ag+CO3', 'Ag+SiO3', 'Ag+OH', 'Ag+SO4',
  'Ba+SO4', 'Ba+CO3', 'Ba+PO4', 'Ba+SiO3',
  'Ca+CO3', 'Ca+PO4', 'Ca+SiO3', 'Ca+SO4',
  'Mg+OH', 'Mg+CO3', 'Mg+PO4', 'Mg+SiO3',
  'Fe2+OH', 'Fe2+CO3', 'Fe2+PO4', 'Fe2+SiO3',
  'Fe3+OH', 'Fe3+CO3', 'Fe3+PO4', 'Fe3+SiO3',
  'Cu+OH', 'Cu+CO3', 'Cu+PO4', 'Cu+SiO3',
  'H+CO3', 'H+SiO3', 'NH4+OH', 'NH4+SiO3',
]
const visible = (a: ChemId, b: ChemId) =>
  IONS[a].some((x) => IONS[b].some((y) => VISIBLE.includes(`${x}+${y}`) || VISIBLE.includes(`${y}+${x}`)))

/** «2K+ + SO4^2-» → список частиц с повторами по коэффициентам */
const particles = (side: string) =>
  side
    .split(' + ')
    .flatMap((term) => {
      const [, k, p] = term.trim().replace(/ [v^]$/, '').match(/^(\d*)(.+)$/)!
      return Array<string>(Number(k || 1)).fill(p)
    })
    .sort()

/** Убирает из обеих частей полного ионного уравнения частицы, которые не изменились */
function reduce(full: string) {
  const [l, r] = full.split(' -> ').map(particles)
  const right = [...r]
  const left = l.filter((p) => {
    const i = right.indexOf(p)
    if (i < 0) return true
    right.splice(i, 1)
    return false
  })
  return [left, right]
}

describe('лаборатория: набор экспериментов', () => {
  it('шесть экспериментов по порядку, из демоверсии только первый', () => {
    expect(EXPERIMENTS.map((e) => e.id)).toEqual([1, 2, 3, 4, 5, 6])
    expect(EXPERIMENTS.filter((e) => e.demo).map((e) => e.id)).toEqual([1])
  })

  it('эксперимент 1 — как в демоверсии', () => {
    expect(demo.substances).toEqual(['KOH', 'Na2SO4'])
    expect(demo.reagents).toEqual(['BaCl2', 'H2O2', 'FeSO4'])
    expect(neededOf(demo)).toEqual(['FeSO4', 'BaCl2'])
    expect(conditionOf(demo)).toBe(
      'Для проведения эксперимента выданы склянки № 1 и № 2 с растворами гидроксида калия и сульфата натрия, а также растворы трёх реактивов: хлорида бария, пероксида водорода и сульфата железа(II).',
    )
  })

  it('наборы веществ не повторяются, вещества и реактивы внутри набора разные', () => {
    expect(new Set(EXPERIMENTS.map((e) => [...e.substances].sort().join())).size).toBe(EXPERIMENTS.length)
    for (const e of EXPERIMENTS) expect(new Set([...e.substances, ...e.reagents]).size, `№ ${e.id}`).toBe(5)
  })

  it('окрашенных растворов в склянках с веществами нет — по цвету их не угадать', () => {
    for (const e of EXPERIMENTS) for (const s of e.substances) expect(SOLUTIONS[s].liquid, s).toBe(SOLUTIONS.KOH.liquid)
  })
})

describe.each(EXPERIMENTS)('лаборатория: эксперимент $id', (exp) => {
  const needed = neededOf(exp)

  it('каждое вещество определяется своим реактивом из перечня, который с другим веществом ничего не даёт', () => {
    expect(new Set(needed).size).toBe(2)
    for (const s of exp.substances) {
      const { reagent } = detectionOf(exp, s)
      const other = exp.substances.find((x) => x !== s)!
      expect(exp.reagents).toContain(reagent)
      expect(react(exp, s, reagent).obs).not.toBe('none')
      expect(react(exp, other, reagent).obs).toBe('none')
    }
  })

  it('лишний реактив не даёт признаков ни с одним веществом', () => {
    const extra = exp.reagents.filter((r) => !needed.includes(r))
    expect(extra).toHaveLength(1)
    for (const s of exp.substances) expect(react(exp, s, extra[0]).obs).toBe('none')
  })

  it('признак есть ровно там, где ионы дают осадок или газ', () => {
    for (const s of exp.substances)
      for (const r of exp.reagents) expect(react(exp, s, r).obs !== 'none', `${s} + ${r}`).toBe(visible(s, r))
  })

  it('рисунок соответствует наблюдению: осадок, пузырьки или ничего', () => {
    for (const s of exp.substances)
      for (const r of exp.reagents) {
        const { obs, precip, bubbles } = react(exp, s, r)
        expect(OBSERVATIONS[obs]).toBeTruthy()
        expect(Boolean(bubbles), `${s} + ${r}`).toBe(obs === 'gas' || obs === 'smell')
        expect(Boolean(precip), `${s} + ${r}`).toBe(!['none', 'gas', 'smell'].includes(obs))
      }
  })

  it('молекулярные, полные и сокращённые ионные уравнения уравнены', () => {
    for (const d of exp.detections) {
      expect(isBalanced(d.molecular), d.molecular).toBe(true)
      expect(isIonBalanced(d.full), d.full).toBe(true)
      expect(isIonBalanced(d.short), d.short).toBe(true)
    }
  })

  it('сокращённое уравнение получается из полного', () => {
    for (const d of exp.detections) expect(reduce(d.full), d.full).toEqual(d.short.split(' -> ').map(particles))
  })

  it('вещества в склянках распределяются случайно', () => {
    expect(randomContents(exp, () => 0)).toEqual(orders(exp)[0])
    expect(randomContents(exp, () => 0.9)).toEqual(orders(exp)[1])
  })

  it('эталонная таблица получает 3 балла при любом расположении склянок и порядке опытов', () => {
    for (const c of orders(exp)) {
      const t = modelTable(exp, c)
      expect(scoreTable(t, exp, c).k2).toBe(3)
      expect(scoreTable({ ...t, rows: [t.rows[1], t.rows[0]] }, exp, c).k2).toBe(3)
      expect(emptyCells(t)).toBe(0)
    }
  })
})

describe('лаборатория: штатив', () => {
  it('в штативе не больше четырёх пробирок', () => {
    let rack = emptyRack()
    for (let i = 0; i < RACK_SIZE + 2; i++) rack = pourSample(rack, 0)
    expect(rack.tubes).toHaveLength(RACK_SIZE)
  })

  it('реактив приливается только в выбранную пробирку и только один раз', () => {
    expect(addReagent(emptyRack(), 'BaCl2')).toEqual(emptyRack())
    let rack = pourSample(pourSample(emptyRack(), 0), 1)
    rack = addReagent(rack, 'BaCl2')
    expect(rack.tubes.map((t) => t.reagent)).toEqual([null, 'BaCl2'])
    // выбор перешёл к пробе без реактива
    expect(rack.selected).toBe(rack.tubes[0].id)
    rack = addReagent(rack, 'FeSO4')
    expect(rack.tubes.map((t) => t.reagent)).toEqual(['FeSO4', 'BaCl2'])
    expect(addReagent(rack, 'H2O2')).toBe(rack)
  })
})

describe('лаборатория: таблица и критерий К2', () => {
  const KOH_FIRST: Contents = ['KOH', 'Na2SO4']
  const model = () => modelTable(demo, KOH_FIRST)

  it('эталон демоверсии: № 1 — KOH, № 2 — сульфат натрия', () => {
    expect(model()).toEqual({
      rows: [
        { reagent: 'FeSO4', obs: ['greygreen', 'none'] },
        { reagent: 'BaCl2', obs: ['none', 'white'] },
      ],
      conclusion: ['KOH', 'Na2SO4'],
    })
  })

  it('пустая таблица — 0 баллов', () => {
    expect(scoreTable(emptyTable(), demo, KOH_FIRST).k2).toBe(0)
    expect(emptyCells(emptyTable())).toBe(8)
  })

  it('ошибка в одной ячейке снимает балл за строку', () => {
    const t = model()
    t.rows[0].obs[1] = 'white'
    const s = scoreTable(t, demo, KOH_FIRST)
    expect(s.k2).toBe(2)
    expect(s.rows[0].obs).toEqual([true, false])
  })

  it('перепутанный вывод снимает балл', () => {
    expect(scoreTable({ ...model(), conclusion: ['Na2SO4', 'KOH'] }, demo, KOH_FIRST).k2).toBe(2)
  })

  it('лишний реактив и повтор реактива не засчитываются', () => {
    const m = model()
    const peroxide: LabTableValue = { ...m, rows: [{ reagent: 'H2O2', obs: ['none', 'none'] }, m.rows[1]] }
    const s = scoreTable(peroxide, demo, KOH_FIRST)
    expect(s.k2).toBe(2)
    expect(s.rows[0]).toEqual({ reagent: false, obs: [true, true], correct: false })
    expect(scoreTable({ ...m, rows: [m.rows[0], m.rows[0]] }, demo, KOH_FIRST).k2).toBe(2)
  })

  it('студенистый осадок можно записать и просто как белый', () => {
    const exp = EXPERIMENTS[4]
    const c: Contents = ['Na2SiO3', 'NH4Cl']
    const t = modelTable(exp, c)
    expect(t.rows[1].obs).toEqual(['gel', 'none'])
    t.rows[1].obs[0] = 'white'
    expect(scoreTable(t, exp, c).k2).toBe(3)
  })
})
