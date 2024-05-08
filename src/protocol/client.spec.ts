import { describe, it, vi, expect, afterEach } from 'vitest'
import { Client, type ClientEvents, type ServerDefinition } from './client'
import {
  type JobPollResponse,
  type JobResult,
  ServerAutonomy,
} from './scrapeer'
import {
  sahibinden,
  sahibindenSmallJobs,
} from '~/fixtures/sahibinden/sahibinden'
import { TEST_URL_ENDPOINT } from '~/setup-tools'
import { HttpResponse, http } from 'msw'
import { server } from '~/msw'
import { TypedEmitter } from 'tiny-typed-emitter'

const serverDefinition: ServerDefinition = {
  autonomy: ServerAutonomy.Active,
  token: '0000',
  url: TEST_URL_ENDPOINT,
}

describe('client', () => {
  let client: Client

  afterEach(() => {
    return client.stopAll()
  })

  it('gets resources on start', async () => {
    const events = new TypedEmitter<ClientEvents>()
    client = new Client({
      events,
      pollIntervalSeconds: 1,
      queueIntervalSeconds: 1,
      defaultServers: [serverDefinition],
    })
    const fn = vi.fn()
    events.on('updatedResources', fn)
    await client.startAll()
    const args = [serverDefinition, [sahibinden]]
    expect(fn.mock.calls).toStrictEqual([args])
  })

  it('invalidates resources when instructed', async () => {
    const events = new TypedEmitter<ClientEvents>()
    client = new Client({
      events,
      pollIntervalSeconds: 1,
      queueIntervalSeconds: 1,
      defaultServers: [serverDefinition],
    })
    const poller = vi.fn()
    const resourceUpdater = vi.fn()
    const runJob = vi.fn()
    events.on('polled', poller)
    events.on('updatedResources', resourceUpdater)
    events.on('runJob', runJob)

    vi.useFakeTimers()
    await client.startAll()
    expect(poller).toBeCalledTimes(1)
    expect(runJob).toBeCalledTimes(0)
    expect(resourceUpdater).toBeCalledTimes(1)
    server.use(
      http.get(`${TEST_URL_ENDPOINT}/worker/jobs`, () => {
        return HttpResponse.json<JobPollResponse>({
          jobs: sahibindenSmallJobs,
          refetch: ['resources'],
        })
      }),
    )

    vi.advanceTimersByTime(1000)
    await vi.waitUntil(() => poller.mock.calls.length === 2)
    expect(poller).toBeCalledTimes(2)
    expect(runJob).toBeCalledTimes(1)
    expect(resourceUpdater).toBeCalledTimes(2)
    vi.useRealTimers()
  })

  it('sends the server passive jobs', async () => {
    const events = new TypedEmitter<ClientEvents>()
    client = new Client({
      events,
      pollIntervalSeconds: 1,
      queueIntervalSeconds: 1,
      defaultServers: [serverDefinition],
    })
    await client.startAll()

    server.use(
      http.post(
        `${TEST_URL_ENDPOINT}/worker/jobs`,
        () => {
          return HttpResponse.json({})
        },
        { once: true },
      ),
    )

    events.emit('pageMatched', {
      payload: { hello: 'world' },
      resource: sahibinden,
      source: {
        kind: 'passive',
      },
      variables: {},
      warnings: [],
    })
    const fn = vi.fn()
    server.events.on('request:match', fn)
    await vi.waitUntil(() => fn.mock.lastCall)
    const request = await fn.mock.calls[0][0].request.json()

    expect(request).toStrictEqual({
      kind: 'ok',
      payload: { hello: 'world' },
      resourceId: 'sahibinden:city_listing',
      job: { kind: 'passive' },
      variables: {},
      warnings: [],
    } satisfies JobResult)
  })
})
