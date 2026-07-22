export type ShieldThrowSkillId =
  | 'shield-throw'
  | 'shield-rebound-combo'
  | 'blood-oath-thump'
  | 'final-reconsideration'

export type ShieldThrowSkill = {
  id: ShieldThrowSkillId
  label: string
  minLevel: number
  maxLevel: number
  description: string
}

export const SHIELD_THROW_SKILLS: ShieldThrowSkill[] = [
  {
    id: 'shield-throw',
    label: 'Shield Throw',
    minLevel: 1,
    maxLevel: 10,
    description:
      'Throw the shield, and it will bounce back and forth within a 5-meter range of the target, dealing physical damage equal to [Shield boomerang] * X% each time. The bounce interval is fixed at 0.5 seconds, and it can bounce up to 4 times. Enemies hit by the bounce will be disarmed for 1 second.',
  },
  {
    id: 'shield-rebound-combo',
    label: 'Shield Rebound Combo',
    minLevel: 1,
    maxLevel: 5,
    description:
      '[Shield throw] will bounce an additional X times. If there are no other enemies near the target, it can bounce back to the Royal Guard itself.',
  },
  {
    id: 'blood-oath-thump',
    label: 'Blood Oath Thump',
    minLevel: 1,
    maxLevel: 5,
    description:
      "[Shield boomerang] deals additional physical damage equal to the user's maximum HP * X%, and it is also affected by Star Rune and Equipment bonuses (in PVP or GVG, the effect is 25%).",
  },
  {
    id: 'final-reconsideration',
    label: 'Final Reconsideration',
    minLevel: 1,
    maxLevel: 10,
    description:
      "Each 1% Physical Reflect or Magic Reflect attribute of the Royal Guard increases the damage of {reflect}% [Shield Boomerang]. Every 1% Def/M.Def allows [Shield Boomerang] to additionally ignore {ignoreDef}% Def. When target's HP is lower than {executeHp}% of the Royal Guard's current HP, [Shield Throw] executes the target, ineffective against monsters.",
  },
]

export type ShieldThrowSkillLevels = Record<ShieldThrowSkillId, number>

export const DEFAULT_SHIELD_THROW_SKILL_LEVELS: ShieldThrowSkillLevels = {
  'shield-throw': 1,
  'shield-rebound-combo': 1,
  'blood-oath-thump': 1,
  'final-reconsideration': 1,
}

export function sanitizeShieldThrowSkillLevels(
  stored: unknown,
  fallback: ShieldThrowSkillLevels,
): ShieldThrowSkillLevels {
  if (!stored || typeof stored !== 'object') return fallback

  const result = { ...fallback }
  const source = stored as Record<string, unknown>

  for (const skill of SHIELD_THROW_SKILLS) {
    const value = source[skill.id]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    result[skill.id] = Math.min(
      skill.maxLevel,
      Math.max(skill.minLevel, Math.round(value)),
    )
  }

  return result
}

/** Linear fit from known points: Lv.3 = 94%, Lv.4 = 102% → +8% per level. */
export function shieldThrowDamagePercent(level: number): number {
  return 70 + 8 * level
}

/** Blood Oath Thump: Lv.1 = 8%, Lv.2 = 16%, … → 8% × level. */
export function bloodOathThumpHpPercent(level: number): number {
  return 8 * level
}

/** Final Reconsideration coefficients per level: reflect / ignore Def / execute HP. */
export function finalReconsiderationPercents(level: number): {
  reflect: number
  ignoreDef: number
  executeHp: number
} {
  return {
    reflect: 0.1 * level,
    ignoreDef: 0.1 * level,
    executeHp: 0.5 * level,
  }
}

function formatPercentValue(value: number): string {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })
}

export type ShieldThrowStats = {
  maxHp: number
  ignoreDefence: number
  physicalReflect: number
  magicReflect: number
  def: number
  mdef: number
  dmg: number
}

export const DEFAULT_SHIELD_THROW_STATS: ShieldThrowStats = {
  maxHp: 0,
  ignoreDefence: 0,
  physicalReflect: 0,
  magicReflect: 0,
  def: 0,
  mdef: 0,
  dmg: 0,
}

export type ShieldThrowOutputs = {
  /** Base DMG + Final Reconsideration bonus from reflect. */
  dmg: number
  /** Base ignore Def % + Final Reconsideration bonus from Def/M.Def. */
  ignoreDefence: number
  /** Extra DMG from Physical/Magic Reflect. */
  dmgBonus: number
  /** Extra ignore Def % from Def/M.Def. */
  ignoreDefenceBonus: number
}

/**
 * Final Reconsideration:
 * - each 1% Physical/Magic Reflect adds `reflect` to Shield Boomerang DMG
 * - each 1% Def/M.Def adds `ignoreDef`% ignore Def
 */
export function calculateShieldThrowOutputs(
  stats: ShieldThrowStats,
  finalReconsiderationLevel: number,
): ShieldThrowOutputs {
  const { reflect, ignoreDef } = finalReconsiderationPercents(
    finalReconsiderationLevel,
  )

  const reflectTotal = stats.physicalReflect + stats.magicReflect
  const defTotal = stats.def + stats.mdef

  const dmgBonus = reflectTotal * reflect
  const dmg = stats.dmg + dmgBonus

  const ignoreDefenceBonus = defTotal * ignoreDef
  const ignoreDefence = stats.ignoreDefence + ignoreDefenceBonus

  return {
    dmg,
    ignoreDefence,
    dmgBonus,
    ignoreDefenceBonus,
  }
}

export function formatShieldThrowSkillDescription(
  skillId: ShieldThrowSkillId,
  level: number,
): string {
  const skill = SHIELD_THROW_SKILLS.find((entry) => entry.id === skillId)
  if (!skill) {
    throw new Error(`Unknown shield throw skill: ${skillId}`)
  }

  if (skillId === 'shield-throw') {
    return skill.description.replaceAll(
      'X',
      String(shieldThrowDamagePercent(level)),
    )
  }

  if (skillId === 'shield-rebound-combo') {
    return skill.description.replaceAll('X', String(level))
  }

  if (skillId === 'blood-oath-thump') {
    return skill.description.replaceAll(
      'X',
      String(bloodOathThumpHpPercent(level)),
    )
  }

  if (skillId === 'final-reconsideration') {
    const values = finalReconsiderationPercents(level)
    return skill.description
      .replaceAll('{reflect}', formatPercentValue(values.reflect))
      .replaceAll('{ignoreDef}', formatPercentValue(values.ignoreDef))
      .replaceAll('{executeHp}', formatPercentValue(values.executeHp))
  }

  return skill.description
}
