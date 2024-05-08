import { PageEvaluator } from './page-evaluator'
import { constructPathRegex } from './resource'
import type { Resource, UnknownPayload } from './scrapeer'

export function findResource(id: string, resources: Resource[]): Resource {
  const resource = resources.find((r) => r.id === id)
  if (!resource) {
    throw new Error(`Resource ${id} not found`)
  }

  return resource
}

export function parseVariables(resource: Resource, url: URL) {
  const regex = constructPathRegex(resource.url_pattern)
  const matching = Array.from(
    PageEvaluator.normalizePath(url.pathname).matchAll(regex),
  )

  const isRelatedUrl = matching.length > 0
  if (!isRelatedUrl) {
    return
  }

  const urlVariables = {} as UnknownPayload
  const definedUrlVariables = resource.variables.filter(
    (variable) => variable.kind === 'url',
  )
  for (const { groups } of matching) {
    if (!groups) {
      continue
    }
    const declaredVariable = definedUrlVariables.filter(
      (v) => v.identifier in groups,
    )
    for (const variable of declaredVariable) {
      urlVariables[variable.alias ?? variable.identifier] =
        groups[variable.identifier]
    }
  }

  const definedQueryVariables = resource.variables.filter(
    (variable) => variable.kind === 'query',
  )
  const queryVariables = Object.fromEntries(
    definedQueryVariables.map((v) => {
      const value = url.searchParams.get(v.identifier) ?? v.default
      return [v.alias, value]
    }),
  )

  return { ...queryVariables, ...urlVariables }
}
