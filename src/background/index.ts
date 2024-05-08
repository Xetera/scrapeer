import { onMessage, sendMessage } from 'webext-bridge/background'
import {
  addIframeSecurityListener,
  disableIframeSecurity,
} from './iframe-security'
import { Client, type ClientEvents } from '~/protocol/client'
import { TypedEmitter } from 'tiny-typed-emitter'
import { ScriptRegistry } from './dynamic-registry'

import {
  type Resource,
  ServerAutonomy,
  type JobParameters,
} from '~/protocol/scrapeer'
import { addDisableChipsListener } from './cookie'
import { log } from './backend-logger'
import { Job } from '~/protocol/job'
import { sahibinden } from '~/fixtures/sahibinden/sahibinden'
import { shuffle } from 'lodash'
import { ContentScriptTracker } from './content-script-tracker'
import { generateUID } from '~/shared'
;(async () => {
  try {
    const cst = new ContentScriptTracker()
    chrome.webNavigation.onHistoryStateUpdated.addListener(
      (details) => {
        if (details.parentDocumentId !== undefined) {
          // request sent from our iframe
          return
        }
        sendMessage('url-update', details.url, {
          context: 'content-script',
          tabId: details.tabId,
        })
      },
      {
        url: [{ hostContains: 'sahibinden' }, { hostContains: 'instagram' }],
      },
    )

    const events = new TypedEmitter<ClientEvents>()
    const client = new Client({
      events,
      pollIntervalSeconds: 30,
      queueIntervalSeconds: 1,
      defaultServers: [
        {
          id: generateUID(),
          name: 'Sencekaclira',
          url: 'http://localhost:4000/',
          autonomy: ServerAutonomy.Active,
          token: 'hello-world',
        },
      ],
      async enabledResources(server) {
        const { enabledResources = {} } = (await chrome.storage.local.get({
          enabledResources: {},
        })) as { enabledResources: Record<string, string[]> }
        return enabledResources[server.name] ?? []
      },
    })
    events.on('runJob', async (job) => {
      const tabId = await cst.getScriptTab(job.resource)
      log({
        text: `Running job: ${job.resource.id}`,
        severity: 'debug',
        data: { url: job.url.toString(), resourceId: job.resource.id },
      })
      console.log('[events] sending run-job event')
      console.log(await chrome.tabs.get(tabId))
      sendMessage('run-job', job.params, {
        context: 'content-script',
        tabId,
      })
    })
    const origins = ['webbook.site', 'instagram.com', 'www.sahibinden.com']
    setTimeout(async () => {
      const id = await cst.getScriptTab(sahibinden)
      const params: JobParameters = {
        id: '1',
        issued_at: new Date(),
        expires_at: new Date(),
        resource_id: 'sahibinden:city_listing',
        url: 'https://www.sahibinden.com/satilik/istanbul',
      }
      const page = await sendMessage('run-job', params, {
        context: 'content-script',
        tabId: id,
      })
      console.log(page)
    }, 5_000)

    events.on('updatedResources', async (server, resources) => {
      const tabIds = await cst.getAllScriptTabs()
      console.log('[events] updated resources')
      sendMessage('update-resources', resources, {
        context: 'popup',
        tabId: 0,
      })
      ScriptRegistry.loadFromResources(resources)
      const hostnames = resources.map((re) => re.hostname)
      disableIframeSecurity(hostnames)
      for (const tabId of tabIds) {
        sendMessage('update-resources', resources, {
          context: 'content-script',
          tabId,
        })
      }
    })

    disableIframeSecurity(origins)
    addIframeSecurityListener()
    addDisableChipsListener(origins)

    onMessage('resources', () => client.allResources)
    onMessage('page-match', ({ data }) => {
      try {
        console.log(`Got a matching page for ${data.resourceId}`)
        return events.emit('pageMatched', data)
      } catch (err) {
        console.error(err)
      }
    })

    onMessage('toggle-resource', () => {})
    onMessage('log', ({ data }) => {
      log(data)
    })

    await client.startAll()
  } catch (err) {
    console.error(err)
  }
})()
