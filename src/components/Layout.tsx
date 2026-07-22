import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-violet-500/20 text-violet-200'
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
  ].join(' ')

export function Layout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Ragnarok M Classic
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Tools</h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/calculators/kafra" className={linkClass}>
            Kafra
          </NavLink>
          <NavLink to="/calculators/ms" className={linkClass}>
            MS Calc
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-500">
        Built with Vite, React, Tailwind CSS, and React Router.
      </footer>
    </div>
  )
}
