/* @refresh reload */
import { onMessage, sendMessage } from 'webext-bridge/popup'
import { For, Index, createEffect, createSignal } from 'solid-js'
import type { Resource } from '~/protocol/scrapeer'
import { toOrigin } from '~/protocol/resource'
import { useLogs } from './hooks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { AddServer } from './add-server'

async function requestNewPermissions(resource: Resource) {
  await chrome.permissions.request({
    origins: [toOrigin(resource)],
    permissions: ['declarativeNetRequest', 'webNavigation'],
  })
  // chrome.permissions.request({
  // })
}

function Page() {
  const [state, setState] = createSignal<StatefulResource[]>([])
  const { logs, send } = useLogs()
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
  }

  return (
    <div class='w-xl '>
      <div class=''>
        <h2 class='text-lg font-semibold'>Spatula 🍳</h2>
        <Tabs defaultValue='dashboard' class='w-400px'>
          <TabsList>
            <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
            <TabsTrigger value='add-server'>Add Server</TabsTrigger>
          </TabsList>
          <TabsContent value='dashboard'>
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
                        <summary>{log.text}</summary>
                        <code class='ml-2 whitespace-pre'>
                          {JSON.stringify(log.data, null, 2)}
                        </code>
                      </details>
                    ) : (
                      <p>{log.text}</p>
                    )}
                  </div>
                )}
              </For>
            </div>
          </TabsContent>
          <TabsContent value='add-server'>
            <AddServer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export interface StatefulResource {
  hostAllowed: boolean
  resource: Resource
}

export default Page
