import { shuffle } from 'lodash'
import { onMessage } from 'webext-bridge/background'
import { log } from './backend-logger'
import type { Resource } from '~/protocol/scrapeer'

export class ContentScriptTracker {
  #tabIds = new Set<number>()
  constructor() {
    onMessage('start', ({ sender }) => {
      console.log('adding tab id')
      this.#tabIds.add(sender.tabId)
    })

    chrome.tabs.onRemoved.addListener((id) => {
      this.#tabIds.delete(id)
    })
  }

  async getScriptTab(resource?: Resource): Promise<number> {
    const rawTabs = await chrome.tabs.query({})
    const tabs = shuffle(rawTabs)
    for (const tab of tabs) {
      const id = this.#getTabId(tab)
      if (id && this.isValid(id)) {
        return id
      }
    }

    log({
      text: 'No valid tabs open to run job',
      severity: 'error',
      data: {
        ...(resource ? { resourceId: resource.id } : {}),
        tabCount: tabs.length,
      },
    })
    throw new Error('No valid tabs')
  }

  async getAllScriptTabs(): Promise<number[]> {
    const rawTabs = await chrome.tabs.query({})
    return rawTabs.flatMap((tab) => {
      const id = this.#getTabId(tab)
      return id && this.isValid(id) ? [id] : []
    })
  }

  isValid(id: number): boolean {
    return this.#tabIds.has(id)
  }

  #getTabId(tab: chrome.tabs.Tab) {
    if (tab.id && tab.id !== chrome.tabs.TAB_ID_NONE && this.isValid(tab.id)) {
      return tab.id
    }
  }
}
