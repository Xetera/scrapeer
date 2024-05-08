import PQueue from 'p-queue'
import { EVENTS_KEY, generateUID, type Log } from '~/shared'

const MAX_LOG_RETENTION = 200
const q = new PQueue()

async function get<T>(key: string, defaultValue: T): Promise<T>
async function get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
  const store = await chrome.storage.local.get(key)
  return store[key] ?? defaultValue
}

const set = <T>(key: string, data: T): Promise<void> =>
  chrome.storage.local.set({ [key]: data })

/** Using a promise queue to make sure two writes aren't trying to happen simultaneously */
const push = async <T>(
  key: string,
  data: T,
  options: { trim: number },
): Promise<void> => {
  return q.add(
    async () => {
      const existing = await get<T[]>(key, [])
      existing.unshift(data)
      const trimmed = existing.slice(0, options.trim)
      await set(key, trimmed)
    },
    { throwOnTimeout: true },
  )
}

export function log(payload: Omit<Log, 'date' | 'type' | 'id'>) {
  const toPush: Log = {
    id: generateUID(),
    type: 'plain',
    ...payload,
    date: Date.now(),
  }
  push(EVENTS_KEY, toPush, { trim: MAX_LOG_RETENTION })

  if (payload.severity === 'error') {
    console.error(payload.text, payload.data)
  } else if (payload.severity === 'info') {
    console.log(payload.text, payload.data)
  } else if (payload.severity === 'debug') {
    console.debug(payload.text, payload.data)
  }
}
