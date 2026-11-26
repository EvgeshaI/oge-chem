/** Данные об углероде и кремнии для анимаций темы «Углерод и кремний» (значения — из опорного конспекта и справочников). */

export interface Tetrel {
  sym: 'C' | 'Si'
  name: string
  /** родительный падеж для подписей */
  gen: string
  z: number
  /** электроны по слоям */
  shells: number[]
  /** электроотрицательность по Полингу */
  eo: number
  /** радиус атома, пм */
  r: number
  /** на какой благородный газ похож атом с с. о. −4 */
  noble: string
  /** примеры веществ, где у элемента −4 */
  minus4: string
  /** примеры веществ, где у элемента +4 */
  plus4: string
}

export const TETRELS: Tetrel[] = [
  { sym: 'C', name: 'углерод', gen: 'углерода', z: 6, shells: [2, 4], eo: 2.55, r: 77, noble: 'неона', minus4: 'CH₄, Al₄C₃', plus4: 'CO₂, CaCO₃' },
  { sym: 'Si', name: 'кремний', gen: 'кремния', z: 14, shells: [2, 8, 4], eo: 1.9, r: 118, noble: 'аргона', minus4: 'Mg₂Si, Ca₂Si', plus4: 'SiO₂, Na₂SiO₃' },
]

/* ---------------------------------------------------------------- роли C и Si */

export type CsOx = '−4' | '−1' | '0' | '+2' | '+4'

export interface CsReaction {
  id: string
  el: 'C' | 'Si'
  /** подпись кнопки (с чем реагирует) */
  label: string
  /** уравнение mhchem */
  eq: string
  /** степень окисления элемента в продукте */
  to: CsOx
  product: string
  role: 'окислитель' | 'восстановитель'
  cond: string
}

export const CS_REACTIONS: CsReaction[] = [
  { id: 'c-o2', el: 'C', label: 'O₂ (изб.)', eq: 'C + O2 -> CO2', to: '+4', product: 'CO₂ — углекислый газ', role: 'восстановитель', cond: 'горение, кислорода много' },
  { id: 'c-o2-lack', el: 'C', label: 'O₂ (недост.)', eq: '2C + O2 -> 2CO', to: '+2', product: 'CO — угарный газ', role: 'восстановитель', cond: 'горение, кислорода мало' },
  { id: 'c-co2', el: 'C', label: 'CO₂', eq: 'C + CO2 ->[t] 2CO', to: '+2', product: 'CO — угарный газ', role: 'восстановитель', cond: 'CO₂ над раскалённым углём' },
  { id: 'c-cuo', el: 'C', label: 'CuO', eq: 'CuO + C ->[t] Cu + CO', to: '+2', product: 'Cu — медь', role: 'восстановитель', cond: 'при нагревании' },
  { id: 'c-fe2o3', el: 'C', label: 'Fe₂O₃', eq: 'Fe2O3 + 3C ->[t] 2Fe + 3CO', to: '+2', product: 'Fe — железо', role: 'восстановитель', cond: 'в доменной печи' },
  { id: 'c-h2o', el: 'C', label: 'H₂O (пар)', eq: 'C + H2O ->[t] CO + H2', to: '+2', product: 'CO + H₂ — «водяной газ»', role: 'восстановитель', cond: 'водяной пар, ≈ 1000 °C' },
  { id: 'c-hno3', el: 'C', label: 'HNO₃ (конц.)', eq: 'C + 4HNO3 -> CO2 + 4NO2 + 2H2O', to: '+4', product: 'CO₂, бурый NO₂ и H₂O', role: 'восстановитель', cond: 'концентрированная кислота, t' },
  { id: 'c-h2so4', el: 'C', label: 'H₂SO₄ (конц.)', eq: 'C + 2H2SO4 -> CO2 + 2SO2 + 2H2O', to: '+4', product: 'CO₂, SO₂ и H₂O', role: 'восстановитель', cond: 'концентрированная кислота, t' },
  { id: 'c-ca', el: 'C', label: 'Ca', eq: 'Ca + 2C ->[t] CaC2', to: '−1', product: 'CaC₂ — карбид кальция', role: 'окислитель', cond: 'при сильном нагревании' },
  { id: 'c-al', el: 'C', label: 'Al', eq: '4Al + 3C ->[t] Al4C3', to: '−4', product: 'Al₄C₃ — карбид алюминия', role: 'окислитель', cond: 'при сильном нагревании' },
  { id: 'c-h2', el: 'C', label: 'H₂', eq: 'C + 2H2 ->[{t, кат.}] CH4', to: '−4', product: 'CH₄ — метан', role: 'окислитель', cond: 'нагревание, катализатор' },
  { id: 'c-si', el: 'C', label: 'Si', eq: 'Si + C ->[t] SiC', to: '−4', product: 'SiC — карборунд', role: 'окислитель', cond: 'при сильном нагревании' },
  { id: 'si-o2', el: 'Si', label: 'O₂', eq: 'Si + O2 ->[t] SiO2', to: '+4', product: 'SiO₂ — оксид кремния(IV)', role: 'восстановитель', cond: 'при нагревании' },
  { id: 'si-cl2', el: 'Si', label: 'Cl₂', eq: 'Si + 2Cl2 ->[t] SiCl4', to: '+4', product: 'SiCl₄ — хлорид кремния(IV)', role: 'восстановитель', cond: 'при нагревании' },
  { id: 'si-c', el: 'Si', label: 'C', eq: 'Si + C ->[t] SiC', to: '+4', product: 'SiC — карборунд', role: 'восстановитель', cond: 'при сильном нагревании' },
  { id: 'si-naoh', el: 'Si', label: 'NaOH + H₂O', eq: 'Si + 2NaOH + H2O -> Na2SiO3 + 2H2 ^', to: '+4', product: 'Na₂SiO₃ — силикат натрия, и H₂', role: 'восстановитель', cond: 'раствор щёлочи' },
  { id: 'si-mg', el: 'Si', label: 'Mg', eq: '2Mg + Si ->[t] Mg2Si', to: '−4', product: 'Mg₂Si — силицид магния', role: 'окислитель', cond: 'при нагревании' },
  { id: 'si-ca', el: 'Si', label: 'Ca', eq: '2Ca + Si ->[t] Ca2Si', to: '−4', product: 'Ca₂Si — силицид кальция', role: 'окислитель', cond: 'при нагревании' },
]

