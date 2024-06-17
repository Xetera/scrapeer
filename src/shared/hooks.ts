import { createSignal } from 'solid-js'
import type { BrowserStorageSchema } from './storage'

export function useBrowserStorage<T extends keyof BrowserStorageSchema>(
  eventsKey: T,
  defaultValue: BrowserStorageSchema[T],
) {
  let changed = false
  const [value, setValue] = createSignal<BrowserStorageSchema[T]>(defaultValue)

  chrome.storage.local.get({ [eventsKey]: defaultValue }).then((rawValue) => {
    if (changed) {
      console.log(
        '[useBrowserStorage] skipping setting a defalt value for logs signal because it was already updated',
      )
      return
    }
    const value = rawValue[eventsKey]
    setValue(value)
  })
  chrome.storage.local.onChanged.addListener((value) => {
    const newValue = value[eventsKey]?.newValue
    if (newValue === undefined) {
      return
    }
    changed = true
    setValue(newValue)
  })

  async function set(newValue: BrowserStorageSchema[T]) {
    await chrome.storage.local.set({ [eventsKey]: newValue })
  }
  return { value, set }
}
