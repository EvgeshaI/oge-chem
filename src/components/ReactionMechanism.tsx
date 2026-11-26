import { useEffect, useMemo, useState } from 'react'
import { GROUP_TITLES, scenesOf, type GroupId, type Kind, type Note, type Scene, type St, type Step } from '../lib/mechanisms'
import { RichText, tex } from './RichText'

const LOOK: Record<Kind, { fill: string; text: string; r: number }> = {
  metal: { fill: '#cdd5e8', text: '#1b2445', r: 22 },
  cu: { fill: '#e8924f', text: '#1b2445', r: 22 },
  ag: { fill: '#f3f5fb', text: '#1b2445', r: 21 },
  cation: { fill: '#7fb2ff', text: '#10224d', r: 18 },
  anion: { fill: '#ff9d9d', text: '#4a0f14', r: 22 },
  cl: { fill: '#cfe56a', text: '#2d3a05', r: 20 },
  o: { fill: '#ff8a8a', text: '#4a0f14', r: 19 },
  s: { fill: '#f7d94c', text: '#4a3b00', r: 22 },
  h: { fill: '#ffffff', text: '#1b2445', r: 13 },
  hplus: { fill: '#ffb3cf', text: '#5a1031', r: 16 },
  c: { fill: '#3a4056', text: '#ffffff', r: 20 },
  f: { fill: '#f3ecb0', text: '#4d4710', r: 17 },
  br: { fill: '#e9946a', text: '#3d1405', r: 23 },
  i: { fill: '#c9a6e6', text: '#2e1250', r: 26 },
  p: { fill: '#f4b183', text: '#4a2108', r: 22 },
  n: { fill: '#9fa8ff', text: '#16205a', r: 19 },
}

const NOTE_COLOR = { info: '#cfd6f5', good: '#6ee7c4', bad: '#ff8a8f' } as const
const ELECTRON_MS = 1400
const AUTO_MS = 3400

/** Состояние частицы на шаге; если на шаге её нет — берём ближайшее известное и прячем */
function stateAt(scene: Scene, id: string, i: number): { st: St; visible: boolean } {
  const here = scene.steps[i].sp[id]
  if (here) return { st: here, visible: true }
  for (let d = 1; d < scene.steps.length; d++) {
    const prev = scene.steps[i - d]?.sp[id]
    if (prev) return { st: prev, visible: false }
    const nxt = scene.steps[i + d]?.sp[id]
    if (nxt) return { st: nxt, visible: false }
  }
  throw new Error(`Нет частицы ${id}`)
}

const plain = (s: string) => s.replace(/\$([^$]+)\$/g, '$1').replace(/\*\*/g, '')

function Particle({ st, visible, shake }: { st: St; visible: boolean; shake: boolean }) {
  const look = LOOK[st.k]
  const r = st.r ?? look.r
  const small = st.t.length > 3 || r < 17
  return (
    <g
      className="mech-sp"
      style={{
        transform: `translate(${st.x}px, ${st.y}px)`,
        opacity: visible ? 1 : 0,
        transition: 'transform 1.1s ease-in-out, opacity .5s',
      }}
    >
      <g style={shake ? { animation: 'shake .5s ease-in-out 3' } : undefined}>
        <circle r={r} fill={look.fill} stroke="#fff" strokeWidth={1.5} style={{ transition: 'fill .6s, r .6s' }} />
        <text textAnchor="middle" dy="0.35em" fontSize={small ? 12.5 : 15} fontWeight={700} fill={look.text}>
          {st.t}
        </text>
        {st.ox && visible && (
          <g transform={`translate(0, ${-r - 12})`}>
            <g key={st.ox} style={{ animation: 'pop .35s ease-out both', transformBox: 'fill-box', transformOrigin: 'center' }}>
              <rect x={-(st.ox.length * 4 + 6)} y={-9} width={st.ox.length * 8 + 12} height={18} rx={9} fill="#ffd54a" />
              <text textAnchor="middle" dy="0.35em" fontSize={11.5} fontWeight={800} fill="#1b2445">
                {st.ox}
              </text>
            </g>
          </g>
        )}
      </g>
    </g>
  )
}

