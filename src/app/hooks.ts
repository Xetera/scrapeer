import { sendMessage } from 'webext-bridge/content-script'
import { EVENTS_KEY, type Log } from '~/shared'
import { useBrowserStorage } from '~/shared/hooks'

export function useLogs() {
  const { value: logs } = useBrowserStorage<'events'>(EVENTS_KEY, [])

  function send(log: Omit<Log, 'date'>) {
    sendMessage('log', log, {
      context: 'background',
      tabId: 0,
    })
  }

  return { logs, send }
}
