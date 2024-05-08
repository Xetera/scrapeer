import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import type { JobPollResponse, ResourcesResponse } from './protocol/scrapeer'
import { sahibinden } from '~/fixtures/sahibinden/sahibinden'
import { TEST_URL_ENDPOINT } from './setup-tools'

export const restHandlers = [
  http.get(`${TEST_URL_ENDPOINT}/resources`, () => {
    return HttpResponse.json<ResourcesResponse>({
      resources: [sahibinden],
    })
  }),
  http.get(`${TEST_URL_ENDPOINT}/worker/jobs`, () => {
    return HttpResponse.json<JobPollResponse>({
      jobs: [],
    })
  }),
]

export const server = setupServer(...restHandlers)
