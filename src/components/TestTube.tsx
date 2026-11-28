interface Props {
  /** цвет раствора (любой CSS-цвет) */
  liquid: string
  /** 0…1 — на сколько заполнена пробирка */
  level?: number
  /** цвет осадка и его доля высоты (0…1) */
  precip?: string
  precipH?: number
  /** выделяется газ: пузырьки поднимаются со дна */
  bubbles?: boolean
  /** подпись под пробиркой */
  label?: string
  className?: string
}

/** Пузырьки газа: [x, y, радиус, задержка в секундах] */
const BUBBLES = [
  [27, 146, 3.5, 0],
  [42, 136, 2.5, 0.35],
  [34, 150, 3, 0.7],
  [46, 144, 3.5, 1.05],
  [24, 132, 2.5, 0.5],
  [37, 128, 2, 0.9],
]

/** Пробирка с раствором и (при желании) осадком. Цвета меняются плавно. */
export function TestTube({ liquid, level = 0.62, precip, precipH = 0, bubbles, label, className }: Props) {
  const top = 22
  const bottom = 138
  const h = bottom - top
  const liqTop = bottom - h * level
  return (
    <svg viewBox="0 0 70 190" className={className} role="img" aria-label={label ?? 'Пробирка'}>
      <defs>
        <clipPath id="tt-clip">
          <path d="M 14 22 V 138 A 21 21 0 0 0 56 138 V 22 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#tt-clip)">
        <rect x={10} y={liqTop} width={50} height={bottom + 30 - liqTop} fill={liquid} style={{ transition: 'fill 1.4s ease, y .6s' }} />
        {precip && (
          <rect
            x={10}
            y={bottom + 20 - (h * precipH)}
            width={50}
            height={h * precipH + 20}
            fill={precip}
            style={{ transition: 'y 1.6s ease-out, height 1.6s ease-out, fill .6s' }}
          />
        )}
        <rect x={16} y={liqTop} width={4} height={bottom - liqTop} fill="#fff" opacity={0.25} />
        {bubbles &&
          BUBBLES.map(([x, y, r, delay]) => (
            <circle
              key={delay}
              cx={x}
              cy={y}
              r={r}
              fill="none"
              stroke="#fff"
              strokeWidth={1.4}
              style={{ animation: `rise 1.4s ease-out ${delay}s infinite backwards` }}
            />
          ))}
      </g>
      <path d="M 14 22 V 138 A 21 21 0 0 0 56 138 V 22" fill="none" stroke="#fff" strokeWidth={2.4} strokeOpacity={0.9} />
      <path d="M 11 22 H 59" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeOpacity={0.9} />
      {label && (
        <text x={35} y={184} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
          {label}
        </text>
      )}
    </svg>
  )
}
