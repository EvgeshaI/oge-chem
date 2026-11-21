import { shells } from '../lib/elements'

const RADII = [48, 82, 116, 148]
export const SHELL_COLORS = ['#f5a623', '#16a58c', '#7a5ce0', '#e6559b']

interface Props {
  /** заряд ядра */
  z: number
  /** число электронов (по умолчанию = z) */
  electrons?: number
  label?: string
  className?: string
}

/** Модель атома/иона: ядро и электроны на вращающихся слоях. Рассчитана на viewBox 320×320. */
export function ShellsSvg({ z, electrons, label, className }: Props) {
  const e = electrons ?? z
  const sh = shells(e)
  return (
    <svg viewBox="0 0 320 320" className={className} role="img" aria-label={label ?? `Модель частицы: ${z} протонов, ${e} электронов`}>
      {sh.map((n, i) => (
        <g key={`${e}-${i}`}>
          <circle cx={160} cy={160} r={RADII[i]} fill="none" stroke={SHELL_COLORS[i]} strokeOpacity={0.35} strokeWidth={1.5} />
          <g className="orbit" style={{ animationDuration: `${30 + i * 20}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
            {Array.from({ length: n }, (_, k) => {
              const a = (2 * Math.PI * k) / n
              return (
                <circle
                  key={k}
                  cx={160 + RADII[i] * Math.cos(a)}
                  cy={160 + RADII[i] * Math.sin(a)}
                  r={7}
                  fill={SHELL_COLORS[i]}
                  stroke="#fff"
                  strokeWidth={1.5}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'pop .35s ease-out both', animationDelay: `${k * 40}ms` }}
                />
              )
            })}
          </g>
        </g>
      ))}
      <circle cx={160} cy={160} r={24} fill="#e5484d" stroke="#fff" strokeWidth={2} />
      <text x={160} y={166} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
        +{z}
      </text>
    </svg>
  )
}
