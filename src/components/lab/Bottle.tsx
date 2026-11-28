interface Props {
  /** надпись на этикетке */
  label: string
  /** цвет раствора */
  liquid: string
  className?: string
}

const BODY = 'M 28 24 V 36 C 28 42 12 44 12 56 V 108 Q 12 118 22 118 H 58 Q 68 118 68 108 V 56 C 68 44 52 42 52 36 V 24'

/** Склянка с раствором: пробка, горлышко и этикетка */
export function Bottle({ label, liquid, className }: Props) {
  return (
    <svg viewBox="0 0 80 124" className={className} aria-hidden>
      <path d="M 14 54 C 18 50 22 48 24 48 H 56 C 58 48 62 50 66 54 V 108 Q 66 116 58 116 H 22 Q 14 116 14 108 Z" fill={liquid} />
      <path d={BODY} fill="rgba(255,255,255,.04)" stroke="#fff" strokeOpacity={0.9} strokeWidth={2.4} strokeLinejoin="round" />
      <rect x={25} y={6} width={30} height={15} rx={3} fill="#8d97b8" />
      <path d="M 23 23 H 57" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
      <rect x={13} y={65} width={54} height={32} rx={4} fill="#fff" />
      <text
        x={40}
        y={86}
        textAnchor="middle"
        fontSize={label.length > 4 ? 15 : 17}
        // длинные формулы вроде Na₂CO₃ и Ca(NO₃)₂ сжимаем до ширины этикетки
        {...(label.length > 5 ? { textLength: 50, lengthAdjust: 'spacingAndGlyphs' as const } : {})}
        fontWeight={800}
        fill="#1b2445"
      >
        {label}
      </text>
    </svg>
  )
}
