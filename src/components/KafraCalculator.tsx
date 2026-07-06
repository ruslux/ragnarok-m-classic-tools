import { useMemo, useState } from 'react'
import {
  ADVANCED_BOXES_PER_TIER,
  COLLECTION_BOXES_PER_TIER,
  DAILY_XP,
  MONDAY_BONUS_XP,
  WEEKLY_XP_CAP,
  XP_PER_TIER,
  calculateMonthlyRewards,
  cloneDefaultRewards,
  formatMonthLabel,
  formatZeny,
  type BoxReward,
} from '../lib/kafra-calculator'
import { DropTableEditor } from './DropTableEditor'

const now = new Date()

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 py-2 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-100">{value}</span>
    </div>
  )
}

export function KafraCalculator() {
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [advancedRewards, setAdvancedRewards] = useState<BoxReward[]>(() =>
    cloneDefaultRewards(),
  )
  const [collectionRewards, setCollectionRewards] = useState<BoxReward[]>(() =>
    cloneDefaultRewards(),
  )

  const result = useMemo(
    () => calculateMonthlyRewards(year, month, advancedRewards, collectionRewards),
    [year, month, advancedRewards, collectionRewards],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
              Kafra Adventure Log
            </p>
            <h2 className="mt-1 text-2xl font-semibold capitalize text-white">
              {formatMonthLabel(year, month)}
            </h2>
          </div>

          <div className="flex gap-2">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              Month
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index} value={index}>
                    {new Date(2026, index, 1).toLocaleDateString('en-US', {
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              Year
              <input
                type="number"
                min={2020}
                max={2100}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
              />
            </label>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          {DAILY_XP} XP per day, +{MONDAY_BONUS_XP} XP on Mondays, {WEEKLY_XP_CAP} XP
          weekly cap (resets on Mondays and on the 1st of each month). Every {XP_PER_TIER}{' '}
          XP: {ADVANCED_BOXES_PER_TIER} advanced and {COLLECTION_BOXES_PER_TIER}{' '}
          collection boxes.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_320px]">
        <DropTableEditor
          title="Advanced Box"
          rewards={advancedRewards}
          onChange={setAdvancedRewards}
        />
        <DropTableEditor
          title="Collection Box"
          rewards={collectionRewards}
          onChange={setCollectionRewards}
        />

        <aside className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 xl:sticky xl:top-6 xl:self-start">
          <h2 className="text-lg font-semibold text-white">Results</h2>
          <p className="mt-1 text-sm text-violet-200/80">Expected earnings this month</p>

          <div className="mt-5 rounded-xl bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total zeny</p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {formatZeny(result.totalExpectedZeny)}
            </p>
          </div>

          <div className="mt-4 space-y-0">
            <StatRow
              label="Monthly XP"
              value={`${result.totalXp.toLocaleString('en-US')} XP`}
            />
            <StatRow label="Tiers (×100 XP)" value={result.tiers.toLocaleString('en-US')} />
            <StatRow
              label="Advanced boxes"
              value={result.advancedBoxes.toLocaleString('en-US')}
            />
            <StatRow
              label="Collection boxes"
              value={result.collectionBoxes.toLocaleString('en-US')}
            />
            <StatRow
              label="Advanced zeny"
              value={formatZeny(result.advancedExpectedZeny)}
            />
            <StatRow
              label="Collection zeny"
              value={formatZeny(result.collectionExpectedZeny)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
