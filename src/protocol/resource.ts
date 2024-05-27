import type { Resource } from './scrapeer'

export const constructPathRegex = (pattern: string): RegExp => {
  const regexValue = normalizePath(pattern).replaceAll(
    /:([a-zA-Z0-9-_]+)/g,
    String.raw`(?<$1>[a-zA-Z0-9-_]+)`,
  )
  return new RegExp(`^${regexValue}$`, 'g')
}

export const normalizePath = (path: string): string => path.replace(/\/$/, '')

export const originToUrl = (origin: string) =>
  `https://${origin.replace(/^\./, '')}`

export const toOrigin = (resource: Resource) => `*://${resource.hostname}/*`

export const toOrigins = (resources: Resource[]) => resources.map(toOrigin)
