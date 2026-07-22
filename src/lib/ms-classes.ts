export type MsClassId =
  | 'rune-knight'
  | 'royal-guard'
  | 'warlock'
  | 'guillotine-cross'
  | 'shadow-chaser'
  | 'ranger'
  | 'archbishop'
  | 'sura'
  | 'mechanic'
  | 'genetic'

export type MsClassGroupId =
  | 'swordsman'
  | 'mage'
  | 'thief'
  | 'archer'
  | 'acolyte'
  | 'merchant'

export type MsClass = {
  id: MsClassId
  label: string
}

export type MsClassGroup = {
  id: MsClassGroupId
  label: string
  classes: MsClass[]
}

export const MS_CLASS_GROUPS: MsClassGroup[] = [
  {
    id: 'swordsman',
    label: 'Swordsman',
    classes: [
      { id: 'rune-knight', label: 'Rune Knight' },
      { id: 'royal-guard', label: 'Royal Guard' },
    ],
  },
  {
    id: 'mage',
    label: 'Mage',
    classes: [{ id: 'warlock', label: 'Warlock' }],
  },
  {
    id: 'thief',
    label: 'Thief',
    classes: [
      { id: 'guillotine-cross', label: 'Guillotine Cross' },
      { id: 'shadow-chaser', label: 'Shadow Chaser' },
    ],
  },
  {
    id: 'archer',
    label: 'Archer',
    classes: [{ id: 'ranger', label: 'Ranger' }],
  },
  {
    id: 'acolyte',
    label: 'Acolyte',
    classes: [
      { id: 'archbishop', label: 'Archbishop' },
      { id: 'sura', label: 'Sura' },
    ],
  },
  {
    id: 'merchant',
    label: 'Merchant',
    classes: [
      { id: 'mechanic', label: 'Mechanic' },
      { id: 'genetic', label: 'Genetic' },
    ],
  },
]

export const MS_CLASSES: MsClass[] = MS_CLASS_GROUPS.flatMap(
  (group) => group.classes,
)

export const DEFAULT_MS_CLASS_ID: MsClassId = 'royal-guard'

export type MsSkillSlot = 1 | 2 | 3

export type MsSkill = {
  slot: MsSkillSlot
  label: string
}

export const MS_SKILLS: MsSkill[] = [
  { slot: 1, label: '1 MS' },
  { slot: 2, label: '2 MS' },
  { slot: 3, label: '3 MS' },
]

export const DEFAULT_MS_SKILL_SLOT: MsSkillSlot = 2

export function findMsClass(id: MsClassId): MsClass {
  const found = MS_CLASSES.find((job) => job.id === id)
  if (!found) {
    throw new Error(`Unknown MS class: ${id}`)
  }
  return found
}

export function findMsSkill(slot: MsSkillSlot): MsSkill {
  const found = MS_SKILLS.find((skill) => skill.slot === slot)
  if (!found) {
    throw new Error(`Unknown MS skill slot: ${slot}`)
  }
  return found
}

export function sanitizeMsClassId(
  stored: unknown,
  fallback: MsClassId,
): MsClassId {
  if (typeof stored !== 'string') return fallback
  return MS_CLASSES.some((job) => job.id === stored)
    ? (stored as MsClassId)
    : fallback
}

export function sanitizeMsSkillSlot(
  stored: unknown,
  fallback: MsSkillSlot,
): MsSkillSlot {
  return stored === 1 || stored === 2 || stored === 3 ? stored : fallback
}
