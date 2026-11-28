// Расчёты для темы «Массовая доля»: состав вещества по формуле и операции с растворами.

/** Относительные атомные массы, округлённые так, как принято на ОГЭ (Cl — 35,5) */
export const AR: Record<string, number> = {
  H: 1,
  C: 12,
  N: 14,
  O: 16,
  Na: 23,
  Mg: 24,
  Al: 27,
  Si: 28,
  P: 31,
  S: 32,
  Cl: 35.5,
  K: 39,
  Ca: 40,
  Fe: 56,
  Cu: 64,
  Zn: 65,
  Ba: 137,
}

/** Цвет «кирпичика» элемента на схемах */
export const EL_COLOR: Record<string, string> = {
  H: '#9fd3ff',
  C: '#4b5168',
  N: '#7a5ce0',
  O: '#e5484d',
  Na: '#f5a623',
  Mg: '#c9ced9',
  Al: '#b7c0cf',
  Si: '#79819a',
  P: '#e6559b',
  S: '#f7d94c',
  Cl: '#16a58c',
  K: '#f08a3e',
  Ca: '#2f7fec',
  Fe: '#a0522d',
  Cu: '#d9773f',
  Zn: '#8fa3b8',
  Ba: '#5cc8a8',
}

export interface Part {
  el: string
  /** число атомов в формуле */
  n: number
}

/** Разбор формулы со скобками: Ca3(PO4)2 → Ca 3, P 2, O 8. Порядок — как элементы впервые встретились. */
export function parseFormula(formula: string): Part[] {
  const counts = new Map<string, number>()
  const stack: Map<string, number>[] = [new Map()]
  const re = /([A-Z][a-z]?|\(|\)|\d+)/g
  const tokens = formula.match(re) ?? []
  const add = (m: Map<string, number>, el: string, n: number) => m.set(el, (m.get(el) ?? 0) + n)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    const next = tokens[i + 1]
    const k = next && /^\d+$/.test(next) ? Number(next) : 1
    if (t === '(') stack.push(new Map())
    else if (t === ')') {
      const inner = stack.pop()!
      for (const [el, n] of inner) add(stack[stack.length - 1], el, n * k)
      if (next && /^\d+$/.test(next)) i++
    } else if (/^[A-Z]/.test(t)) {
      if (!(t in AR)) throw new Error(`Нет Ar для ${t}`)
      add(stack[stack.length - 1], t, k)
      if (next && /^\d+$/.test(next)) i++
    }
  }
  for (const [el, n] of stack[0]) counts.set(el, n)
  return [...counts].map(([el, n]) => ({ el, n }))
}

export const molarMass = (parts: Part[]) => parts.reduce((s, p) => s + AR[p.el] * p.n, 0)

/** Массовая доля элемента, % (без округления) */
export function elementFraction(formula: string, el: string): number {
  const parts = parseFormula(formula)
  const p = parts.find((x) => x.el === el)
  if (!p) return 0
  return ((AR[el] * p.n) / molarMass(parts)) * 100
}

/** Округление «как в ответе»: до digits знаков, запятая */
export const fmt = (x: number, digits = 1) => {
  const r = Math.round(x * 10 ** digits) / 10 ** digits
  return String(r).replace('.', ',')
}

/** Вещества для анимации «Массовая доля элемента» */
export const SUBSTANCES: { formula: string; label: string; name: string }[] = [
  { formula: 'H2O', label: 'H₂O', name: 'вода' },
  { formula: 'CO2', label: 'CO₂', name: 'углекислый газ' },
  { formula: 'NaCl', label: 'NaCl', name: 'хлорид натрия' },
  { formula: 'H2SO4', label: 'H₂SO₄', name: 'серная кислота' },
  { formula: 'CaCO3', label: 'CaCO₃', name: 'карбонат кальция' },
  { formula: 'Fe2O3', label: 'Fe₂O₃', name: 'оксид железа(III)' },
  { formula: 'NH4NO3', label: 'NH₄NO₃', name: 'нитрат аммония' },
  { formula: 'Ca3(PO4)2', label: 'Ca₃(PO₄)₂', name: 'фосфат кальция' },
]

/** Раствор: масса растворённого вещества и масса воды, г */
export interface Solution {
  solute: number
  water: number
}
export const solutionMass = (s: Solution) => s.solute + s.water
export const solutionFraction = (s: Solution) => (s.solute / solutionMass(s)) * 100

export type OpId = 'water' | 'evaporate' | 'salt' | 'mix'

export interface Op {
  id: OpId
  tab: string
  /** исходный раствор */
  start: Solution
  /** что меняем: масса добавленной воды / выпаренной воды / добавленной соли, г; для mix — второй раствор */
  delta: number
  second?: Solution
  what: string
  rule: string
}

export const OPS: Op[] = [
  {
    id: 'water',
    tab: 'Добавили воду',
    start: { solute: 20, water: 180 },
    delta: 50,
    what: 'К 200 г 10%-го раствора соли добавили 50 г воды.',
    rule: 'Соли столько же, раствор стал тяжелее → доля уменьшилась.',
  },
  {
    id: 'evaporate',
    tab: 'Выпарили воду',
    start: { solute: 20, water: 180 },
    delta: 100,
    what: 'Из 200 г 10%-го раствора соли выпарили 100 г воды.',
    rule: 'Соли столько же, раствор стал легче → доля увеличилась.',
  },
  {
    id: 'salt',
    tab: 'Добавили соль',
    start: { solute: 20, water: 180 },
    delta: 25,
    what: 'В 200 г 10%-го раствора растворили ещё 25 г соли.',
    rule: 'Соль прибавляется и к m(в-ва), и к m(р-ра) — к обеим массам!',
  },
  {
    id: 'mix',
    tab: 'Смешали растворы',
    start: { solute: 20, water: 180 },
    delta: 0,
    second: { solute: 90, water: 210 },
    what: 'Смешали 200 г 10%-го и 300 г 30%-го растворов соли.',
    rule: 'Складываем отдельно массы вещества и отдельно массы растворов. Проценты не складывают!',
  },
]

/** Что получится после операции */
export function applyOp(op: Op): Solution {
  const s = op.start
  switch (op.id) {
    case 'water':
      return { solute: s.solute, water: s.water + op.delta }
    case 'evaporate':
      return { solute: s.solute, water: s.water - op.delta }
    case 'salt':
      return { solute: s.solute + op.delta, water: s.water }
    case 'mix':
      return { solute: s.solute + op.second!.solute, water: s.water + op.second!.water }
  }
}
