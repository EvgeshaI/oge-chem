import type { Accent } from '../content/types'

// Классы Tailwind должны быть записаны целиком, поэтому карта явная.
export const ACCENT: Record<Accent, { bg: string; soft: string; text: string; ring: string }> = {
  teal: { bg: 'bg-teal', soft: 'bg-teal/10', text: 'text-teal', ring: 'ring-teal' },
  purple: { bg: 'bg-purple', soft: 'bg-purple/10', text: 'text-purple', ring: 'ring-purple' },
  orange: { bg: 'bg-orange', soft: 'bg-orange/15', text: 'text-[#b8740a]', ring: 'ring-orange' },
  pink: { bg: 'bg-pink', soft: 'bg-pink/10', text: 'text-pink', ring: 'ring-pink' },
  blue: { bg: 'bg-blue', soft: 'bg-blue/10', text: 'text-blue', ring: 'ring-blue' },
}