/** Ступени степеней окисления с примерами веществ (сверху вниз) */
export const CS_LEVELS: Record<'C' | 'Si', { ox: CsOx; examples: string }[]> = {
  C: [
    { ox: '+4', examples: 'CO₂, H₂CO₃, CaCO₃' },
    { ox: '+2', examples: 'CO' },
    { ox: '0', examples: 'C — алмаз, графит, уголь' },
    { ox: '−1', examples: 'CaC₂' },
    { ox: '−4', examples: 'CH₄, Al₄C₃, SiC' },
  ],
  Si: [
    { ox: '+4', examples: 'SiO₂, Na₂SiO₃, SiCl₄, SiC' },
    { ox: '0', examples: 'Si — простое вещество' },
    { ox: '−4', examples: 'Mg₂Si, Ca₂Si' },
  ],
}

/* ---------------------------------------------------------------- горение углерода */

export interface BurnCase {
  id: 'excess' | 'lack' | 'co2'
  label: string
  eq: string
  product: 'CO₂' | 'CO'
  name: string
  /** степень окисления углерода в продукте */
  cOx: '+2' | '+4'
  /** частицы «было»: атомы C и молекулы-окислители */
  atomsC: number
  oxidizer: { formula: 'O₂' | 'CO₂'; count: number }
  /** сколько молекул продукта */
  molecules: number
}

export const BURN_CASES: BurnCase[] = [
  { id: 'excess', label: 'много O₂ (избыток)', eq: 'C + O2 -> CO2', product: 'CO₂', name: 'оксид углерода(IV), углекислый газ', cOx: '+4', atomsC: 1, oxidizer: { formula: 'O₂', count: 1 }, molecules: 1 },
  { id: 'lack', label: 'мало O₂ (недостаток)', eq: '2C + O2 -> 2CO', product: 'CO', name: 'оксид углерода(II), угарный газ', cOx: '+2', atomsC: 2, oxidizer: { formula: 'O₂', count: 1 }, molecules: 2 },
  { id: 'co2', label: 'CO₂ над раскалённым углём', eq: 'C + CO2 ->[t] 2CO', product: 'CO', name: 'оксид углерода(II), угарный газ', cOx: '+2', atomsC: 1, oxidizer: { formula: 'CO₂', count: 1 }, molecules: 2 },
]

/* ---------------------------------------------------------------- восстановление металлов углём */

export interface ReductionCase {
  /** формула оксида (Unicode) */
  oxide: string
  metal: string
  /** место металла в ряду активности (индекс в ACTIVITY) */
  sym: string
  reacts: boolean
  eq?: string
  /** цвет порошка до и после */
  from: string
  to: string
  fromName: string
  toName: string
}

export const ACTIVITY = ['Li', 'K', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Hg', 'Ag', 'Au']
/** углём восстанавливают металлы правее алюминия */
export const CARBON_LIMIT = ACTIVITY.indexOf('Al')

export const REDUCTION_CASES: ReductionCase[] = [
  { oxide: 'CuO', metal: 'медь', sym: 'Cu', reacts: true, eq: 'CuO + C ->[t] Cu + CO', from: '#1d1d22', to: '#c4622d', fromName: 'чёрный порошок CuO', toName: 'красная медь' },
  { oxide: 'ZnO', metal: 'цинк', sym: 'Zn', reacts: true, eq: 'ZnO + C ->[t] Zn + CO', from: '#f1f1ec', to: '#9ea3ad', fromName: 'белый порошок ZnO', toName: 'серый цинк' },
  { oxide: 'Fe₂O₃', metal: 'железо', sym: 'Fe', reacts: true, eq: 'Fe2O3 + 3C ->[t] 2Fe + 3CO', from: '#8a3a1e', to: '#4d5058', fromName: 'красно-бурый Fe₂O₃', toName: 'серое железо' },
  { oxide: 'MgO', metal: 'магний', sym: 'Mg', reacts: false, from: '#f4f4f0', to: '#f4f4f0', fromName: 'белый порошок MgO', toName: 'без изменений' },
  { oxide: 'Al₂O₃', metal: 'алюминий', sym: 'Al', reacts: false, from: '#ecebe6', to: '#ecebe6', fromName: 'белый порошок Al₂O₃', toName: 'без изменений' },
  { oxide: 'CaO', metal: 'кальций', sym: 'Ca', reacts: false, from: '#f7f6f1', to: '#f7f6f1', fromName: 'белый порошок CaO', toName: 'без изменений' },
]
