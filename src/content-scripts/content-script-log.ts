import { sendMessage } from 'webext-bridge/content-script'
import type { Log } from '~/shared'

export function sendLog(log: Omit<Log, 'date' | 'type' | 'id'>) {
  sendMessage('log', log)
}
