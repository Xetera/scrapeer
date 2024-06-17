import { createDateFormatter } from '@kobalte/core/i18n'
import { For, Index, createEffect, createSignal } from 'solid-js'
/* @refresh reload */
import { onMessage, sendMessage } from 'webext-bridge/popup'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { toOrigin } from '~/protocol/resource'
import type { Resource } from '~/protocol/scrapeer'
import { type BrowserStorageSchema, Storage } from '~/shared/storage'
import { AddServer } from './add-server'
import { useLogs } from './hooks'

const formatter = createDateFormatter({
  timeStyle: 'medium',
})()

async function requestNewPermissions(resource: Resource) {
  await chrome.permissions.request({
    origins: [toOrigin(resource)],
    permissions: ['declarativeNetRequest', 'webNavigation'],
  })
  // chrome.permissions.request({
  // })
}

function Page() {
  const storage = new Storage<BrowserStorageSchema>()
  const [state, setState] = createSignal<StatefulResource[]>([])
  const { logs } = useLogs()
  async function updateState(resources: Resource[]) {
    const permissions = await chrome.permissions.getAll()
    console.log(permissions)
    setState(
      resources.map((resource) => {
        const hostAllowed =
          permissions.origins?.includes(toOrigin(resource)) ?? false
        return {
          resource,
          hostAllowed,
        }
      }),
    )
  }
  createEffect(async () => {
    const resources = await sendMessage('resources', undefined, {
      context: 'background',
      tabId: 0,
    })
    updateState(resources)
  })

  onMessage('update-resources', async ({ data }) => {
    console.log('updated!!!', data)
    updateState(data)
  })

  // onMessage('ran-job', (a) => {
  //   console.log(a)
  // })

  function getNewPermissions(resource: Resource) {
    requestNewPermissions(resource)
    storage.push('enabledResources', resource.id)
  }

  return (
    <div class='w-xl '>
      <div class=''>
        {/* <h2 class='text-lg font-semibold'>Spatula 🍳</h2> */}
        <AddServer />
        <div class='flex flex-col items-start gap-2 p-3'>
          <For each={state()} fallback={'Nothing here!'}>
            {({ resource, hostAllowed }) => (
              <button
                class='px-2 py-1'
                type='button'
                onClick={() => getNewPermissions(resource)}
              >
                {hostAllowed ? '👍' : '👎'} {resource.id}
              </button>
            )}
          </For>
        </div>
        <div>
          <For each={logs()}>
            {(log) => (
              <div
                data-index={log.id}
                classList={{
                  'bg-red-100': log.severity === 'error',
                  'bg-green-100': log.severity === 'info',
                }}
              >
                {log.data ? (
                  <details>
                    <summary class='tabular-nums'>
                      {formatter.format(new Date(log.date))} {log.text}
                    </summary>
                    <code class='ml-2 whitespace-pre text-wrap'>
                      {JSON.stringify(log.data, null, 2)}
                    </code>
                  </details>
                ) : (
                  <span class='ml-[10px] tabular-nums'>
                    {formatter.format(new Date(log.date))} {log.text}
                  </span>
                )}
              </div>
            )}
          </For>
        </div>
        {/* <Tabs defaultValue='dashboard' class='w-400px'>
          <TabsList>
            <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
            <TabsTrigger value='add-server'>Add Server</TabsTrigger>
          </TabsList>
          <TabsContent value='dashboard'></TabsContent>
          <TabsContent value='add-server'>
            <AddServer />
          </TabsContent>
        </Tabs> */}
      </div>
    </div>
  )
}

export interface StatefulResource {
  hostAllowed: boolean
  resource: Resource
}

export default Page
