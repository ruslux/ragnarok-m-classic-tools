import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-black/20">
      <h2 className="text-3xl font-semibold text-white">Welcome</h2>
      <p className="mt-4 max-w-xl text-slate-300">
        This is a single-page application scaffold ready for GitHub Pages. Edit
        pages in <code className="rounded bg-slate-800 px-1.5 py-0.5 text-violet-200">src/pages</code>{' '}
        and deploy with the included GitHub Actions workflow.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/about"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          Go to About
        </Link>
        <a
          href="https://github.com/vitejs/vite"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Vite docs
        </a>
      </div>
    </section>
  )
}
