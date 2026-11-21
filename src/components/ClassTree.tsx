import { useState } from 'react'

interface Node {
  id: string
  title: string
  /** Что это за класс */
  info: string
  /** Как узнать по формуле */
  sign?: string
  examples?: string
  children?: Node[]
}

const ROOT: Node = {
  id: 'root',
  title: 'Неорганические вещества',
  info: 'Все вещества делят на простые и сложные. Дальше сложные делят на классы — это и есть «классификация».',
  children: [
    {
      id: 'simple',
      title: 'Простые',
      info: 'Состоят из атомов одного химического элемента.',
      sign: 'В формуле один элемент: Na, O₂, S.',
      examples: 'Na, Fe, O₂, S, He',
      children: [
        { id: 'metal', title: 'металлы', info: 'Блестят, проводят ток и тепло, ковкие.', sign: 'Обычно один символ металла: Fe, Cu.', examples: 'Na, Fe, Cu, Al' },
        { id: 'nonmetal', title: 'неметаллы', info: 'Не имеют металлического блеска, чаще не проводят ток.', sign: 'Символ неметалла или двухатомная молекула: O₂, Cl₂, S.', examples: 'O₂, S, Cl₂, C' },
        { id: 'noble', title: 'благородные газы', info: 'Одноатомные газы, практически не вступают в реакции.', sign: 'He, Ne, Ar, Kr, Xe.', examples: 'He, Ne, Ar' },
      ],
    },
    {
      id: 'complex',
      title: 'Сложные',
      info: 'Состоят из атомов разных элементов. Делятся на пять групп.',
      sign: 'В формуле два и более элемента.',
      examples: 'CaO, NaOH, HCl, NaCl',
      children: [
        {
          id: 'oxide',
          title: 'Оксиды',
          info: 'Два элемента, один из которых кислород в степени окисления −2.',
          sign: 'Э + O, больше ничего.',
          examples: 'CaO, CO₂, SO₃, H₂O',
          children: [
            { id: 'o-basic', title: 'основные', info: 'Оксиды металлов со с. о. +1, +2. Реагируют с кислотами.', sign: 'Металл (+1, +2) + O, кроме Zn и Be.', examples: 'Na₂O, CaO, MgO, FeO, CuO' },
            { id: 'o-amph', title: 'амфотерные', info: 'Реагируют и с кислотами, и со щёлочами.', sign: 'Только ZnO, BeO, Al₂O₃, Fe₂O₃.', examples: 'ZnO, BeO, Al₂O₃, Fe₂O₃' },
            { id: 'o-acid', title: 'кислотные', info: 'Оксиды неметаллов и металлов с высокой с. о. (+5…+7). Реагируют со щёлочами.', sign: 'Неметалл + O (кроме CO, NO, N₂O, SiO).', examples: 'CO₂, SO₂, SO₃, P₂O₅, SiO₂, N₂O₅' },
            { id: 'o-non', title: 'несолеобразующие', info: 'Не реагируют ни с кислотами, ни со щёлочами.', sign: 'Только четыре: CO, NO, N₂O, SiO.', examples: 'CO, NO, N₂O, SiO' },
          ],
        },
        {
          id: 'base',
          title: 'Основания',
          info: 'Атом металла и одна или несколько групп OH.',
          sign: 'Me(OH)ₙ — металл и OH.',
          examples: 'NaOH, Ca(OH)₂, Cu(OH)₂',
          children: [
            { id: 'b-alkali', title: 'щёлочи', info: 'Растворимые в воде основания. Меняют цвет индикаторов.', sign: 'Металл IA группы, а также Ca, Sr, Ba + OH.', examples: 'LiOH, NaOH, KOH, Ba(OH)₂, Ca(OH)₂' },
            { id: 'b-insol', title: 'нерастворимые', info: 'Гидроксиды остальных металлов со с. о. +1, +2. При нагревании разлагаются на оксид и воду.', sign: 'Любой другой металл (+1, +2) + OH.', examples: 'Cu(OH)₂, Fe(OH)₂, Mg(OH)₂, Ni(OH)₂' },
          ],
        },
        {
          id: 'amph',
          title: 'Амфотерные гидроксиды',
          info: 'Реагируют и с кислотами, и со щёлочами. Нерастворимы в воде. По формуле похожи на основания — запомни список!',
          sign: 'Только Zn(OH)₂, Be(OH)₂, Al(OH)₃, Fe(OH)₃.',
          examples: 'Zn(OH)₂, Be(OH)₂, Al(OH)₃, Fe(OH)₃',
        },
        {
          id: 'acid',
          title: 'Кислоты',
          info: 'Атомы водорода и кислотный остаток.',
          sign: 'H в начале формулы: HₙА.',
          examples: 'HCl, H₂SO₄, HNO₃, H₃PO₄',
          children: [
            { id: 'a-ox', title: 'кислородсодержащие', info: 'В остатке есть кислород. Это «кислотные гидроксиды».', sign: 'H + остаток с O.', examples: 'HNO₃, H₂SO₄, H₃PO₄, H₂CO₃' },
            { id: 'a-free', title: 'бескислородные', info: 'Остаток без кислорода: водород связан прямо с неметаллом.', sign: 'H + остаток без O.', examples: 'HCl, HBr, HF, H₂S' },
            { id: 'a-basic', title: 'по основности', info: 'Основность — число атомов водорода, которые способны замещаться на металл: одно-, двух-, трёхосновные.', sign: 'Основность = число атомов H в формуле.', examples: 'HCl (1) · H₂SO₄ (2) · H₃PO₄ (3)' },
          ],
        },
        {
          id: 'salt',
          title: 'Соли',
          info: 'Металл (или ион аммония NH₄⁺) и кислотный остаток.',
          sign: 'Me + остаток: MeₓАᵧ.',
          examples: 'NaCl, CaCO₃, K₂SO₄',
          children: [
            { id: 's-mid', title: 'средние', info: 'Все атомы H кислоты замещены на металл.', sign: 'Нет ни H, ни OH: металл + остаток.', examples: 'NaCl, K₂SO₄, CaCO₃, NH₄NO₃' },
            { id: 's-acid', title: 'кислые', info: 'Замещены не все атомы H многоосновной кислоты. Приставка «гидро-».', sign: 'H в середине формулы.', examples: 'NaHCO₃, KHSO₄, NaH₂PO₄' },
            { id: 's-base', title: 'основные', info: 'Замещены не все группы OH основания. Приставка «гидроксо-».', sign: 'OH внутри формулы соли.', examples: 'MgOHCl, (CuOH)₂CO₃, AlOHCl₂' },
          ],
        },
      ],
    },
  ],
}

