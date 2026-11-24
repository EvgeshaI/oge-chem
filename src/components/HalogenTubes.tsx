import { useState } from 'react'
import { HALOGENS, sub } from '../lib/halogens'

const X = [90, 250, 410, 570]
const TOP = 78
const BOTTOM = 238
const WD = 96

const NOTES: Record<string, { smell: string; extra: string }> = {
  F: { smell: 'резкий запах, очень ядовит', extra: 'самый активный неметалл: реагирует почти со всеми веществами, даже с водой' },
  Cl: { smell: 'резкий удушливый запах, ядовит', extra: 'в 2,5 раза тяжелее воздуха; растворяется в воде, образуя «хлорную воду»' },
  Br: { smell: 'резкий неприятный запах, пары ядовиты', extra: 'единственный жидкий неметалл; летучий, на коже оставляет ожоги' },
  I: { smell: 'специфический запах, пары ядовиты', extra: 'при нагревании возгоняется — переходит в пар, минуя жидкость; в воде почти нерастворим' },
}

function Vapour({ x, color, count, y0 }: { x: number; color: string; count: number; y0: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, k) => (
        <circle
          key={k}
          cx={x - WD / 2 + 12 + ((k * 37) % (WD - 24))}
          cy={y0 - ((k * 23) % 60)}
          r={4 + (k % 3)}
          fill={color}
          opacity={0}
          style={{ animation: `rise ${3.2 + (k % 4) * 0.5}s linear ${(k * 0.45) % 3}s infinite` }}
        />
      ))}
    </>
  )
}

