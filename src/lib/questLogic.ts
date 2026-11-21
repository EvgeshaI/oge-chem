import { CASES, NUANCES, TOPIC_TITLES, type QuestCase, type QuestTopic } from '../content/quest'

/** Запись об улике: сколько ошибок было в последнем прохождении, раскрыта ли, и лучший заработанный опыт */
export interface StepRec {
  tries: number
  solved: boolean
  best: number
}

export interface QuestState {
  steps: Record<string, StepRec>
  /** Лучший результат по делу: число звёзд 1–3 */
  cases: Record<string, number>
  streak: number
  bestStreak: number
  /** Хотя бы раз улучшили результат дела при повторном прохождении */
  improved: boolean
}

export const MAX_HEARTS = 3

export const emptyQuest = (): QuestState => ({ steps: {}, cases: {}, streak: 0, bestStreak: 0, improved: false })

/** Опыт за улику: 10 — с первой попытки, 5 — после ошибок, 0 — не раскрыта */
export const stepXp = (tries: number, solved: boolean): number => (!solved ? 0 : tries === 0 ? 10 : 5)

/** Звёзды за дело = оставшиеся сердца (0 — дело провалено) */
export const starsFor = (heartsLeft: number): number => Math.max(0, Math.min(MAX_HEARTS, heartsLeft))

export function applyStep(s: QuestState, id: string, tries: number, solved: boolean): QuestState {
  const prev = s.steps[id]
  const best = Math.max(prev?.best ?? 0, stepXp(tries, solved))
  const clean = solved && tries === 0
  const streak = clean ? s.streak + 1 : 0
  return {
    ...s,
    steps: { ...s.steps, [id]: { tries, solved, best } },
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
  }
}

export function applyCase(s: QuestState, caseId: string, stars: number): QuestState {
  const before = s.cases[caseId] ?? 0
  return {
    ...s,
    cases: { ...s.cases, [caseId]: Math.max(before, stars) },
    improved: s.improved || (before > 0 && stars > before),
  }
}

export function totalXp(s: QuestState, cases: QuestCase[] = CASES): number {
  const stepsXp = cases.flatMap((c) => c.steps).reduce((sum, st) => sum + (s.steps[st.id]?.best ?? 0), 0)
  const bonus = cases.filter((c) => s.cases[c.id] === MAX_HEARTS).length * 10
  return stepsXp + bonus
}

export const RANKS = [
  { from: 0, title: 'Стажёр', emoji: '🐣' },
  { from: 40, title: 'Лаборант', emoji: '🧫' },
  { from: 90, title: 'Следователь', emoji: '🔎' },
  { from: 150, title: 'Эксперт', emoji: '🧠' },
  { from: 210, title: 'Главный детектив', emoji: '🕵️' },
] as const

export function rankOf(xp: number) {
  let i = 0
  RANKS.forEach((r, idx) => {
    if (xp >= r.from) i = idx
  })
  const next = RANKS[i + 1]
  return {
    index: i,
    rank: RANKS[i],
    next,
    /** Доля пути до следующего ранга, 0..1 (для последнего — 1) */
    progress: next ? (xp - RANKS[i].from) / (next.from - RANKS[i].from) : 1,
    left: next ? next.from - xp : 0,
  }
}

export interface Achievement {
  id: string
  emoji: string
  title: string
  how: string
}

