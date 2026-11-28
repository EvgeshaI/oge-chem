/** Данные анимации «Качественные реакции на ионы» (тема «Свойства оксидов, кислот, оснований и солей») */

export interface IonTest {
  ion: string
  group: 'anion' | 'cation'
  sample: string
  reagent: string
  effect: 'precip' | 'gas' | 'color'
  /** цвет осадка или окраски раствора */
  color: string
  /** цвет исходного раствора */
  liquid?: string
  look: string
  eq?: string
  excess?: { eq: string; look: string }
}

export const ION_TESTS: IonTest[] = [
  { ion: 'Cl⁻', group: 'anion', sample: 'NaCl', reagent: 'AgNO₃', effect: 'precip', color: '#f6f6f0', look: 'белый творожистый осадок', eq: 'Ag+ + Cl- -> AgCl v' },
  { ion: 'Br⁻', group: 'anion', sample: 'NaBr', reagent: 'AgNO₃', effect: 'precip', color: '#eee6a6', look: 'бледно-жёлтый осадок', eq: 'Ag+ + Br- -> AgBr v' },
  { ion: 'I⁻', group: 'anion', sample: 'KI', reagent: 'AgNO₃', effect: 'precip', color: '#f2d93c', look: 'жёлтый осадок', eq: 'Ag+ + I- -> AgI v' },
  { ion: 'SO₄²⁻', group: 'anion', sample: 'Na₂SO₄', reagent: 'BaCl₂', effect: 'precip', color: '#f6f6f0', look: 'белый осадок, не растворяется в кислотах', eq: 'Ba^2+ + SO4^2- -> BaSO4 v' },
  { ion: 'PO₄³⁻', group: 'anion', sample: 'Na₃PO₄', reagent: 'AgNO₃', effect: 'precip', color: '#f0cf45', look: 'жёлтый осадок', eq: '3Ag+ + PO4^3- -> Ag3PO4 v' },
  { ion: 'CO₃²⁻', group: 'anion', sample: 'Na₂CO₃', reagent: 'HCl', effect: 'gas', color: '#cfe8ff', look: 'выделяется газ без запаха; он вызывает помутнение известковой воды', eq: 'CO3^2- + 2H+ -> H2O + CO2 ^' },
  { ion: 'SiO₃²⁻', group: 'anion', sample: 'Na₂SiO₃', reagent: 'HCl', effect: 'precip', color: '#e3ebf3', look: 'белый студенистый осадок (гель) кремниевой кислоты', eq: 'SiO3^2- + 2H+ -> H2SiO3 v' },
  { ion: 'OH⁻', group: 'anion', sample: 'NaOH', reagent: 'фенолфталеин', effect: 'color', color: 'rgba(214,51,108,.8)', look: 'раствор окрашивается в малиновый цвет' },
  { ion: 'NH₄⁺', group: 'cation', sample: 'NH₄Cl', reagent: 'NaOH, t', effect: 'gas', color: '#e8f0ff', look: 'запах аммиака; влажная красная лакмусовая бумажка синеет', eq: 'NH4+ + OH- ->[t] NH3 ^ + H2O' },
  { ion: 'Ca²⁺', group: 'cation', sample: 'CaCl₂', reagent: 'Na₂CO₃', effect: 'precip', color: '#f6f6f0', look: 'белый осадок', eq: 'Ca^2+ + CO3^2- -> CaCO3 v' },
  { ion: 'Mg²⁺', group: 'cation', sample: 'MgCl₂', reagent: 'NaOH', effect: 'precip', color: '#f6f6f0', look: 'белый осадок', eq: 'Mg^2+ + 2OH- -> Mg(OH)2 v' },
  {
    ion: 'Al³⁺',
    group: 'cation',
    sample: 'AlCl₃',
    reagent: 'NaOH',
    effect: 'precip',
    color: '#f2f4f6',
    look: 'белый студенистый осадок',
    eq: 'Al^3+ + 3OH- -> Al(OH)3 v',
    excess: { eq: 'Al(OH)3 + OH- -> [Al(OH)4]-', look: 'В избытке щёлочи осадок растворяется — Al(OH)₃ амфотерен' },
  },
  {
    ion: 'Zn²⁺',
    group: 'cation',
    sample: 'ZnCl₂',
    reagent: 'NaOH',
    effect: 'precip',
    color: '#f2f4f6',
    look: 'белый осадок',
    eq: 'Zn^2+ + 2OH- -> Zn(OH)2 v',
    excess: { eq: 'Zn(OH)2 + 2OH- -> [Zn(OH)4]^2-', look: 'В избытке щёлочи осадок растворяется — Zn(OH)₂ амфотерен' },
  },
  { ion: 'Fe²⁺', group: 'cation', sample: 'FeSO₄', reagent: 'NaOH', effect: 'precip', color: '#7f9a6a', liquid: 'rgba(170,220,170,.25)', look: 'серо-зелёный осадок, на воздухе постепенно буреет', eq: 'Fe^2+ + 2OH- -> Fe(OH)2 v' },
  { ion: 'Fe³⁺', group: 'cation', sample: 'FeCl₃', reagent: 'NaOH', effect: 'precip', color: '#9a4a1c', liquid: 'rgba(235,175,60,.35)', look: 'бурый осадок', eq: 'Fe^3+ + 3OH- -> Fe(OH)3 v' },
  { ion: 'Cu²⁺', group: 'cation', sample: 'CuSO₄', reagent: 'NaOH', effect: 'precip', color: '#4ea8de', liquid: 'rgba(80,160,230,.35)', look: 'голубой осадок', eq: 'Cu^2+ + 2OH- -> Cu(OH)2 v' },
]
