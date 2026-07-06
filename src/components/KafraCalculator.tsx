import { useMemo, useState } from 'react'
import {
  ADVANCED_BOXES_PER_TIER,
  BP_MAX_LEVELS,
  COLLECTION_BOXES_PER_TIER,
  DAILY_XP,
  MAX_MIDDLE_SECTION_CYCLES_PER_MONTH,
  MONDAY_BONUS_XP,
  WEEKLY_XP_CAP,
  XP_PER_BP_LEVEL,
  XP_PER_TIER,
  ZENY_PER_BP_LEVEL,
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
  const [purchasedLevels, setPurchasedLevels] = useState(0)
  const [bpZenyReward, setBpZenyReward] = useState(0)
  const [advancedRewards, setAdvancedRewards] = useState<BoxReward[]>(() =>
    cloneDefaultRewards(),
  )
  const [collectionRewards, setCollectionRewards] = useState<BoxReward[]>(() =>
    cloneDefaultRewards(),
  )
  const [advancedBoxesPer100Xp, setAdvancedBoxesPer100Xp] = useState(
    ADVANCED_BOXES_PER_TIER,
  )
  const [collectionBoxesPer100Xp, setCollectionBoxesPer100Xp] = useState(
    COLLECTION_BOXES_PER_TIER,
  )

  const result = useMemo(
    () =>
      calculateMonthlyRewards(
        year,
        month,
        advancedRewards,
        collectionRewards,
        purchasedLevels,
        bpZenyReward,
        advancedBoxesPer100Xp,
        collectionBoxesPer100Xp,
      ),
    [
      year,
      month,
      advancedRewards,
      collectionRewards,
      purchasedLevels,
      bpZenyReward,
      advancedBoxesPer100Xp,
      collectionBoxesPer100Xp,
    ],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Battle Pass
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {XP_PER_BP_LEVEL} XP = 1 level, max {BP_MAX_LEVELS} levels. Box rewards apply
          only to XP above a fully closed pass.
        </p>

        <div className="mt-4 space-y-4">
          <label className="block">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Purchased levels</span>
              <span className="font-medium text-violet-200">
                {purchasedLevels} / {BP_MAX_LEVELS}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={BP_MAX_LEVELS}
              step={1}
              value={purchasedLevels}
              onChange={(event) => setPurchasedLevels(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-violet-500"
            />
          </label>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            BP zeny rewards
            <input
              type="number"
              min={0}
              step={1000}
              value={bpZenyReward}
              onChange={(event) =>
                setBpZenyReward(Math.max(0, Number(event.target.value) || 0))
              }
              className="w-40 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            />
          </label>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Purchase cost
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatZeny(result.purchaseCost)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatZeny(ZENY_PER_BP_LEVEL)} per level
            </p>
          </div>
          </div>
        </div>
      </section>

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
          XP above level {BP_MAX_LEVELS} grants boxes per column settings below (max{' '}
          {MAX_MIDDLE_SECTION_CYCLES_PER_MONTH} cycles per month).
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_320px]">
        <DropTableEditor
          title="Advanced Box"
          rewards={advancedRewards}
          boxesPer100Xp={advancedBoxesPer100Xp}
          onRewardsChange={setAdvancedRewards}
          onBoxesPer100XpChange={setAdvancedBoxesPer100Xp}
        />
        <DropTableEditor
          title="Collection Box"
          rewards={collectionRewards}
          boxesPer100Xp={collectionBoxesPer100Xp}
          onRewardsChange={setCollectionRewards}
          onBoxesPer100XpChange={setCollectionBoxesPer100Xp}
        />

        <aside className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 xl:sticky xl:top-6 xl:self-start">
          <h2 className="text-lg font-semibold text-white">Results</h2>
          <p className="mt-1 text-sm text-violet-200/80">Expected box earnings this month</p>

          <div className="mt-5 rounded-xl bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Box zeny</p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {formatZeny(result.totalExpectedZeny)}
            </p>
          </div>

          <div className="mt-4 space-y-0">
            <StatRow
              label="Monthly XP"
              value={`${result.totalXp.toLocaleString('en-US')} XP`}
            />
            <StatRow
              label="XP for BP levels"
              value={`${result.xpForBp.toLocaleString('en-US')} XP`}
            />
            <StatRow
              label="Surplus XP (boxes)"
              value={`${result.surplusXp.toLocaleString('en-US')} XP`}
            />
            <StatRow
              label="Surplus tiers (×100 XP)"
              value={result.surplusTiers.toLocaleString('en-US')}
            />
            <StatRow
              label="Reward cycles"
              value={
                result.surplusTiers > result.rewardCycles
                  ? `${result.rewardCycles.toLocaleString('en-US')} / ${result.surplusTiers.toLocaleString('en-US')}`
                  : result.rewardCycles.toLocaleString('en-US')
              }
            />
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

      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
              Final result
            </p>
            <p className="mt-1 text-sm text-emerald-200/80">
              Box zeny plus BP rewards minus level purchase cost
            </p>
          </div>
          <p
            className={`text-3xl font-semibold ${
              result.netZeny >= 0 ? 'text-emerald-100' : 'text-red-300'
            }`}
          >
            {formatZeny(result.netZeny)}
          </p>
        </div>
      </section>
    </div>
  )
}
