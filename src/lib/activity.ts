/** Электрохимический ряд напряжений и генерация уравнений для интерактива «Ряд напряжений». */

export type WaterMode = 'cold' | 'hot' | 'steam' | 'film' | 'no'

export interface Metal {
  sym: string
  name: string
  /** валентность в солях (для уравнений) */
  v: number
  water: WaterMode
  /** входит ли металл в кодификатор ОГЭ */
  oge: boolean
}

/** Ряд активности: Li K Ba Ca Na Mg Al Zn Fe Ni Sn Pb (H₂) Cu Hg Ag Pt Au */
export const SERIES: Metal[] = [
  { sym: 'Li', name: 'литий', v: 1, water: 'cold', oge: false },
  { sym: 'K', name: 'калий', v: 1, water: 'cold', oge: true },
  { sym: 'Ba', name: 'барий', v: 2, water: 'cold', oge: false },
  { sym: 'Ca', name: 'кальций', v: 2, water: 'cold', oge: true },
  { sym: 'Na', name: 'натрий', v: 1, water: 'cold', oge: true },
  { sym: 'Mg', name: 'магний', v: 2, water: 'hot', oge: true },
  { sym: 'Al', name: 'алюминий', v: 3, water: 'film', oge: true },
  { sym: 'Zn', name: 'цинк', v: 2, water: 'steam', oge: false },
  { sym: 'Fe', name: 'железо', v: 2, water: 'steam', oge: true },
  { sym: 'Ni', name: 'никель', v: 2, water: 'no', oge: false },
  { sym: 'Sn', name: 'олово', v: 2, water: 'no', oge: false },
  { sym: 'Pb', name: 'свинец', v: 2, water: 'no', oge: false },
  { sym: 'Cu', name: 'медь', v: 2, water: 'no', oge: false },
  { sym: 'Hg', name: 'ртуть', v: 2, water: 'no', oge: false },
  { sym: 'Ag', name: 'серебро', v: 1, water: 'no', oge: false },
  { sym: 'Pt', name: 'платина', v: 2, water: 'no', oge: false },
  { sym: 'Au', name: 'золото', v: 3, water: 'no', oge: false },
]

/** Позиция водорода в ряду (после Pb) */
export const H_INDEX = SERIES.findIndex((m) => m.sym === 'Cu')

/** Индекс металла в ряду; для водорода — H_INDEX − 0.5 */
export const posOf = (sym: string) => SERIES.findIndex((m) => m.sym === sym)

export const isLeftOfH = (sym: string) => posOf(sym) < H_INDEX

const coef = (n: number) => (n === 1 ? '' : String(n))
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

interface Anion {
  f: string
  charge: number
  poly: boolean
}
export const ANIONS: Record<string, Anion> = {
  SO4: { f: 'SO4', charge: 2, poly: true },
  Cl: { f: 'Cl', charge: 1, poly: false },
  NO3: { f: 'NO3', charge: 1, poly: true },
}

/** Формула соли металла с валентностью v и кислотным остатком an: Al2(SO4)3, FeCl2, Cu(NO3)2 */
export function saltFormula(metal: string, v: number, an: Anion): string {
  const g = gcd(v, an.charge)
  const m = an.charge / g
  const n = v / g
  const anion = n > 1 ? (an.poly ? `(${an.f})${n}` : `${an.f}${n}`) : an.f
  return `${metal}${m > 1 ? m : ''}${anion}`
}

/** Сколько атомов металла в формульной единице соли */
const atomsInSalt = (v: number, an: Anion) => an.charge / gcd(v, an.charge)

export interface SaltOption {
  id: string
  /** формула для отображения */
  label: string
  metal: string
  an: keyof typeof ANIONS
}
export const SALTS: SaltOption[] = [
  { id: 'cuso4', label: 'CuSO₄', metal: 'Cu', an: 'SO4' },
  { id: 'fecl2', label: 'FeCl₂', metal: 'Fe', an: 'Cl' },
  { id: 'znso4', label: 'ZnSO₄', metal: 'Zn', an: 'SO4' },
  { id: 'pbno32', label: 'Pb(NO₃)₂', metal: 'Pb', an: 'NO3' },
  { id: 'agno3', label: 'AgNO₃', metal: 'Ag', an: 'NO3' },
  { id: 'mgcl2', label: 'MgCl₂', metal: 'Mg', an: 'Cl' },
]

/** Уравнение «металл A + соль металла B»; null — если реакция невозможна по ряду */
export function displacement(aSym: string, salt: SaltOption): string | null {
  const A = SERIES[posOf(aSym)]
  const B = SERIES[posOf(salt.metal)]
  if (!A || !B || posOf(aSym) >= posOf(salt.metal)) return null
  const an = ANIONS[salt.an]
  const L = lcm(A.v, B.v)
  const cA = L / A.v
  const cB = L / B.v
  const saltA = saltFormula(A.sym, A.v, an)
  const saltB = saltFormula(B.sym, B.v, an)
  const cSaltA = cA / atomsInSalt(A.v, an)
  const cSaltB = cB / atomsInSalt(B.v, an)
  return `${coef(cA)}${A.sym} + ${coef(cSaltB)}${saltB} -> ${coef(cSaltA)}${saltA} + ${coef(cB)}${B.sym}`
}

/** Уравнение «металл + HCl» (металл левее водорода) */
export function withAcid(sym: string): string | null {
  const A = SERIES[posOf(sym)]
  if (!A || !isLeftOfH(sym)) return null
  const salt = saltFormula(A.sym, A.v, ANIONS.Cl)
  const n = A.v
  if (n === 1) return `2${A.sym} + 2HCl -> 2${salt} + H2 ^`
  if (n === 2) return `${A.sym} + 2HCl -> ${salt} + H2 ^`
  return `2${A.sym} + 6HCl -> 2${salt} + 3H2 ^`
}

/** Уравнение «металл + вода» по условиям */
export function withWater(sym: string): { mode: WaterMode; eq: string | null } {
  const A = SERIES[posOf(sym)]
  if (!A) return { mode: 'no', eq: null }
  const hydroxide = `${A.sym}${A.v === 1 ? 'OH' : `(OH)${A.v}`}`
  switch (A.water) {
    case 'cold':
      return { mode: 'cold', eq: A.v === 1 ? `2${A.sym} + 2H2O -> 2${hydroxide} + H2 ^` : `${A.sym} + 2H2O -> ${hydroxide} + H2 ^` }
    case 'hot':
      return { mode: 'hot', eq: `${A.sym} + 2H2O ->[t] ${hydroxide} + H2 ^` }
    case 'steam':
      return {
        mode: 'steam',
        eq: A.sym === 'Fe' ? '3Fe + 4H2O ->[t] Fe3O4 + 4H2' : `${A.sym} + H2O ->[t] ${A.sym}O + H2`,
      }
    case 'film':
      return { mode: 'film', eq: '2Al + 6H2O -> 2Al(OH)3 + 3H2 ^' }
    default:
      return { mode: 'no', eq: null }
  }
}
