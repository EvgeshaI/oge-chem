/**
 * Эксперименты виртуальной лаборатории (задание 23 ОГЭ по химии).
 * № 1 — из демоверсии 2027 г.; № 2–6 — тренировочные, составлены по тому же образцу.
 */

export const CLEAR = 'rgba(255,255,255,.14)'
const PALE_GREEN = 'rgba(170,220,170,.3)'
const YELLOW = 'rgba(235,175,60,.35)'
const BLUE = 'rgba(80,180,220,.35)'

interface Solution {
  formula: string
  /** «гидроксид калия» */
  name: string
  /** «гидроксида калия» — для условия задания */
  of: string
  /** цвет раствора */
  liquid: string
}

const solution = (formula: string, name: string, of: string, liquid = CLEAR): Solution => ({ formula, name, of, liquid })

export const SOLUTIONS = {
  KOH: solution('KOH', 'гидроксид калия', 'гидроксида калия'),
  NaOH: solution('NaOH', 'гидроксид натрия', 'гидроксида натрия'),
  HCl: solution('HCl', 'соляная кислота', 'соляной кислоты'),
  H2O2: solution('H₂O₂', 'пероксид водорода', 'пероксида водорода'),
  Na2SO4: solution('Na₂SO₄', 'сульфат натрия', 'сульфата натрия'),
  FeSO4: solution('FeSO₄', 'сульфат железа(II)', 'сульфата железа(II)', PALE_GREEN),
  BaCl2: solution('BaCl₂', 'хлорид бария', 'хлорида бария'),
  'Ba(NO3)2': solution('Ba(NO₃)₂', 'нитрат бария', 'нитрата бария'),
  K2CO3: solution('K₂CO₃', 'карбонат калия', 'карбоната калия'),
  Na2CO3: solution('Na₂CO₃', 'карбонат натрия', 'карбоната натрия'),
  MgCl2: solution('MgCl₂', 'хлорид магния', 'хлорида магния'),
  FeCl3: solution('FeCl₃', 'хлорид железа(III)', 'хлорида железа(III)', YELLOW),
  CuCl2: solution('CuCl₂', 'хлорид меди(II)', 'хлорида меди(II)', BLUE),
  NaCl: solution('NaCl', 'хлорид натрия', 'хлорида натрия'),
  KCl: solution('KCl', 'хлорид калия', 'хлорида калия'),
  KNO3: solution('KNO₃', 'нитрат калия', 'нитрата калия'),
  NH4Cl: solution('NH₄Cl', 'хлорид аммония', 'хлорида аммония'),
  Na2SiO3: solution('Na₂SiO₃', 'силикат натрия', 'силиката натрия'),
  Na3PO4: solution('Na₃PO₄', 'фосфат натрия', 'фосфата натрия'),
  'Ca(NO3)2': solution('Ca(NO₃)₂', 'нитрат кальция', 'нитрата кальция'),
  AgNO3: solution('AgNO₃', 'нитрат серебра', 'нитрата серебра'),
} satisfies Record<string, Solution>

export type ChemId = keyof typeof SOLUTIONS

/** Варианты записи в таблице; в каждом эксперименте часть из них не наблюдается */
export const OBSERVATIONS = {
  none: 'Изменений нет',
  white: 'Выпал белый осадок',
  gel: 'Выпал белый студенистый осадок',
  yellow: 'Выпал жёлтый осадок',
  greygreen: 'Выпал серо-зелёный осадок',
  blue: 'Выпал голубой осадок',
  brown: 'Выпал бурый осадок',
  gas: 'Выделился газ без запаха',
  smell: 'Выделился газ с резким запахом',
}

export type ObsId = keyof typeof OBSERVATIONS

export interface Look {
  obs: ObsId
  /** ещё одна запись, которую тоже засчитываем */
  also?: ObsId
  /** цвет содержимого пробирки после добавления реактива */
  liquid: string
  /** цвет осадка и его доля высоты пробирки */
  precip?: string
  precipH?: number
  /** идут пузырьки */
  bubbles?: boolean
}

const solid = (obs: ObsId, liquid: string, precip: string): Look => ({ obs, liquid, precip, precipH: 0.3 })

