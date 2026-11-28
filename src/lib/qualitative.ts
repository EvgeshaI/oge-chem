/** Данные анимации «Что происходит на уровне ионов» (тема «Качественные реакции») */

export interface QIon {
  label: string
  sign: '+' | '-'
  n: number
  /** ион связывается и уходит из раствора */
  reacts?: boolean
}

export interface QualExample {
  /** ион, который обнаруживаем (совпадает с ION_TESTS.ion) */
  ion: string
  sample: { name: string; ions: QIon[] }
  reagent: { name: string; ions: QIon[] }
  product: { kind: 'solid' | 'gas'; label: string; color: string }
  look: string
}

export const QUAL_EXAMPLES: QualExample[] = [
  {
    ion: 'Cl⁻',
    sample: { name: 'NaCl', ions: [{ label: 'Na⁺', sign: '+', n: 1 }, { label: 'Cl⁻', sign: '-', n: 1, reacts: true }] },
    reagent: { name: 'AgNO₃', ions: [{ label: 'Ag⁺', sign: '+', n: 1, reacts: true }, { label: 'NO₃⁻', sign: '-', n: 1 }] },
    product: { kind: 'solid', label: 'AgCl↓', color: '#f6f6f0' },
    look: 'Ионы Ag⁺ и Cl⁻ связываются — выпадает белый творожистый осадок.',
  },
  {
    ion: 'SO₄²⁻',
    sample: { name: 'Na₂SO₄', ions: [{ label: 'Na⁺', sign: '+', n: 2 }, { label: 'SO₄²⁻', sign: '-', n: 1, reacts: true }] },
    reagent: { name: 'BaCl₂', ions: [{ label: 'Ba²⁺', sign: '+', n: 1, reacts: true }, { label: 'Cl⁻', sign: '-', n: 2 }] },
    product: { kind: 'solid', label: 'BaSO₄↓', color: '#f6f6f0' },
    look: 'Ионы Ba²⁺ и SO₄²⁻ связываются — выпадает белый осадок, нерастворимый в кислотах.',
  },
  {
    ion: 'CO₃²⁻',
    sample: { name: 'Na₂CO₃', ions: [{ label: 'Na⁺', sign: '+', n: 2 }, { label: 'CO₃²⁻', sign: '-', n: 1, reacts: true }] },
    reagent: { name: 'HCl', ions: [{ label: 'H⁺', sign: '+', n: 2, reacts: true }, { label: 'Cl⁻', sign: '-', n: 2 }] },
    product: { kind: 'gas', label: 'CO₂↑', color: '#cfe8ff' },
    look: 'Ионы CO₃²⁻ и H⁺ образуют H₂CO₃, она сразу распадается — выделяется газ CO₂ без запаха.',
  },
  {
    ion: 'Ca²⁺',
    sample: { name: 'CaCl₂', ions: [{ label: 'Ca²⁺', sign: '+', n: 1, reacts: true }, { label: 'Cl⁻', sign: '-', n: 2 }] },
    reagent: { name: 'Na₂CO₃', ions: [{ label: 'Na⁺', sign: '+', n: 2 }, { label: 'CO₃²⁻', sign: '-', n: 1, reacts: true }] },
    product: { kind: 'solid', label: 'CaCO₃↓', color: '#f6f6f0' },
    look: 'Ионы Ca²⁺ и CO₃²⁻ связываются — выпадает белый осадок.',
  },
  {
    ion: 'Cu²⁺',
    sample: { name: 'CuSO₄', ions: [{ label: 'Cu²⁺', sign: '+', n: 1, reacts: true }, { label: 'SO₄²⁻', sign: '-', n: 1 }] },
    reagent: { name: 'NaOH', ions: [{ label: 'Na⁺', sign: '+', n: 2 }, { label: 'OH⁻', sign: '-', n: 2, reacts: true }] },
    product: { kind: 'solid', label: 'Cu(OH)₂↓', color: '#4ea8de' },
    look: 'Ионы Cu²⁺ и OH⁻ связываются — выпадает голубой осадок.',
  },
  {
    ion: 'Fe³⁺',
    sample: { name: 'FeCl₃', ions: [{ label: 'Fe³⁺', sign: '+', n: 1, reacts: true }, { label: 'Cl⁻', sign: '-', n: 3 }] },
    reagent: { name: 'NaOH', ions: [{ label: 'Na⁺', sign: '+', n: 3 }, { label: 'OH⁻', sign: '-', n: 3, reacts: true }] },
    product: { kind: 'solid', label: 'Fe(OH)₃↓', color: '#9a4a1c' },
    look: 'Ионы Fe³⁺ и OH⁻ связываются — выпадает бурый осадок.',
  },
  {
    ion: 'NH₄⁺',
    sample: { name: 'NH₄Cl', ions: [{ label: 'NH₄⁺', sign: '+', n: 1, reacts: true }, { label: 'Cl⁻', sign: '-', n: 1 }] },
    reagent: { name: 'NaOH, t', ions: [{ label: 'Na⁺', sign: '+', n: 1 }, { label: 'OH⁻', sign: '-', n: 1, reacts: true }] },
    product: { kind: 'gas', label: 'NH₃↑', color: '#e8f0ff' },
    look: 'При нагревании NH₄⁺ и OH⁻ дают аммиак NH₃ — резкий запах, влажная красная лакмусовая бумажка синеет.',
  },
]

