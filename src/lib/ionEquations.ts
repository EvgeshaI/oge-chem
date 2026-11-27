/**
 * Данные для темы «Реакции ионного обмена».
 * Каждое вещество — набор цветных кусочков (Seg): катион — синий, анион — красный,
 * индекс или коэффициент — оранжевый. Из одних и тех же данных строятся анимации,
 * формулы в уроках и проверка уравнений в тестах.
 */

export type Kind = 'cat' | 'an' | 'k' | 'plain' | 'solid' | 'gas' | 'water'
export type Seg = [text: string, kind: Kind]
export type Mark = '↓' | '↑'

export interface IonDef {
  /** сколько таких ионов даёт одна формульная единица (индекс → коэффициент) */
  n: number
  seg: Seg[]
  /** ион-«наблюдатель»: слева и справа одинаков, в реакции не участвует */
  spec?: boolean
}

export interface Term {
  coef: number
  /** формула в молекулярном уравнении */
  mol: Seg[]
  /** если вещество записывают ионами */
  ions?: IonDef[]
  mark?: Mark
  /** почему так записываем (для шага «что расписывать на ионы») */
  why: string
}

export interface Reaction {
  id: string
  /** подпись на вкладке */
  tab: string
  kind: 'solid' | 'gas' | 'water' | 'none'
  left: Term[]
  right: Term[]
  /** что наблюдаем */
  look: string
  /** какое условие выполнено */
  condition: string
}

export interface Item {
  id: string
  coef: number
  segs: Seg[]
  mark?: Mark
  spec?: boolean
}

const C = (t: string): Seg[] => [[t, 'cat']]
const A = (t: string): Seg[] => [[t, 'an']]

