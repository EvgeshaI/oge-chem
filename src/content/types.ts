export type Accent = 'teal' | 'purple' | 'orange' | 'pink' | 'blue'

export type AnimationName =
  | 'atom-shells'
  | 'periodic-electrons'
  | 'periodic-substances'
  | 'orbital-cells'
  | 'element-card'
  | 'periodic-trends'
  | 'ion-formation'
  | 'ion-cells'
  | 'excited-states'
  | 'bond-formation'
  | 'bond-types'
  | 'rust-nails'
  | 'class-tree'
  | 'formula-reader'
  | 'oxide-tests'
  | 'oxide-solubility'
  | 'oxide-hydroxide'
  | 'indicators'
  | 'acid-structure'
  | 'salt-builder'
  | 'activity-series'
  | 'mech-nonmetals'
  | 'mech-water'
  | 'mech-acids'
  | 'mech-salts'
  | 'mech-oxides'
  | 'react-matrix'
  | 'flame-test'
  | 'metal-ion'
  | 'react-nonmetals'
  | 'mech-switcher'
  | 'halogen-atoms'
  | 'excited-halogens'
  | 'halogen-trends'
  | 'halogen-molecule'
  | 'halogen-tubes'
  | 'chlorine-lab'
  | 'halogen-mech-metals'
  | 'halogen-mech-nonmetals'
  | 'halogen-mech-water'
  | 'halogen-mech-displace'
  | 'halogen-displace'
  | 'halide-test'
  | 'chalcogen-atoms'
  | 'excited-chalcogens'
  | 'ozone-discharge'
  | 'sulfur-heating'
  | 'oxygen-lab'
  | 'oxygen-burning'
  | 'chal-mech-oxygen'
  | 'chal-mech-sulfur'
  | 'sulfur-roles'
  | 'pnictogen-atoms'
  | 'excited-pnictogens'
  | 'pnictogen-molecules'
  | 'pn-mech-nitrogen'
  | 'pn-mech-phosphorus'
  | 'pnictogen-roles'
  | 'phosphorus-amount'
  | 'carbon-atoms'
  | 'excited-carbon'
  | 'carbon-allotropes'
  | 'charcoal-adsorption'
  | 'carbon-burning'
  | 'carbon-reduction'
  | 'cs-mech-carbon'
  | 'cs-mech-silicon'
  | 'carbon-roles'

export interface CardItem {
  title: string
  text?: string
  list?: string[]
  example?: string
  tag?: string
  tone: Accent
}

export type Block =
  | { kind: 'split'; left: Block[]; right: Block[]; leftWidth?: number }
  | { kind: 'heading'; text: string; id?: string }
  | { kind: 'text'; text: string }
  | { kind: 'callout'; tone: 'remember' | 'tip' | 'warn'; title?: string; text: string }
  | { kind: 'equation'; tex: string }
  | { kind: 'cards'; cols?: 1 | 2 | 3; items: CardItem[] }
  | { kind: 'steps'; items: { title: string; text: string }[] }
  | { kind: 'animation'; name: AnimationName }
  | { kind: 'image'; src: string; alt: string; caption?: string; maxWidth?: number }
  | {
      kind: 'gallery'
      items: {
        src: string
        alt: string
        title: string
        caption?: string
        /** формула, выделяется яркой плашкой под названием (простой текст с Unicode-индексами) */
        formula?: string
        /** короткая метка рядом с названием, например символ металла */
        tag?: string
      }[]
      caption?: string
    }
  | { kind: 'video'; src: string; poster?: string; caption?: string }
  | { kind: 'table'; head: string[]; rows: string[][]; cellColors?: (string | null)[][] }

export interface Lesson {
  id: string
  title: string
  blocks: Block[]
}

interface TaskBase {
  /** Уникальный id, начинается с `${topicId}.` */
  id: string
  /** Пояснение, которое показывается после проверки */
  explanation: string
  /** Подсказка «как отвечать» над заданием; если не задана — берётся типовая */
  hint?: string
}

/** Текст с пропусками {1}, {2}… и банком слов. answers[i] — верный вариант или список допустимых. */
export interface FillTask extends TaskBase {
  type: 'fill'
  text: string
  bank: string[]
  answers: (string | string[])[]
  /** Слова банка можно использовать несколько раз */
  reuse?: boolean
}

