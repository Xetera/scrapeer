import type { BrowserStorageSchema } from '~/shared/storage'

export class StorageListener {
  #updateMap: Array<{
    key: keyof BrowserStorageSchema
    callback: (
      value: NonNullable<BrowserStorageSchema[keyof BrowserStorageSchema]>,
    ) => void
  }> = []
  constructor() {
    chrome.storage.local.onChanged.addListener((changes) => {
      for (const { callback, key } of this.#updateMap) {
        if (!(key in changes)) {
          continue
        }
        const newValue = changes[key]?.newValue ?? undefined
        if (newValue !== undefined) {
          callback(newValue)
        }
      }
    })
  }

  on<T extends keyof BrowserStorageSchema>(
    key: T,
    callback: (value: NonNullable<BrowserStorageSchema[T]>) => void,
  ) {
    this.#updateMap.push({ key, callback })
  }
}
