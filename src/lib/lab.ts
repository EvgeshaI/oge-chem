/**
 * Виртуальная лаборатория: ход опытов, оценивание таблицы и тексты задания 23.
 * Форма таблицы и критерии — по демоверсии ОГЭ по химии 2027 г.
 */
import { SOLUTIONS, type ChemId, type Detection, type Experiment, type Look, type ObsId } from './labData'

/** 0 — склянка № 1, 1 — склянка № 2 */
export type Flask = 0 | 1
/** Что налито в склянки № 1 и № 2 */
export type Contents = [ChemId, ChemId]

/** Что видно, если к пробе вещества прилить реактив */
export function react(exp: Experiment, substance: ChemId, reagent: ChemId): Look {
  const hit = exp.detections.find((d) => d.substance === substance && d.reagent === reagent)
  return hit?.look ?? { obs: 'none', liquid: SOLUTIONS[reagent].liquid }
}

/** Реакция, по которой определяют вещество */
export const detectionOf = (exp: Experiment, substance: ChemId): Detection => exp.detections.find((d) => d.substance === substance)!

/** Два реактива, которые нужны для определения веществ (в порядке опытов из эталона) */
export const neededOf = (exp: Experiment): ChemId[] => exp.detections.map((d) => d.reagent)

export function randomContents(exp: Experiment, rnd: () => number = Math.random): Contents {
  const [a, b] = exp.substances
  return rnd() < 0.5 ? [a, b] : [b, a]
}

/* ───────────── Штатив с пробирками ───────────── */

export const RACK_SIZE = 4

export interface Tube {
  id: number
  flask: Flask
  reagent: ChemId | null
}

export interface Rack {
  tubes: Tube[]
  /** id выбранной пробирки */
  selected: number | null
  nextId: number
}

export const emptyRack = (): Rack => ({ tubes: [], selected: null, nextId: 1 })

/** Отбираем пробу из склянки в новую чистую пробирку и выбираем её */
export function pourSample(rack: Rack, flask: Flask): Rack {
  if (rack.tubes.length >= RACK_SIZE) return rack
  const tube: Tube = { id: rack.nextId, flask, reagent: null }
  return { tubes: [...rack.tubes, tube], selected: tube.id, nextId: rack.nextId + 1 }
}

/** Приливаем реактив в выбранную пробирку; затем выбор переходит к пробе, где реактива ещё нет */
export function addReagent(rack: Rack, reagent: ChemId): Rack {
  const target = rack.tubes.find((t) => t.id === rack.selected)
  if (!target || target.reagent) return rack
  const tubes = rack.tubes.map((t) => (t.id === target.id ? { ...t, reagent } : t))
  return { ...rack, tubes, selected: tubes.find((t) => !t.reagent)?.id ?? target.id }
}

/* ───────────── Таблица и оценивание ───────────── */

export interface Row {
  reagent: ChemId | ''
  obs: [ObsId | '', ObsId | '']
}

export interface LabTableValue {
  rows: [Row, Row]
  conclusion: [ChemId | '', ChemId | '']
}

export const emptyTable = (): LabTableValue => ({
  rows: [
    { reagent: '', obs: ['', ''] },
    { reagent: '', obs: ['', ''] },
  ],
  conclusion: ['', ''],
})

export function emptyCells(t: LabTableValue): number {
  return [...t.rows.flatMap((r) => [r.reagent, ...r.obs]), ...t.conclusion].filter((v) => v === '').length
}

export interface TableScore {
  rows: { reagent: boolean; obs: [boolean, boolean]; correct: boolean }[]
  conclusion: [boolean, boolean]
  conclusionCorrect: boolean
  /** критерий К2: число верно заполненных строк, 0…3 */
  k2: number
}

/**
 * К2 по демоверсии: две строки опытов (реактив и признаки для обеих склянок) и строка «вывод».
 * Порядок опытов любой; один и тот же реактив во второй строке не засчитывается.
 */
export function scoreTable(t: LabTableValue, exp: Experiment, contents: Contents): TableScore {
  const needed = neededOf(exp)
  const rows = t.rows.map((row, i) => {
    const r = row.reagent
    const reagent = r !== '' && needed.includes(r) && !t.rows.slice(0, i).some((p) => p.reagent === r)
    const seen = (j: Flask) => {
      const o = row.obs[j]
      if (r === '' || o === '') return false
      const look = react(exp, contents[j], r)
      return o === look.obs || o === look.also
    }
    const obs: [boolean, boolean] = [seen(0), seen(1)]
    return { reagent, obs, correct: reagent && obs[0] && obs[1] }
  })
  const conclusion: [boolean, boolean] = [t.conclusion[0] === contents[0], t.conclusion[1] === contents[1]]
  const conclusionCorrect = conclusion[0] && conclusion[1]
  return { rows, conclusion, conclusionCorrect, k2: rows.filter((r) => r.correct).length + (conclusionCorrect ? 1 : 0) }
}

/** Эталонная таблица для данного расположения веществ */
export function modelTable(exp: Experiment, contents: Contents): LabTableValue {
  const row = (reagent: ChemId): Row => ({
    reagent,
    obs: [react(exp, contents[0], reagent).obs, react(exp, contents[1], reagent).obs],
  })
  const [a, b] = neededOf(exp)
  return { rows: [row(a), row(b)], conclusion: [...contents] }
}

/* ───────────── Тексты задания (демоверсия ОГЭ 2027) ───────────── */

export function conditionOf({ substances: [a, b], reagents: [x, y, z] }: Experiment): string {
  const of = (id: ChemId) => SOLUTIONS[id].of
  return `Для проведения эксперимента выданы склянки № 1 и № 2 с растворами ${of(a)} и ${of(b)}, а также растворы трёх реактивов: ${of(x)}, ${of(y)} и ${of(z)}.`
}

export const TASK_ITEMS = [
  'только из указанных в перечне трёх реактивов выберите два, которые необходимы для определения каждого вещества, находящегося в склянках № 1 и № 2;',
  'составьте молекулярное, полное и сокращённое ионные уравнения реакции, которую планируете провести для определения вещества из склянки № 1;',
  'составьте молекулярное, полное и сокращённое ионные уравнения реакции, которую планируете провести для определения вещества из склянки № 2;',
  'для оформления хода эксперимента используйте предложенную таблицу;',
  'приступайте к выполнению эксперимента.',
]

export const INSTRUCTION = [
  'Из склянки № 1 отберите в две чистые пробирки по 1–2 мл раствора.',
  'Добавьте в одну из пробирок 1–2 мл первого из двух реактивов, а во вторую — второго из двух реактивов, отобранных на этапе планирования.',
  'Запишите наблюдаемые признаки реакций (наличие или отсутствие запаха у газа, цвет осадка или раствора) или укажите на их отсутствие в соответствующих ячейках таблицы.',
  'Из склянки № 2 отберите в две новые чистые пробирки по 1–2 мл раствора.',
  'Добавьте в одну из пробирок 1–2 мл первого из двух реактивов, а во вторую — второго.',
  'Запишите в таблицу формулы или названия выбранных реактивов и наблюдаемые признаки реакций или укажите на их отсутствие.',
  'В строке «вывод» запишите формулы или названия веществ, содержащихся в склянках № 1 и № 2.',
]

export const MAX_K1 = 2
export const MAX_K2 = 3
