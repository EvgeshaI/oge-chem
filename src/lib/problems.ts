// Данные анимаций темы «Решение задач» (задание 22 ОГЭ).

/** Что за величина в «звене» цепочки — от этого зависит цвет */
export type LinkKind = 'solution' | 'mass' | 'amount' | 'volume' | 'fraction'

export const KIND_NAME: Record<LinkKind, string> = {
  solution: 'масса раствора',
  mass: 'масса вещества',
  amount: 'количество вещества',
  volume: 'объём газа',
  fraction: 'массовая доля',
}

/** Переход между веществами по коэффициентам — единственный «мост» в уравнении */
export const BRIDGE = 'по уравнению'

export interface ChainLink {
  kind: LinkKind
  /** «n(CaCO₃) = 0,2 моль» */
  box: string
  /** действие на стрелке к этому звену; у первого звена в ряду его нет */
  how?: string
  /** пояснение шага с вычислением */
  calc: string
}

export interface Problem {
  id: string
  condition: string
  /** уравнение в записи mhchem */
  eq: string
  rows: { label?: string; links: ChainLink[] }[]
  answer: string
}

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    condition:
      'К 200 г раствора карбоната натрия с массовой долей соли 10,6% добавили избыток раствора хлорида кальция. Вычислите массу образовавшегося осадка.',
    eq: 'Na2CO3 + CaCl2 -> CaCO3 v + 2NaCl',
    rows: [
      {
        links: [
          { kind: 'solution', box: 'm(р-ра) = 200 г', calc: 'Дано: раствор Na₂CO₃ массой 200 г, ω = 10,6% (0,106).' },
          { kind: 'mass', box: 'm(Na₂CO₃) = 21,2 г', how: '× ω', calc: 'Из раствора берём только соль: m(Na₂CO₃) = 200 · 0,106 = 21,2 г.' },
          { kind: 'amount', box: 'n(Na₂CO₃) = 0,2 моль', how: '÷ M', calc: 'M(Na₂CO₃) = 2·23 + 12 + 3·16 = 106 г/моль; n = 21,2 / 106 = 0,2 моль.' },
          { kind: 'amount', box: 'n(CaCO₃) = 0,2 моль', how: BRIDGE, calc: 'По уравнению n(Na₂CO₃) : n(CaCO₃) = 1 : 1, значит n(CaCO₃) = 0,2 моль.' },
          { kind: 'mass', box: 'm(CaCO₃) = 20 г', how: '× M', calc: 'M(CaCO₃) = 40 + 12 + 3·16 = 100 г/моль; m = 0,2 · 100 = 20 г.' },
        ],
      },
    ],
    answer: 'масса осадка CaCO₃ — 20 г',
  },
  {
    id: 'p2',
    condition:
      'К 73 г соляной кислоты с массовой долей хлороводорода 10% добавили избыток карбоната кальция. Вычислите объём (н. у.) выделившегося газа.',
    eq: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2 ^',
    rows: [
      {
        links: [
          { kind: 'solution', box: 'm(р-ра) = 73 г', calc: 'Дано: соляная кислота — это раствор HCl в воде, ω = 10% (0,1).' },
          { kind: 'mass', box: 'm(HCl) = 7,3 г', how: '× ω', calc: 'm(HCl) = 73 · 0,1 = 7,3 г.' },
          { kind: 'amount', box: 'n(HCl) = 0,2 моль', how: '÷ M', calc: 'M(HCl) = 1 + 35,5 = 36,5 г/моль; n = 7,3 / 36,5 = 0,2 моль.' },
          { kind: 'amount', box: 'n(CO₂) = 0,1 моль', how: BRIDGE, calc: 'По уравнению n(HCl) : n(CO₂) = 2 : 1, значит n(CO₂) = 0,2 / 2 = 0,1 моль.' },
          { kind: 'volume', box: 'V(CO₂) = 2,24 л', how: '× 22,4', calc: 'При н. у. V = n · Vm = 0,1 моль · 22,4 л/моль = 2,24 л.' },
        ],
      },
    ],
    answer: 'объём CO₂ — 2,24 л',
  },
  {
    id: 'p3',
    condition:
      'К 170 г раствора нитрата серебра добавили избыток раствора хлорида натрия. Выпал осадок массой 14,35 г. Вычислите массовую долю нитрата серебра в исходном растворе.',
    eq: 'AgNO3 + NaCl -> AgCl v + NaNO3',
    rows: [
      {
        links: [
          { kind: 'mass', box: 'm(AgCl) = 14,35 г', calc: 'Начинаем с того, о чём известно всё: осадок — чистое вещество, его масса дана.' },
          { kind: 'amount', box: 'n(AgCl) = 0,1 моль', how: '÷ M', calc: 'M(AgCl) = 108 + 35,5 = 143,5 г/моль; n = 14,35 / 143,5 = 0,1 моль.' },
          { kind: 'amount', box: 'n(AgNO₃) = 0,1 моль', how: BRIDGE, calc: 'По уравнению n(AgNO₃) : n(AgCl) = 1 : 1, значит n(AgNO₃) = 0,1 моль.' },
          { kind: 'mass', box: 'm(AgNO₃) = 17 г', how: '× M', calc: 'M(AgNO₃) = 108 + 14 + 3·16 = 170 г/моль; m = 0,1 · 170 = 17 г.' },
          { kind: 'fraction', box: 'ω(AgNO₃) = 10%', how: '÷ m(р-ра)', calc: 'ω = m(в-ва) / m(р-ра) · 100% = 17 / 170 · 100% = 10%.' },
        ],
      },
    ],
    answer: 'массовая доля AgNO₃ — 10%',
  },
  {
    id: 'p4',
    condition:
      'Какую массу раствора гидроксида натрия с массовой долей 20% нужно добавить к 160 г раствора сульфата меди(II) с массовой долей 20%, чтобы полностью осадить медь в виде гидроксида?',
    eq: '2NaOH + CuSO4 -> Cu(OH)2 v + Na2SO4',
    rows: [
      {
        label: 'Раствор сульфата меди(II): о нём известно всё',
        links: [
          { kind: 'solution', box: 'm(р-ра CuSO₄) = 160 г', calc: 'Дано: раствор CuSO₄ массой 160 г, ω = 20% (0,2).' },
          { kind: 'mass', box: 'm(CuSO₄) = 32 г', how: '× ω', calc: 'm(CuSO₄) = 160 · 0,2 = 32 г.' },
          { kind: 'amount', box: 'n(CuSO₄) = 0,2 моль', how: '÷ M', calc: 'M(CuSO₄) = 64 + 32 + 4·16 = 160 г/моль; n = 32 / 160 = 0,2 моль.' },
        ],
      },
      {
        label: 'Раствор щёлочи: его массу нужно найти',
        links: [
          { kind: 'amount', box: 'n(NaOH) = 0,4 моль', how: BRIDGE, calc: 'По уравнению n(NaOH) : n(CuSO₄) = 2 : 1, значит n(NaOH) = 2 · 0,2 = 0,4 моль.' },
          { kind: 'mass', box: 'm(NaOH) = 16 г', how: '× M', calc: 'M(NaOH) = 23 + 16 + 1 = 40 г/моль; m = 0,4 · 40 = 16 г.' },
          { kind: 'solution', box: 'm(р-ра NaOH) = 80 г', how: '÷ ω', calc: '16 г — это чистая щёлочь. Раствора нужно больше: m(р-ра) = 16 / 0,2 = 80 г.' },
        ],
      },
    ],
    answer: 'масса раствора NaOH — 80 г',
  },
  {
    id: 'p5',
    condition:
      '10 г карбоната кальция полностью растворили в 94,4 г соляной кислоты, взятой в избытке. Вычислите массовую долю соли в образовавшемся растворе.',
    eq: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2 ^',
    rows: [
      {
        label: '1. Масса соли в новом растворе',
        links: [
          { kind: 'mass', box: 'm(CaCO₃) = 10 г', calc: 'CaCO₃ — чистое вещество, он растворился полностью. Кислота в избытке, по ней не считаем.' },
          { kind: 'amount', box: 'n(CaCO₃) = 0,1 моль', how: '÷ M', calc: 'M(CaCO₃) = 100 г/моль; n = 10 / 100 = 0,1 моль.' },
          { kind: 'amount', box: 'n(CaCl₂) = 0,1 моль', how: BRIDGE, calc: 'По уравнению n(CaCO₃) : n(CaCl₂) = 1 : 1, значит n(CaCl₂) = 0,1 моль.' },
          { kind: 'mass', box: 'm(CaCl₂) = 11,1 г', how: '× M', calc: 'M(CaCl₂) = 40 + 2·35,5 = 111 г/моль; m = 0,1 · 111 = 11,1 г.' },
        ],
      },
      {
        label: '2. Масса нового раствора: газ из него улетел',
        links: [
          { kind: 'amount', box: 'n(CO₂) = 0,1 моль', how: BRIDGE, calc: 'Снова от CaCO₃ по уравнению: n(CaCO₃) : n(CO₂) = 1 : 1, значит n(CO₂) = 0,1 моль.' },
          { kind: 'mass', box: 'm(CO₂) = 4,4 г', how: '× M', calc: 'M(CO₂) = 12 + 2·16 = 44 г/моль; m = 0,1 · 44 = 4,4 г.' },
          { kind: 'solution', box: 'm(р-ра) = 100 г', how: 'баланс масс', calc: 'm(р-ра) = m(CaCO₃) + m(кислоты) − m(CO₂) = 10 + 94,4 − 4,4 = 100 г.' },
        ],
      },
      {
        label: '3. Массовая доля соли',
        links: [{ kind: 'fraction', box: 'ω(CaCl₂) = 11,1%', calc: 'ω = m(CaCl₂) / m(р-ра) · 100% = 11,1 / 100 · 100% = 11,1%.' }],
      },
    ],
    answer: 'массовая доля CaCl₂ — 11,1%',
  },
]

