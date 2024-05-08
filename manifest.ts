import type { ManifestV3Export } from '@crxjs/vite-plugin'

export default {
  manifest_version: 3,
  name: 'Spatula',
  version: '1.0.0',
  action: { default_popup: 'index.html' },
  permissions: [
    'cookies',
    'scripting',
    'declarativeNetRequest',
    'declarativeNetRequestFeedback',
    'webNavigation',
    'storage',
  ],
  // @ts-expect-error | Isn't implemented for some reason
  optional_host_permissions: ['*://*/*'],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content-scripts/spatula.ts'],
      run_at: 'document_idle',
      all_frames: true,
    },
  ],
  background: { service_worker: 'src/background/index.ts' },
} satisfies ManifestV3Export
