import { useState } from 'react'
import { tex } from './RichText'

const GAS = '#d7ee5c'

interface Step {
  title: string
  eq: string
  text: string
  /** какие части схемы подсвечены */
  on: ('flask' | 'b1' | 'b2' | 'jar' | 'trap')[]
}

const STEPS: Step[] = [
  {
    title: 'Получение',
    eq: '\\ce{MnO2 + 4HCl ->[t] MnCl2 + Cl2 ^ + 2H2O}',
    text: 'В колбе смесь оксида марганца(IV) с концентрированной соляной кислотой, которую подливают из воронки. При нагревании образуется хлор. Окислитель здесь — $\\ce{MnO2}$ (Mn⁺⁴ → Mn⁺²), а восстановитель — хлорид-ион (Cl⁻ → Cl⁰). Фтор так получить нельзя: его нечем окислить.',
    on: ['flask'],
  },
  {
    title: 'Очистка от HCl',
    eq: '\\ce{HCl ->[H2O] H+ + Cl-}',
    text: 'Вместе с хлором из колбы летят пары хлороводорода. Промывная склянка с водой (или насыщенным раствором NaCl) задерживает $\\ce{HCl}$: он очень хорошо растворяется, а хлор — заметно хуже.',
    on: ['b1'],
  },
  {
    title: 'Осушка',
    eq: '\\mathrm{H_2SO_4} + n\\,\\mathrm{H_2O} \\rightarrow \\mathrm{H_2SO_4}\\cdot n\\mathrm{H_2O}',
    text: 'Вторая склянка заполнена концентрированной серной кислотой. Она поглощает пары воды, и хлор становится сухим. Сухой хлор — менее агрессивный, чем влажный.',
    on: ['b2'],
  },
  {
    title: 'Собирание',
    eq: 'M(\\mathrm{Cl_2}) = 71\\ \\text{г/моль} \\;>\\; M(\\text{воздуха}) = 29\\ \\text{г/моль}',
    text: 'Хлор в 2,5 раза тяжелее воздуха, поэтому он опускается на дно. Трубку подводят **к самому дну** сосуда: хлор заполняет его снизу вверх и вытесняет воздух. Заполнение видно по жёлто-зелёной окраске.',
    on: ['jar'],
  },
  {
    title: 'Поглощение избытка',
    eq: '\\ce{Cl2 + 2NaOH -> NaCl + NaClO + H2O}',
    text: 'Хлор ядовит, поэтому его остатки пропускают через раствор щёлочи. Реакция идёт на холоде: образуются безопасные соли — хлорид и гипохлорит натрия.',
    on: ['trap'],
  },
]

