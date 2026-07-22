import {
  MAX_SHIELD_REFINING_LEVEL,
  calculateRoyalGuardMs2Damage,
  calculateRoyalGuardMs2ParamStats,
  type RoyalGuardMs2Input,
} from './royal-guard-ms2'
import {
  DEFAULT_SHIELD_COOLDOWNS,
  normalizeShieldCooldowns,
  shieldsPerThrowCast,
  simulateShieldDps,
  type ShieldCooldownConfig,
  type ShieldDpsResult,
} from './shield-dps'
import {
  SHIELD_THROW_SKILLS,
  bloodOathThumpHpPercent,
  calculateShieldThrowOutputs,
  finalReconsiderationPercents,
  shieldThrowDamagePercent,
  type ShieldThrowSkillId,
  type ShieldThrowSkillLevels,
  type ShieldThrowStats,
} from './shield-throw-skills'

export type RoyalGuardMs2Pipeline = {
  cleanDmg: number
  throwBonusDmg: number
  ignoreDefence: number
  withHpDmg: number
  baseDamage: number
  shieldThrowDamage: number
  shieldThrowTotalDamage: number
  shieldsPerThrow: number
  dps: ShieldDpsResult
}

export function calculateRoyalGuardMs2Pipeline(
  input: RoyalGuardMs2Input,
  shieldThrow: ShieldThrowStats,
  skillLevels: ShieldThrowSkillLevels,
  cooldowns: ShieldCooldownConfig = DEFAULT_SHIELD_COOLDOWNS,
): RoyalGuardMs2Pipeline {
  const cleanDmg = calculateRoyalGuardMs2Damage(input).dmg
  const throwOutputs = calculateShieldThrowOutputs(
    shieldThrow,
    skillLevels['final-reconsideration'],
  )
  const bloodOathX = bloodOathThumpHpPercent(skillLevels['blood-oath-thump'])
  const bloodOathThumpDmg = (shieldThrow.maxHp * bloodOathX) / 100
  const withHpDmg = cleanDmg + bloodOathThumpDmg
  const baseDamage = withHpDmg + (withHpDmg * throwOutputs.dmg) / 100
  const shieldThrowX = shieldThrowDamagePercent(skillLevels['shield-throw'])
  const shieldThrowDamage = (baseDamage * shieldThrowX) / 100
  const shieldsPerThrow = shieldsPerThrowCast(
    skillLevels['shield-rebound-combo'],
  )
  const shieldThrowTotalDamage = shieldThrowDamage * shieldsPerThrow
  const safeCooldowns = normalizeShieldCooldowns(cooldowns)
  const dps = simulateShieldDps({
    durationSec: safeCooldowns.durationSec,
    gcdSec: safeCooldowns.gcdSec,
    boomerangCooldownSec: safeCooldowns.boomerangCooldownSec,
    throwCooldownSec: safeCooldowns.throwCooldownSec,
    baseDamage,
    shieldThrowTotalDamage,
    shieldsPerThrow,
  })

  return {
    cleanDmg,
    throwBonusDmg: throwOutputs.dmg,
    ignoreDefence: throwOutputs.ignoreDefence,
    withHpDmg,
    baseDamage,
    shieldThrowDamage,
    shieldThrowTotalDamage,
    shieldsPerThrow,
    dps,
  }
}

export type DpsWeightRow = {
  id: string
  label: string
  group: 'boomerang' | 'throw' | 'skill'
  /** Share of attributed DPS within the group. */
  weightPercent: number | null
  deltaDpsPerPoint: number | null
  /** Attributed DPS contribution at current values. */
  contribution: number
  note?: string
}

function weightFromContributions(
  rows: Omit<DpsWeightRow, 'weightPercent'>[],
): DpsWeightRow[] {
  const total = rows.reduce((sum, row) => sum + Math.max(0, row.contribution), 0)

  return rows.map((row) => ({
    ...row,
    weightPercent:
      total > 0 && row.contribution > 0
        ? (row.contribution / total) * 100
        : total > 0
          ? 0
          : null,
  }))
}

function deltaDpsForInput(
  input: RoyalGuardMs2Input,
  shieldThrow: ShieldThrowStats,
  skillLevels: ShieldThrowSkillLevels,
  cooldowns: ShieldCooldownConfig,
  baselineDps: number,
  nextInput: RoyalGuardMs2Input = input,
  nextThrow: ShieldThrowStats = shieldThrow,
  nextLevels: ShieldThrowSkillLevels = skillLevels,
): number {
  return (
    calculateRoyalGuardMs2Pipeline(
      nextInput,
      nextThrow,
      nextLevels,
      cooldowns,
    ).dps.dps - baselineDps
  )
}

