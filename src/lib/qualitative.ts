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
