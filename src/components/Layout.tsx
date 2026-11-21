import { Link, NavLink, Outlet } from 'react-router-dom'
import { publicUrl } from '../lib/publicUrl'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src={publicUrl('/favicon.svg')} alt="" className="h-8 w-8" />
            ОГЭ · Химия
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-orange' : 'text-white/80 hover:text-white')}>
              Темы
            </NavLink>
            <NavLink to="/quest" className={({ isActive }) => (isActive ? 'text-orange' : 'text-white/80 hover:text-white')}>
              🕵️ Расследование
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-navy py-4 text-center text-xs text-white/60">Подготовка к ОГЭ по химии</footer>
      <ScrollToTop />
    </div>
  )
}
