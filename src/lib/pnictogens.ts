/** Данные об азоте и фосфоре для анимаций темы «Азот и фосфор» (значения — из опорного конспекта и справочников). */

export interface Pnictogen {
  sym: 'N' | 'P'
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
  /** на какой благородный газ похож ион Э³⁻ */
  noble: string
  /** название иона Э³⁻ и примеры соединений с ним */
  ion: string
  ionExamples: string
  /** примеры веществ, где у элемента +5 */
  plus5: string
}

export const PNICTOGENS: Pnictogen[] = [
  { sym: 'N', name: 'азот', gen: 'азота', z: 7, shells: [2, 5], eo: 3.04, r: 75, noble: 'неона', ion: 'нитрид-ион', ionExamples: 'нитридах Li₃N, Mg₃N₂', plus5: 'HNO₃, N₂O₅' },
  { sym: 'P', name: 'фосфор', gen: 'фосфора', z: 15, shells: [2, 8, 5], eo: 2.19, r: 110, noble: 'аргона', ion: 'фосфид-ион', ionExamples: 'фосфидах Ca₃P₂, Mg₃P₂', plus5: 'P₂O₅, H₃PO₄' },
]

/* ---------------------------------------------------------------- роли N и P */

export type PnOx = '−3' | '0' | '+2' | '+3' | '+4' | '+5'

export interface PnReaction {
  id: string
  el: 'N' | 'P'
  /** подпись кнопки (с чем реагирует) */
  label: string
  /** уравнение mhchem */
  eq: string
  /** степень окисления элемента в продукте */
  to: PnOx
  product: string
  role: 'окислитель' | 'восстановитель'
  cond: string
}

export const PN_REACTIONS: PnReaction[] = [
  { id: 'n-h2', el: 'N', label: 'H₂', eq: 'N2 + 3H2 <=>[{t, p, кат.}] 2NH3', to: '−3', product: 'NH₃ — аммиак', role: 'окислитель', cond: 't ≈ 450 °C, давление, катализатор Fe' },
  { id: 'n-li', el: 'N', label: 'Li', eq: '6Li + N2 -> 2Li3N', to: '−3', product: 'Li₃N — нитрид лития', role: 'окислитель', cond: 'при обычных условиях!' },
  { id: 'n-mg', el: 'N', label: 'Mg', eq: '3Mg + N2 ->[t] Mg3N2', to: '−3', product: 'Mg₃N₂ — нитрид магния', role: 'окислитель', cond: 'при нагревании' },
  { id: 'n-ca', el: 'N', label: 'Ca', eq: '3Ca + N2 ->[t] Ca3N2', to: '−3', product: 'Ca₃N₂ — нитрид кальция', role: 'окислитель', cond: 'при нагревании' },
  { id: 'n-o2', el: 'N', label: 'O₂', eq: 'N2 + O2 <=>[{разряд}] 2NO', to: '+2', product: 'NO — оксид азота(II)', role: 'восстановитель', cond: '≈ 2000 °C или электрический разряд' },
  { id: 'p-ca', el: 'P', label: 'Ca', eq: '3Ca + 2P ->[t] Ca3P2', to: '−3', product: 'Ca₃P₂ — фосфид кальция', role: 'окислитель', cond: 'при нагревании' },
  { id: 'p-mg', el: 'P', label: 'Mg', eq: '3Mg + 2P ->[t] Mg3P2', to: '−3', product: 'Mg₃P₂ — фосфид магния', role: 'окислитель', cond: 'при нагревании' },
  { id: 'p-na', el: 'P', label: 'Na', eq: '3Na + P ->[t] Na3P', to: '−3', product: 'Na₃P — фосфид натрия', role: 'окислитель', cond: 'при нагревании' },
  { id: 'p-o2-lack', el: 'P', label: 'O₂ (недост.)', eq: '4P + 3O2 -> 2P2O3', to: '+3', product: 'P₂O₃ — оксид фосфора(III)', role: 'восстановитель', cond: 'горение, кислорода мало' },
  { id: 'p-o2', el: 'P', label: 'O₂ (изб.)', eq: '4P + 5O2 -> 2P2O5', to: '+5', product: 'P₂O₅ — оксид фосфора(V)', role: 'восстановитель', cond: 'горение, кислорода много' },
  { id: 'p-cl2-lack', el: 'P', label: 'Cl₂ (недост.)', eq: '2P + 3Cl2 -> 2PCl3', to: '+3', product: 'PCl₃ — хлорид фосфора(III)', role: 'восстановитель', cond: 'хлора мало' },
  { id: 'p-cl2', el: 'P', label: 'Cl₂ (изб.)', eq: '2P + 5Cl2 -> 2PCl5', to: '+5', product: 'PCl₅ — хлорид фосфора(V)', role: 'восстановитель', cond: 'хлора много' },
  { id: 'p-hno3', el: 'P', label: 'HNO₃ (конц.)', eq: 'P + 5HNO3 -> H3PO4 + 5NO2 + H2O', to: '+5', product: 'H₃PO₄ — фосфорная кислота', role: 'восстановитель', cond: 'концентрированная кислота' },
  { id: 'p-kclo3', el: 'P', label: 'KClO₃', eq: '6P + 5KClO3 -> 3P2O5 + 5KCl', to: '+5', product: 'P₂O₅ — оксид фосфора(V)', role: 'восстановитель', cond: 'трение — вспышка спички' },
]