/** Внешний вид F₂, Cl₂, Br₂, I₂ и возгонка иода при нагревании */
export default function HalogenTubes() {
  const [sel, setSel] = useState(1)
  const [hot, setHot] = useState(false)
  const h = HALOGENS[sel]
  const note = NOTES[h.sym]
  const selectTube = (k: number) => {
    setSel(k)
    if (k !== 3) setHot(false)
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <div className="text-sm text-white/75">Нажмите на сосуд, чтобы узнать подробности. Выберите иод — его можно нагреть.</div>
      <svg viewBox="0 0 660 320" className="mx-auto mt-2 block w-full rounded-xl bg-white/5" role="img" aria-label="Сосуды с фтором, хлором, бромом и иодом: цвет и агрегатное состояние">
        {HALOGENS.map((g, k) => {
          const x = X[k]
          const active = sel === k
          const left = x - WD / 2
          return (
            <g key={g.sym} onClick={() => selectTube(k)} style={{ cursor: 'pointer', outline: 'none' }} role="button" aria-label={`${g.name}: показать описание`} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectTube(k)}>
              <rect x={left - 10} y={TOP - 24} width={WD + 20} height={BOTTOM - TOP + 100} rx={12} fill="none" stroke={active ? '#ffd54a' : 'transparent'} strokeWidth={1.2} />

              {/* содержимое */}
              {g.sym === 'F' && <rect x={left + 2} y={TOP + 2} width={WD - 4} height={BOTTOM - TOP - 4} fill="#f6ee9a" opacity={0.42} rx={4} />}
              {g.sym === 'Cl' && <rect x={left + 2} y={TOP + 2} width={WD - 4} height={BOTTOM - TOP - 4} fill="#bfdc3c" opacity={0.62} rx={4} />}
              {g.sym === 'Br' && (
                <>
                  <rect x={left + 2} y={TOP + 2} width={WD - 4} height={BOTTOM - TOP - 4} fill="#c24a22" opacity={0.3} rx={4} />
                  <rect x={left + 2} y={BOTTOM - 40} width={WD - 4} height={38} fill="#7f1d0d" opacity={0.95} rx={4} />
                  <ellipse cx={x} cy={BOTTOM - 40} rx={(WD - 4) / 2} ry={3} fill="#a3290f" />
                </>
              )}
              {g.sym === 'I' && (
                <>
                  <rect x={left + 2} y={TOP + 2} width={WD - 4} height={BOTTOM - TOP - 4} fill="#7b3fc4" opacity={hot ? 0.55 : 0.04} rx={4} style={{ transition: 'opacity 1.6s' }} />
                  {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                    <polygon
                      key={c}
                      points={`${left + 10 + c * 12},${BOTTOM - 2} ${left + 14 + c * 12},${BOTTOM - 14 - (c % 3) * 5} ${left + 20 + c * 12},${BOTTOM - 2}`}
                      fill="#2d1650"
                      stroke="#6b43a8"
                      strokeWidth={1}
                      style={{ opacity: hot ? 0.35 : 1, transition: 'opacity 2s' }}
                    />
                  ))}
                  {/* кристаллы, осевшие на холодной крышке */}
                  {[0, 1, 2, 3].map((c) => (
                    <polygon
                      key={`d${c}`}
                      points={`${left + 18 + c * 20},${TOP + 2} ${left + 24 + c * 20},${TOP + 12} ${left + 30 + c * 20},${TOP + 2}`}
                      fill="#2d1650"
                      stroke="#6b43a8"
                      strokeWidth={1}
                      style={{ opacity: hot ? 0.9 : 0, transition: 'opacity 3s ease 1.5s' }}
                    />
                  ))}
                </>
              )}

              {/* летучие пары */}
              {g.sym === 'F' && <Vapour x={x} color="#f6ee9a" count={7} y0={BOTTOM - 10} />}
              {g.sym === 'Cl' && <Vapour x={x} color="#d7ee5c" count={9} y0={BOTTOM - 10} />}
              {g.sym === 'Br' && <Vapour x={x} color="#e0653a" count={9} y0={BOTTOM - 46} />}
              {g.sym === 'I' && hot && <Vapour x={x} color="#a366f0" count={11} y0={BOTTOM - 14} />}

              {/* стекло */}
              <path d={`M ${left} ${TOP} V ${BOTTOM - 14} Q ${left} ${BOTTOM} ${left + 14} ${BOTTOM} H ${left + WD - 14} Q ${left + WD} ${BOTTOM} ${left + WD} ${BOTTOM - 14} V ${TOP}`} fill="none" stroke="#fff" strokeWidth={2.4} strokeOpacity={0.85} />
              <rect x={left - 4} y={TOP - 14} width={WD + 8} height={14} rx={4} fill={g.sym === 'I' && hot ? '#9fd0ff' : '#cfd6f5'} style={{ transition: 'fill 1s' }} />

              {/* горелка для иода */}
              {g.sym === 'I' && hot && (
                <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: 'flicker .5s ease-in-out infinite' }}>
                  <path d={`M ${x} ${BOTTOM + 34} C ${x - 20} ${BOTTOM + 18} ${x - 8} ${BOTTOM + 8} ${x} ${BOTTOM + 4} C ${x + 8} ${BOTTOM + 8} ${x + 20} ${BOTTOM + 18} ${x} ${BOTTOM + 34} Z`} fill="#ffb347" />
                  <path d={`M ${x} ${BOTTOM + 34} C ${x - 10} ${BOTTOM + 24} ${x - 4} ${BOTTOM + 16} ${x} ${BOTTOM + 14} C ${x + 4} ${BOTTOM + 16} ${x + 10} ${BOTTOM + 24} ${x} ${BOTTOM + 34} Z`} fill="#ff6b3d" />
                </g>
              )}

              <text x={x} y={BOTTOM + 52} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff">
                {sub(g.sym + '2')}
              </text>
              <text x={x} y={BOTTOM + 70} textAnchor="middle" fontSize={12} fill="#fff" opacity={0.75}>
                {g.state}
              </text>
            </g>
          )
        })}
        {hot && (
          <text x={650} y={TOP - 38} textAnchor="end" fontSize={12} fontWeight={700} fill="#ffd54a">
            возгонка: кристаллы → пар → кристаллы
          </text>
        )}
      </svg>

      {sel === 3 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHot((v) => !v)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${hot ? 'bg-white/10 hover:bg-white/20' : 'bg-orange text-navy hover:brightness-110'}`}
          >
            {hot ? '↺ Остудить иод' : '🔥 Нагреть иод'}
          </button>
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs text-white/60">Вещество</div>
          <div className="text-xl font-extrabold">{sub(h.sym + '2')} · {h.name}</div>
          <div className="mt-1 text-sm">
            <span className="mr-1 inline-block h-3 w-3 rounded-full border border-white align-middle" style={{ background: h.look }} />
            {h.colorName}, <b>{h.state}</b>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-sm">
          <div className="text-xs text-white/60">Температуры</div>
          <div>t плавления: <b>{h.mp} °C</b></div>
          <div>t кипения: <b>{h.bp} °C</b></div>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-sm">
          <div className="text-xs text-white/60">Запах и безопасность</div>
          <div>{note.smell}</div>
        </div>
      </div>
      <p className="mt-2 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed text-white/90">{note.extra}.</p>
      <p className="mt-2 text-xs text-white/60">Рисунок схематичен. Все галогены ядовиты: опыты с ними проводят только в вытяжном шкафу.</p>
    </div>
  )
}
