import type { GraphitePlugin } from '@graphitemd/plugin-sdk'

export const systemStatusPlugin: GraphitePlugin = {
  manifest: { id: 'system-status', name: 'System Status', version: '0.0.0', capabilities: [] },
  async activate() {},
}