/** Ступени степеней окисления с примерами веществ (сверху вниз) */
export const PN_LEVELS: Record<'N' | 'P', { ox: PnOx; examples: string }[]> = {
  N: [
    { ox: '+5', examples: 'HNO₃, N₂O₅, KNO₃' },
    { ox: '+4', examples: 'NO₂' },
    { ox: '+2', examples: 'NO' },
    { ox: '0', examples: 'N₂ — простое вещество' },
    { ox: '−3', examples: 'NH₃, Li₃N, Mg₃N₂' },
  ],
  P: [
    { ox: '+5', examples: 'P₂O₅, PCl₅, H₃PO₄' },
    { ox: '+3', examples: 'P₂O₃, PCl₃' },
    { ox: '0', examples: 'P — простое вещество' },
    { ox: '−3', examples: 'PH₃, Ca₃P₂, Mg₃P₂' },
  ],
}

/* ---------------------------------------------------------------- избыток / недостаток */

export interface AmountCase {
  /** окислитель */
  ox: 'O2' | 'Cl2'
  lack: boolean
  eq: string
  product: string
  name: string
  /** степень окисления фосфора */
  pOx: '+3' | '+5'
  /** сколько атомов окислителя приходится на один атом P в продукте */
  perP: number
  /** сколько молекул окислителя на 4 атома P (для O₂) или 2 атома P (для Cl₂) */
  molecules: number
  atomsP: number
}

export const AMOUNT_CASES: AmountCase[] = [
  { ox: 'O2', lack: true, eq: '4P + 3O2 -> 2P2O3', product: 'P₂O₃', name: 'оксид фосфора(III)', pOx: '+3', perP: 1.5, molecules: 3, atomsP: 4 },
  { ox: 'O2', lack: false, eq: '4P + 5O2 -> 2P2O5', product: 'P₂O₅', name: 'оксид фосфора(V)', pOx: '+5', perP: 2.5, molecules: 5, atomsP: 4 },
  { ox: 'Cl2', lack: true, eq: '2P + 3Cl2 -> 2PCl3', product: 'PCl₃', name: 'хлорид фосфора(III)', pOx: '+3', perP: 3, molecules: 3, atomsP: 2 },
  { ox: 'Cl2', lack: false, eq: '2P + 5Cl2 -> 2PCl5', product: 'PCl₅', name: 'хлорид фосфора(V)', pOx: '+5', perP: 5, molecules: 5, atomsP: 2 },
]
