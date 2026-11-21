import { useId } from 'react'
import { dialAngles } from '../../lib/questLogic'

interface Props {
  /** Цифры кода по порядку улик */
  code: string[]
  /** Сколько улик раскрыто */
  solved: number
  /** Счётчик ошибок — при его росте сейф «вздрагивает» */
  wiggle: number
  className?: string
}

const CX = 120
const CY = 160

const TICKS = Array.from({ length: 10 }, (_, i) => i)

/** Сейф: диск с цифрами крутится при каждой раскрытой улике, а после последней дверца приоткрывается */
export function Safe({ code, solved, wiggle, className }: Props) {
  const uid = useId().replace(/:/g, '')
  const total = code.length
  const open = solved >= total
  const angles = dialAngles(code)
  const angle = angles[Math.min(solved, angles.length - 1)]
  const label = open
    ? 'Сейф приоткрыт'
    : `Сейф закрыт, открыто цифр кода: ${solved} из ${total}`

  return (
    <svg viewBox="0 0 240 268" role="img" aria-label={label} className={className}>
      <defs>
        <linearGradient id={`safe-body-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#66749a" />
          <stop offset="1" stopColor="#36405f" />
        </linearGradient>
        <linearGradient id={`safe-door-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8d9bbd" />
          <stop offset="1" stopColor="#5a6788" />
        </linearGradient>
        <radialGradient id={`safe-glow-${uid}`} cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#c9791a" />
        </radialGradient>
      </defs>

      <g key={wiggle} style={wiggle ? { animation: 'shake 0.4s' } : undefined}>
        {/* корпус */}
        <rect x="8" y="6" width="224" height="256" rx="18" fill={`url(#safe-body-${uid})`} stroke="#1b2445" strokeWidth="3" />

        {/* табло с кодом */}
        <rect x="24" y="18" width="192" height="44" rx="10" fill="#10162e" />
        {code.map((d, i) => {
          const on = i < solved
          return (
            <g key={i}>
              <rect x={32 + i * 46} y="26" width="38" height="28" rx="6" fill={on ? '#1e3a34' : '#1b2445'} stroke={on ? '#16a58c' : '#2c3a66'} strokeWidth="1.5" />
              <text
                key={on ? 'on' : 'off'}
                x={32 + i * 46 + 19}
                y="41"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="20"
                fontWeight="700"
                fill={on ? '#5eead4' : '#4a5a8c'}
                style={on ? { animation: 'pop 0.4s', transformBox: 'fill-box', transformOrigin: 'center' } : undefined}
              >
                {on ? d : '•'}
              </text>
            </g>
          )
        })}

        {/* внутренность сейфа — видна, когда дверца приоткрыта */}
        <rect x="24" y="74" width="192" height="170" rx="10" fill="#10162e" />
        <rect
          x="24"
          y="74"
          width="192"
          height="170"
          rx="10"
          fill={`url(#safe-glow-${uid})`}
          className="transition-opacity duration-1000"
          opacity={open ? 0.95 : 0}
        />
        <text
          x="152"
          y="168"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="46"
          className="transition-opacity delay-500 duration-1000"
          opacity={open ? 1 : 0}
        >
          🧪
        </text>

        {/* дверца: шарнир слева, при открытии «сжимается» к петлям */}
        <g
          className="transition-transform duration-[1400ms] ease-in-out motion-reduce:transition-none"
          style={{
            transform: `scaleX(${open ? 0.3 : 1})`,
            transformBox: 'view-box',
            transformOrigin: '24px 0px',
          }}
        >
          <rect x="24" y="74" width="192" height="170" rx="10" fill={`url(#safe-door-${uid})`} stroke="#1b2445" strokeWidth="3" />
          {[
            [36, 86],
            [204, 86],
            [36, 232],
            [204, 232],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#3a4562" />
          ))}

          {/* диск с цифрами */}
          <circle cx={CX} cy={CY} r="58" fill="#2a3352" stroke="#1b2445" strokeWidth="3" />
          <g
            className="transition-transform duration-[1500ms] ease-[cubic-bezier(0.3,1.25,0.5,1)] motion-reduce:transition-none"
            style={{
              transform: `rotate(${angle}deg)`,
              transformBox: 'view-box',
              transformOrigin: `${CX}px ${CY}px`,
            }}
          >
            <circle cx={CX} cy={CY} r="53" fill="#dfe6f7" />
            {TICKS.map((i) => {
              const a = (i * 36 * Math.PI) / 180
              const x = CX + 40 * Math.sin(a)
              const y = CY - 40 * Math.cos(a)
              return (
                <g key={i}>
                  <line
                    x1={CX + 50 * Math.sin(a)}
                    y1={CY - 50 * Math.cos(a)}
                    x2={CX + 46 * Math.sin(a)}
                    y2={CY - 46 * Math.cos(a)}
                    stroke="#1b2445"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    fontWeight="700"
                    fill="#1b2445"
                    transform={`rotate(${i * 36} ${x} ${y})`}
                  >
                    {i}
                  </text>
                </g>
              )
            })}
            <circle cx={CX} cy={CY} r="20" fill="#7a5ce0" stroke="#1b2445" strokeWidth="2.5" />
            <rect x={CX - 3} y={CY - 18} width="6" height="14" rx="3" fill="#f5a623" />
          </g>
          {/* неподвижная метка */}
          <path d={`M ${CX - 7} ${CY - 66} L ${CX + 7} ${CY - 66} L ${CX} ${CY - 54} Z`} fill="#e5484d" stroke="#1b2445" strokeWidth="1.5" />

          {/* ручка */}
          <rect x="190" y="136" width="14" height="48" rx="7" fill="#f5a623" stroke="#1b2445" strokeWidth="2.5" />
        </g>
      </g>
    </svg>
  )
}
