import { useState } from 'react'

const TUBES = [
  { title: 'Сухой воздух', sub: 'вода отсутствует', rusts: false, water: false, oil: false },
  { title: 'Кипячёная вода + масло', sub: 'нет кислорода', rusts: false, water: true, oil: true },
  { title: 'Вода + воздух', sub: 'есть вода и кислород', rusts: true, water: true, oil: false },
]

/** Опыт «когда ржавеет гвоздь»: ползунок времени, ржавеет только гвоздь в воде с воздухом */
export default function RustNails() {
  const [day, setDay] = useState(0)
  const k = Math.min(day / 14, 1)

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="font-bold">Опыт: когда ржавеет железный гвоздь?</div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {TUBES.map((t, i) => (
          <div key={i} className="text-center">
            <svg viewBox="0 0 100 170" className="mx-auto w-full max-w-[110px]" role="img" aria-label={`Пробирка ${i + 1}: ${t.title}`}>
              <path d="M22 10 H78 V130 a28 28 0 0 1 -56 0 Z" fill="#f4f8ff" stroke="#6b7387" strokeWidth={3} />
              {t.water && <path d="M24 55 H76 V130 a26 26 0 0 1 -52 0 Z" fill="#bcd9ff" opacity={0.8} />}
              {t.oil && <rect x={24} y={50} width={52} height={14} fill="#f5d98b" />}
              {!t.water && (
                <g stroke="#6b7387" strokeWidth={1.5} fill="#e7e0ff">
                  <rect x={30} y={22} width={40} height={14} rx={3} />
                  <text x={50} y={33} textAnchor="middle" fontSize={8} stroke="none" fill="#7a5ce0">CaCl₂</text>
                </g>
              )}
              <rect x={44} y={70} width={12} height={78} rx={3} fill="#8a91a3" />
              <rect x={44} y={70} width={12} height={78} rx={3} fill="#b4501f" opacity={t.rusts ? k : 0} />
              {t.rusts && <path d="M24 100 H76 V130 a26 26 0 0 1 -52 0 Z" fill="#d9822b" opacity={k * 0.35} />}
            </svg>
            <div className="mt-1 text-xs font-semibold leading-tight">{t.title}</div>
            <div className="text-[11px] text-muted">{t.sub}</div>
            <div className={`mt-1 text-xs font-bold ${t.rusts ? (k > 0.5 ? 'text-orange' : 'text-muted') : 'text-teal'}`}>
              {t.rusts ? (k > 0.5 ? 'ржавеет' : '…') : 'не ржавеет'}
            </div>
          </div>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block text-muted">Прошло дней: <b className="text-ink">{day}</b></span>
        <input type="range" min={0} max={14} value={day} onChange={(e) => setDay(Number(e.target.value))} className="w-full accent-orange" aria-label="Время опыта, дней" />
      </label>
      <p className="mt-2 text-sm">
        Для ржавления нужны <b>одновременно вода и кислород</b>. Соли (например, NaCl) ускоряют коррозию.
      </p>
    </div>
  )
}
