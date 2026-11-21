import { useState } from 'react'

type Role = 'metal' | 'nonmetal' | 'h' | 'oh' | 'o' | 'res' | 'nh4'

const ROLES: Record<Role, { label: string; cls: string }> = {
  metal: { label: 'металл', cls: 'bg-blue text-white' },
  nonmetal: { label: 'неметалл', cls: 'bg-white/80 text-navy' },
  h: { label: 'водород', cls: 'bg-pink text-white' },
  oh: { label: 'группа OH', cls: 'bg-orange text-navy' },
  o: { label: 'кислород', cls: 'bg-red text-white' },
  res: { label: 'кислотный остаток', cls: 'bg-teal text-white' },
  nh4: { label: 'вместо металла', cls: 'bg-purple text-white' },
}

interface Sample {
  f: string
  parts: [string, Role][]
  cls: string
  why: string
}

const SAMPLES: Sample[] = [
  { f: 'CaO', parts: [['Ca', 'metal'], ['O', 'o']], cls: 'оксид', why: 'Два элемента, один из них O (−2): это оксид кальция.' },
  { f: 'SO₃', parts: [['S', 'nonmetal'], ['O₃', 'o']], cls: 'оксид', why: 'Два элемента, один из них O (−2): это оксид серы(VI).' },
  { f: 'CO', parts: [['C', 'nonmetal'], ['O', 'o']], cls: 'несолеобразующий оксид', why: 'Это оксид неметалла, но один из четырёх «особых»: CO, NO, N₂O, SiO — не реагируют ни с кислотами, ни со щёлочами.' },
  { f: 'H₂O', parts: [['H₂', 'h'], ['O', 'o']], cls: 'оксид', why: 'Два элемента, один из них O (−2): вода — это оксид водорода. Ловушка: H в начале, но формула не кислота.' },
  { f: 'NaOH', parts: [['Na', 'metal'], ['OH', 'oh']], cls: 'основание (щёлочь)', why: 'Металл и группа OH: Me(OH)ₙ. Металл IA группы — гидроксид растворим, это щёлочь.' },
  { f: 'Fe(OH)₂', parts: [['Fe', 'metal'], ['(OH)₂', 'oh']], cls: 'основание (нерастворимое)', why: 'Металл и две группы OH. У железа здесь с. о. +2 — это обычное нерастворимое основание.' },
  { f: 'Al(OH)₃', parts: [['Al', 'metal'], ['(OH)₃', 'oh']], cls: 'амфотерный гидроксид', why: 'По формуле — основание, но Al(OH)₃ входит в список амфотерных: Zn(OH)₂, Be(OH)₂, Al(OH)₃, Fe(OH)₃.' },
  { f: 'H₂SO₄', parts: [['H₂', 'h'], ['SO₄', 'res']], cls: 'кислота (кислородсодержащая, двухосновная)', why: 'Водород в начале + кислотный остаток SO₄. Два атома H — двухосновная кислота.' },
  { f: 'HCl', parts: [['H', 'h'], ['Cl', 'res']], cls: 'кислота (бескислородная, одноосновная)', why: 'Водород в начале + остаток без кислорода. Один атом H — одноосновная кислота.' },
  { f: 'NaCl', parts: [['Na', 'metal'], ['Cl', 'res']], cls: 'средняя соль', why: 'Металл + кислотный остаток, нет ни H, ни OH.' },
  { f: 'NH₄Cl', parts: [['NH₄', 'nh4'], ['Cl', 'res']], cls: 'средняя соль', why: 'Ион аммония NH₄⁺ ведёт себя как металл: он + остаток, нет «лишних» H и OH.' },
  { f: 'NaHCO₃', parts: [['Na', 'metal'], ['H', 'h'], ['CO₃', 'res']], cls: 'кислая соль', why: 'Металл, затем H в середине формулы, затем остаток. Это пищевая сода.' },
  { f: 'MgOHCl', parts: [['Mg', 'metal'], ['OH', 'oh'], ['Cl', 'res']], cls: 'основная соль', why: 'Металл, затем OH внутри формулы, затем остаток.' },
  { f: 'Na₂O₂', parts: [['Na₂', 'metal'], ['O₂', 'o']], cls: 'не оксид, а пероксид', why: 'Формула похожа на оксид, но у кислорода здесь с. о. −1, а не −2. Пероксиды не входят в эти классы.' },
  { f: 'NH₃', parts: [['N', 'nonmetal'], ['H₃', 'h']], cls: 'не относится к четырём классам', why: 'Водородное соединение неметалла: нет ни остатка, ни OH, ни кислорода. Это аммиак.' },
]

/** «Читаем формулу»: какие части видно и к какому классу это приводит */
export default function FormulaReader() {
  const [i, setI] = useState(0)
  const s = SAMPLES[i]
  const used = [...new Set(s.parts.map((p) => p[1]))]

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Выберите формулу — части формулы окрасятся, а ниже вы увидите вывод.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLES.map((x, k) => (
          <button
            key={x.f}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${k === i ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {x.f}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white/5 p-4">
        <div key={s.f} className="flex flex-wrap items-end justify-center gap-1.5">
          {s.parts.map(([t, r], k) => (
            <div key={k} className="flex flex-col items-center gap-1" style={{ animation: `pop .35s ease-out ${k * 110}ms both` }}>
              <span className={`rounded-lg px-3 py-1.5 text-2xl font-extrabold ${ROLES[r].cls}`}>{t}</span>
              <span className="text-[11px] text-white/75">{ROLES[r].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <p>
          <b className="text-white">{s.f}</b> — <b className="text-orange">{s.cls}</b>
        </p>
        <p className="text-white/90">{s.why}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
        {used.map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <i className={`inline-block h-3 w-3 rounded ${ROLES[r].cls}`} /> {ROLES[r].label}
          </span>
        ))}
      </div>
    </div>
  )
}
