import { useEffect, useId, useRef, useState } from 'react'
import {
  MS_SKILLS,
  findMsSkill,
  type MsSkillSlot,
} from '../lib/ms-classes'

type MsSkillSelectorProps = {
  value: MsSkillSlot
  onChange: (slot: MsSkillSlot) => void
}

export function MsSkillSelector({ value, onChange }: MsSkillSelectorProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = findMsSkill(value)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-violet-500/40 hover:bg-slate-900"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="text-slate-400">Master Skill</span>
        <span>{selected.label}</span>
        <span className="text-slate-500" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Master Skill"
          className="absolute left-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 py-2 shadow-xl shadow-black/40"
        >
          <ul>
            {MS_SKILLS.map((skill) => {
              const isActive = skill.slot === value
              return (
                <li key={skill.slot}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={[
                      'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-violet-500/20 text-violet-100'
                        : 'text-slate-200 hover:bg-slate-800',
                    ].join(' ')}
                    onClick={() => {
                      onChange(skill.slot)
                      setOpen(false)
                    }}
                  >
                    {skill.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
