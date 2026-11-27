/**
 * Проверка баланса уравнений в записи mhchem: «2Al + 6HCl -> 2AlCl3 + 3H2 ^».
 * Нужна тестам: каждое уравнение в теме про металлы обязано быть уравнено.
 */

export type Atoms = Record<string, number>

function add(into: Atoms, from: Atoms, k: number) {
  for (const [el, n] of Object.entries(from)) into[el] = (into[el] ?? 0) + n * k
}

/** Атомы в формуле вещества: Al2(SO4)3, Na[Al(OH)4], CuSO4 */
export function atomsOf(formula: string): Atoms {
  let i = 0
  const readNum = () => {
    let s = ''
    while (i < formula.length && /\d/.test(formula[i])) s += formula[i++]
    return s ? Number(s) : 1
  }
  const group = (close: string | null): Atoms => {
    const out: Atoms = {}
    while (i < formula.length) {
      const c = formula[i]
      if (c === close) {
        i++
        return out
      }
      if (c === '(' || c === '[') {
        i++
        const inner = group(c === '(' ? ')' : ']')
        add(out, inner, readNum())
      } else if (/[A-Z]/.test(c)) {
        let el = c
        i++
        while (i < formula.length && /[a-z]/.test(formula[i])) el += formula[i++]
        out[el] = (out[el] ?? 0) + readNum()
      } else {
        throw new Error(`Неожиданный символ «${c}» в формуле ${formula}`)
      }
    }
    return out
  }
  return group(null)
}

function side(s: string): Atoms {
  const total: Atoms = {}
  for (const raw of s.split(/\s\+\s/)) {
    const term = raw.replace(/\s+[\^v]$/, '').trim()
    if (!term) continue
    const m = term.match(/^(\d+)?\s*(.+)$/)
    if (!m) throw new Error(`Не разобран член «${term}»`)
    add(total, atomsOf(m[2]), m[1] ? Number(m[1]) : 1)
  }
  return total
}

/** Ионное уравнение «Ba^2+ + SO4^2- -> BaSO4 v»: совпадают ли атомы и суммарный заряд */
export function isIonBalanced(eq: string): boolean | null {
  const parts = eq.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  if (parts.length !== 2) return null
  const count = (s: string) => {
    const atoms: Atoms = {}
    let charge = 0
    for (const raw of s.trim().split(/\s\+\s/)) {
      const term = raw.replace(/\s+[\^v]$/, '').trim()
      const m = term.match(/^(\d+)?\s*(.+?)(?:\^(\d*)([+-])|([+-]))?$/)
      if (!m) throw new Error(`Не разобран член «${term}»`)
      const k = m[1] ? Number(m[1]) : 1
      add(atoms, atomsOf(m[2]), k)
      const sign = m[4] ?? m[5]
      if (sign) charge += k * (m[3] ? Number(m[3]) : 1) * (sign === '+' ? 1 : -1)
    }
    return { atoms, charge }
  }
  const l = count(parts[0])
  const r = count(parts[1])
  const els = new Set([...Object.keys(l.atoms), ...Object.keys(r.atoms)])
  return l.charge === r.charge && [...els].every((el) => (l.atoms[el] ?? 0) === (r.atoms[el] ?? 0))
}

/** null — уравнение нельзя проверить (нет стрелки, есть заряды); иначе баланс по атомам */
export function isBalanced(eq: string): boolean | null {
  const parts = eq.split(/(?:<=>|->)(?:\[[^\]]*\])*/)
  if (parts.length !== 2) return null
  if (/[+-]\s*$|\^\d|\^[+-]/.test(parts[0]) || /\^\d|\^[+-]/.test(parts[1])) return null
  const l = side(parts[0].trim())
  const r = side(parts[1].trim())
  const els = new Set([...Object.keys(l), ...Object.keys(r)])
  return [...els].every((el) => (l[el] ?? 0) === (r[el] ?? 0))
}
