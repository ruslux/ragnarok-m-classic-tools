import { Link } from 'react-router-dom'

const sections = [
  {
    to: '/calculators/kafra',
    title: 'Kafra Adventure Log',
    description:
      'Estimate monthly zeny from the battle pass using calendar XP and drop tables.',
  },
  {
    to: '/calculators/ms',
    title: 'MS Calc',
    description: 'MS calculator with profession selection.',
  },
  {
    to: '/about',
    title: 'About',
    description: 'How the calculators work and what assumptions they use.',
  },
] as const

export function HomePage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">Tools</h2>
        <p className="mt-2 text-slate-400">
          Pick a section to open a calculator or read more about the project.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.to}>
            <Link
              to={section.to}
              className="block rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-violet-500/40 hover:bg-slate-900"
            >
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{section.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
