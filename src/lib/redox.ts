import { atomsOf, type Atoms } from './balance'

/* Данные и формулы для темы «Окислительно-восстановительные реакции». Компоненты — RedoxDemos.tsx. */

export const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'

/** Степень окисления со знаком: +2, −3, 0 */
export const coText = (n: number) => (n === 0 ? '0' : `${n > 0 ? '+' : '−'}${Math.abs(n)}`)

/** Ион / частица с зарядом: Na⁺, S²⁻ */
export const chargeText = (sym: string, ch: number) =>
  ch === 0 ? sym : `${sym}${Math.abs(ch) > 1 ? SUP[Math.abs(ch)] : ''}${ch > 0 ? '⁺' : '⁻'}`

/* ------------------------------------------------------------------ TeX */

const sgn = (n: number) => (n === 0 ? '0' : `${n > 0 ? '+' : '-'}${Math.abs(n)}`)

/** Символ со степенью окисления над ним: \overset{+2}{\mathrm{Ca}} */
export const so = (sym: string, co: number, idx = 1) =>
  `\\overset{${sgn(co)}}{\\mathrm{${sym}}}${idx > 1 ? `_{${idx}}` : ''}`

export type Part = [sym: string, co: number, idx?: number]
/** Формула со степенями окисления над каждым элементом */
export const fo = (...parts: Part[]) => parts.map(([s, c, i]) => so(s, c, i ?? 1)).join('\\,')

export const E = '\\bar{e}'
export const ARROW = '\\;\\ce{->}\\;'

/* ------------------------------------------------------------------ электронный баланс */