function Notes({ notes, k }: { notes: Note[]; k: string }) {
  return (
    <>
      {notes.map((n, i) => (
        <text
          key={`${k}-${i}`}
          x={n.x}
          y={n.y}
          textAnchor="middle"
          fontSize={13}
          fontWeight={600}
          fill={NOTE_COLOR[n.tone ?? 'info']}
          style={{ animation: 'fade-up .6s ease-out .5s both' }}
        >
          {n.t.split('\n').map((line, j) => (
            <tspan key={j} x={n.x} dy={j === 0 ? 0 : 16}>
              {line}
            </tspan>
          ))}
        </text>
      ))}
    </>
  )
}

function Electrons({ step, k }: { step: Step; k: string }) {
  if (!step.e) return null
  return (
    <>
      {step.e.flatMap((f, fi) => {
        const from = step.sp[f.from]
        const to = step.sp[f.to]
        if (!from || !to) return []
        return Array.from({ length: f.n }, (_, j) => {
          const off = (j - (f.n - 1) / 2) * 12
          return (
            <circle
              key={`${k}-${fi}-${j}`}
              r={5.5}
              fill="#ffd54a"
              stroke="#fff"
              strokeWidth={1.2}
              style={
                {
                  '--fx': `${from.x}px`,
                  '--fy': `${from.y + off}px`,
                  '--tx': `${to.x - 8}px`,
                  '--ty': `${to.y + off * 0.6}px`,
                  animation: `fly ${ELECTRON_MS}ms ease-in-out ${fi * 120 + j * 280}ms both`,
                } as React.CSSProperties
              }
            >
              <title>электрон</title>
            </circle>
          )
        })
      })}
      {step.e.map((f, fi) => {
        const from = step.sp[f.from]
        const to = step.sp[f.to]
        if (!from || !to) return null
        return (
          <line
            key={`${k}-g${fi}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#ffd54a"
            strokeOpacity={0.4}
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />
        )
      })}
    </>
  )
}

function SceneView({ scene }: { scene: Scene }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = scene.steps.length - 1
  const step = scene.steps[i]
  const ids = useMemo(() => [...new Set(scene.steps.flatMap((s) => Object.keys(s.sp)))], [scene])

  useEffect(() => {
    if (!playing) return
    if (i >= last) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setI((v) => v + 1), AUTO_MS)
    return () => clearTimeout(t)
  }, [playing, i, last])

  const tint = step.tint ?? scene.steps.find((s) => s.tint)?.tint ?? 'transparent'
  const eqTex = scene.eq.startsWith('\\') ? scene.eq : `\\ce{${scene.eq}}`
  const k = `${scene.id}-${i}`

  return (
    <div className="mt-3 min-w-0">
      <div className="overflow-x-auto">
      <svg
        viewBox="0 0 640 260"
        className="mx-auto block w-full min-w-[320px] max-w-full rounded-xl bg-white/5"
        role="img"
        aria-label={`Шаг ${i + 1} из ${last + 1}: ${step.title}. ${plain(step.text)}`}
      >
        {scene.solution && (
          <>
            <rect x={8} y={12} width={624} height={238} rx={18} fill={tint} stroke="rgba(255,255,255,.28)" strokeWidth={1.5} style={{ transition: 'fill .9s' }} />
            <text x={24} y={34} fontSize={12} fill="rgba(255,255,255,.7)" fontWeight={600}>
              {scene.solution}
            </text>
          </>
        )}
        <Electrons step={step} k={k} />
        {ids.map((id) => {
          const { st, visible } = stateAt(scene, id, i)
          return <Particle key={id} st={st} visible={visible} shake={!!step.shake?.includes(id)} />
        })}
        <Notes notes={step.notes ?? []} k={k} />
      </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {scene.steps.map((s, n) => (
          <button
            key={n}
            onClick={() => {
              setPlaying(false)
              setI(n)
            }}
            aria-pressed={n === i}
            className={`max-w-full rounded-xl px-2.5 py-1.5 text-left text-sm font-semibold transition ${n === i ? 'bg-orange text-navy' : n < i ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {n + 1}. {s.title}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <div className="font-bold text-orange">
          Шаг {i + 1} из {last + 1}: {step.title}
        </div>
        <p className="mt-1 text-white/90">
          <RichText text={step.text} />
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setPlaying(false)
            setI((v) => Math.max(0, v - 1))
          }}
          disabled={i === 0}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-40"
        >
          ← Назад
        </button>
        <button
          onClick={() => {
            setPlaying(false)
            setI((v) => Math.min(last, v + 1))
          }}
          disabled={i === last}
          className="rounded-xl bg-orange px-4 py-2 text-sm font-semibold text-navy hover:brightness-105 disabled:opacity-40"
        >
          Дальше →
        </button>
        <button
          onClick={() => {
            if (playing) setPlaying(false)
            else {
              if (i >= last) setI(0)
              setPlaying(true)
            }
          }}
          className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          {playing ? '⏸ Пауза' : '▶ Показать всё'}
        </button>
        <button
          onClick={() => {
            setPlaying(false)
            setI(0)
          }}
          disabled={i === 0}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-40"
        >
          ↺ Сначала
        </button>
        <span className="w-full text-xs text-white/60 sm:ml-auto sm:w-auto">
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#ffd54a] align-middle" /> электрон ·{' '}
          <span className="rounded-full bg-[#ffd54a] px-1.5 font-bold text-navy">+1</span> степень окисления
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-white/60">Уравнение реакции</div>
        <div className="overflow-x-auto text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(eqTex, true) }} />
      </div>

      {scene.roles.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-xl bg-white/10">
          <table className="w-full text-left text-sm">
            <caption className="px-3 pt-2 text-left text-xs font-bold uppercase tracking-wide text-white/60">Что на что меняется</caption>
            <thead>
              <tr className="text-white/70">
                <th className="px-3 py-1.5 font-semibold">Элемент</th>
                <th className="px-3 py-1.5 font-semibold">Было</th>
                <th className="px-3 py-1.5 font-semibold">Стало</th>
                <th className="px-3 py-1.5 font-semibold">Что делает</th>
                <th className="px-3 py-1.5 font-semibold">Роль</th>
              </tr>
            </thead>
            <tbody>
              {scene.roles.map((r) => (
                <tr key={r.el} className="border-t border-white/10">
                  <td className="px-3 py-1.5 font-bold">{r.el}</td>
                  <td className="px-3 py-1.5">
                    <b className="rounded bg-[#ffd54a] px-1.5 text-navy">{r.from}</b>
                  </td>
                  <td className="px-3 py-1.5">
                    <b className="rounded bg-[#ffd54a] px-1.5 text-navy">{r.to}</b>
                  </td>
                  <td className="px-3 py-1.5">{r.change}</td>
                  <td className="px-3 py-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 font-semibold ${r.role === 'восстановитель' ? 'bg-orange text-navy' : 'bg-teal text-white'}`}>{r.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 pb-2 pt-1 text-xs text-white/65">{scene.footnote ? <RichText text={scene.footnote} /> : <>Металл всегда отдаёт электроны: степень окисления растёт — это <b>восстановитель</b>.</>}</p>
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-white/85">
          Степени окисления не изменились — это значит, что окислительно-восстановительной реакции не произошло.
        </p>
      )}
    </div>
  )
}

/** Покадровая анимация: что на что меняется при реакции металла (электроны, ионы, продукты) */
export default function ReactionMechanism({ group, scenes: given, embedded = false }: { group?: GroupId; scenes?: Scene[]; embedded?: boolean }) {
  const scenes = given ?? scenesOf(group!)
  const [id, setId] = useState(scenes[0].id)
  const scene = scenes.find((s) => s.id === id) ?? scenes[0]
  const body = (
    <>
      {!embedded && (
        <div className="text-sm text-white/75">
          {group ? GROUP_TITLES[group] : 'Механизм реакции'}: пройдите реакцию по шагам и посмотрите, куда «уходят» электроны.
        </div>
      )}
      {scenes.length > 1 && (
        <div className={`${embedded ? '' : 'mt-3 '}flex flex-wrap gap-1.5`}>
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => setId(s.id)}
              aria-pressed={s.id === scene.id}
              className={`rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${s.id === scene.id ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {s.tab}
            </button>
          ))}
        </div>
      )}
      <SceneView key={scene.id} scene={scene} />
    </>
  )
  if (embedded) return <div className="min-w-0">{body}</div>
  return <div className="min-w-0 overflow-x-clip rounded-2xl bg-navy p-3 text-white sm:p-5">{body}</div>
}
