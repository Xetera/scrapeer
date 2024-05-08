import { createEffect, createSignal } from 'solid-js'
import { sendMessage } from 'webext-bridge/content-script'
import { EVENTS_KEY, type Log } from '~/shared'

export function useLogs() {
  const [logs, setLogs] = createSignal<Log[]>([])

  chrome.storage.local.get({ [EVENTS_KEY]: [] }).then((value) => {
    if (logs().length !== 0) {
      console.log(
        '[useLogs] skipping setting a defalt value for logs signal because it was already updated',
      )
      return
    }
    console.log(value[EVENTS_KEY])
    setLogs(value[EVENTS_KEY])
  })
  chrome.storage.local.onChanged.addListener((value) => {
    const logValue = value[EVENTS_KEY]?.newValue
    if (!logValue) {
      return
    }
    setLogs(logValue)
  })

  function send(log: Omit<Log, 'date'>) {
    sendMessage('log', log, {
      context: 'background',
      tabId: 0,
    })
  }

  return { logs, send }
}