const WHITE = solid('white', 'rgba(245,245,240,.38)', '#f6f6f0')
const GREEN = solid('greygreen', 'rgba(127,154,106,.42)', '#7f9a6a')
const BROWN = solid('brown', 'rgba(154,74,28,.45)', '#9a4a1c')
const SKY = solid('blue', 'rgba(78,168,222,.4)', '#4ea8de')
const LEMON = solid('yellow', 'rgba(240,207,69,.42)', '#f0cf45')
const GEL: Look = { obs: 'gel', also: 'white', liquid: 'rgba(227,235,243,.45)', precip: 'rgba(227,235,243,.72)', precipH: 0.46 }
const GAS: Look = { obs: 'gas', liquid: 'rgba(207,232,255,.22)', bubbles: true }
const AMMONIA: Look = { obs: 'smell', liquid: 'rgba(207,232,255,.22)', bubbles: true }

/** Реакция, по которой определяют вещество */
export interface Detection {
  substance: ChemId
  reagent: ChemId
  look: Look
  /** уравнения в записи mhchem */
  molecular: string
  full: string
  short: string
  why: string
}

export interface Experiment {
  id: number
  /** взят из демоверсии, а не составлен по образцу */
  demo?: boolean
  /** вещества в склянках — в порядке перечисления в условии */
  substances: [ChemId, ChemId]
  /** реактивы — в порядке перечисления в условии; один из них лишний */
  reagents: [ChemId, ChemId, ChemId]
  /** две нужные реакции — в порядке опытов эталонной таблицы */
  detections: [Detection, Detection]
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: 1,
    demo: true,
    substances: ['KOH', 'Na2SO4'],
    reagents: ['BaCl2', 'H2O2', 'FeSO4'],
    detections: [
      {
        substance: 'KOH',
        reagent: 'FeSO4',
        look: GREEN,
        molecular: '2KOH + FeSO4 -> Fe(OH)2 v + K2SO4',
        full: '2K+ + 2OH- + Fe^2+ + SO4^2- -> Fe(OH)2 v + 2K+ + SO4^2-',
        short: 'Fe^2+ + 2OH- -> Fe(OH)2 v',
        why: 'Гидроксид-ионы щёлочи дают с ионами Fe²⁺ серо-зелёный осадок гидроксида железа(II). На воздухе он постепенно буреет.',
      },
      {
        substance: 'Na2SO4',
        reagent: 'BaCl2',
        look: WHITE,
        molecular: 'Na2SO4 + BaCl2 -> BaSO4 v + 2NaCl',
        full: '2Na+ + SO4^2- + Ba^2+ + 2Cl- -> BaSO4 v + 2Na+ + 2Cl-',
        short: 'Ba^2+ + SO4^2- -> BaSO4 v',
        why: 'Сульфат-ионы дают с ионами Ba²⁺ белый осадок сульфата бария, нерастворимый в кислотах.',
      },
    ],
  },
  {
    id: 2,
    substances: ['K2CO3', 'MgCl2'],
    reagents: ['HCl', 'NaOH', 'KNO3'],
    detections: [
      {
        substance: 'K2CO3',
        reagent: 'HCl',
        look: GAS,
        molecular: 'K2CO3 + 2HCl -> 2KCl + H2O + CO2 ^',
        full: '2K+ + CO3^2- + 2H+ + 2Cl- -> 2K+ + 2Cl- + H2O + CO2 ^',
        short: 'CO3^2- + 2H+ -> H2O + CO2 ^',
        why: 'Карбонат-ионы с кислотой образуют угольную кислоту, которая сразу распадается: выделяется углекислый газ без запаха.',
      },
      {
        substance: 'MgCl2',
        reagent: 'NaOH',
        look: WHITE,
        molecular: 'MgCl2 + 2NaOH -> Mg(OH)2 v + 2NaCl',
        full: 'Mg^2+ + 2Cl- + 2Na+ + 2OH- -> Mg(OH)2 v + 2Na+ + 2Cl-',
        short: 'Mg^2+ + 2OH- -> Mg(OH)2 v',
        why: 'Ионы Mg²⁺ дают со щёлочью белый осадок гидроксида магния. В избытке щёлочи он не растворяется.',
      },
    ],
  },
  {
    id: 3,
    substances: ['HCl', 'NaOH'],
    reagents: ['NaCl', 'FeCl3', 'Na2CO3'],
    detections: [
      {
        substance: 'NaOH',
        reagent: 'FeCl3',
        look: BROWN,
        molecular: '3NaOH + FeCl3 -> Fe(OH)3 v + 3NaCl',
        full: '3Na+ + 3OH- + Fe^3+ + 3Cl- -> Fe(OH)3 v + 3Na+ + 3Cl-',
        short: 'Fe^3+ + 3OH- -> Fe(OH)3 v',
        why: 'Гидроксид-ионы щёлочи дают с ионами Fe³⁺ бурый осадок гидроксида железа(III).',
      },
      {
        substance: 'HCl',
        reagent: 'Na2CO3',
        look: GAS,
        molecular: '2HCl + Na2CO3 -> 2NaCl + H2O + CO2 ^',
        full: '2H+ + 2Cl- + 2Na+ + CO3^2- -> 2Na+ + 2Cl- + H2O + CO2 ^',
        short: '2H+ + CO3^2- -> H2O + CO2 ^',
        why: 'Ионы водорода кислоты вытесняют из карбоната углекислый газ без запаха.',
      },
    ],
  },
  {
    id: 4,
    substances: ['Ba(NO3)2', 'KOH'],
    reagents: ['CuCl2', 'Na2SO4', 'KNO3'],
    detections: [
      {
        substance: 'KOH',
        reagent: 'CuCl2',
        look: SKY,
        molecular: '2KOH + CuCl2 -> Cu(OH)2 v + 2KCl',
        full: '2K+ + 2OH- + Cu^2+ + 2Cl- -> Cu(OH)2 v + 2K+ + 2Cl-',
        short: 'Cu^2+ + 2OH- -> Cu(OH)2 v',
        why: 'Гидроксид-ионы щёлочи дают с ионами Cu²⁺ голубой осадок гидроксида меди(II).',
      },
      {
        substance: 'Ba(NO3)2',
        reagent: 'Na2SO4',
        look: WHITE,
        molecular: 'Ba(NO3)2 + Na2SO4 -> BaSO4 v + 2NaNO3',
        full: 'Ba^2+ + 2NO3- + 2Na+ + SO4^2- -> BaSO4 v + 2Na+ + 2NO3-',
        short: 'Ba^2+ + SO4^2- -> BaSO4 v',
        why: 'Ионы Ba²⁺ дают с сульфат-ионами белый осадок сульфата бария.',
      },
    ],
  },
  {
    id: 5,
    substances: ['NH4Cl', 'Na2SiO3'],
    reagents: ['KNO3', 'NaOH', 'HCl'],
    detections: [
      {
        substance: 'NH4Cl',
        reagent: 'NaOH',
        look: AMMONIA,
        molecular: 'NH4Cl + NaOH -> NaCl + NH3 ^ + H2O',
        full: 'NH4+ + Cl- + Na+ + OH- -> Na+ + Cl- + NH3 ^ + H2O',
        short: 'NH4+ + OH- -> NH3 ^ + H2O',
        why: 'Ионы аммония реагируют со щёлочью: выделяется аммиак — газ с резким запахом. При нагревании запах сильнее.',
      },
      {
        substance: 'Na2SiO3',
        reagent: 'HCl',
        look: GEL,
        molecular: 'Na2SiO3 + 2HCl -> H2SiO3 v + 2NaCl',
        full: '2Na+ + SiO3^2- + 2H+ + 2Cl- -> H2SiO3 v + 2Na+ + 2Cl-',
        short: 'SiO3^2- + 2H+ -> H2SiO3 v',
        why: 'Сильная кислота вытесняет из силиката нерастворимую кремниевую кислоту — белый студенистый осадок.',
      },
    ],
  },
  {
    id: 6,
    substances: ['Na3PO4', 'Ca(NO3)2'],
    reagents: ['Na2CO3', 'AgNO3', 'KCl'],
    detections: [
      {
        substance: 'Na3PO4',
        reagent: 'AgNO3',
        look: LEMON,
        molecular: 'Na3PO4 + 3AgNO3 -> Ag3PO4 v + 3NaNO3',
        full: '3Na+ + PO4^3- + 3Ag+ + 3NO3- -> Ag3PO4 v + 3Na+ + 3NO3-',
        short: '3Ag+ + PO4^3- -> Ag3PO4 v',
        why: 'Фосфат-ионы дают с ионами серебра жёлтый осадок фосфата серебра.',
      },
      {
        substance: 'Ca(NO3)2',
        reagent: 'Na2CO3',
        look: WHITE,
        molecular: 'Ca(NO3)2 + Na2CO3 -> CaCO3 v + 2NaNO3',
        full: 'Ca^2+ + 2NO3- + 2Na+ + CO3^2- -> CaCO3 v + 2Na+ + 2NO3-',
        short: 'Ca^2+ + CO3^2- -> CaCO3 v',
        why: 'Ионы Ca²⁺ дают с карбонат-ионами белый осадок карбоната кальция.',
      },
    ],
  },
]
