export type BoxReward = {
  id: string
  chancePercent: number
  zeny: number
}

export const DEFAULT_BOX_REWARDS: BoxReward[] = [
  { id: '1', chancePercent: 5, zeny: 180_000 },
  { id: '2', chancePercent: 15, zeny: 200_000 },
  { id: '3', chancePercent: 10, zeny: 250_000 },
  { id: '4', chancePercent: 10, zeny: 300_000 },
]

export const XP_PER_TIER = 100
export const ADVANCED_BOXES_PER_TIER = 12
export const COLLECTION_BOXES_PER_TIER = 24
export const DAILY_XP = 140
export const MONDAY_BONUS_XP = 620
export const WEEKLY_XP_CAP = 1950

export type MonthlyCalculation = {
  year: number
  month: number
  totalXp: number
  tiers: number
  advancedBoxes: number
  collectionBoxes: number
  advancedExpectedZeny: number
  collectionExpectedZeny: number
  totalExpectedZeny: number
  advancedZenyPerBox: number
  collectionZenyPerBox: number
}

export function createRewardId(): string {
  return crypto.randomUUID()
}

export function cloneDefaultRewards(): BoxReward[] {
  return DEFAULT_BOX_REWARDS.map((reward) => ({ ...reward, id: createRewardId() }))
}

export function expectedZenyPerBox(rewards: BoxReward[]): number {
  return rewards.reduce(
    (sum, reward) => sum + (reward.chancePercent / 100) * reward.zeny,
    0,
  )
}

function getDailyPotential(date: Date): number {
  return DAILY_XP + (date.getDay() === 1 ? MONDAY_BONUS_XP : 0)
}

function isWeeklyCapReset(day: Date): boolean {
  return day.getDate() === 1 || day.getDay() === 1
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const cursor = new Date(year, month, 1)

  while (cursor.getMonth() === month) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function calculateMonthlyXp(year: number, month: number): number {
  let totalXp = 0
  let weeklyXp = 0

  for (const day of getDaysInMonth(year, month)) {
    if (isWeeklyCapReset(day)) {
      weeklyXp = 0
    }

    const potential = getDailyPotential(day)
    const earned = Math.min(potential, Math.max(0, WEEKLY_XP_CAP - weeklyXp))
    weeklyXp += earned
    totalXp += earned
  }

  return totalXp
}

export function calculateMonthlyRewards(
  year: number,
  month: number,
  advancedRewards: BoxReward[],
  collectionRewards: BoxReward[],
): MonthlyCalculation {
  const totalXp = calculateMonthlyXp(year, month)
  const tiers = Math.floor(totalXp / XP_PER_TIER)
  const advancedBoxes = tiers * ADVANCED_BOXES_PER_TIER
  const collectionBoxes = tiers * COLLECTION_BOXES_PER_TIER
  const advancedZenyPerBox = expectedZenyPerBox(advancedRewards)
  const collectionZenyPerBox = expectedZenyPerBox(collectionRewards)
  const advancedExpectedZeny = advancedBoxes * advancedZenyPerBox
  const collectionExpectedZeny = collectionBoxes * collectionZenyPerBox

  return {
    year,
    month,
    totalXp,
    tiers,
    advancedBoxes,
    collectionBoxes,
    advancedZenyPerBox,
    collectionZenyPerBox,
    advancedExpectedZeny,
    collectionExpectedZeny,
    totalExpectedZeny: advancedExpectedZeny + collectionExpectedZeny,
  }
}

export function formatZeny(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} z`
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
