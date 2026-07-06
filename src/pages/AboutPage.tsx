export function AboutPage() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <h2 className="text-3xl font-semibold text-white">About</h2>
      <p className="mt-4 text-slate-300">
        Calculators for Ragnarok M Classic. Currently includes expected zeny from
        the Kafra Adventure Log battle pass.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-slate-400">
        <li>Expected value is computed from drop chance tables (EV)</li>
        <li>100 XP = 1 BP level; box rewards apply only to XP above level 50</li>
        <li>Weekly XP cap resets on Mondays and on the 1st of each month</li>
        <li>Advanced and Collection drop tables are edited independently</li>
      </ul>
    </section>
  )
}
