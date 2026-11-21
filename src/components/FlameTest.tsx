import { useState } from 'react'

interface Ion {
  ion: string
  salt: string
  color: string
  name: string
  hex: string
}

const IONS: Ion[] = [
  { ion: 'Li⁺', salt: 'LiCl', color: 'карминово-красное', name: 'литий', hex: '#e0245e' },
  { ion: 'Na⁺', salt: 'NaCl', color: 'жёлтое', name: 'натрий', hex: '#ffd22e' },
  { ion: 'K⁺', salt: 'KCl', color: 'фиолетовое', name: 'калий', hex: '#b58cff' },
  { ion: 'Ca²⁺', salt: 'CaCl₂', color: 'кирпично-красное', name: 'кальций', hex: '#e8542a' },
  { ion: 'Ba²⁺', salt: 'BaCl₂', color: 'жёлто-зелёное', name: 'барий', hex: '#a9d93c' },
]
const PLAIN = '#7ec8ff'

function Burner({ color, lit }: { color: string; lit: boolean }) {
  return (
    <svg viewBox="0 0 220 260" className="mx-auto w-full max-w-[220px]" role="img" aria-label={lit ? 'Горелка: пламя окрашено солью металла' : 'Горелка с бесцветным пламенем'}>
      <defs>
        <radialGradient id="flame-glow" cx="50%" cy="85%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* горелка */}
      <rect x={100} y={150} width={20} height={64} fill="#8a91a3" />
      <path d="M70 250 L84 214 H136 L150 250 Z" fill="#6b7387" />
      <rect x={92} y={178} width={36} height={8} rx={2} fill="#4b5168" />
      {/* пламя */}
      <g className="flame" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .7s ease-in-out infinite' }}>
        <path
          d="M110 150 C80 135 76 100 96 66 C100 84 112 88 114 70 C128 90 144 112 138 130 C134 142 124 148 110 150 Z"
          fill={color}
          style={{ transition: 'fill .9s' }}
          opacity={0.92}
        />
        <path d="M110 150 C94 142 94 122 108 104 C122 120 128 138 110 150 Z" fill="#fff" opacity={0.55} />
        <ellipse cx={110} cy={130} rx={46} ry={56} fill="url(#flame-glow)" opacity={0.35} />
      </g>
      {/* проволока с пробой */}
      <line x1={196} y1={40} x2={112} y2={110} stroke="#cfd6e6" strokeWidth={3} strokeLinecap="round" />
      <circle cx={112} cy={110} r={6} fill={lit ? '#fff' : '#e9edf7'} stroke="#cfd6e6" strokeWidth={1.5} />
    </svg>
  )
}

/** Окраска пламени солями металлов: опыт и тренажёр «угадай ион» */
export default function FlameTest() {
  const [i, setI] = useState(1)
  const [lit, setLit] = useState(false)
  const [quiz, setQuiz] = useState(false)
  const [target, setTarget] = useState(2)
  const [picked, setPicked] = useState<number | null>(null)

  const cur = IONS[quiz ? target : i]
  const color = lit ? cur.hex : PLAIN

  const pick = (k: number) => {
    setI(k)
    setLit(false)
  }
  const startQuiz = (on: boolean) => {
    setQuiz(on)
    setLit(false)
    setPicked(null)
    if (on) setTarget(Math.floor(Math.random() * IONS.length))
  }
  const again = () => {
    setPicked(null)
    setLit(false)
    setTarget((t) => (t + 1 + Math.floor(Math.random() * (IONS.length - 1))) % IONS.length)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => startQuiz(false)} aria-pressed={!quiz} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${!quiz ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
          Опыт
        </button>
        <button onClick={() => startQuiz(true)} aria-pressed={quiz} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${quiz ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}>
          Угадай ион
        </button>
      </div>

      <div className="mt-3 grid items-center gap-4 sm:grid-cols-[220px_1fr]">
        <Burner color={color} lit={lit} />
        <div>
          {!quiz ? (
            <>
              <div className="flex flex-wrap gap-2">
                {IONS.map((x, k) => (
                  <button key={x.ion} onClick={() => pick(k)} aria-pressed={k === i} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                    {x.ion}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-white/80">
                Проба: соль <b>{cur.salt}</b> (ион {cur.name}а) на платиновой или нихромовой проволоке.
              </p>
              <button onClick={() => setLit(true)} disabled={lit} className="mt-3 rounded-xl bg-orange px-4 py-2 font-semibold text-navy hover:brightness-105 disabled:opacity-50">
                {lit ? 'Проба в пламени' : 'Внести пробу в пламя'}
              </button>
              <div className="mt-3 min-h-[3rem] rounded-xl bg-white/10 p-3" aria-live="polite">
                {lit ? (
                  <span style={{ animation: 'pop .3s ease-out both', display: 'inline-block' }}>
                    <b style={{ color: cur.hex }}>{cur.ion}</b> окрашивает пламя в <b className="text-orange">{cur.color}</b> цвет.
                  </span>
                ) : (
                  <span className="text-white/70">Пламя горелки почти бесцветное. Внесите пробу — и посмотрите, что изменится.</span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-white/80">В пламя внесли соль неизвестного металла. Смотрите на цвет пламени и выберите ион.</p>
              {!lit && (
                <button onClick={() => setLit(true)} className="mt-3 rounded-xl bg-orange px-4 py-2 font-semibold text-navy hover:brightness-105">
                  Внести пробу в пламя
                </button>
              )}
              {lit && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {IONS.map((x, k) => {
                    let cls = 'bg-white/10 hover:bg-white/20'
                    if (picked !== null) cls = k === target ? 'bg-teal text-white' : k === picked ? 'bg-red text-white' : 'bg-white/10 opacity-60'
                    return (
                      <button key={x.ion} disabled={picked !== null} onClick={() => setPicked(k)} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${cls}`}>
                        {x.ion}
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="mt-3 min-h-[3rem] rounded-xl bg-white/10 p-3" aria-live="polite">
                {picked === null ? (
                  <span className="text-white/70">{lit ? 'Какой это ион?' : 'Сначала внесите пробу.'}</span>
                ) : picked === target ? (
                  <b className="text-teal">Верно! {cur.ion} — {cur.color} пламя.</b>
                ) : (
                  <span>
                    <b className="text-red">Неверно.</b> Это {cur.ion}: {cur.color} пламя. {IONS[picked].ion} даёт {IONS[picked].color}.
                  </span>
                )}
              </div>
              {picked !== null && (
                <button onClick={again} className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                  Ещё раз
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
