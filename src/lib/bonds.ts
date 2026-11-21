/** Ковалентные связи: неспаренные электроны атомов образуют общие пары. Геометрия схемы — в координатах SVG. */

export type ElSym = 'H' | 'C' | 'N' | 'O'

export interface Shell {
  sub: string
  /** число электронов в каждой ячейке: 0, 1 или 2 */
  cells: number[]
}

export interface ElementInfo {
  name: string
  genitive: string
  ground: Shell[]
  excited?: Shell[]
  /** неподелённые пары во внешнем слое при образовании связей */
  lonePairs: number
}

export const ELEMENTS: Record<ElSym, ElementInfo> = {
  H: { name: 'водород', genitive: 'водорода', ground: [{ sub: '1s', cells: [1] }], lonePairs: 0 },
  C: {
    name: 'углерод',
    genitive: 'углерода',
    ground: [{ sub: '2s', cells: [2] }, { sub: '2p', cells: [1, 1, 0] }],
    excited: [{ sub: '2s', cells: [1] }, { sub: '2p', cells: [1, 1, 1] }],
    lonePairs: 0,
  },
  N: { name: 'азот', genitive: 'азота', ground: [{ sub: '2s', cells: [2] }, { sub: '2p', cells: [1, 1, 1] }], lonePairs: 1 },
  O: { name: 'кислород', genitive: 'кислорода', ground: [{ sub: '2s', cells: [2] }, { sub: '2p', cells: [2, 1, 1] }], lonePairs: 2 },
}

export interface Atom {
  el: ElSym
  /** положение в готовой молекуле */
  x: number
  y: number
  /** атом участвует в связях в возбуждённом состоянии */
  excited?: boolean
}
export interface Bond {
  a: number
  b: number
  order: 1 | 2 | 3
}
export interface Substance {
  id: string
  formula: string
  name: string
  atoms: Atom[]
  bonds: Bond[]
  /** центральный атом (относительно него атомы «разъезжаются») */
  center?: number
  /** во сколько раз атомы дальше друг от друга до образования связей */
  sep: number
  /** структурная формула (моноширинный текст) */
  struct: string
  /** степени окисления для сравнения */
  oxidation: string
}

export const substances: Substance[] = [
  {
    id: 'h2', formula: 'H₂', name: 'водород',
    atoms: [{ el: 'H', x: 145, y: 120 }, { el: 'H', x: 215, y: 120 }],
    bonds: [{ a: 0, b: 1, order: 1 }],
    sep: 2.2, struct: 'H–H', oxidation: 'H: 0',
  },
  {
    id: 'o2', formula: 'O₂', name: 'кислород',
    atoms: [{ el: 'O', x: 140, y: 120 }, { el: 'O', x: 220, y: 120 }],
    bonds: [{ a: 0, b: 1, order: 2 }],
    sep: 1.8, struct: 'O=O', oxidation: 'O: 0',
  },
  {
    id: 'n2', formula: 'N₂', name: 'азот',
    atoms: [{ el: 'N', x: 140, y: 120 }, { el: 'N', x: 220, y: 120 }],
    bonds: [{ a: 0, b: 1, order: 3 }],
    sep: 1.8, struct: 'N≡N', oxidation: 'N: 0',
  },
  {
    id: 'nh3', formula: 'NH₃', name: 'аммиак',
    atoms: [{ el: 'N', x: 180, y: 100 }, { el: 'H', x: 115, y: 160 }, { el: 'H', x: 180, y: 180 }, { el: 'H', x: 245, y: 160 }],
    bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }],
    center: 0, sep: 1.35, struct: 'H–N–H\n  |\n  H', oxidation: 'N: −3, H: +1',
  },
  {
    id: 'ch4', formula: 'CH₄', name: 'метан',
    atoms: [
      { el: 'C', x: 180, y: 120, excited: true },
      { el: 'H', x: 180, y: 50 }, { el: 'H', x: 180, y: 190 }, { el: 'H', x: 110, y: 120 }, { el: 'H', x: 250, y: 120 },
    ],
    bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }, { a: 0, b: 4, order: 1 }],
    center: 0, sep: 1.4, struct: '  H\n  |\nH–C–H\n  |\n  H', oxidation: 'C: −4, H: +1',
  },
  {
    id: 'co2', formula: 'CO₂', name: 'углекислый газ',
    atoms: [{ el: 'O', x: 80, y: 120 }, { el: 'C', x: 180, y: 120, excited: true }, { el: 'O', x: 280, y: 120 }],
    bonds: [{ a: 0, b: 1, order: 2 }, { a: 1, b: 2, order: 2 }],
    center: 1, sep: 1.4, struct: 'O=C=O', oxidation: 'C: +4, O: −2',
  },
]

export const shellsOf = (el: ElSym, excited: boolean): Shell[] =>
  excited && ELEMENTS[el].excited ? ELEMENTS[el].excited! : ELEMENTS[el].ground

