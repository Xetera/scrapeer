export function disableIframeSecurity(origins: string[]) {
  console.log('[security] disabling security for %s domains', origins.length)
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
    addRules: [
      {
        // response headers
        id: 1,
        priority: 1,
        condition: {
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME],
          requestDomains: origins,
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            {
              operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              header: 'X-Frame-Options',
            },
            {
              operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              header: 'Content-Security-Policy',
            },
          ],
        },
      },
      {
        // request headers
        id: 2,
        priority: 1,
        condition: {
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME],
          requestDomains: origins,
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              header: 'Sec-Fetch-Site',
              value: 'none',
            },
            {
              operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
              header: 'Referer',
            },
            {
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              header: 'Sec-Fetch-Dest',
              value: 'document',
            },
          ],
        },
      },
    ],
  })
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(console.log)
}

export function addIframeSecurityListener() {
  chrome.permissions.onAdded.addListener((permission) => {
    if (permission.origins) {
      console.log('disabling iframe security for new domains')
      disableIframeSecurity(permission.origins)
    }
  })
}
