/** Основное и возбуждённые состояния атомов: внешний слой по ячейкам. */

export type Sub = '2s' | '2p' | '3s' | '3p' | '3d'

/** Подуровни внешнего слоя: номер слоя → подуровни */
export const LAYER_SUBS: Record<2 | 3, Sub[]> = { 2: ['2s', '2p'], 3: ['3s', '3p', '3d'] }
export const CELLS_IN: Record<string, number> = { s: 1, p: 3, d: 5 }

/** Число электронов в каждой ячейке (0, 1 или 2) */
export type State = Partial<Record<Sub, number[]>>

/** Переход одного электрона: [откуда подуровень, ячейка, куда подуровень, ячейка] */
export type Move = [Sub, number, Sub, number]

export interface ExcitedElement {
  sym: string
  name: string
  z: number
  layer: 2 | 3
  ground: State
  /** Последовательные возбуждения: состояние k = основное + первые k переходов */
  moves: Move[]
  /** Почему возбуждение невозможно (если moves пуст) */
  why?: string
}

const empty = (n: number) => Array(n).fill(0) as number[]
const d0 = empty(5)

export const excitedElements: ExcitedElement[] = [
  { sym: 'Be', name: 'бериллий', z: 4, layer: 2, ground: { '2s': [2], '2p': empty(3) }, moves: [['2s', 0, '2p', 0]] },
  { sym: 'B', name: 'бор', z: 5, layer: 2, ground: { '2s': [2], '2p': [1, 0, 0] }, moves: [['2s', 0, '2p', 1]] },
  { sym: 'C', name: 'углерод', z: 6, layer: 2, ground: { '2s': [2], '2p': [1, 1, 0] }, moves: [['2s', 0, '2p', 2]] },
  {
    sym: 'N', name: 'азот', z: 7, layer: 2, ground: { '2s': [2], '2p': [1, 1, 1] }, moves: [],
    why: 'На 2-м слое свободных ячеек нет: все три 2p-ячейки заняты по одному электрону. Распариваться некуда, а переход на 3-й слой потребовал бы слишком много энергии. Валентность азота — III; IV получается уже иначе (донорно-акцепторная связь).',
  },
  {
    sym: 'O', name: 'кислород', z: 8, layer: 2, ground: { '2s': [2], '2p': [2, 1, 1] }, moves: [],
    why: 'На 2-м слое свободных ячеек нет, а d-подуровня на 2-м слое не существует. Поэтому валентность кислорода — всегда II.',
  },
  {
    sym: 'F', name: 'фтор', z: 9, layer: 2, ground: { '2s': [2], '2p': [2, 2, 1] }, moves: [],
    why: 'На 2-м слое свободных ячеек нет, а d-подуровня на 2-м слое не существует. Поэтому валентность фтора — всегда I.',
  },
  { sym: 'Al', name: 'алюминий', z: 13, layer: 3, ground: { '3s': [2], '3p': [1, 0, 0], '3d': d0 }, moves: [['3s', 0, '3p', 1]] },
  { sym: 'Si', name: 'кремний', z: 14, layer: 3, ground: { '3s': [2], '3p': [1, 1, 0], '3d': d0 }, moves: [['3s', 0, '3p', 2]] },
  { sym: 'P', name: 'фосфор', z: 15, layer: 3, ground: { '3s': [2], '3p': [1, 1, 1], '3d': d0 }, moves: [['3s', 0, '3d', 0]] },
  {
    sym: 'S', name: 'сера', z: 16, layer: 3, ground: { '3s': [2], '3p': [2, 1, 1], '3d': d0 },
    moves: [['3p', 0, '3d', 0], ['3s', 0, '3d', 1]],
  },
  {
    sym: 'Cl', name: 'хлор', z: 17, layer: 3, ground: { '3s': [2], '3p': [2, 2, 1], '3d': d0 },
    moves: [['3p', 0, '3d', 0], ['3p', 1, '3d', 1], ['3s', 0, '3d', 2]],
  },
]

const cloneState = (s: State): State => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, [...v!]])) as State

/** Состояние k: основное (k = 0) или после k переходов */
export function stateAt(el: ExcitedElement, k: number): State {
  const s = cloneState(el.ground)
  for (const [fs, fc, ts, tc] of el.moves.slice(0, k)) {
    s[fs]![fc] -= 1
    s[ts]![tc] += 1
  }
  return s
}

/** Число неспаренных электронов (ячейки с одним электроном) */
export function unpaired(s: State): number {
  return Object.values(s).reduce((a, cells) => a + cells!.filter((n) => n === 1).length, 0)
}

export const electronsIn = (s: State) => Object.values(s).reduce((a, cells) => a + cells!.reduce((x, y) => x + y, 0), 0)

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('')

/** Электронная формула: внутренние слои + внешний слой в данном состоянии */
export function formulaOf(el: ExcitedElement, s: State): string {
  const inner = el.layer === 2 ? '1s²' : '1s²2s²2p⁶'
  const outer = LAYER_SUBS[el.layer]
    .map((name) => ({ name, n: (s[name] ?? []).reduce((a, b) => a + b, 0) }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.name}${sup(x.n)}`)
    .join('')
  return inner + outer
}