/** Дерево классификации: кликайте по узлам и спускайтесь от общего к частному */
export default function ClassTree() {
  const [path, setPath] = useState<string[]>([])

  // путь → список узлов: [root, выбранный на 1 уровне, …]
  const chain: Node[] = [ROOT]
  for (const id of path) {
    const next = chain[chain.length - 1].children?.find((c) => c.id === id)
    if (!next) break
    chain.push(next)
  }
  const current = chain[chain.length - 1]

  const choose = (depth: number, id: string) => {
    // depth — уровень, на котором выбираем (0 = дети корня)
    setPath((p) => (p[depth] === id ? p.slice(0, depth) : [...p.slice(0, depth), id]))
  }

  return (
    <div className="rounded-2xl bg-navy p-4 text-white sm:p-6">
      <p className="text-sm text-white/75">Нажимайте на карточки и спускайтесь вглубь схемы. Повторный клик возвращает на уровень выше.</p>

      <div className="mt-3 space-y-2">
        <div className="rounded-lg bg-white/10 px-3 py-2 text-center text-sm font-bold">{ROOT.title}</div>
        {chain.map((node, depth) => {
          const kids = node.children
          if (!kids) return null
          return (
            <div key={node.id} className="border-l-2 border-orange/60 pl-3" style={{ animation: 'pop .3s ease-out both' }}>
              <div className="flex flex-wrap gap-2">
                {kids.map((k) => {
                  const on = path[depth] === k.id
                  return (
                    <button
                      key={k.id}
                      onClick={() => choose(depth, k.id)}
                      aria-pressed={on}
                      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-orange text-navy' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {k.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-white/10 p-3 text-[15px] leading-relaxed" aria-live="polite">
        <p className="font-bold text-orange">{current.title}</p>
        <p className="text-white/90">{current.info}</p>
        {current.sign && (
          <p className="text-sm text-white/85">
            <b className="text-teal">Как узнать:</b> {current.sign}
          </p>
        )}
        {current.examples && (
          <p className="text-sm text-white/85">
            <b className="text-teal">Примеры:</b> {current.examples}
          </p>
        )}
      </div>
    </div>
  )
}
