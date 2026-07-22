import { useMemo } from 'react'
import {
  DEFAULT_ROYAL_GUARD_MS2_INPUT,
  MAX_SHIELD_REFINING_LEVEL,
  calculateRoyalGuardMs2Damage,
  calculateRoyalGuardMs2ParamStats,
  sanitizeRoyalGuardMs2Input,
  type RoyalGuardMs2Input,
} from '../lib/royal-guard-ms2'
import {
  calculateDpsWeights,
  calculateRoyalGuardMs2Pipeline,
} from '../lib/royal-guard-ms2-pipeline'
import {
  DEFAULT_SHIELD_THROW_SKILL_LEVELS,
  DEFAULT_SHIELD_THROW_STATS,
  SHIELD_THROW_SKILLS,
  bloodOathThumpHpPercent,
  formatShieldThrowSkillDescription,
  sanitizeShieldThrowSkillLevels,
  shieldThrowDamagePercent,
  type ShieldThrowSkillLevels,
  type ShieldThrowStats,
} from '../lib/shield-throw-skills'
import {
  DEFAULT_SHIELD_COOLDOWNS,
  type ShieldCooldownConfig,
} from '../lib/shield-dps'
import {
  sanitizeNumberRecord,
  useLocalStorageState,
} from '../lib/local-storage-state'

const inputClassName =
  'w-20 rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-white outline-none focus:border-violet-500'

const fields: {
  key: keyof RoyalGuardMs2Input
  label: string
  max?: number
}[] = [
  { key: 'vit', label: 'VIT' },
  { key: 'dex', label: 'DEX' },
  { key: 'luk', label: 'LUK' },
  { key: 'atk', label: 'ATK' },
  { key: 'refineAtk', label: 'Refine ATK' },
  {
    key: 'shieldRefiningLevel',
    label: 'Shield refining level',
    max: MAX_SHIELD_REFINING_LEVEL,
  },
]

function parseNonNegative(value: string): number {
  const next = Number(value)
  if (!Number.isFinite(next) || next < 0) return 0
  return next
}

function parsePositive(value: string, fallback: number): number {
  const next = Number(value)
  if (!Number.isFinite(next) || next <= 0) return fallback
  return next
}

function FormulaTerm({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-md bg-slate-950/80 px-2 py-1 font-mono text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-violet-200">{value.toLocaleString('en-US')}</span>
    </span>
  )
}

function formatWeight(weightPercent: number | null): string {
  if (weightPercent === null) return '—'
  return `${weightPercent.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })}%`
}

function formatSigned(value: number): string {
  const abs = Math.abs(value).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })
  if (value > 0) return `+${abs}`
  if (value < 0) return `-${abs}`
  return '0'
}

