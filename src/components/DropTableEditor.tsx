import type { BoxReward } from '../lib/kafra-calculator'
import { expectedZenyPerBox, formatZeny } from '../lib/kafra-calculator'

type DropTableEditorProps = {
  title: string
  rewards: BoxReward[]
  onChange: (rewards: BoxReward[]) => void
}

function updateReward(
  rewards: BoxReward[],
  id: string,
  patch: Partial<Pick<BoxReward, 'chancePercent' | 'zeny'>>,
): BoxReward[] {
  return rewards.map((reward) =>
    reward.id === id ? { ...reward, ...patch } : reward,
  )
}

export function DropTableEditor({ title, rewards, onChange }: DropTableEditorProps) {
  const zenyPerBox = expectedZenyPerBox(rewards)
  const totalChance = rewards.reduce((sum, reward) => sum + reward.chancePercent, 0)

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            EV per box:{' '}
            <span className="font-medium text-violet-200">{formatZeny(zenyPerBox)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...rewards,
              { id: crypto.randomUUID(), chancePercent: 0, zeny: 0 },
            ])
          }
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-violet-500 hover:text-white"
        >
          + row
        </button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 text-xs uppercase tracking-wide text-slate-500">
          <span>Chance, %</span>
          <span>Zeny</span>
          <span className="w-8" />
        </div>

        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="grid grid-cols-[1fr_1fr_auto] gap-2"
          >
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={reward.chancePercent}
              onChange={(event) =>
                onChange(
                  updateReward(rewards, reward.id, {
                    chancePercent: Number(event.target.value),
                  }),
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            />
            <input
              type="number"
              min={0}
              step={1000}
              value={reward.zeny}
              onChange={(event) =>
                onChange(
                  updateReward(rewards, reward.id, {
                    zeny: Number(event.target.value),
                  }),
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            />
            <button
              type="button"
              disabled={rewards.length <= 1}
              onClick={() =>
                onChange(rewards.filter((item) => item.id !== reward.id))
              }
              className="rounded-lg px-2 text-slate-500 transition hover:bg-slate-800 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Remove row"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {totalChance !== 100 && (
        <p className="mt-3 text-xs text-amber-400/90">
          Total chance: {totalChance}% (remaining outcomes count as 0 zeny)
        </p>
      )}
    </section>
  )
}