/** Анимация «Мост через количество вещества» */
export interface BridgeReaction {
  tab: string
  eq: string
  /** сколько веществ слева от стрелки */
  nLeft: number
  species: { f: string; label: string; k: number; M: number }[]
}

export const BRIDGE_REACTIONS: BridgeReaction[] = [
  {
    tab: 'Щёлочь + соль меди',
    eq: '2NaOH + CuSO4 -> Cu(OH)2 v + Na2SO4',
    nLeft: 2,
    species: [
      { f: 'NaOH', label: 'NaOH', k: 2, M: 40 },
      { f: 'CuSO4', label: 'CuSO₄', k: 1, M: 160 },
      { f: 'Cu(OH)2', label: 'Cu(OH)₂', k: 1, M: 98 },
      { f: 'Na2SO4', label: 'Na₂SO₄', k: 1, M: 142 },
    ],
  },
  {
    tab: 'Мел + соляная кислота',
    eq: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2 ^',
    nLeft: 2,
    species: [
      { f: 'CaCO3', label: 'CaCO₃', k: 1, M: 100 },
      { f: 'HCl', label: 'HCl', k: 2, M: 36.5 },
      { f: 'CaCl2', label: 'CaCl₂', k: 1, M: 111 },
      { f: 'H2O', label: 'H₂O', k: 1, M: 18 },
      { f: 'CO2', label: 'CO₂', k: 1, M: 44 },
    ],
  },
]

/** Анимация «Масса вещества, а не раствора» */
export const SOLUTION_EXAMPLE = { mSolution: 200, w: 0.106, M: 106, productM: 100 }

/** Число по-русски: запятая, без лишних нулей */
export const num = (x: number, d = 2) => String(Math.round(x * 10 ** d) / 10 ** d).replace('.', ',')