export const REACTIONS: Reaction[] = [
  {
    id: 'baso4',
    tab: 'BaCl₂ + Na₂SO₄',
    kind: 'solid',
    left: [
      { coef: 1, mol: [['Ba', 'cat'], ['Cl', 'an'], ['₂', 'k']], ions: [{ n: 1, seg: C('Ba²⁺') }, { n: 2, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 1, mol: [['Na', 'cat'], ['₂', 'k'], ['SO₄', 'an']], ions: [{ n: 2, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('SO₄²⁻') }], why: 'растворимая соль → ионы' },
    ],
    right: [
      { coef: 1, mol: [['BaSO₄', 'solid']], mark: '↓', why: 'нерастворим (осадок) → формула' },
      { coef: 2, mol: [['Na', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
    ],
    look: 'Раствор мутнеет: выпадает белый осадок сульфата бария.',
    condition: 'Образовалось нерастворимое вещество — осадок.',
  },
  {
    id: 'co2',
    tab: 'Na₂CO₃ + HCl',
    kind: 'gas',
    left: [
      { coef: 1, mol: [['Na', 'cat'], ['₂', 'k'], ['CO₃', 'an']], ions: [{ n: 2, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('CO₃²⁻') }], why: 'растворимая соль → ионы' },
      { coef: 2, mol: [['H', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('H⁺') }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'сильная кислота → ионы' },
    ],
    right: [
      { coef: 2, mol: [['Na', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 1, mol: [['H₂O', 'water']], why: 'слабый электролит → формула' },
      { coef: 1, mol: [['CO₂', 'gas']], mark: '↑', why: 'газ → формула' },
    ],
    look: 'Раствор «закипает»: выделяются пузырьки углекислого газа.',
    condition: 'Выделился газ (и образовалась вода).',
  },
  {
    id: 'water',
    tab: 'NaOH + HCl',
    kind: 'water',
    left: [
      { coef: 1, mol: [['Na', 'cat'], ['OH', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('OH⁻') }], why: 'щёлочь → ионы' },
      { coef: 1, mol: [['H', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('H⁺') }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'сильная кислота → ионы' },
    ],
    right: [
      { coef: 1, mol: [['Na', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 1, mol: [['H₂O', 'water']], why: 'слабый электролит → формула' },
    ],
    look: 'Видимых признаков нет: раствор остаётся прозрачным (но немного нагревается). Узнать о реакции можно по индикатору.',
    condition: 'Образовалось малодиссоциирующее вещество — вода.',
  },
  {
    id: 'cuoh2',
    tab: 'CuSO₄ + NaOH',
    kind: 'solid',
    left: [
      { coef: 1, mol: [['Cu', 'cat'], ['SO₄', 'an']], ions: [{ n: 1, seg: C('Cu²⁺') }, { n: 1, seg: A('SO₄²⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 2, mol: [['Na', 'cat'], ['OH', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('OH⁻') }], why: 'щёлочь → ионы' },
    ],
    right: [
      { coef: 1, mol: [['Cu(OH)₂', 'solid']], mark: '↓', why: 'нерастворимое основание (осадок) → формула' },
      { coef: 1, mol: [['Na', 'cat'], ['₂', 'k'], ['SO₄', 'an']], ions: [{ n: 2, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('SO₄²⁻'), spec: true }], why: 'растворимая соль → ионы' },
    ],
    look: 'Выпадает голубой студенистый осадок гидроксида меди(II).',
    condition: 'Образовалось нерастворимое основание — осадок.',
  },
  {
    id: 'cuoh2-acid',
    tab: 'Cu(OH)₂ + HCl',
    kind: 'water',
    left: [
      { coef: 1, mol: [['Cu(OH)₂', 'solid']], why: 'нерастворимое основание → формула' },
      { coef: 2, mol: [['H', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('H⁺') }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'сильная кислота → ионы' },
    ],
    right: [
      { coef: 1, mol: [['Cu', 'cat'], ['Cl', 'an'], ['₂', 'k']], ions: [{ n: 1, seg: C('Cu²⁺') }, { n: 2, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 2, mol: [['H₂O', 'water']], why: 'слабый электролит → формула' },
    ],
    look: 'Голубой осадок растворяется, раствор становится голубым (ионы меди).',
    condition: 'Образовалась вода; нерастворимое основание записывают формулой.',
  },
  {
    id: 'none',
    tab: 'NaCl + KNO₃',
    kind: 'none',
    left: [
      { coef: 1, mol: [['Na', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 1, mol: [['K', 'cat'], ['NO₃', 'an']], ions: [{ n: 1, seg: C('K⁺'), spec: true }, { n: 1, seg: A('NO₃⁻'), spec: true }], why: 'растворимая соль → ионы' },
    ],
    right: [
      { coef: 1, mol: [['Na', 'cat'], ['NO₃', 'an']], ions: [{ n: 1, seg: C('Na⁺'), spec: true }, { n: 1, seg: A('NO₃⁻'), spec: true }], why: 'растворимая соль → ионы' },
      { coef: 1, mol: [['K', 'cat'], ['Cl', 'an']], ions: [{ n: 1, seg: C('K⁺'), spec: true }, { n: 1, seg: A('Cl⁻'), spec: true }], why: 'растворимая соль → ионы' },
    ],
    look: 'Ничего не происходит: получилась просто смесь четырёх видов ионов.',
    condition: 'Нет ни осадка, ни газа, ни воды — реакция не идёт.',
  },
]

export const reactionById = (id: string) => REACTIONS.find((r) => r.id === id)!

const itemsOfTerm = (t: Term, key: string, full: boolean): Item[] => {
  if (full && t.ions) return t.ions.map((ion, i) => ({ id: `${key}.${i}`, coef: t.coef * ion.n, segs: ion.seg, spec: ion.spec }))
  return [{ id: key, coef: t.coef, segs: t.mol, mark: t.mark }]
}

/** Члены одной части уравнения: molecular — формулы, full — ионы там, где вещество распадается */
export function sideItems(terms: Term[], side: 'L' | 'R', full: boolean): Item[] {
  return terms.flatMap((t, i) => itemsOfTerm(t, `${side}${i}`, full))
}

/** Сокращённое уравнение: полное без ионов-наблюдателей */
export const shortItems = (items: Item[]) => items.filter((it) => !it.spec)

/* -------------------------------------------------- перевод в запись mhchem */

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }

/** «SO₄²⁻» → «SO4^2-» */
export function toCe(text: string): string {
  return text
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/([⁰¹²³⁴-⁹]*)([⁺⁻])/g, (_, d: string, s: string) => `^${[...d].map((c) => SUP[c]).join('')}${s === '⁺' ? '+' : '-'}`)
}

export const segsText = (segs: Seg[]) => segs.map((s) => s[0]).join('')

/** Заряд иона по подписи «SO₄²⁻» (для не-ионов — 0) */
export function chargeOf(segs: Seg[]): number {
  const m = segsText(segs).match(/([²³]?)([⁺⁻])$/)
  if (!m) return 0
  return (m[1] ? ({ '²': 2, '³': 3 } as Record<string, number>)[m[1]] : 1) * (m[2] === '⁺' ? 1 : -1)
}

export const sideCharge = (items: Item[]) => items.reduce((s, it) => s + it.coef * chargeOf(it.segs), 0)

/** Уравнение строкой для проверки: «Ba^2+ + 2Cl- -> BaSO4 v» */
export function equationCe(left: Item[], right: Item[]): string {
  const side = (items: Item[]) =>
    items.map((it) => `${it.coef > 1 ? it.coef : ''}${toCe(segsText(it.segs))}${it.mark ? (it.mark === '↓' ? ' v' : ' ^') : ''}`).join(' + ')
  return `${side(left)} -> ${side(right)}`
}

/* ------------------------------------------------ цвета формул в уроках (светлый фон) */

export const LIGHT: Record<Kind, string> = {
  cat: '#2f7fec',
  an: '#e5484d',
  k: '#e8890c',
  plain: '#1b2445',
  solid: '#a15c00',
  gas: '#0f9d7a',
  water: '#0891b2',
}

/** Цветная формула в TeX: коэффициент оранжевый, катион синий, анион красный */
export function itemsTex(items: Item[], spectators: 'keep' | 'drop' = 'keep'): string {
  return items
    .filter((it) => spectators === 'keep' || !it.spec)
    .map((it) => {
      const coef = it.coef > 1 ? `\\textcolor{${LIGHT.k}}{${it.coef}}` : ''
      const body = it.segs
        .map(([t, k]) => {
          const ce = toCe(t)
          return k === 'k' ? `\\textcolor{${LIGHT.k}}{{}_{${ce}}}` : `\\textcolor{${LIGHT[k]}}{\\ce{${ce}}}`
        })
        .join('')
      const mark = it.mark ? `\\textcolor{${it.mark === '↓' ? LIGHT.solid : LIGHT.gas}}{${it.mark === '↓' ? '\\downarrow' : '\\uparrow'}}` : ''
      return `${coef}${body}${mark}`
    })
    .join(' + ')
}

export const equationTex = (left: Item[], right: Item[]) => `${itemsTex(left)} \\to ${itemsTex(right)}`
