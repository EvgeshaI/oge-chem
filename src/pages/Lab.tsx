import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MAX_K1, MAX_K2 } from '../lib/lab'
import { EXPERIMENTS, SOLUTIONS, type ChemId } from '../lib/labData'

const formulas = (ids: ChemId[]) => ids.map((id) => SOLUTIONS[id].formula).join(', ')

/** Список экспериментов лаборатории */
export default function LabPage() {
  return (
    <div>
      <Link to="/" className="text-sm font-semibold text-muted hover:text-navy">
        ← Все темы
      </Link>
      <section className="mt-3 rounded-3xl bg-gradient-to-r from-teal to-blue p-6 text-white sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Практическая часть ОГЭ</div>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">🥼 Лаборатория</h1>
        <p className="mt-2 max-w-xl text-white/90">
          Виртуальные эксперименты по заданию 23: выберите реактивы, проведите опыты и заполните таблицу. Максимум на экзамене —{' '}
          {MAX_K1 + MAX_K2} баллов.
        </p>
      </section>

      <h2 className="mb-4 mt-8 text-2xl font-bold">Эксперименты</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERIMENTS.map((e, i) => (
          <motion.div key={e.id} className="h-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={`/lab/${e.id}`} className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-xl font-extrabold text-teal" aria-hidden>
                  {e.id}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.demo ? 'bg-purple/10 text-purple' : 'bg-paper text-muted'}`}>
                  {e.demo ? 'из демоверсии' : 'тренировочный'}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold">Эксперимент {e.id}</h3>
              {/* вещества из склянок на карточке не называем: их предстоит определить */}
              <p className="mt-2 text-sm">
                <span className="text-muted">Реактивы: </span>
                <span className="font-semibold">{formulas(e.reagents)}</span>
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        Эксперимент 1 взят из демоверсии ОГЭ 2027. Остальные составлены для тренировки по тому же образцу.
      </p>
    </div>
  )
}
