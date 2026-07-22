import {
  DEFAULT_MS_CLASS_ID,
  DEFAULT_MS_SKILL_SLOT,
  sanitizeMsClassId,
  sanitizeMsSkillSlot,
  type MsClassId,
  type MsSkillSlot,
} from '../lib/ms-classes'
import { useLocalStorageState } from '../lib/local-storage-state'
import { MsClassSelector } from './MsClassSelector'
import { MsSkillSelector } from './MsSkillSelector'
import { RoyalGuardMs2Panel } from './RoyalGuardMs2Panel'

export function MsCalculator() {
  const [classId, setClassId] = useLocalStorageState<MsClassId>(
    'ms-calc.classId',
    DEFAULT_MS_CLASS_ID,
    sanitizeMsClassId,
  )
  const [skillSlot, setSkillSlot] = useLocalStorageState<MsSkillSlot>(
    'ms-calc.skillSlot',
    DEFAULT_MS_SKILL_SLOT,
    sanitizeMsSkillSlot,
  )

  const showRoyalGuardMs2 = classId === 'royal-guard' && skillSlot === 2

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Calculator
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-white">MS Calc</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <MsClassSelector value={classId} onChange={setClassId} />
          <MsSkillSelector value={skillSlot} onChange={setSkillSlot} />
        </div>
      </header>

      {showRoyalGuardMs2 ? <RoyalGuardMs2Panel /> : null}
    </div>
  )
}