export interface BalanceCase {
  id: string
  title: string
  /** схема со степенями окисления (TeX) */
  scheme: string
  /** что поменялось (обычный текст) */
  changed: string[]
  /** электронные уравнения (TeX) */
  red: string
  ox: string
  /** число электронов в каждом уравнении */
  redN: number
  oxN: number
  redWho: string
  oxWho: string
  /** перед какими веществами ставится множитель (обычный текст) */
  redFor: string
  oxFor: string
  /** уравнение после подстановки множителей (mhchem) */
  partial: string
  /** что ещё нужно уравнять (обычный текст) */
  rest: string
  /** итог (mhchem, без степеней окисления) */
  final: string
  /** итог со степенями окисления (TeX) */
  finalSo: string
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
export const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

export const BALANCE_CASES: BalanceCase[] = [
  {
    id: 'na-cl',
    title: 'Na + Cl₂',
    scheme: `${fo(['Na', 0])} + ${fo(['Cl', 0, 2])}${ARROW}${fo(['Na', 1], ['Cl', -1])}`,
    changed: ['Na: 0 → +1 (СО выросла)', 'Cl: 0 → −1 (СО уменьшилась)'],
    red: `${so('Na', 0)} - 1${E} \\rightarrow ${so('Na', 1)}`,
    ox: `${so('Cl', 0, 2)} + 2${E} \\rightarrow 2${so('Cl', -1)}`,
    redN: 1,
    oxN: 2,
    redWho: 'Na⁰ — восстановитель (отдаёт ē, окисляется)',
    oxWho: 'Cl₂⁰ — окислитель (принимает ē, восстанавливается)',
    redFor: 'Na и NaCl',
    oxFor: 'Cl₂',
    partial: '2Na + Cl2 -> 2NaCl',
    rest: 'Больше уравнивать нечего: натрий взят 2 раза, хлор — 2 атома в Cl₂.',
    final: '2Na + Cl2 -> 2NaCl',
    finalSo: `2${fo(['Na', 0])} + ${fo(['Cl', 0, 2])}${ARROW}2${fo(['Na', 1], ['Cl', -1])}`,
  },
  {
    id: 'mg-o2',
    title: 'Mg + O₂',
    scheme: `${fo(['Mg', 0])} + ${fo(['O', 0, 2])}${ARROW}${fo(['Mg', 2], ['O', -2])}`,
    changed: ['Mg: 0 → +2 (СО выросла)', 'O: 0 → −2 (СО уменьшилась)'],
    red: `${so('Mg', 0)} - 2${E} \\rightarrow ${so('Mg', 2)}`,
    ox: `${so('O', 0, 2)} + 4${E} \\rightarrow 2${so('O', -2)}`,
    redN: 2,
    oxN: 4,
    redWho: 'Mg⁰ — восстановитель',
    oxWho: 'O₂⁰ — окислитель',
    redFor: 'Mg и MgO',
    oxFor: 'O₂',
    partial: '2Mg + O2 -> 2MgO',
    rest: 'Кислород в O₂ — 2 атома, и каждый принимает по 2 ē, поэтому всего 4 ē.',
    final: '2Mg + O2 -> 2MgO',
    finalSo: `2${fo(['Mg', 0])} + ${fo(['O', 0, 2])}${ARROW}2${fo(['Mg', 2], ['O', -2])}`,
  },
  {
    id: 'al-s',
    title: 'Al + S',
    scheme: `${fo(['Al', 0])} + ${fo(['S', 0])}${ARROW}${fo(['Al', 3, 2], ['S', -2, 3])}`,
    changed: ['Al: 0 → +3 (СО выросла)', 'S: 0 → −2 (СО уменьшилась)'],
    red: `${so('Al', 0)} - 3${E} \\rightarrow ${so('Al', 3)}`,
    ox: `${so('S', 0)} + 2${E} \\rightarrow ${so('S', -2)}`,
    redN: 3,
    oxN: 2,
    redWho: 'Al⁰ — восстановитель',
    oxWho: 'S⁰ — окислитель',
    redFor: 'Al',
    oxFor: 'S',
    partial: '2Al + 3S -> Al2S3',
    rest: 'В Al₂S₃ два атома алюминия и три атома серы — как раз 2Al и 3S. Всё сошлось.',
    final: '2Al + 3S -> Al2S3',
    finalSo: `2${fo(['Al', 0])} + 3${fo(['S', 0])}${ARROW}${fo(['Al', 3, 2], ['S', -2, 3])}`,
  },
  {
    id: 'p-o2',
    title: 'P + O₂',
    scheme: `${fo(['P', 0])} + ${fo(['O', 0, 2])}${ARROW}${fo(['P', 5, 2], ['O', -2, 5])}`,
    changed: ['P: 0 → +5 (СО выросла)', 'O: 0 → −2 (СО уменьшилась)'],
    red: `${so('P', 0)} - 5${E} \\rightarrow ${so('P', 5)}`,
    ox: `${so('O', 0, 2)} + 4${E} \\rightarrow 2${so('O', -2)}`,
    redN: 5,
    oxN: 4,
    redWho: 'P⁰ — восстановитель',
    oxWho: 'O₂⁰ — окислитель',
    redFor: 'P (а перед P₂O₅ получится 2: в нём 2 атома P)',
    oxFor: 'O₂',
    partial: '4P + 5O2 -> 2P2O5',
    rest: 'Фосфора взяли 4 атома, а в одной формуле P₂O₅ их 2 — значит, перед P₂O₅ нужен коэффициент 2. Кислорода справа 2·5 = 10, слева 5·2 = 10.',
    final: '4P + 5O2 -> 2P2O5',
    finalSo: `4${fo(['P', 0])} + 5${fo(['O', 0, 2])}${ARROW}2${fo(['P', 5, 2], ['O', -2, 5])}`,
  },
  {
    id: 'al-hcl',
    title: 'Al + HCl',
    scheme: `${fo(['Al', 0])} + ${fo(['H', 1], ['Cl', -1])}${ARROW}${fo(['Al', 3], ['Cl', -1, 3])} + ${fo(['H', 0, 2])}`,
    changed: ['Al: 0 → +3 (СО выросла)', 'H: +1 → 0 (СО уменьшилась)', 'Cl: −1 → −1 (не изменилась)'],
    red: `${so('Al', 0)} - 3${E} \\rightarrow ${so('Al', 3)}`,
    ox: `2${so('H', 1)} + 2${E} \\rightarrow ${so('H', 0, 2)}`,
    redN: 3,
    oxN: 2,
    redWho: 'Al⁰ — восстановитель',
    oxWho: 'H⁺ (в HCl) — окислитель',
    redFor: 'Al и AlCl₃',
    oxFor: 'H₂ (перед HCl коэффициент подберём позже)',
    partial: '2Al + HCl -> 2AlCl3 + 3H2',
    rest: 'Теперь уравняем хлор, который не менял СО: справа 2·3 = 6 атомов Cl, значит, перед HCl нужен коэффициент 6. Водород проверяем последним: слева 6, справа 3·2 = 6.',
    final: '2Al + 6HCl -> 2AlCl3 + 3H2',
    finalSo: `2${fo(['Al', 0])} + 6${fo(['H', 1], ['Cl', -1])}${ARROW}2${fo(['Al', 3], ['Cl', -1, 3])} + 3${fo(['H', 0, 2])}`,
  },
  {
    id: 'fe2o3-co',
    title: 'Fe₂O₃ + CO',
    scheme: `${fo(['Fe', 3, 2], ['O', -2, 3])} + ${fo(['C', 2], ['O', -2])}${ARROW}${fo(['Fe', 0])} + ${fo(['C', 4], ['O', -2, 2])}`,
    changed: ['Fe: +3 → 0 (СО уменьшилась)', 'C: +2 → +4 (СО выросла)', 'O: −2 → −2 (не изменилась)'],
    red: `${so('C', 2)} - 2${E} \\rightarrow ${so('C', 4)}`,
    ox: `2${so('Fe', 3)} + 6${E} \\rightarrow 2${so('Fe', 0)}`,
    redN: 2,
    oxN: 6,
    redWho: 'C⁺² (в CO) — восстановитель',
    oxWho: 'Fe⁺³ (в Fe₂O₃) — окислитель',
    redFor: 'CO и CO₂',
    oxFor: 'Fe₂O₃ и Fe (в Fe₂O₃ уже 2 атома Fe)',
    partial: 'Fe2O3 + 3CO -> 2Fe + 3CO2',
    rest: 'В Fe₂O₃ уже два атома железа, поэтому все 6 ē они принимают вместе: 2Fe⁺³ + 6ē. Перед Fe₂O₃ коэффициент 1, перед железом справа — 2. Кислород проверяем последним: слева 3 + 3 = 6, справа 3·2 = 6.',
    final: 'Fe2O3 + 3CO -> 2Fe + 3CO2',
    finalSo: `${fo(['Fe', 3, 2], ['O', -2, 3])} + 3${fo(['C', 2], ['O', -2])}${ARROW}2${fo(['Fe', 0])} + 3${fo(['C', 4], ['O', -2, 2])}`,
  },
]

/** Подсчёт атомов по сторонам итогового уравнения: для проверки */
export function sideAtoms(eq: string): [Atoms, Atoms] {
  const [l, r] = eq.split('->')
  const count = (s: string) => {
    const out: Atoms = {}
    for (const raw of s.split(/\s\+\s/)) {
      const m = raw.trim().match(/^(\d+)?(.+)$/)!
      const k = m[1] ? Number(m[1]) : 1
      for (const [el, n] of Object.entries(atomsOf(m[2].replace(/\s+[\^v]$/, '')))) out[el] = (out[el] ?? 0) + n * k
    }
    return out
  }
  return [count(l), count(r)]
}

/* ------------------------------------------------------------------ шкала степеней окисления */

export interface Move {
  /** в какую степень окисления переходит */
  to: number
  ce: string
  text?: string
}

export interface ScaleState {
  co: number
  /** формула вещества с этим состоянием (mhchem) */
  form: string
  name: string
  red?: Move
  ox?: Move
  /** пояснение, если примера нет */
  note?: string
}

export interface ScaleElement {
  sym: string
  name: string
  /** номер группы (число внешних электронов) */
  group: number
  intro: string
  states: ScaleState[]
}

export const SCALE_MIN = -4
export const SCALE_MAX = 7

export const SCALE_ELEMENTS: ScaleElement[] = [
  {
    sym: 'Fe',
    name: 'Железо',
    group: 8,
    intro: 'Металл: в простом веществе (Fe⁰) только отдаёт электроны. Ионы железа могут и отдавать, и принимать.',
    states: [
      { co: 0, form: 'Fe', name: 'железо', red: { to: 2, ce: 'Fe + CuSO4 -> FeSO4 + Cu' } },
      {
        co: 2,
        form: 'FeCl2',
        name: 'хлорид железа(II)',
        red: { to: 3, ce: '2FeCl2 + Cl2 -> 2FeCl3' },
        ox: { to: 0, ce: 'FeO + CO -> Fe + CO2' },
      },
      { co: 3, form: 'FeCl3', name: 'хлорид железа(III)', ox: { to: 2, ce: '2FeCl3 + Fe -> 3FeCl2' } },
    ],
  },
  {
    sym: 'H',
    name: 'Водород',
    group: 1,
    intro: 'Водород в H₂ может быть и окислителем (с металлами), и восстановителем (с кислородом).',
    states: [
      { co: -1, form: 'NaH', name: 'гидрид натрия', red: { to: 0, ce: 'NaH + H2O -> NaOH + H2 ^' } },
      {
        co: 0,
        form: 'H2',
        name: 'водород',
        red: { to: 1, ce: '2H2 + O2 -> 2H2O' },
        ox: { to: -1, ce: '2Na + H2 -> 2NaH' },
      },
      { co: 1, form: 'HCl', name: 'соляная кислота (H⁺)', ox: { to: 0, ce: 'Zn + 2HCl -> ZnCl2 + H2 ^' } },
    ],
  },
  {
    sym: 'S',
    name: 'Сера',
    group: 6,
    intro: 'Низшая СО −2 (6 − 8), высшая +6 (номер группы). Между ними — «двойная жизнь».',
    states: [
      { co: -2, form: 'H2S', name: 'сероводород', red: { to: 0, ce: '2H2S + O2 -> 2S + 2H2O' } },
      {
        co: 0,
        form: 'S',
        name: 'сера',
        red: { to: 4, ce: 'S + O2 -> SO2' },
        ox: { to: -2, ce: 'Fe + S -> FeS' },
      },
      {
        co: 4,
        form: 'SO2',
        name: 'сернистый газ',
        red: { to: 6, ce: '2SO2 + O2 <=> 2SO3' },
        ox: { to: 0, ce: 'SO2 + 2H2S -> 3S + 2H2O' },
      },
      {
        co: 6,
        form: 'H2SO4',
        name: 'серная кислота',
        ox: { to: 4, ce: 'Cu + 2H2SO4 -> CuSO4 + SO2 ^ + 2H2O', text: 'с концентрированной кислотой' },
      },
    ],
  },
  {
    sym: 'N',
    name: 'Азот',
    group: 5,
    intro: 'Низшая СО −3 (5 − 8), высшая +5. Аммиак — только восстановитель, азотная кислота — только окислитель.',
    states: [
      { co: -3, form: 'NH3', name: 'аммиак', red: { to: 0, ce: '4NH3 + 3O2 -> 2N2 + 6H2O' } },
      {
        co: 0,
        form: 'N2',
        name: 'азот',
        red: { to: 2, ce: 'N2 + O2 <=> 2NO' },
        ox: { to: -3, ce: 'N2 + 3H2 <=> 2NH3' },
      },
      {
        co: 2,
        form: 'NO',
        name: 'оксид азота(II)',
        red: { to: 4, ce: '2NO + O2 -> 2NO2' },
        ox: { to: 0, ce: '2NO + 2H2 -> N2 + 2H2O' },
      },
      {
        co: 4,
        form: 'NO2',
        name: 'оксид азота(IV)',
        red: { to: 5, ce: '4NO2 + O2 + 2H2O -> 4HNO3' },
        ox: { to: 2, ce: 'NO2 + SO2 -> NO + SO3' },
      },
      { co: 5, form: 'HNO3', name: 'азотная кислота', ox: { to: 4, ce: 'Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 ^ + 2H2O', text: 'с концентрированной кислотой' } },
    ],
  },
  {
    sym: 'C',
    name: 'Углерод',
    group: 4,
    intro: 'Низшая СО −4 (4 − 8), высшая +4. Уголь C⁰ чаще восстановитель, но с активными металлами — окислитель.',
    states: [
      { co: -4, form: 'CH4', name: 'метан', red: { to: 4, ce: 'CH4 + 2O2 -> CO2 + 2H2O' } },
      {
        co: 0,
        form: 'C',
        name: 'уголь, графит',
        red: { to: 4, ce: 'C + O2 -> CO2' },
        ox: { to: -4, ce: '4Al + 3C -> Al4C3' },
      },
      {
        co: 2,
        form: 'CO',
        name: 'угарный газ',
        red: { to: 4, ce: 'CuO + CO -> Cu + CO2' },
        note: 'В школьных реакциях CO почти всегда восстановитель, хотя по положению в шкале он может и принимать электроны.',
      },
      { co: 4, form: 'CO2', name: 'углекислый газ', ox: { to: 0, ce: 'CO2 + 2Mg -> 2MgO + C' } },
    ],
  },
  {
    sym: 'Cl',
    name: 'Хлор',
    group: 7,
    intro: 'Низшая СО −1 (7 − 8), высшая +7. Хлор Cl₂ — классический окислитель, а хлорид-ион Cl⁻ — восстановитель.',
    states: [
      { co: -1, form: 'HCl', name: 'соляная кислота (Cl⁻)', red: { to: 0, ce: 'MnO2 + 4HCl -> MnCl2 + Cl2 ^ + 2H2O' } },
      {
        co: 0,
        form: 'Cl2',
        name: 'хлор',
        red: { to: 1, ce: 'Cl2 + 2NaOH -> NaCl + NaClO + H2O', text: 'здесь Cl₂ одновременно и окислитель, и восстановитель' },
        ox: { to: -1, ce: '2Na + Cl2 -> 2NaCl' },
      },
      {
        co: 1,
        form: 'NaClO',
        name: 'гипохлорит натрия',
        ox: { to: 0, ce: 'NaClO + 2HCl -> NaCl + Cl2 ^ + H2O' },
        note: 'Окислять хлор(+1) до более высоких СО тоже можно, но в ОГЭ таких реакций нет.',
      },
      { co: 3, form: 'NaClO2', name: 'хлорит натрия', note: 'Хлор(+3) — промежуточная степень окисления; в ОГЭ реакций с ним нет.' },
      { co: 5, form: 'KClO3', name: 'хлорат калия', ox: { to: -1, ce: '2KClO3 -> 2KCl + 3O2 ^', text: 'при нагревании' } },
      { co: 7, form: 'HClO4', name: 'хлорная кислота', note: 'Высшая СО хлора +7: отдавать больше нечего, это сильнейший окислитель.' },
    ],
  },
]

export type Role = 'red' | 'ox' | 'both'
/** Роль состояния определяется положением на шкале: низшее — восстановитель, высшее — окислитель, между — и то и другое */
export function roleOf(el: ScaleElement, i: number): Role {
  if (i === 0) return 'red'
  if (i === el.states.length - 1) return 'ox'
  return 'both'
}

/* ------------------------------------------------------------------ сдвиг СО при отдаче/принятии ē */

export interface ShiftElement {
  sym: string
  name: string
  z: number
  group: number
  min: number
  max: number
  /** возможные степени окисления */
  states: number[]
}

export const SHIFT_ELEMENTS: ShiftElement[] = [
  { sym: 'Na', name: 'Натрий', z: 11, group: 1, min: 0, max: 1, states: [0, 1] },
  { sym: 'Mg', name: 'Магний', z: 12, group: 2, min: 0, max: 2, states: [0, 2] },
  { sym: 'Al', name: 'Алюминий', z: 13, group: 3, min: 0, max: 3, states: [0, 3] },
  { sym: 'C', name: 'Углерод', z: 6, group: 4, min: -4, max: 4, states: [-4, 0, 2, 4] },
  { sym: 'N', name: 'Азот', z: 7, group: 5, min: -3, max: 5, states: [-3, 0, 1, 2, 3, 4, 5] },
  { sym: 'S', name: 'Сера', z: 16, group: 6, min: -2, max: 6, states: [-2, 0, 4, 6] },
  { sym: 'Cl', name: 'Хлор', z: 17, group: 7, min: -1, max: 7, states: [-1, 0, 1, 3, 5, 7] },
]

/** Сценарии «передачи электронов» для первой анимации */
export interface Transfer {
  red: { sym: string; name: string }
  ox: { sym: string; name: string }
  n: number
  product: string
}
export const TRANSFERS: Transfer[] = [
  { red: { sym: 'Na', name: 'натрий' }, ox: { sym: 'Cl', name: 'хлор' }, n: 1, product: 'NaCl' },
  { red: { sym: 'Mg', name: 'магний' }, ox: { sym: 'S', name: 'сера' }, n: 2, product: 'MgS' },
  { red: { sym: 'Al', name: 'алюминий' }, ox: { sym: 'N', name: 'азот' }, n: 3, product: 'AlN' },
]

/* ------------------------------------------------------------------ сложные уравнения (часть 2 ОГЭ) */

export interface ComplexCase {
  id: string
  title: string
  /** формулы веществ (mhchem), слева направо; первые nLeft — реагенты */
  ce: string[]
  nLeft: number
  /** те же вещества со степенями окисления (TeX) */
  so: string[]
  /** итоговые коэффициенты */
  coef: number[]
  /** коэффициенты после подстановки множителей (null — пока не известен) */
  partial: (number | null)[]
  /** что уравниваем дальше: по шагам */
  rest: { text: string; coef: (number | null)[] }[]
  changed: string[]
  red: string
  ox: string
  redN: number
  oxN: number
  redWho: string
  oxWho: string
  redFor: string
  oxFor: string
  /** итоговое замечание об окислителе и восстановителе (вещества) */
  answer: string
}

const wrap = (c: number | null) => (c === null || c === 1 ? '' : String(c))
/** Уравнение в mhchem с заданными коэффициентами */
export function complexCe(c: ComplexCase, coef: (number | null)[]): string {
  const t = c.ce.map((f, i) => `${wrap(coef[i])}${f}`)
  return `${t.slice(0, c.nLeft).join(' + ')} -> ${t.slice(c.nLeft).join(' + ')}`
}
/** Уравнение со степенями окисления (TeX) */
export function complexSo(c: ComplexCase, coef: (number | null)[]): string {
  const t = c.so.map((f, i) => `${wrap(coef[i])}${f}`)
  return `${t.slice(0, c.nLeft).join(' + ')}${ARROW}${t.slice(c.nLeft).join(' + ')}`
}

const H2O = fo(['H', 1, 2], ['O', -2])
const HCl = fo(['H', 1], ['Cl', -1])
const KCl = fo(['K', 1], ['Cl', -1])
const HNO3 = fo(['H', 1], ['N', 5], ['O', -2, 3])

export const COMPLEX_CASES: ComplexCase[] = [
  {
    id: 'cr-br',
    title: 'Cr(OH)₃ + Br₂ + KOH',
    ce: ['Cr(OH)3', 'Br2', 'KOH', 'K2CrO4', 'KBr', 'H2O'],
    nLeft: 3,
    so: [
      `${so('Cr', 3)}(${fo(['O', -2], ['H', 1])})_3`,
      so('Br', 0, 2),
      fo(['K', 1], ['O', -2], ['H', 1]),
      fo(['K', 1, 2], ['Cr', 6], ['O', -2, 4]),
      fo(['K', 1], ['Br', -1]),
      H2O,
    ],
    coef: [2, 3, 10, 2, 6, 8],
    partial: [2, 3, null, 2, 6, null],
    rest: [
      { text: 'Калий: справа 2·2 + 6 = 10 атомов K, значит, перед KOH коэффициент 10.', coef: [2, 3, 10, 2, 6, null] },
      { text: 'Водород: слева 2·3 + 10 = 16 атомов H, значит, перед H₂O коэффициент 16 : 2 = 8.', coef: [2, 3, 10, 2, 6, 8] },
    ],
    changed: ['Cr: +3 → +6 (СО выросла)', 'Br: 0 → −1 (СО уменьшилась)', 'K, O, H — не изменились'],
    red: `${so('Cr', 3)} - 3${E} \\rightarrow ${so('Cr', 6)}`,
    ox: `${so('Br', 0, 2)} + 2${E} \\rightarrow 2${so('Br', -1)}`,
    redN: 3,
    oxN: 2,
    redWho: 'Cr⁺³ (в Cr(OH)₃) — восстановитель',
    oxWho: 'Br₂⁰ — окислитель',
    redFor: 'Cr(OH)₃ и K₂CrO₄',
    oxFor: 'Br₂ (а перед KBr получится 6: 3 · 2 атома Br)',
    answer: 'Окислитель — Br₂, восстановитель — Cr(OH)₃ (за счёт Cr⁺³).',
  },
  {
    id: 'mn-cl',
    title: 'KMnO₄ + HCl',
    ce: ['KMnO4', 'HCl', 'KCl', 'MnCl2', 'Cl2', 'H2O'],
    nLeft: 2,
    so: [fo(['K', 1], ['Mn', 7], ['O', -2, 4]), HCl, KCl, fo(['Mn', 2], ['Cl', -1, 2]), so('Cl', 0, 2), H2O],
    coef: [2, 16, 2, 2, 5, 8],
    partial: [2, null, null, 2, 5, null],
    rest: [
      { text: 'Калий: слева 2 атома K, значит, перед KCl коэффициент 2.', coef: [2, null, 2, 2, 5, null] },
      { text: 'Хлор: справа 2 + 2·2 + 5·2 = 16 атомов Cl, значит, перед HCl коэффициент 16. (Часть хлора окислилась до Cl₂, а часть осталась в солях Cl⁻.)', coef: [2, 16, 2, 2, 5, null] },
      { text: 'Водород: слева 16 атомов H, значит, перед H₂O коэффициент 16 : 2 = 8.', coef: [2, 16, 2, 2, 5, 8] },
    ],
    changed: ['Mn: +7 → +2 (СО уменьшилась)', 'Cl: −1 → 0 (СО выросла, но только у части хлора)', 'K, H, O — не изменились'],
    red: `2${so('Cl', -1)} - 2${E} \\rightarrow ${so('Cl', 0, 2)}`,
    ox: `${so('Mn', 7)} + 5${E} \\rightarrow ${so('Mn', 2)}`,
    redN: 2,
    oxN: 5,
    redWho: 'Cl⁻¹ (в HCl) — восстановитель',
    oxWho: 'Mn⁺⁷ (в KMnO₄) — окислитель',
    redFor: 'Cl₂ (HCl — позже)',
    oxFor: 'KMnO₄ и MnCl₂',
    answer: 'Окислитель — KMnO₄ (за счёт Mn⁺⁷), восстановитель — HCl (за счёт Cl⁻¹).',
  },
  {
    id: 'cr-cl',
    title: 'K₂Cr₂O₇ + HCl',
    ce: ['K2Cr2O7', 'HCl', 'KCl', 'CrCl3', 'Cl2', 'H2O'],
    nLeft: 2,
    so: [fo(['K', 1, 2], ['Cr', 6, 2], ['O', -2, 7]), HCl, KCl, fo(['Cr', 3], ['Cl', -1, 3]), so('Cl', 0, 2), H2O],
    coef: [1, 14, 2, 2, 3, 7],
    partial: [1, null, null, 2, 3, null],
    rest: [
      { text: 'Калий: слева 2 атома K, значит, перед KCl коэффициент 2.', coef: [1, null, 2, 2, 3, null] },
      { text: 'Хлор: справа 2 + 2·3 + 3·2 = 14 атомов Cl, значит, перед HCl коэффициент 14.', coef: [1, 14, 2, 2, 3, null] },
      { text: 'Водород: слева 14 атомов H, значит, перед H₂O коэффициент 14 : 2 = 7.', coef: [1, 14, 2, 2, 3, 7] },
    ],
    changed: ['Cr: +6 → +3 (СО уменьшилась)', 'Cl: −1 → 0 (СО выросла, только у части хлора)', 'K, H, O — не изменились'],
    red: `2${so('Cl', -1)} - 2${E} \\rightarrow ${so('Cl', 0, 2)}`,
    ox: `2${so('Cr', 6)} + 6${E} \\rightarrow 2${so('Cr', 3)}`,
    redN: 2,
    oxN: 6,
    redWho: 'Cl⁻¹ (в HCl) — восстановитель',
    oxWho: 'Cr⁺⁶ (в K₂Cr₂O₇) — окислитель',
    redFor: 'Cl₂ (HCl — позже)',
    oxFor: 'K₂Cr₂O₇ (в нём 2 атома Cr — как раз 2Cr в уравнении) и CrCl₃ (коэффициент 2)',
    answer: 'Окислитель — K₂Cr₂O₇ (за счёт Cr⁺⁶), восстановитель — HCl (за счёт Cl⁻¹).',
  },
  {
    id: 'cu-hno3',
    title: 'Cu + HNO₃ (конц.)',
    ce: ['Cu', 'HNO3', 'Cu(NO3)2', 'NO2', 'H2O'],
    nLeft: 2,
    so: [so('Cu', 0), HNO3, `${so('Cu', 2)}(${fo(['N', 5], ['O', -2, 3])})_2`, fo(['N', 4], ['O', -2, 2]), H2O],
    coef: [1, 4, 1, 2, 2],
    partial: [1, null, 1, 2, null],
    rest: [
      { text: 'Азот: справа 2 + 2 = 4 атома N (часть в соли, часть в NO₂), значит, перед HNO₃ коэффициент 4.', coef: [1, 4, 1, 2, null] },
      { text: 'Водород: слева 4 атома H, значит, перед H₂O коэффициент 4 : 2 = 2.', coef: [1, 4, 1, 2, 2] },
    ],
    changed: ['Cu: 0 → +2 (СО выросла)', 'N: +5 → +4 (СО уменьшилась, только у части азота)', 'H, O — не изменились'],
    red: `${so('Cu', 0)} - 2${E} \\rightarrow ${so('Cu', 2)}`,
    ox: `${so('N', 5)} + 1${E} \\rightarrow ${so('N', 4)}`,
    redN: 2,
    oxN: 1,
    redWho: 'Cu⁰ — восстановитель',
    oxWho: 'N⁺⁵ (в HNO₃) — окислитель',
    redFor: 'Cu и Cu(NO₃)₂',
    oxFor: 'NO₂ (HNO₃ — позже)',
    answer: 'Окислитель — HNO₃ (за счёт N⁺⁵), восстановитель — Cu.',
  },
  {
    id: 'mg-h2so4',
    title: 'Mg + H₂SO₄ (конц.)',
    ce: ['Mg', 'H2SO4', 'MgSO4', 'H2S', 'H2O'],
    nLeft: 2,
    so: [so('Mg', 0), fo(['H', 1, 2], ['S', 6], ['O', -2, 4]), fo(['Mg', 2], ['S', 6], ['O', -2, 4]), fo(['H', 1, 2], ['S', -2]), H2O],
    coef: [4, 5, 4, 1, 4],
    partial: [4, null, 4, 1, null],
    rest: [
      { text: 'Сера: справа 4 + 1 = 5 атомов S (часть в соли, часть в H₂S), значит, перед H₂SO₄ коэффициент 5.', coef: [4, 5, 4, 1, null] },
      { text: 'Водород: слева 5·2 = 10 атомов H, справа в H₂S уже 2, значит, в воде 8 атомов H и перед H₂O коэффициент 4.', coef: [4, 5, 4, 1, 4] },
    ],
    changed: ['Mg: 0 → +2 (СО выросла)', 'S: +6 → −2 (СО уменьшилась, только у части серы)', 'H, O — не изменились'],
    red: `${so('Mg', 0)} - 2${E} \\rightarrow ${so('Mg', 2)}`,
    ox: `${so('S', 6)} + 8${E} \\rightarrow ${so('S', -2)}`,
    redN: 2,
    oxN: 8,
    redWho: 'Mg⁰ — восстановитель',
    oxWho: 'S⁺⁶ (в H₂SO₄) — окислитель',
    redFor: 'Mg и MgSO₄',
    oxFor: 'H₂S (H₂SO₄ — позже)',
    answer: 'Окислитель — H₂SO₄ (за счёт S⁺⁶), восстановитель — Mg.',
  },
  {
    id: 'p-hno3',
    title: 'P + HNO₃ + H₂O',
    ce: ['P', 'HNO3', 'H2O', 'H3PO4', 'NO'],
    nLeft: 3,
    so: [so('P', 0), HNO3, H2O, fo(['H', 1, 3], ['P', 5], ['O', -2, 4]), fo(['N', 2], ['O', -2])],
    coef: [3, 5, 2, 3, 5],
    partial: [3, 5, null, 3, 5],
    rest: [
      { text: 'Водород: справа 3·3 = 9 атомов H, слева в HNO₃ их 5, значит, в воде 4 атома H и перед H₂O коэффициент 2.', coef: [3, 5, 2, 3, 5] },
    ],
    changed: ['P: 0 → +5 (СО выросла)', 'N: +5 → +2 (СО уменьшилась)', 'H, O — не изменились'],
    red: `${so('P', 0)} - 5${E} \\rightarrow ${so('P', 5)}`,
    ox: `${so('N', 5)} + 3${E} \\rightarrow ${so('N', 2)}`,
    redN: 5,
    oxN: 3,
    redWho: 'P⁰ — восстановитель',
    oxWho: 'N⁺⁵ (в HNO₃) — окислитель',
    redFor: 'P и H₃PO₄',
    oxFor: 'HNO₃ и NO',
    answer: 'Окислитель — HNO₃ (за счёт N⁺⁵), восстановитель — P.',
  },
]
