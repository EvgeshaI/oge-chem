import { describe, expect, it } from 'vitest'
import { CASES, NUANCES, TOPIC_TITLES } from '../content/quest'
import { catalog } from '../content/catalog'
import {
  ACHIEVEMENTS,
  achievementsOf,
  applyCase,
  applyStep,
  caseUnlocked,
  dialAngles,
  emptyQuest,
  rankOf,
  starsFor,
  stepXp,
  topicStats,
  totalXp,
  weakNuances,
} from './questLogic'

const steps = CASES.flatMap((c) => c.steps)

describe('контент квеста', () => {
  it('id дел и улик уникальны', () => {
    expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length)
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length)
  })
  it('темы квеста есть в каталоге, нюансы описаны', () => {
    for (const t of Object.keys(TOPIC_TITLES)) expect(catalog.some((m) => m.id === t), t).toBe(true)
    for (const s of steps) {
      expect(NUANCES[s.nuance], `${s.id}: нет нюанса ${s.nuance}`).toBeDefined()
      expect(NUANCES[s.nuance].topic, `${s.id}: тема нюанса`).toBe(s.topic)
      expect(s.explanation.trim().length).toBeGreaterThan(0)
      expect(s.found.trim().length).toBeGreaterThan(0)
    }
  })
  it('ответы лежат в пределах вариантов', () => {
    for (const s of steps) {
      if (s.kind === 'single') {
        expect(s.options, s.id).toHaveLength(4)
        expect(Number.isInteger(s.answer) && (s.answer as number) >= 1 && (s.answer as number) <= 4, s.id).toBe(true)
      } else {
        const a = String(s.answer)
        expect(a, s.id).toMatch(/^\d+$/)
        expect([...a].sort().join(''), `${s.id}: цифры по возрастанию`).toBe(a)
        expect(new Set(a).size, s.id).toBe(a.length)
        for (const d of a) expect(Number(d) >= 1 && Number(d) <= s.options.length, s.id).toBe(true)
      }
      expect(new Set(s.options).size, `${s.id}: одинаковые варианты`).toBe(s.options.length)
    }
  })
  it('у каждого дела по 4 улики, каждая тема представлена', () => {
    for (const c of CASES) expect(c.steps, c.id).toHaveLength(4)
    for (const t of Object.keys(TOPIC_TITLES)) expect(steps.some((s) => s.topic === t), t).toBe(true)
  })
})

describe('сейф', () => {
  it('цифры кода есть либо у всех улик дела, либо ни у одной', () => {
    for (const c of CASES) {
      const n = c.steps.filter((s) => s.code !== undefined).length
      expect(n === 0 || n === c.steps.length, c.id).toBe(true)
    }
    const safe = CASES.find((c) => c.id === 'safe')!
    for (const s of safe.steps) expect(s.code, s.id).toMatch(/^\d$/)
  })
  it('диск останавливается нужной цифрой под меткой и крутится по очереди в обе стороны', () => {
    const code = ['7', '1', '0', '5']
    const a = dialAngles(code)
    expect(a).toHaveLength(code.length + 1)
    code.forEach((d, i) => {
      expect((((a[i + 1] % 360) + 360) % 360)).toBe(((360 - Number(d) * 36) % 360))
      expect(Math.abs(a[i + 1] - a[i])).toBeGreaterThanOrEqual(360)
      expect(Math.sign(a[i + 1] - a[i])).toBe(i % 2 === 0 ? 1 : -1)
    })
  })
})

describe('логика игры', () => {
  it('опыт и звёзды', () => {
    expect(stepXp(0, true)).toBe(10)
    expect(stepXp(2, true)).toBe(5)
    expect(stepXp(3, false)).toBe(0)
    expect(starsFor(3)).toBe(3)
    expect(starsFor(-1)).toBe(0)
  })

  it('идеальное прохождение даёт максимум и все достижения', () => {
    let s = emptyQuest()
    for (const c of CASES) {
      for (const st of c.steps) s = applyStep(s, st.id, 0, true)
      s = applyCase(s, c.id, 3)
    }
    expect(totalXp(s)).toBe(steps.length * 10 + CASES.length * 10)
    // всё, кроме «Работы над ошибками» — её без ошибок не получить
    expect(achievementsOf(s).sort()).toEqual(ACHIEVEMENTS.map((a) => a.id).filter((id) => id !== 'fixer').sort())
    expect(weakNuances(s)).toEqual([])
    expect(rankOf(totalXp(s)).rank.title).toBe('Главный детектив')
  })

  it('серия сбрасывается ошибкой, лучший результат сохраняется', () => {
    let s = emptyQuest()
    for (let i = 0; i < 6; i++) s = applyStep(s, steps[i].id, 0, true)
    expect(s.bestStreak).toBe(6)
    s = applyStep(s, steps[6].id, 1, true)
    expect(s.streak).toBe(0)
    expect(s.bestStreak).toBe(6)
  })

  it('слабые места берутся из ошибок, провал важнее', () => {
    let s = emptyQuest()
    s = applyStep(s, steps[0].id, 1, true)
    s = applyStep(s, steps[1].id, 3, false)
    s = applyStep(s, steps[2].id, 0, true)
    const w = weakNuances(s)
    expect(w.map((x) => x.nuance)).toEqual([steps[1].nuance, steps[0].nuance])
    expect(w[0].failed).toBe(true)
    const t = topicStats(s)
    expect(t.find((x) => x.topic === steps[2].topic)?.clean).toBeGreaterThanOrEqual(1)
  })

  it('повторное прохождение не снижает опыт и даёт «работу над ошибками»', () => {
    let s = emptyQuest()
    s = applyStep(s, steps[0].id, 0, true)
    s = applyCase(s, CASES[0].id, 1)
    const xp = totalXp(s)
    s = applyStep(s, steps[0].id, 3, false)
    expect(totalXp(s)).toBe(xp)
    s = applyCase(s, CASES[0].id, 3)
    expect(s.improved).toBe(true)
    expect(s.cases[CASES[0].id]).toBe(3)
  })

  it('дела открываются по порядку', () => {
    let s = emptyQuest()
    expect(caseUnlocked(s, CASES, 0)).toBe(true)
    expect(caseUnlocked(s, CASES, 1)).toBe(false)
    s = applyCase(s, CASES[0].id, 1)
    expect(caseUnlocked(s, CASES, 1)).toBe(true)
  })

  it('ранги растут вместе с опытом', () => {
    expect(rankOf(0).rank.title).toBe('Стажёр')
    expect(rankOf(40).rank.title).toBe('Лаборант')
    expect(rankOf(89).next?.title).toBe('Следователь')
  })
})
