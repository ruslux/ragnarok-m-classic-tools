export const DPS_WINDOW_SEC = 60
export const GLOBAL_CAST_LOCK_SEC = 1
export const SHIELD_BOOMERANG_COOLDOWN_SEC = 2.5
export const SHIELD_THROW_COOLDOWN_SEC = 5
export const SHIELD_THROW_BASE_BOUNCES = 4

export type ShieldCooldownConfig = {
  durationSec: number
  gcdSec: number
  boomerangCooldownSec: number
  throwCooldownSec: number
}

export const DEFAULT_SHIELD_COOLDOWNS: ShieldCooldownConfig = {
  durationSec: DPS_WINDOW_SEC,
  gcdSec: GLOBAL_CAST_LOCK_SEC,
  boomerangCooldownSec: SHIELD_BOOMERANG_COOLDOWN_SEC,
  throwCooldownSec: SHIELD_THROW_COOLDOWN_SEC,
}

export function normalizeShieldCooldowns(
  cooldowns: ShieldCooldownConfig,
): ShieldCooldownConfig {
  return {
    durationSec: Math.max(1, cooldowns.durationSec),
    gcdSec: Math.max(0.1, cooldowns.gcdSec),
    boomerangCooldownSec: Math.max(0.1, cooldowns.boomerangCooldownSec),
    throwCooldownSec: Math.max(0.1, cooldowns.throwCooldownSec),
  }
}

export type ShieldDpsInput = {
  durationSec: number
  gcdSec: number
  boomerangCooldownSec: number
  throwCooldownSec: number
  baseDamage: number
  shieldThrowTotalDamage: number
  shieldsPerThrow: number
}

export type ShieldDpsResult = {
  durationSec: number
  boomerangCasts: number
  throwCasts: number
  shieldsThrown: number
  boomerangDamage: number
  throwDamage: number
  totalDamage: number
  dps: number
}

/**
 * Simulate a 60s (or custom) rotation:
 * - Shield Throw CD 5s, Shield Boomerang CD 2.5s
 * - Global cast lock: at most one skill every 1s
 * - Prefer Throw when both are ready at the same time (higher payload)
 */
export function simulateShieldDps(input: ShieldDpsInput): ShieldDpsResult {
  const {
    durationSec,
    gcdSec,
    boomerangCooldownSec,
    throwCooldownSec,
    baseDamage,
    shieldThrowTotalDamage,
    shieldsPerThrow,
  } = input

  let gcdReady = 0
  let boomerangReady = 0
  let throwReady = 0
  let boomerangCasts = 0
  let throwCasts = 0

  for (let step = 0; step < 10_000; step += 1) {
    const earliestAct = gcdReady
    const throwAt = Math.max(earliestAct, throwReady)
    const boomAt = Math.max(earliestAct, boomerangReady)

    const canThrow = throwAt < durationSec
    const canBoom = boomAt < durationSec
    if (!canThrow && !canBoom) break

    let actAt: number
    let castThrow: boolean

    if (canThrow && canBoom) {
      if (throwAt <= boomAt) {
        actAt = throwAt
        castThrow = true
      } else {
        actAt = boomAt
        castThrow = false
      }
    } else if (canThrow) {
      actAt = throwAt
      castThrow = true
    } else {
      actAt = boomAt
      castThrow = false
    }

    if (castThrow) {
      throwCasts += 1
      throwReady = actAt + throwCooldownSec
    } else {
      boomerangCasts += 1
      boomerangReady = actAt + boomerangCooldownSec
    }

    gcdReady = actAt + gcdSec
  }

  const boomerangDamage = boomerangCasts * baseDamage
  const throwDamage = throwCasts * shieldThrowTotalDamage
  const totalDamage = boomerangDamage + throwDamage

  return {
    durationSec,
    boomerangCasts,
    throwCasts,
    shieldsThrown: throwCasts * shieldsPerThrow,
    boomerangDamage,
    throwDamage,
    totalDamage,
    dps: durationSec > 0 ? totalDamage / durationSec : 0,
  }
}

export function shieldsPerThrowCast(reboundComboLevel: number): number {
  return SHIELD_THROW_BASE_BOUNCES + reboundComboLevel
}