export function calculateDpsWeights(
  input: RoyalGuardMs2Input,
  shieldThrow: ShieldThrowStats,
  skillLevels: ShieldThrowSkillLevels,
  cooldowns: ShieldCooldownConfig = DEFAULT_SHIELD_COOLDOWNS,
): {
  boomerang: DpsWeightRow[]
  throwStats: DpsWeightRow[]
  skills: DpsWeightRow[]
} {
  const pipeline = calculateRoyalGuardMs2Pipeline(
    input,
    shieldThrow,
    skillLevels,
    cooldowns,
  )
  const baselineDps = pipeline.dps.dps
  const cleanStats = calculateRoyalGuardMs2ParamStats(input)
  const throwOutputs = calculateShieldThrowOutputs(
    shieldThrow,
    skillLevels['final-reconsideration'],
  )
  const bloodOathX = bloodOathThumpHpPercent(skillLevels['blood-oath-thump'])
  const bloodOathThumpDmg = (shieldThrow.maxHp * bloodOathX) / 100
  const { reflect } = finalReconsiderationPercents(
    skillLevels['final-reconsideration'],
  )
  const reflectBonus =
    (shieldThrow.physicalReflect + shieldThrow.magicReflect) * reflect

  // DPS = withHpDmg * (1 + throwBonus/100) * castFactor / duration
  // withHpDmg = cleanDmg + bloodOathThumpDmg
  const dpsPerWithHpUnit =
    pipeline.withHpDmg > 0 ? baselineDps / pipeline.withHpDmg : 0

  const boomerang = weightFromContributions(
    cleanStats.map((stat) => {
      const atMaxRefine =
        stat.key === 'shieldRefiningLevel' &&
        input.shieldRefiningLevel >= MAX_SHIELD_REFINING_LEVEL

      const nextValue =
        stat.key === 'shieldRefiningLevel'
          ? Math.min(MAX_SHIELD_REFINING_LEVEL, input[stat.key] + 1)
          : input[stat.key] + 1

      const contribution = stat.contributionDmg * dpsPerWithHpUnit

      return {
        id: `boomerang.${stat.key}`,
        label: stat.label,
        group: 'boomerang' as const,
        contribution,
        deltaDpsPerPoint: atMaxRefine
          ? null
          : deltaDpsForInput(
              input,
              shieldThrow,
              skillLevels,
              cooldowns,
              baselineDps,
              { ...input, [stat.key]: nextValue },
            ),
        note: atMaxRefine ? `Max ${MAX_SHIELD_REFINING_LEVEL}` : undefined,
      }
    }),
  )

  const bonusFactor = throwOutputs.dmg / 100
  const bonusDps =
    pipeline.withHpDmg > 0 ? baselineDps * (bonusFactor / (1 + bonusFactor)) : 0
  const basePartDps = baselineDps - bonusDps

  const bloodOathShareOfWithHp =
    pipeline.withHpDmg > 0 ? bloodOathThumpDmg / pipeline.withHpDmg : 0
  const maxHpContribution = basePartDps * bloodOathShareOfWithHp

  const throwBonusParts = {
    dmg: shieldThrow.dmg,
    physicalReflect: shieldThrow.physicalReflect * reflect,
    magicReflect: shieldThrow.magicReflect * reflect,
  }
  const throwBonusTotal =
    throwBonusParts.dmg +
    throwBonusParts.physicalReflect +
    throwBonusParts.magicReflect

  const shareOfBonus = (part: number) =>
    throwBonusTotal > 0 ? (part / throwBonusTotal) * bonusDps : 0

  const throwStats = weightFromContributions(
    (
      [
        {
          key: 'maxHp',
          label: 'Max HP',
          contribution: maxHpContribution,
        },
        {
          key: 'dmg',
          label: 'DMG',
          contribution: shareOfBonus(throwBonusParts.dmg),
        },
        {
          key: 'ignoreDefence',
          label: 'Ignore Defence %',
          contribution: 0,
          note: 'No DPS impact in current model',
        },
        {
          key: 'physicalReflect',
          label: 'Physical Reflect %',
          contribution: shareOfBonus(throwBonusParts.physicalReflect),
        },
        {
          key: 'magicReflect',
          label: 'Magic Reflect %',
          contribution: shareOfBonus(throwBonusParts.magicReflect),
        },
        {
          key: 'def',
          label: 'Def %',
          contribution: 0,
          note: 'No DPS impact in current model',
        },
        {
          key: 'mdef',
          label: 'M.Def %',
          contribution: 0,
          note: 'No DPS impact in current model',
        },
      ] as const
    ).map((field) => ({
      id: `throw.${field.key}`,
      label: field.label,
      group: 'throw' as const,
      contribution: field.contribution,
      note: 'note' in field ? field.note : undefined,
      deltaDpsPerPoint: deltaDpsForInput(
        input,
        shieldThrow,
        skillLevels,
        cooldowns,
        baselineDps,
        input,
        { ...shieldThrow, [field.key]: shieldThrow[field.key] + 1 },
      ),
    })),
  )

  const reboundLevel = skillLevels['shield-rebound-combo']
  const throwDps = pipeline.dps.throwDamage / pipeline.dps.durationSec
  const perBounceDps =
    pipeline.shieldsPerThrow > 0 ? throwDps / pipeline.shieldsPerThrow : 0
  const shieldThrowBaseBounceDps = perBounceDps * 4
  const reboundBounceDps = perBounceDps * reboundLevel
  const reflectBonusDps = shareOfBonus(reflectBonus)
  const bloodOathSkillDps = maxHpContribution

  const skills = weightFromContributions(
    SHIELD_THROW_SKILLS.map((skill) => {
      const currentLevel = skillLevels[skill.id]
      const atMax = currentLevel >= skill.maxLevel

      let contribution = 0
      switch (skill.id) {
        case 'blood-oath-thump':
          contribution = bloodOathSkillDps
          break
        case 'final-reconsideration':
          contribution = reflectBonusDps
          break
        case 'shield-throw':
          contribution = shieldThrowBaseBounceDps
          break
        case 'shield-rebound-combo':
          contribution = reboundBounceDps
          break
      }

      return {
        id: `skill.${skill.id}`,
        label: skill.label,
        group: 'skill' as const,
        contribution,
        note: atMax ? `Max Lv.${skill.maxLevel}` : undefined,
        deltaDpsPerPoint: atMax
          ? null
          : deltaDpsForInput(
              input,
              shieldThrow,
              skillLevels,
              cooldowns,
              baselineDps,
              input,
              shieldThrow,
              { ...skillLevels, [skill.id]: currentLevel + 1 },
            ),
      }
    }),
  )

  return {
    boomerang,
    throwStats,
    skills,
  }
}

export type { ShieldThrowSkillId }