/** Анимация «Избыток щёлочи»: осадок гидроксида после каждой капли NaOH */
export interface ExcessStage {
  /** доля высоты осадка, 0…1 */
  precip: number
  text: string
  eq?: string
}

export interface ExcessCase {
  ion: string
  sample: string
  hydroxide: string
  color: string
  amphoteric: boolean
  stages: ExcessStage[]
}

export const EXCESS_CASES: ExcessCase[] = [
  {
    ion: 'Al³⁺',
    sample: 'AlCl₃',
    hydroxide: 'Al(OH)₃',
    color: '#f2f4f6',
    amphoteric: true,
    stages: [
      { precip: 0, text: 'Раствор соли алюминия прозрачен. Начинаем добавлять щёлочь по каплям.' },
      { precip: 0.14, text: 'Первые капли: выпадает белый студенистый осадок Al(OH)₃.', eq: 'Al^3+ + 3OH- -> Al(OH)3 v' },
      { precip: 0.3, text: 'Осадка становится больше: ионы Al³⁺ продолжают связываться.', eq: 'Al^3+ + 3OH- -> Al(OH)3 v' },
      { precip: 0.42, text: 'Все ионы Al³⁺ осаждены — осадок максимальный. Если остановиться здесь, реакцию на Al³⁺ видно хорошо.' },
      { precip: 0.2, text: 'Щёлочь в избытке: осадок начинает растворяться — Al(OH)₃ реагирует со щёлочью как кислота.', eq: 'Al(OH)3 + OH- -> [Al(OH)4]-' },
      { precip: 0, text: 'Осадок растворился полностью: образовался растворимый комплекс. Признак реакции потерян!', eq: 'Al(OH)3 + OH- -> [Al(OH)4]-' },
    ],
  },
  {
    ion: 'Zn²⁺',
    sample: 'ZnCl₂',
    hydroxide: 'Zn(OH)₂',
    color: '#f2f4f6',
    amphoteric: true,
    stages: [
      { precip: 0, text: 'Раствор соли цинка прозрачен. Начинаем добавлять щёлочь по каплям.' },
      { precip: 0.14, text: 'Первые капли: выпадает белый осадок Zn(OH)₂.', eq: 'Zn^2+ + 2OH- -> Zn(OH)2 v' },
      { precip: 0.3, text: 'Осадка становится больше: ионы Zn²⁺ продолжают связываться.', eq: 'Zn^2+ + 2OH- -> Zn(OH)2 v' },
      { precip: 0.42, text: 'Все ионы Zn²⁺ осаждены — осадок максимальный.' },
      { precip: 0.2, text: 'Щёлочь в избытке: осадок начинает растворяться — Zn(OH)₂ амфотерен.', eq: 'Zn(OH)2 + 2OH- -> [Zn(OH)4]^2-' },
      { precip: 0, text: 'Осадок растворился полностью: образовался растворимый комплекс. Признак реакции потерян!', eq: 'Zn(OH)2 + 2OH- -> [Zn(OH)4]^2-' },
    ],
  },
  {
    ion: 'Mg²⁺',
    sample: 'MgCl₂',
    hydroxide: 'Mg(OH)₂',
    color: '#f6f6f0',
    amphoteric: false,
    stages: [
      { precip: 0, text: 'Для сравнения — соль магния. Добавляем щёлочь по каплям.' },
      { precip: 0.14, text: 'Выпадает белый осадок Mg(OH)₂.', eq: 'Mg^2+ + 2OH- -> Mg(OH)2 v' },
      { precip: 0.3, text: 'Осадка становится больше.', eq: 'Mg^2+ + 2OH- -> Mg(OH)2 v' },
      { precip: 0.42, text: 'Все ионы Mg²⁺ осаждены — осадок максимальный.' },
      { precip: 0.42, text: 'Добавляем щёлочь в избытке — осадок не меняется: Mg(OH)₂ обычное основание, со щёлочью не реагирует.' },
      { precip: 0.42, text: 'Сколько ни добавляй щёлочи, осадок остаётся. Так Mg²⁺ отличают от Al³⁺ и Zn²⁺.' },
    ],
  },
]
