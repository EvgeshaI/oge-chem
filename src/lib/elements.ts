export type ElKind = 'metal' | 'nonmetal' | 'noble'

export interface El {
  z: number
  symbol: string
  name: string
  period: number
  group: number // 1..8 (номер группы A)
  kind: ElKind
  /** простое вещество при н. у. */
  gas: boolean
  formula: string
  /** цвет заливки ячейки простого вещества */
  color: string
  look: string
}

const W = '#f4f5f8' // бесцветный
const SILVER = '#d6dbe6'

const raw: Omit<El, 'z' | 'period' | 'group'>[] = [
  { symbol: 'H', name: 'Водород', kind: 'nonmetal', gas: true, formula: 'H₂', color: W, look: 'бесцветный газ, самый лёгкий' },
  { symbol: 'He', name: 'Гелий', kind: 'noble', gas: true, formula: 'He', color: W, look: 'бесцветный газ; наполняют воздушные шары' },
  { symbol: 'Li', name: 'Литий', kind: 'metal', gas: false, formula: 'Li', color: SILVER, look: 'серебристо-белый мягкий металл; хранят в вазелине' },
  { symbol: 'Be', name: 'Бериллий', kind: 'metal', gas: false, formula: 'Be', color: '#9aa3b2', look: 'серо-стальной металл (единственный не серебристо-белый)' },
  { symbol: 'B', name: 'Бор', kind: 'nonmetal', gas: false, formula: 'B', color: '#3a4056', look: 'чёрное/серо-чёрное твёрдое вещество' },
  { symbol: 'C', name: 'Углерод', kind: 'nonmetal', gas: false, formula: 'C', color: '#4b5168', look: 'графит (серо-чёрный) и алмаз (бесцветный)' },
  { symbol: 'N', name: 'Азот', kind: 'nonmetal', gas: true, formula: 'N₂', color: W, look: 'бесцветный газ, 78 % воздуха' },
  { symbol: 'O', name: 'Кислород', kind: 'nonmetal', gas: true, formula: 'O₂', color: W, look: 'бесцветный газ, поддерживает горение' },
  { symbol: 'F', name: 'Фтор', kind: 'nonmetal', gas: true, formula: 'F₂', color: '#f3f1b5', look: 'светло-жёлтый ядовитый газ' },
  { symbol: 'Ne', name: 'Неон', kind: 'noble', gas: true, formula: 'Ne', color: W, look: 'бесцветный газ; светится в рекламных трубках' },
  { symbol: 'Na', name: 'Натрий', kind: 'metal', gas: false, formula: 'Na', color: SILVER, look: 'серебристо-белый мягкий металл; хранят под керосином' },
  { symbol: 'Mg', name: 'Магний', kind: 'metal', gas: false, formula: 'Mg', color: SILVER, look: 'серебристо-белый металл' },
  { symbol: 'Al', name: 'Алюминий', kind: 'metal', gas: false, formula: 'Al', color: SILVER, look: 'лёгкий серебристо-белый металл' },
  { symbol: 'Si', name: 'Кремний', kind: 'nonmetal', gas: false, formula: 'Si', color: '#79819a', look: 'тёмно-серое кристаллическое вещество с блеском' },
  { symbol: 'P', name: 'Фосфор', kind: 'nonmetal', gas: false, formula: 'P', color: '#f2c0b6', look: 'белый (хранят под водой) и красный фосфор' },
  { symbol: 'S', name: 'Сера', kind: 'nonmetal', gas: false, formula: 'S₈', color: '#f7d94c', look: 'жёлтое хрупкое твёрдое вещество' },
  { symbol: 'Cl', name: 'Хлор', kind: 'nonmetal', gas: true, formula: 'Cl₂', color: '#cfe56a', look: 'жёлто-зелёный ядовитый газ' },
  { symbol: 'Ar', name: 'Аргон', kind: 'noble', gas: true, formula: 'Ar', color: W, look: 'бесцветный газ; наполняют лампы накаливания' },
  { symbol: 'K', name: 'Калий', kind: 'metal', gas: false, formula: 'K', color: SILVER, look: 'серебристо-белый мягкий металл; хранят под керосином' },
  { symbol: 'Ca', name: 'Кальций', kind: 'metal', gas: false, formula: 'Ca', color: SILVER, look: 'серебристо-белый металл' },
]

/** Номер группы и период для элементов 1–20 */
function pos(z: number): { period: number; group: number } {
  if (z === 1) return { period: 1, group: 1 }
  if (z === 2) return { period: 1, group: 8 }
  if (z <= 10) return { period: 2, group: z - 2 }
  if (z <= 18) return { period: 3, group: z - 10 }
  return { period: 4, group: z - 18 }
}

export const ELEMENTS: El[] = raw.map((e, i) => ({ ...e, z: i + 1, ...pos(i + 1) }))

const CAPS = [2, 8, 8, 2]

/** Распределение электронов по слоям, как в школьном курсе (Z ≤ 20) */
export function shells(electrons: number): number[] {
  const out: number[] = []
  let left = electrons
  for (const cap of CAPS) {
    if (left <= 0) break
    const n = Math.min(cap, left)
    out.push(n)
    left -= n
  }
  return out
}

export const KIND_LABEL: Record<ElKind, string> = {
  metal: 'металл',
  nonmetal: 'неметалл',
  noble: 'благородный газ',
}
