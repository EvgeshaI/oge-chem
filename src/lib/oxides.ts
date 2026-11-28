/** Данные анимаций темы «Свойства оксидов, кислот, оснований и солей»: таблица реакций оксидов и образование кислых/основных солей */

export type OxideNature = 'основный' | 'амфотерный' | 'кислотный' | 'несолеобразующий'

export type OxReagentId = 'water' | 'acid' | 'alkali' | 'basic' | 'acidic'

export const OX_REAGENTS: { id: OxReagentId; label: string }[] = [
  { id: 'water', label: 'вода' },
  { id: 'acid', label: 'кислота' },
  { id: 'alkali', label: 'щёлочь' },
  { id: 'basic', label: 'основный оксид' },
  { id: 'acidic', label: 'кислотный оксид' },
]

/** '+' — идёт, '−' — не идёт, 't' — только при нагревании или сплавлении */
export interface OxCell {
  mark: '+' | '−' | 't'
  why: string
  eq?: string
}

export interface OxideRow {
  f: string
  nature: OxideNature
  cells: Record<OxReagentId, OxCell>
}

const no = (why: string): OxCell => ({ mark: '−', why })
const yes = (eq: string, why: string): OxCell => ({ mark: '+', eq, why })
const hot = (eq: string, why: string): OxCell => ({ mark: 't', eq, why })

const SAME_BASIC = 'Основное с основным не реагирует.'
const SAME_ACIDIC = 'Кислотное с кислотным не реагирует.'

export const OXIDE_ROWS: OxideRow[] = [
  {
    f: 'Na₂O',
    nature: 'основный',
    cells: {
      water: yes('Na2O + H2O -> 2NaOH', 'Гидроксид NaOH растворим (щёлочь) — оксид реагирует с водой.'),
      acid: yes('Na2O + 2HCl -> 2NaCl + H2O', 'Основный оксид + кислота → соль + вода.'),
      alkali: no(SAME_BASIC + ' В растворе щёлочи Na₂O прореагирует только с водой.'),
      basic: no(SAME_BASIC),
      acidic: yes('Na2O + CO2 -> Na2CO3', 'Основный оксид + кислотный оксид → соль.'),
    },
  },
  {
    f: 'CaO',
    nature: 'основный',
    cells: {
      water: yes('CaO + H2O -> Ca(OH)2', 'Ca(OH)₂ — щёлочь, поэтому CaO реагирует с водой (гашение извести).'),
      acid: yes('CaO + 2HCl -> CaCl2 + H2O', 'Основный оксид + кислота → соль + вода.'),
      alkali: no(SAME_BASIC),
      basic: no(SAME_BASIC),
      acidic: yes('CaO + CO2 -> CaCO3', 'Основный оксид + кислотный оксид → соль.'),
    },
  },
  {
    f: 'CuO',
    nature: 'основный',
    cells: {
      water: no('Гидроксид Cu(OH)₂ нерастворим — CuO с водой не реагирует.'),
      acid: yes('CuO + H2SO4 -> CuSO4 + H2O', 'Чёрный порошок растворяется, раствор становится голубым.'),
      alkali: no(SAME_BASIC),
      basic: no(SAME_BASIC),
      acidic: yes('CuO + SO3 -> CuSO4', 'Основный оксид + кислотный оксид → соль.'),
    },
  },
  {
    f: 'ZnO',
    nature: 'амфотерный',
    cells: {
      water: no('Амфотерные оксиды с водой не реагируют: Zn(OH)₂ нерастворим.'),
      acid: yes('ZnO + 2HCl -> ZnCl2 + H2O', 'С кислотой амфотерный оксид ведёт себя как основный.'),
      alkali: yes('ZnO + 2NaOH + H2O -> Na2[Zn(OH)4]', 'Со щёлочью — как кислотный. В растворе образуется тетрагидроксоцинкат натрия.'),
      basic: hot('ZnO + Na2O ->[t] Na2ZnO2', 'При сплавлении с основным оксидом образуется цинкат.'),
      acidic: yes('ZnO + SO3 -> ZnSO4', 'С оксидом сильной кислоты ведёт себя как основный оксид.'),
    },
  },
  {
    f: 'Al₂O₃',
    nature: 'амфотерный',
    cells: {
      water: no('Амфотерные оксиды с водой не реагируют: Al(OH)₃ нерастворим.'),
      acid: yes('Al2O3 + 6HCl -> 2AlCl3 + 3H2O', 'С кислотой амфотерный оксид ведёт себя как основный.'),
      alkali: yes('Al2O3 + 2NaOH + 3H2O -> 2Na[Al(OH)4]', 'Со щёлочью — как кислотный. В растворе образуется тетрагидроксоалюминат натрия.'),
      basic: hot('Al2O3 + Na2O ->[t] 2NaAlO2', 'При сплавлении с основным оксидом образуется алюминат.'),
      acidic: yes('Al2O3 + 3SO3 -> Al2(SO4)3', 'С оксидом сильной кислоты ведёт себя как основный оксид.'),
    },
  },
  {
    f: 'CO₂',
    nature: 'кислотный',
    cells: {
      water: yes('CO2 + H2O <=> H2CO3', 'Реакция обратима: угольная кислота неустойчива.'),
      acid: no(SAME_ACIDIC),
      alkali: yes('CO2 + 2NaOH -> Na2CO3 + H2O', 'Кислотный оксид + щёлочь → соль + вода. Углерод остаётся +4 — получается карбонат.'),
      basic: yes('CO2 + CaO -> CaCO3', 'Кислотный оксид + основный оксид → соль.'),
      acidic: no(SAME_ACIDIC),
    },
  },
  {
    f: 'SO₂',
    nature: 'кислотный',
    cells: {
      water: yes('SO2 + H2O <=> H2SO3', 'Образуется сернистая кислота (сера +4). Реакция обратима.'),
      acid: no(SAME_ACIDIC),
      alkali: yes('SO2 + 2NaOH -> Na2SO3 + H2O', 'Сера остаётся +4 — получается сульфит, а не сульфат.'),
      basic: yes('SO2 + CaO -> CaSO3', 'Кислотный оксид + основный оксид → соль (сульфит).'),
      acidic: no(SAME_ACIDIC),
    },
  },
  {
    f: 'SO₃',
    nature: 'кислотный',
    cells: {
      water: yes('SO3 + H2O -> H2SO4', 'Образуется серная кислота (сера +6).'),
      acid: no(SAME_ACIDIC),
      alkali: yes('SO3 + 2NaOH -> Na2SO4 + H2O', 'Сера +6 — получается сульфат.'),
      basic: yes('SO3 + BaO -> BaSO4', 'Кислотный оксид + основный оксид → соль.'),
      acidic: no(SAME_ACIDIC),
    },
  },
  {
    f: 'P₂O₅',
    nature: 'кислотный',
    cells: {
      water: yes('P2O5 + 3H2O -> 2H3PO4', 'Образуется фосфорная кислота (фосфор +5).'),
      acid: no(SAME_ACIDIC),
      alkali: yes('P2O5 + 6NaOH -> 2Na3PO4 + 3H2O', 'Кислотный оксид + щёлочь → соль (фосфат) + вода.'),
      basic: yes('P2O5 + 3CaO -> Ca3(PO4)2', 'Кислотный оксид + основный оксид → соль.'),
      acidic: no(SAME_ACIDIC),
    },
  },
  {
    f: 'SiO₂',
    nature: 'кислотный',
    cells: {
      water: no('Исключение среди кислотных оксидов: кремниевая кислота нерастворима, песок с водой не реагирует.'),
      acid: no(SAME_ACIDIC),
      alkali: hot('SiO2 + 2NaOH ->[t] Na2SiO3 + H2O', 'Только при сплавлении со щёлочью — образуется силикат.'),
      basic: hot('SiO2 + CaO ->[t] CaSiO3', 'Только при сплавлении — так получают силикаты.'),
      acidic: no(SAME_ACIDIC),
    },
  },
  {
    f: 'CO',
    nature: 'несолеобразующий',
    cells: {
      water: no('Несолеобразующий оксид: с водой не реагирует.'),
      acid: no('Несолеобразующий оксид не реагирует с кислотами.'),
      alkali: no('Несолеобразующий оксид не реагирует со щелочами — солей не образует.'),
      basic: no('С основными оксидами солей не образует.'),
      acidic: no('С кислотными оксидами не реагирует.'),
    },
  },
]

