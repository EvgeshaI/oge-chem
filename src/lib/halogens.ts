/** Данные о галогенах для анимаций темы «Галогены» (значения — из рабочего листа и справочников). */

export interface Halogen {
  sym: 'F' | 'Cl' | 'Br' | 'I'
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
  /** длина связи Г–Г в молекуле, пм */
  bond: number
  /** температура плавления / кипения простого вещества, °C */
  mp: number
  bp: number
  state: 'газ' | 'жидкость' | 'твёрдое'
  colorName: string
  /** цвет атома/молекулы на схемах */
  fill: string
  stroke: string
  /** цвет простого вещества в «пробирке» */
  look: string
  /** рядом с названием: изучается ли в ОГЭ */
  oge: boolean
}

export const HALOGENS: Halogen[] = [
  {
    sym: 'F', name: 'фтор', gen: 'фтора', z: 9, shells: [2, 7], eo: 3.98, r: 72, bond: 142, mp: -220, bp: -188,
    state: 'газ', colorName: 'светло-жёлтый', fill: '#f3ecb0', stroke: '#c8bd5a', look: '#f1e68a', oge: true,
  },
  {
    sym: 'Cl', name: 'хлор', gen: 'хлора', z: 17, shells: [2, 8, 7], eo: 3.16, r: 99, bond: 199, mp: -101, bp: -34,
    state: 'газ', colorName: 'жёлто-зелёный', fill: '#cfe56a', stroke: '#8fae1f', look: '#c4dc4f', oge: true,
  },
  {
    sym: 'Br', name: 'бром', gen: 'брома', z: 35, shells: [2, 8, 18, 7], eo: 2.96, r: 114, bond: 228, mp: -7, bp: 59,
    state: 'жидкость', colorName: 'красно-бурый', fill: '#e9946a', stroke: '#b4502a', look: '#a8341a', oge: false,
  },
  {
    sym: 'I', name: 'иод', gen: 'иода', z: 53, shells: [2, 8, 18, 18, 7], eo: 2.66, r: 133, bond: 267, mp: 114, bp: 184,
    state: 'твёрдое', colorName: 'тёмно-фиолетовый', fill: '#c9a6e6', stroke: '#8a55b8', look: '#4a2a78', oge: false,
  },
]

export const halogenBy = (sym: string) => HALOGENS.find((h) => h.sym === sym)!

/** Агрегатное состояние простого вещества при температуре t (°C) */
export function stateAtTemp(h: Halogen, t: number): 'твёрдое' | 'жидкость' | 'газ' {
  if (t < h.mp) return 'твёрдое'
  if (t < h.bp) return 'жидкость'
  return 'газ'
}

/** Нижний индекс: 'Cl2' → 'Cl₂' */
export const sub = (s: string) => s.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])

/** Более активный галоген вытесняет менее активный: индекс в HALOGENS меньше = активнее */
export const displaces = (halogen: Halogen['sym'], salt: Halogen['sym']) =>
  HALOGENS.findIndex((h) => h.sym === halogen) < HALOGENS.findIndex((h) => h.sym === salt)