/** Формат ОГЭ: выберите верные утверждения, ответ — цифры (порядок не важен) */
export interface DigitsTask extends TaskBase {
  type: 'digits'
  question: string
  options: string[]
  /** Например "14" */
  answer: string
}

/** Формат ОГЭ: один верный ответ из четырёх */
export interface SingleTask extends TaskBase {
  type: 'single'
  question: string
  options: string[]
  /** Номер верного варианта, с 1 */
  answer: number
}

/** Формат ОГЭ: установите соответствие А–Б–В, ответ — цифры по порядку */
export interface MatchTask extends TaskBase {
  type: 'match'
  question: string
  rows: string[]
  choices: string[]
  /** Например "123" (А→1, Б→2, В→3) */
  answer: string
}

/** Формат ОГЭ (задание 3): расположите элементы в порядке … — ответ: номера по порядку */
export interface OrderTask extends TaskBase {
  type: 'order'
  question: string
  /** Элементы (или вещества), которые нужно расставить — обычно три */
  options: string[]
  /** Номера по порядку, например "312" */
  answer: string
}

/** Часть 2: развёрнутый ответ с самооценкой по критериям */
export interface OpenTask extends TaskBase {
  type: 'open'
  question: string
  solution: string
  criteria: { text: string; points: number }[]
}

export type FigureName = 'atom-boron'

/** Для каждого утверждения выберите один из вариантов */
export interface ClassifyTask extends TaskBase {
  type: 'classify'
  question: string
  options: string[]
  items: { text: string; answer: string; why?: string }[]
  figure?: FigureName
}

/** Поле таблицы, которое заполняет ученик. a — верный ответ или список допустимых. */
export interface CellInput {
  a: string | string[]
  /** если задан — выпадающий список, иначе ввод с клавиатуры */
  options?: string[]
  /** ширина поля в «символах» */
  w?: number
  /** сравнивать как набор (порядок не важен), разделители: и , ; + */
  set?: boolean
}
export type Cell = string | CellInput

export interface CellsTask extends TaskBase {
  type: 'cells'
  /** Рисунок над таблицей */
  figure?: FigureName
  question: string
  head?: string[]
  rows: Cell[][]
}

export type ParticleKind = 'O2' | 'H2' | 'H2O' | 'CO2' | 'Fe'
export interface ModelsTask extends TaskBase {
  type: 'models'
  question: string
  kinds: string[]
  models: {
    label: string
    particles: { kind: ParticleKind; count: number }[]
    elements: number
    substances: number
    kind: string
    formulas: string
  }[]
}

/** Электронные схемы: заряд ядра, электроны по слоям, внешние, тип */
export interface SchemesTask extends TaskBase {
  type: 'schemes'
  question: string
  kinds: string[]
  schemes: {
    label: string
    /** Слоёв (дуг) на схеме */
    layers: number
    /** Электроны по слоям (верный ответ) */
    shells: number[]
    /** Слои уже подписаны на схеме */
    given?: boolean
    charge: number
    outer: number
    kind: string
    /** Если нужно определить элемент — его символ */
    element?: string
  }[]
}

export type Task =
  | FillTask
  | DigitsTask
  | SingleTask
  | MatchTask
  | OrderTask
  | OpenTask
  | ClassifyTask
  | CellsTask
  | ModelsTask
  | SchemesTask

export interface ExamVariant {
  id: string
  title: string
  tasks: Task[]
}

export interface TopicContent {
  lessons: Lesson[]
  /** Тренировка по теме — не тестовые задания */
  practice: Task[]
  /** Варианты в формате ОГЭ */
  exam: ExamVariant[]
}

export interface TopicMeta {
  id: string
  title: string
  subtitle: string
  emoji: string
  accent: Accent
  /** Бесплатная тема */
  free: boolean
  /** Номера заданий КИМ ОГЭ, которые покрывает тема */
  kim: number[]
  /** Сколько заданий всего (практика + экзамен). Сверяется тестом. */
  totalTasks: number
  /** Тема пока только с теорией: вкладки «Тренировка» и «Формат ОГЭ» скрыты */
  theoryOnly?: boolean
}
