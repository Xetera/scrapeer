export const EVENTS_KEY = 'events'

export type Log = {
  /** randomly generated id */
  id: string
  type: 'plain'
  severity: 'info' | 'warning' | 'error' | 'debug'
  scope?: string
  data?: Record<string, unknown>
  text: string
  /** unix timestamp */
  date: number
  viewedAt?: Date
  name?: 'REQUEST_SENT'
}

export function generateUID() {
  const firstPart = (Math.random() * 46656) | 0
  const secondPart = (Math.random() * 46656) | 0
  const first = `000${firstPart.toString(36)}`.slice(-3)
  const second = `000${secondPart.toString(36)}`.slice(-3)
  return first + second
}

/** Rejects a promise after a certain amount of miliseconds */
export function timeoutReject(ms: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Timeout()), ms)
  })
}

export class Timeout extends Error {}
