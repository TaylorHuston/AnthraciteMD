export type PluginManifest = Readonly<{ id: string; name: string; version: string; capabilities: readonly string[] }>

export interface GraphitePlugin { manifest: PluginManifest; activate(): Promise<void> }
