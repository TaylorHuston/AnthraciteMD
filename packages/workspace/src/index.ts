export interface WorkspaceAuthority {
  current(): Promise<Readonly<{ workspaceId: `wrk_${string}`; available: boolean }>>
}
