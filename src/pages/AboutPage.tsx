export function AboutPage() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <h2 className="text-3xl font-semibold text-white">About</h2>
      <p className="mt-4 text-slate-300">
        Client-side routing works on GitHub Pages thanks to a generated{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-violet-200">404.html</code>{' '}
        fallback copied from the build output.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-slate-400">
        <li>UI styling: Tailwind CSS v4</li>
        <li>Recommended component layer: shadcn/ui (Radix + Tailwind)</li>
        <li>Deploy: GitHub Actions → GitHub Pages</li>
      </ul>
    </section>
  )
}
