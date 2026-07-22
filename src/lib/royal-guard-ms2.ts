export type RoyalGuardMs2Input = {
  vit: number
  dex: number
  luk: number
  atk: number
  refineAtk: number
  shieldRefiningLevel: number
}

export const DEFAULT_ROYAL_GUARD_MS2_INPUT: RoyalGuardMs2Input = {
  vit: 0,
  dex: 0,
  luk: 0,
  atk: 0,
  refineAtk: 0,
  shieldRefiningLevel: 0,
}

export const MAX_SHIELD_REFINING_LEVEL = 15

export function sanitizeRoyalGuardMs2Input(
  stored: unknown,
  fallback: RoyalGuardMs2Input,
): RoyalGuardMs2Input {
  if (!stored || typeof stored !== 'object') return fallback

  const result = { ...fallback }
  const source = stored as Record<string, unknown>

  for (const key of Object.keys(fallback) as Array<keyof RoyalGuardMs2Input>) {
    const value = source[key]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      continue
    }
    if (key === 'shieldRefiningLevel') {
      result.shieldRefiningLevel = Math.min(
        MAX_SHIELD_REFINING_LEVEL,
        Math.round(value),
      )
      continue
    }
    result[key] = value
  }

  return result
}

export type RoyalGuardMs2Breakdown = {
  vitBase: number
  vitSq: number
  dexPart: number
  lukPart: number
  shieldPart: number
  vitPart: number
  atkOnly: number
  refineAtkOnly: number
  base: number
  atkPart: number
  total: number
  dmg: number
}

export type RoyalGuardMs2ParamStat = {
  key: keyof RoyalGuardMs2Input
  label: string
  contribution: number
  contributionDmg: number
  weightPercent: number | null
  deltaDmgPerPoint: number
}

const PARAM_META: {
  key: keyof RoyalGuardMs2Input
  label: string
}[] = [
  { key: 'vit', label: 'VIT' },
  { key: 'dex', label: 'DEX' },
  { key: 'luk', label: 'LUK' },
  { key: 'atk', label: 'ATK' },
  { key: 'refineAtk', label: 'Refine ATK' },
  { key: 'shieldRefiningLevel', label: 'Shield refining level' },
]

export function calculateRoyalGuardMs2Damage(
  input: RoyalGuardMs2Input,
): RoyalGuardMs2Breakdown {
  const vitBase = input.vit * 8
  const vitSq = Math.ceil((input.vit * input.vit) / 100) * 4
  const vitPart = vitBase + vitSq
  const dexPart = Math.ceil(input.dex / 5)
  const lukPart = Math.ceil(input.luk / 5)
  const shieldPart =
    Math.min(MAX_SHIELD_REFINING_LEVEL, input.shieldRefiningLevel) ** 2 * 2
  const atkOnly = input.atk
  const refineAtkOnly = input.refineAtk
  const base = vitPart + dexPart + lukPart + shieldPart
  const atkPart = atkOnly + refineAtkOnly
  const total = base + atkPart
  // 1000% = ×10; (ATK + Refine ATK) × 100% is inside the brackets
  const dmg = 10 * total

  return {
    vitBase,
    vitSq,
    dexPart,
    lukPart,
    shieldPart,
    vitPart,
    atkOnly,
    refineAtkOnly,
    base,
    atkPart,
    total,
    dmg,
  }
}

function contributionForParam(
  breakdown: RoyalGuardMs2Breakdown,
  key: keyof RoyalGuardMs2Input,
): number {
  switch (key) {
    case 'vit':
      return breakdown.vitPart
    case 'dex':
      return breakdown.dexPart
    case 'luk':
      return breakdown.lukPart
    case 'atk':
      return breakdown.atkOnly
    case 'refineAtk':
      return breakdown.refineAtkOnly
    case 'shieldRefiningLevel':
      return breakdown.shieldPart
  }
}

export function calculateRoyalGuardMs2ParamStats(
  input: RoyalGuardMs2Input,
): RoyalGuardMs2ParamStat[] {
  const breakdown = calculateRoyalGuardMs2Damage(input)

  return PARAM_META.map(({ key, label }) => {
    const contribution = contributionForParam(breakdown, key)
    const contributionDmg = contribution * 10
    const weightPercent =
      breakdown.total > 0 ? (contribution / breakdown.total) * 100 : null

    const nextInput: RoyalGuardMs2Input = {
      ...input,
      [key]:
        key === 'shieldRefiningLevel'
          ? Math.min(MAX_SHIELD_REFINING_LEVEL, input[key] + 1)
          : input[key] + 1,
    }
    const nextDmg = calculateRoyalGuardMs2Damage(nextInput).dmg
    const deltaDmgPerPoint = nextDmg - breakdown.dmg

    return {
      key,
      label,
      contribution,
      contributionDmg,
      weightPercent,
      deltaDmgPerPoint,
    }
  })
}