/** Образование кислых и основных солей: сколько молей второго реагента взяли */
export interface RatioStep {
  /** моль щёлочи (или кислоты) на 1 моль кислоты (или основания) */
  n: number
  eq: string
  salt: string
  name: string
  kind: 'кислая соль' | 'основная соль' | 'средняя соль'
}

export interface RatioSeries {
  id: string
  tab: string
  mode: 'acid' | 'base'
  /** что стоит в центре формулы: кислотный остаток или металл */
  core: string
  unit: 'H' | 'OH'
  /** чем заменяют: Na (из щёлочи) или Cl (из кислоты) */
  by: string
  first: string
  second: string
  steps: RatioStep[]
}

export const RATIO_SERIES: RatioSeries[] = [
  {
    id: 'h3po4',
    tab: 'H₃PO₄ + NaOH',
    mode: 'acid',
    core: 'PO₄',
    unit: 'H',
    by: 'Na',
    first: 'H₃PO₄',
    second: 'NaOH',
    steps: [
      { n: 1, eq: 'H3PO4 + NaOH -> NaH2PO4 + H2O', salt: 'NaH₂PO₄', name: 'дигидрофосфат натрия', kind: 'кислая соль' },
      { n: 2, eq: 'H3PO4 + 2NaOH -> Na2HPO4 + 2H2O', salt: 'Na₂HPO₄', name: 'гидрофосфат натрия', kind: 'кислая соль' },
      { n: 3, eq: 'H3PO4 + 3NaOH -> Na3PO4 + 3H2O', salt: 'Na₃PO₄', name: 'фосфат натрия', kind: 'средняя соль' },
    ],
  },
  {
    id: 'h2so4',
    tab: 'H₂SO₄ + NaOH',
    mode: 'acid',
    core: 'SO₄',
    unit: 'H',
    by: 'Na',
    first: 'H₂SO₄',
    second: 'NaOH',
    steps: [
      { n: 1, eq: 'H2SO4 + NaOH -> NaHSO4 + H2O', salt: 'NaHSO₄', name: 'гидросульфат натрия', kind: 'кислая соль' },
      { n: 2, eq: 'H2SO4 + 2NaOH -> Na2SO4 + 2H2O', salt: 'Na₂SO₄', name: 'сульфат натрия', kind: 'средняя соль' },
    ],
  },
  {
    id: 'mgoh2',
    tab: 'Mg(OH)₂ + HCl',
    mode: 'base',
    core: 'Mg',
    unit: 'OH',
    by: 'Cl',
    first: 'Mg(OH)₂',
    second: 'HCl',
    steps: [
      { n: 1, eq: 'Mg(OH)2 + HCl -> MgOHCl + H2O', salt: 'MgOHCl', name: 'гидроксохлорид магния', kind: 'основная соль' },
      { n: 2, eq: 'Mg(OH)2 + 2HCl -> MgCl2 + 2H2O', salt: 'MgCl₂', name: 'хлорид магния', kind: 'средняя соль' },
    ],
  },
]
