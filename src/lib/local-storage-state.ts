import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function readStoredValue<T>(
  key: string,
  fallback: T,
  sanitize?: (stored: unknown, fallback: T) => T,
): T {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return sanitize ? sanitize(parsed, fallback) : (parsed as T)
  } catch {
    return fallback
  }
}

export function useLocalStorageState<T>(
  key: string,
  fallback: T,
  sanitize?: (stored: unknown, fallback: T) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readStoredValue(key, fallback, sanitize),
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore quota / private-mode write failures.
    }
  }, [key, value])

  return [value, setValue]
}

export function sanitizeNumberRecord<T extends Record<string, number>>(
  stored: unknown,
  fallback: T,
): T {
  if (!stored || typeof stored !== 'object') return fallback

  const result = { ...fallback }
  const source = stored as Record<string, unknown>

  for (const key of Object.keys(fallback) as Array<keyof T & string>) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      result[key] = value as T[typeof key]
    }
  }

  return result
}