function WeightTable({
  caption,
  rows,
}: {
  caption: string
  rows: {
    id: string
    label: string
    deltaDpsPerPoint: number | null
    weightPercent: number | null
    contribution: number
    note?: string
  }[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="border-b border-slate-800 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Parameter</th>
            <th className="px-4 py-3 font-medium">Weight %</th>
            <th className="px-4 py-3 font-medium">ΔDPS / +1</th>
            <th className="px-4 py-3 font-medium">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-800/80 last:border-b-0"
            >
              <td className="px-4 py-2.5 text-slate-200">
                {row.label}
                {row.note ? (
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {row.note}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-2.5 font-mono text-violet-200">
                {formatWeight(row.weightPercent)}
              </td>
              <td className="px-4 py-2.5 font-mono text-slate-100">
                {row.deltaDpsPerPoint === null
                  ? '—'
                  : formatSigned(row.deltaDpsPerPoint)}
              </td>
              <td className="px-4 py-2.5 font-mono text-slate-400">
                {row.contribution.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RoyalGuardMs2Panel() {
  const [input, setInput] = useLocalStorageState<RoyalGuardMs2Input>(
    'ms-calc.royal-guard-ms2.boomerang',
    DEFAULT_ROYAL_GUARD_MS2_INPUT,
    sanitizeRoyalGuardMs2Input,
  )
  const [shieldThrow, setShieldThrow] = useLocalStorageState<ShieldThrowStats>(
    'ms-calc.royal-guard-ms2.shield-throw',
    DEFAULT_SHIELD_THROW_STATS,
    sanitizeNumberRecord,
  )
  const [skillLevels, setSkillLevels] =
    useLocalStorageState<ShieldThrowSkillLevels>(
      'ms-calc.royal-guard-ms2.skill-levels',
      DEFAULT_SHIELD_THROW_SKILL_LEVELS,
      sanitizeShieldThrowSkillLevels,
    )
  const [cooldowns, setCooldowns] = useLocalStorageState<ShieldCooldownConfig>(
    'ms-calc.royal-guard-ms2.cooldowns',
    DEFAULT_SHIELD_COOLDOWNS,
    sanitizeNumberRecord,
  )

  const result = useMemo(() => calculateRoyalGuardMs2Damage(input), [input])
  const paramStats = useMemo(
    () => calculateRoyalGuardMs2ParamStats(input),
    [input],
  )
  const pipeline = useMemo(
    () =>
      calculateRoyalGuardMs2Pipeline(
        input,
        shieldThrow,
        skillLevels,
        cooldowns,
      ),
    [input, shieldThrow, skillLevels, cooldowns],
  )
  const {
    throwBonusDmg,
    ignoreDefence,
    withHpDmg,
    baseDamage,
    shieldThrowDamage,
    shieldThrowTotalDamage,
    shieldsPerThrow,
    dps: dpsResult,
  } = pipeline
  const bloodOathX = bloodOathThumpHpPercent(skillLevels['blood-oath-thump'])
  const shieldThrowX = shieldThrowDamagePercent(skillLevels['shield-throw'])
  const shieldThrowOutputs = {
    dmg: throwBonusDmg,
    ignoreDefence,
    dmgBonus: throwBonusDmg - shieldThrow.dmg,
    ignoreDefenceBonus: ignoreDefence - shieldThrow.ignoreDefence,
  }
  const dpsWeights = useMemo(
    () => calculateDpsWeights(input, shieldThrow, skillLevels, cooldowns),
    [input, shieldThrow, skillLevels, cooldowns],
  )

  return (
    <div className="space-y-6">
    <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Shield Boomerang Clean Damage
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <label
            key={field.key}
            className="flex flex-col gap-0.5 text-[10px] text-slate-400"
          >
            {field.label}
            <input
              type="number"
              min={0}
              max={field.max}
              step={1}
              value={input[field.key]}
              onChange={(event) => {
                let next = parseNonNegative(event.target.value)
                if (field.max !== undefined) {
                  next = Math.min(field.max, next)
                }
                setInput((current) => ({
                  ...current,
                  [field.key]: next,
                }))
              }}
              className={inputClassName}
            />
          </label>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Formula
        </p>

        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">DMG</span>
          <span className="text-slate-500"> = </span>
          <span className="text-violet-300">1000%</span>
          <span className="text-slate-500"> × </span>
          <span className="text-slate-400">(</span>
          <span>VIT × 8</span>
          <span className="text-slate-500"> + </span>
          <span>⌈VIT × VIT / 100⌉ × 4</span>
          <span className="text-slate-500"> + </span>
          <span>⌈DEX / 5⌉</span>
          <span className="text-slate-500"> + </span>
          <span>⌈LUK / 5⌉</span>
          <span className="text-slate-500"> + </span>
          <span>shield refine² × 2</span>
          <span className="text-slate-500"> + </span>
          <span className="text-slate-400">(</span>
          <span>ATK + Refine ATK</span>
          <span className="text-slate-400">)</span>
          <span className="text-slate-500"> × </span>
          <span className="text-violet-300">100%</span>
          <span className="text-slate-400">)</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <FormulaTerm label="VIT×8" value={result.vitBase} />
          <FormulaTerm label="⌈VIT²/100⌉×4" value={result.vitSq} />
          <FormulaTerm label="⌈DEX/5⌉" value={result.dexPart} />
          <FormulaTerm label="⌈LUK/5⌉" value={result.lukPart} />
          <FormulaTerm label="refine²×2" value={result.shieldPart} />
          <FormulaTerm label="ATK part" value={result.atkPart} />
          <FormulaTerm label="inner" value={result.total} />
        </div>

        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">DMG</span>
          <span className="text-slate-500"> = </span>
          <span className="text-violet-300">10</span>
          <span className="text-slate-500"> × </span>
          <span className="text-violet-200">
            {result.total.toLocaleString('en-US')}
          </span>
          <span className="text-slate-500"> = </span>
          <span className="text-lg font-semibold text-white">
            {result.dmg.toLocaleString('en-US')}
          </span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Parameter weight and marginal damage
          </caption>
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Parameter</th>
              <th className="px-4 py-3 font-medium">Weight %</th>
              <th className="px-4 py-3 font-medium">ΔDMG / +1</th>
              <th className="px-4 py-3 font-medium">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {paramStats.map((stat) => (
              <tr
                key={stat.key}
                className="border-b border-slate-800/80 last:border-b-0"
              >
                <td className="px-4 py-2.5 text-slate-200">{stat.label}</td>
                <td className="px-4 py-2.5 font-mono text-violet-200">
                  {formatWeight(stat.weightPercent)}
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-100">
                  {formatSigned(stat.deltaDmgPerPoint)}
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-400">
                  {stat.contributionDmg.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Shield Throw
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: 'maxHp', label: 'Max HP', step: 1 },
            { key: 'dmg', label: 'DMG', step: 1 },
            { key: 'ignoreDefence', label: 'Ignore Defence %', step: 0.1 },
            { key: 'physicalReflect', label: 'Physical Reflect %', step: 0.1 },
            { key: 'magicReflect', label: 'Magic Reflect %', step: 0.1 },
            { key: 'def', label: 'Def %', step: 0.1 },
            { key: 'mdef', label: 'M.Def %', step: 0.1 },
          ] as const
        ).map((field) => (
          <label
            key={field.key}
            className="flex flex-col gap-0.5 text-[10px] text-slate-400"
          >
            {field.label}
            <input
              type="number"
              min={0}
              step={field.step}
              value={shieldThrow[field.key]}
              onChange={(event) =>
                setShieldThrow((current) => ({
                  ...current,
                  [field.key]: parseNonNegative(event.target.value),
                }))
              }
              className={inputClassName}
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {SHIELD_THROW_SKILLS.map((skill) => (
          <div
            key={skill.id}
            className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
          >
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              {skill.label}
              <select
                value={skillLevels[skill.id]}
                onChange={(event) => {
                  const level = Number(event.target.value)
                  setSkillLevels((current) => ({
                    ...current,
                    [skill.id]: level,
                  }))
                }}
                className="w-24 rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-white outline-none focus:border-violet-500"
              >
                {Array.from(
                  { length: skill.maxLevel - skill.minLevel + 1 },
                  (_, index) => skill.minLevel + index,
                ).map((level) => (
                  <option key={level} value={level}>
                    Lv.{level}
                  </option>
                ))}
              </select>
            </label>

            <p className="text-sm leading-relaxed text-slate-300">
              {formatShieldThrowSkillDescription(
                skill.id,
                skillLevels[skill.id],
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Throw bonus DMG (Shield Boomerang)
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">
            {shieldThrowOutputs.dmg.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {shieldThrow.dmg.toLocaleString('en-US')}
            {' + '}
            {formatSigned(shieldThrowOutputs.dmgBonus)} from reflect
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Ignore Def %
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">
            {shieldThrowOutputs.ignoreDefence.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
            %
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {shieldThrow.ignoreDefence.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
            {' + '}
            {formatSigned(shieldThrowOutputs.ignoreDefenceBonus)} from Def/M.Def
          </p>
        </div>
      </div>
    </section>

    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Base Damage
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">With HP DMG</span>
          <span className="text-slate-500"> = </span>
          <span>Clean DMG</span>
          <span className="text-slate-500"> + </span>
          <span>Max HP</span>
          <span className="text-slate-500"> × </span>
          <span>Blood Oath Thump X</span>
          <span className="text-slate-500"> / 100</span>
        </p>
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">With HP DMG</span>
          <span className="text-slate-500"> = </span>
          <span className="text-violet-200">
            {result.dmg.toLocaleString('en-US')}
          </span>
          <span className="text-slate-500"> + </span>
          <span className="text-violet-200">
            {shieldThrow.maxHp.toLocaleString('en-US')}
          </span>
          <span className="text-slate-500"> × </span>
          <span className="text-violet-200">
            {bloodOathX.toLocaleString('en-US')}
          </span>
          <span className="text-slate-500"> / 100 = </span>
          <span className="text-lg font-semibold text-white">
            {withHpDmg.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-800 pt-4">
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">Base DMG</span>
          <span className="text-slate-500"> = </span>
          <span>With HP DMG</span>
          <span className="text-slate-500"> + </span>
          <span>With HP DMG</span>
          <span className="text-slate-500"> × </span>
          <span>Throw bonus DMG</span>
          <span className="text-slate-500"> / 100</span>
        </p>
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">Base DMG</span>
          <span className="text-slate-500"> = </span>
          <span className="text-violet-200">
            {withHpDmg.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-slate-500"> + </span>
          <span className="text-violet-200">
            {withHpDmg.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-slate-500"> × </span>
          <span className="text-violet-200">
            {shieldThrowOutputs.dmg.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-slate-500"> / 100 = </span>
          <span className="text-lg font-semibold text-white">
            {baseDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>
    </section>

    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Shield Throw Damage
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">Shield Throw DMG</span>
          <span className="text-slate-500"> = </span>
          <span>Base DMG</span>
          <span className="text-slate-500"> × </span>
          <span>Shield Throw X</span>
          <span className="text-slate-500"> / 100</span>
        </p>
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">Shield Throw DMG</span>
          <span className="text-slate-500"> = </span>
          <span className="text-violet-200">
            {baseDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-slate-500"> × </span>
          <span className="text-violet-200">
            {shieldThrowX.toLocaleString('en-US')}
          </span>
          <span className="text-slate-500"> / 100 = </span>
          <span className="text-lg font-semibold text-white">
            {shieldThrowDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-800 pt-4">
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">Shield Throw Total DMG</span>
          <span className="text-slate-500"> = </span>
          <span>Shield Throw DMG</span>
          <span className="text-slate-500"> × </span>
          <span>(4 + Shield Rebound Combo X)</span>
        </p>
        <p className="font-mono text-sm leading-7 text-slate-200">
          <span className="text-white">Shield Throw Total DMG</span>
          <span className="text-slate-500"> = </span>
          <span className="text-violet-200">
            {shieldThrowDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-slate-500"> × </span>
          <span className="text-violet-200">
            {shieldsPerThrow.toLocaleString('en-US')}
          </span>
          <span className="text-slate-500"> = </span>
          <span className="text-lg font-semibold text-white">
            {shieldThrowTotalDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>
    </section>

    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Cooldown
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            {
              key: 'boomerangCooldownSec',
              label: 'Boomerang CD (s)',
              fallback: DEFAULT_SHIELD_COOLDOWNS.boomerangCooldownSec,
            },
            {
              key: 'throwCooldownSec',
              label: 'Throw CD (s)',
              fallback: DEFAULT_SHIELD_COOLDOWNS.throwCooldownSec,
            },
            {
              key: 'gcdSec',
              label: 'Global cast lock (s)',
              fallback: DEFAULT_SHIELD_COOLDOWNS.gcdSec,
            },
            {
              key: 'durationSec',
              label: 'Window (s)',
              fallback: DEFAULT_SHIELD_COOLDOWNS.durationSec,
            },
          ] as const
        ).map((field) => (
          <label
            key={field.key}
            className="flex flex-col gap-0.5 text-[10px] text-slate-400"
          >
            {field.label}
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={cooldowns[field.key]}
              onChange={(event) =>
                setCooldowns((current) => ({
                  ...current,
                  [field.key]: parsePositive(
                    event.target.value,
                    field.fallback,
                  ),
                }))
              }
              className={inputClassName}
            />
          </label>
        ))}
      </div>
    </section>

    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          DPS
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {cooldowns.durationSec}s window · Boomerang CD{' '}
          {cooldowns.boomerangCooldownSec}s · Throw CD {cooldowns.throwCooldownSec}
          s · global cast lock {cooldowns.gcdSec}s · Throw prioritized when both
          ready
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Boomerang casts
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">
            {dpsResult.boomerangCasts.toLocaleString('en-US')}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {dpsResult.boomerangDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}{' '}
            DMG
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Throw casts
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">
            {dpsResult.throwCasts.toLocaleString('en-US')}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {dpsResult.throwDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}{' '}
            DMG
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Shields thrown
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">
            {dpsResult.shieldsThrown.toLocaleString('en-US')}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {shieldsPerThrow.toLocaleString('en-US')} per Throw (4 + Rebound)
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">DPS</p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">
            {dpsResult.dps.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {dpsResult.totalDamage.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}{' '}
            total / {cooldowns.durationSec}s
          </p>
        </div>
      </div>

      <p className="font-mono text-sm leading-7 text-slate-200">
        <span className="text-white">Total DMG</span>
        <span className="text-slate-500"> = </span>
        <span className="text-violet-200">
          {dpsResult.boomerangCasts.toLocaleString('en-US')}
        </span>
        <span className="text-slate-500"> × Base DMG + </span>
        <span className="text-violet-200">
          {dpsResult.throwCasts.toLocaleString('en-US')}
        </span>
        <span className="text-slate-500"> × Throw Total DMG = </span>
        <span className="text-lg font-semibold text-white">
          {dpsResult.totalDamage.toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}
        </span>
      </p>
    </section>

    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          DPS Weights
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Same layout as Clean Damage: Weight % and Contribution are shares of
          current attributed DPS; ΔDPS / +1 is the marginal gain. Boomerang
          Weight % matches the Clean Damage block.
        </p>
      </div>

      <WeightTable
        caption="Shield Boomerang Clean Damage"
        rows={dpsWeights.boomerang}
      />
      <WeightTable caption="Shield Throw" rows={dpsWeights.throwStats} />
      <WeightTable caption="Skills" rows={dpsWeights.skills} />
    </section>
    </div>
  )
}