export const unpairedOf = (shells: Shell[]) => shells.reduce((a, s) => a + s.cells.filter((n) => n === 1).length, 0)
export const electronsOf = (shells: Shell[]) => shells.reduce((a, s) => a + s.cells.reduce((x, y) => x + y, 0), 0)

/** Валентность атома = сумма кратностей его связей */
export function valenceOf(s: Substance, atom: number): number {
  return s.bonds.filter((b) => b.a === atom || b.b === atom).reduce((a, b) => a + b.order, 0)
}

export const radiusOf = (el: ElSym) => (el === 'H' ? 20 : 28)

export interface Dot {
  x: number
  y: number
}
export interface PairGeo {
  /** до связи: у атомов-партнёров */
  from: [Dot, Dot]
  /** после: общая пара между атомами */
  to: [Dot, Dot]
  center: Dot
  angle: number
  bond: number
}
export interface Geometry {
  atoms: { x: number; y: number; sx: number; sy: number; r: number }[]
  pairs: PairGeo[]
  lone: { atom: number; dots: [Dot, Dot] }[]
}

const TAU = Math.PI * 2
const angDist = (a: number, b: number) => Math.abs((((a - b + Math.PI) % TAU) + TAU) % TAU - Math.PI)

export function geometry(s: Substance): Geometry {
  const cx = s.center !== undefined ? s.atoms[s.center].x : s.atoms.reduce((a, t) => a + t.x, 0) / s.atoms.length
  const cy = s.center !== undefined ? s.atoms[s.center].y : s.atoms.reduce((a, t) => a + t.y, 0) / s.atoms.length
  const atoms = s.atoms.map((a) => ({
    x: a.x,
    y: a.y,
    sx: cx + s.sep * (a.x - cx),
    sy: cy + s.sep * (a.y - cy),
    r: radiusOf(a.el),
  }))

  const pairs: PairGeo[] = []
  s.bonds.forEach((b, bi) => {
    const A = atoms[b.a]
    const B = atoms[b.b]
    const ux = B.x - A.x, uy = B.y - A.y
    const len = Math.hypot(ux, uy)
    const u = { x: ux / len, y: uy / len }
    const n = { x: -u.y, y: u.x }
    const sux = B.sx - A.sx, suy = B.sy - A.sy
    const slen = Math.hypot(sux, suy)
    const su = { x: sux / slen, y: suy / slen }
    const sn = { x: -su.y, y: su.x }
    for (let i = 0; i < b.order; i++) {
      const k = i - (b.order - 1) / 2
      const mx = (A.x + B.x) / 2 + n.x * k * 13
      const my = (A.y + B.y) / 2 + n.y * k * 13
      pairs.push({
        bond: bi,
        center: { x: mx, y: my },
        angle: (Math.atan2(u.y, u.x) * 180) / Math.PI,
        to: [{ x: mx - u.x * 5.5, y: my - u.y * 5.5 }, { x: mx + u.x * 5.5, y: my + u.y * 5.5 }],
        from: [
          { x: A.sx + su.x * (A.r + 8) + sn.x * k * 10, y: A.sy + su.y * (A.r + 8) + sn.y * k * 10 },
          { x: B.sx - su.x * (B.r + 8) + sn.x * k * 10, y: B.sy - su.y * (B.r + 8) + sn.y * k * 10 },
        ],
      })
    }
  })

  const lone: Geometry['lone'] = []
  s.atoms.forEach((a, i) => {
    const n = ELEMENTS[a.el].lonePairs
    if (!n) return
    const dirs = s.bonds
      .filter((b) => b.a === i || b.b === i)
      .map((b) => {
        const o = atoms[b.a === i ? b.b : b.a]
        return Math.atan2(o.y - atoms[i].y, o.x - atoms[i].x)
      })
    let angles: number[] = []
    if (dirs.length === 1) {
      const base = dirs[0] + Math.PI
      angles = n === 1 ? [base] : [base - Math.PI / 3, base + Math.PI / 3]
    } else {
      const taken: number[] = [...dirs]
      for (let t = 0; t < n; t++) {
        let best = 0
        let bestD = -1
        for (let k = 0; k < 36; k++) {
          const c = (k * TAU) / 36
          const d = Math.min(...taken.map((x) => angDist(c, x)))
          if (d > bestD) {
            bestD = d
            best = c
          }
        }
        taken.push(best)
        angles.push(best)
      }
    }
    for (const phi of angles) {
      const d = atoms[i].r + 9
      const p = { x: Math.cos(phi) * d, y: Math.sin(phi) * d }
      const q = { x: -Math.sin(phi) * 4.5, y: Math.cos(phi) * 4.5 }
      lone.push({ atom: i, dots: [{ x: p.x + q.x, y: p.y + q.y }, { x: p.x - q.x, y: p.y - q.y }] })
    }
  })

  return { atoms, pairs, lone }
}