export const TOPIC_BADGES: { topic: QuestTopic; emoji: string; title: string }[] = [
  { topic: 'concepts', emoji: '🧪', title: 'Знаток веществ' },
  { topic: 'atom', emoji: '⚛️', title: 'Знаток атома' },
  { topic: 'periodic', emoji: '📊', title: 'Знаток таблицы' },
  { topic: 'oxidation', emoji: '⚖️', title: 'Знаток степеней окисления' },
  { topic: 'bonds', emoji: '🔗', title: 'Знаток связей' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', emoji: '🔎', title: 'Первая улика', how: 'Раскройте любую улику' },
  { id: 'clean', emoji: '✨', title: 'Чистая работа', how: 'Пройдите дело без единой ошибки (3 звезды)' },
  { id: 'streak5', emoji: '🔥', title: 'Горячий след', how: '5 улик подряд с первой попытки' },
  { id: 'streak10', emoji: '⚡', title: 'Неудержимый', how: '10 улик подряд с первой попытки' },
  { id: 'fixer', emoji: '🔧', title: 'Работа над ошибками', how: 'Улучшите результат дела при повторном прохождении' },
  ...TOPIC_BADGES.map((b) => ({
    id: `topic-${b.topic}`,
    emoji: b.emoji,
    title: b.title,
    how: `Все улики по теме «${TOPIC_TITLES[b.topic]}» — с первой попытки`,
  })),
  { id: 'closed', emoji: '🗂️', title: 'Дело закрыто', how: 'Пройдите все 5 дел' },
  { id: 'perfect', emoji: '🏆', title: 'Идеальный детектив', how: 'Получите 3 звезды во всех делах' },
]

/** Какие достижения получены (всё считается из сохранённого состояния) */
export function achievementsOf(s: QuestState, cases: QuestCase[] = CASES): string[] {
  const got: string[] = []
  const recs = cases.flatMap((c) => c.steps).map((st) => ({ st, rec: s.steps[st.id] }))
  if (recs.some((r) => r.rec?.solved)) got.push('first')
  if (cases.some((c) => s.cases[c.id] === MAX_HEARTS)) got.push('clean')
  if (s.bestStreak >= 5) got.push('streak5')
  if (s.bestStreak >= 10) got.push('streak10')
  if (s.improved) got.push('fixer')
  for (const b of TOPIC_BADGES) {
    const mine = recs.filter((r) => r.st.topic === b.topic)
    if (mine.length > 0 && mine.every((r) => r.rec?.solved && r.rec.tries === 0)) got.push(`topic-${b.topic}`)
  }
  if (cases.every((c) => (s.cases[c.id] ?? 0) > 0)) got.push('closed')
  if (cases.every((c) => s.cases[c.id] === MAX_HEARTS)) got.push('perfect')
  return got
}

export interface TopicStat {
  topic: QuestTopic
  total: number
  /** Сколько улик по теме уже пройдено (раскрыто или провалено) */
  attempted: number
  /** Раскрыто с первой попытки */
  clean: number
}

export function topicStats(s: QuestState, cases: QuestCase[] = CASES): TopicStat[] {
  const steps = cases.flatMap((c) => c.steps)
  return (['concepts', 'atom', 'periodic', 'oxidation', 'bonds'] as QuestTopic[]).map((topic) => {
    const mine = steps.filter((st) => st.topic === topic)
    const recs = mine.map((st) => s.steps[st.id]).filter(Boolean)
    return {
      topic,
      total: mine.length,
      attempted: recs.length,
      clean: recs.filter((r) => r.solved && r.tries === 0).length,
    }
  })
}

export interface WeakNuance {
  nuance: string
  topic: QuestTopic
  /** Сколько улик с этим нюансом вызвали ошибки */
  count: number
  /** Улика не раскрыта совсем */
  failed: boolean
}

/** Нюансы, на которых были ошибки (по последнему прохождению), самые проблемные — первыми */
export function weakNuances(s: QuestState, cases: QuestCase[] = CASES): WeakNuance[] {
  const map = new Map<string, WeakNuance>()
  for (const st of cases.flatMap((c) => c.steps)) {
    const rec = s.steps[st.id]
    if (!rec || (rec.solved && rec.tries === 0)) continue
    const cur = map.get(st.nuance) ?? { nuance: st.nuance, topic: NUANCES[st.nuance].topic, count: 0, failed: false }
    cur.count += 1
    cur.failed ||= !rec.solved
    map.set(st.nuance, cur)
  }
  return [...map.values()].sort((a, b) => Number(b.failed) - Number(a.failed) || b.count - a.count)
}

/** Дело открыто, если пройдено предыдущее (хотя бы на одну звезду) */
export const caseUnlocked = (s: QuestState, cases: QuestCase[], index: number): boolean =>
  index === 0 || (s.cases[cases[index - 1].id] ?? 0) > 0

/**
 * Угол диска после каждой раскрытой улики: диск делает полный оборот (направление чередуется,
 * как у настоящего кодового замка) и останавливается так, что нужная цифра стоит под красной меткой.
 */
export function dialAngles(code: string[]): number[] {
  const mod = (x: number) => ((x % 360) + 360) % 360
  const out = [0]
  let pos = 0
  code.forEach((d, i) => {
    const target = mod(-Number(d) * 36)
    const delta = i % 2 === 0 ? mod(target - pos) + 360 : -(mod(pos - target) + 360)
    out.push(out[i] + delta)
    pos = target
  })
  return out
}
