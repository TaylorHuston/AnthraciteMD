import type { GraphitePlugin } from '@graphitemd/plugin-sdk'

export async function activateForTest(plugin: GraphitePlugin): Promise<void> { await plugin.activate() }
