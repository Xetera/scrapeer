import { sendMessage } from 'webext-bridge/content-script'
import { PageManager } from './page-manager'
;(async () => {
  try {
    sendMessage('start', undefined)
    console.log('[spatula] injecting page manager')
    const resources = await sendMessage('resources', undefined)
    const manager = new PageManager(document, resources)
    await manager.run()
    console.log('[spatula] page manager running')
  } catch (err) {
    console.error(err)
  }
})()