/** Лабораторная установка получения хлора: колба → промывка → осушка → сбор → поглотитель */
export default function ChlorineLab() {
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const s = STEPS[k]
  const on = (p: Step['on'][number]) => s.on.includes(p)
  const dim = (p: Step['on'][number]) => (on(p) ? 1 : 0.55)

  const pipe = (d: string) => (
    <>
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={GAS} strokeWidth={3} strokeDasharray="7 7" strokeLinejoin="round" style={{ animation: 'dash-flow 1s linear infinite' }} />
    </>
  )

  const play = () => {
    if (playing) return
    setPlaying(true)
    setK(0)
    STEPS.forEach((_, i) => {
      window.setTimeout(() => {
        setK(i)
        if (i === STEPS.length - 1) setPlaying(false)
      }, i * 3800)
    })
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-1.5">
        {STEPS.map((x, i) => (
          <button
            key={i}
            onClick={() => setK(i)}
            aria-pressed={i === k}
            className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold transition ${i === k ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {i + 1}. {x.title}
          </button>
        ))}
        <button onClick={play} disabled={playing} className="rounded-xl bg-teal px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">
          ▶ По порядку
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <svg viewBox="0 0 800 330" className="mx-auto block w-full min-w-[560px] rounded-xl bg-white/5" role="img" aria-label="Лабораторная установка для получения хлора">
          {/* трубки с газом */}
          {pipe('M 122 98 H 140 V 60 H 262 V 246')}
          {pipe('M 298 168 V 60 H 422 V 246')}
          {pipe('M 458 168 V 60 H 580 V 266')}
          {pipe('M 620 128 V 60 H 725 V 276')}

          {/* КОЛБА */}
          <g style={{ opacity: dim('flask'), transition: 'opacity .4s' }}>
            <defs>
              <clipPath id="cl-flask">
                <circle cx={110} cy={215} r={55} />
              </clipPath>
            </defs>
            <rect x={98} y={140} width={24} height={44} fill="none" stroke="#fff" strokeWidth={2.4} />
            <circle cx={110} cy={215} r={55} fill="rgba(255,255,255,.04)" stroke="#fff" strokeWidth={2.4} />
            <g clipPath="url(#cl-flask)">
              <rect x={50} y={200} width={120} height={80} fill="#e8c26a" opacity={0.55} />
              <rect x={50} y={252} width={120} height={20} fill="#1b1b24" />
            </g>
            <rect x={96} y={92} width={28} height={14} rx={3} fill="#c9a06a" />
            <path d="M 98 40 H 122 L 112 70 H 108 Z" fill="rgba(255,255,255,.12)" stroke="#fff" strokeWidth={2} />
            <rect x={107} y={70} width={6} height={22} fill="#fff" opacity={0.8} />
            <circle cx={110} cy={74} r={3} fill="#ffd54a" />
            <text x={110} y={30} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">конц. HCl</text>
            <text x={110} y={248} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" opacity={0.9}>MnO₂</text>
            <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
              <path d="M 110 316 C 92 304 100 290 110 282 C 120 290 128 304 110 316 Z" fill="#ffb347" />
              <path d="M 110 316 C 102 308 106 298 110 294 C 114 298 118 308 110 316 Z" fill="#ff6b3d" />
            </g>
            <text x={110} y={326} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.8}>нагревание</text>
            {Array.from({ length: 3 }, (_, i) => (
              <circle key={i} cx={96 + i * 14} cy={225} r={3 + (i % 2)} fill={GAS} opacity={0} style={{ animation: `rise ${2 + i * 0.4}s linear ${i * 0.5}s infinite` }} />
            ))}
          </g>

          {/* ПРОМЫВНАЯ СКЛЯНКА 1 */}
          <Bottle id="b1" cx={280} liquid="#8fc4ff" label="вода" sub="задерживает HCl" opacity={dim('b1')} />
          {/* ПРОМЫВНАЯ СКЛЯНКА 2 */}
          <Bottle id="b2" cx={440} liquid="#f1d98b" label="H₂SO₄ (конц.)" sub="поглощает воду" opacity={dim('b2')} />

          {/* БАНКА ДЛЯ СБОРА */}
          <g style={{ opacity: dim('jar'), transition: 'opacity .4s' }}>
            <defs>
              <clipPath id="cl-jar">
                <rect x={558} y={112} width={84} height={160} rx={10} />
              </clipPath>
            </defs>
            <g clipPath="url(#cl-jar)">
              <rect
                key={`fill-${k === 3}`}
                x={558}
                y={112}
                width={84}
                height={160}
                fill="#bfdc3c"
                opacity={0.62}
                style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: k === 3 ? 'fill-up 3.4s ease-out both' : undefined }}
              />
            </g>
            <rect x={558} y={112} width={84} height={160} rx={10} fill="none" stroke="#fff" strokeWidth={2.4} />
            <rect x={556} y={100} width={88} height={14} rx={4} fill="#c9a06a" />
            <text x={600} y={296} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">Cl₂ тяжелее воздуха</text>
            <text x={600} y={312} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.75}>воздух вытесняется вверх</text>
            {k === 3 && (
              <g fill="#fff" opacity={0.8}>
                <path d="M 624 150 V 118" stroke="#fff" strokeWidth={2} fill="none" />
                <path d="M 619 124 L 624 116 L 629 124" stroke="#fff" strokeWidth={2} fill="none" />
                <text x={650} y={146} fontSize={11}>воздух ↑</text>
              </g>
            )}
          </g>

          {/* ПОГЛОТИТЕЛЬ */}
          <g style={{ opacity: dim('trap'), transition: 'opacity .4s' }}>
            <path d="M 690 210 V 296 Q 690 304 698 304 H 762 Q 770 304 770 296 V 210" fill="rgba(255,255,255,.04)" stroke="#fff" strokeWidth={2.4} />
            <rect x={692} y={236} width={76} height={66} rx={6} fill="#f08fb8" opacity={0.5} />
            <text x={730} y={262} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">NaOH</text>
            <text x={730} y={322} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.75}>поглощает остатки Cl₂</text>
            {Array.from({ length: 3 }, (_, i) => (
              <circle key={i} cx={718 + i * 8} cy={272} r={3} fill={GAS} opacity={0} style={{ animation: `rise ${1.6 + i * 0.3}s linear ${i * 0.4}s infinite` }} />
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-3 rounded-xl bg-white/10 p-3" aria-live="polite">
        <div className="font-bold text-orange">
          Шаг {k + 1} из {STEPS.length}: {s.title}
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-white/90" dangerouslySetInnerHTML={{ __html: rich(s.text) }} />
      </div>
      <div className="mt-3 rounded-xl bg-white/10 p-3">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-white/60">Уравнение</div>
        <div className="overflow-x-auto text-center text-xl" dangerouslySetInnerHTML={{ __html: tex(s.eq, true) }} />
      </div>
      <p className="mt-2 text-xs text-white/60">Схема упрощена. В школе опыт проводят только в вытяжном шкафу.</p>
    </div>
  )
}

function rich(text: string) {
  return text
    .replace(/\$([^$]+)\$/g, (_, f: string) => tex(f))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function Bottle({ id, cx, liquid, label, sub, opacity }: { id: string; cx: number; liquid: string; label: string; sub: string; opacity: number }) {
  const l = cx - 45
  return (
    <g style={{ opacity, transition: 'opacity .4s' }}>
      <defs>
        <clipPath id={`cl-${id}`}>
          <rect x={l} y={140} width={90} height={122} rx={10} />
        </clipPath>
      </defs>
      <g clipPath={`url(#cl-${id})`}>
        <rect x={l} y={175} width={90} height={90} fill={liquid} opacity={0.55} />
      </g>
      <rect x={l} y={140} width={90} height={122} rx={10} fill="none" stroke="#fff" strokeWidth={2.4} />
      <rect x={cx - 30} y={104} width={60} height={36} fill="none" stroke="#fff" strokeWidth={2.4} />
      <rect x={cx - 34} y={96} width={68} height={12} rx={3} fill="#c9a06a" />
      {Array.from({ length: 4 }, (_, i) => (
        <circle key={i} cx={cx - 18 + i * 3} cy={238} r={3 + (i % 2)} fill="#d7ee5c" opacity={0} style={{ animation: `rise ${2.2 + i * 0.3}s linear ${i * 0.45}s infinite` }} />
      ))}
      <text x={cx} y={222} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">{label}</text>
      <text x={cx} y={284} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.75}>{sub}</text>
    </g>
  )
}
