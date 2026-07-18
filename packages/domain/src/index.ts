export type WorkspaceConnection = Readonly<{ workspaceId: `wrk_${string}`; status: 'connected' | 'unavailable' }>

export function connectWorkspace(workspaceId: `wrk_${string}`, rootIsAvailable: boolean): WorkspaceConnection {
  return { workspaceId, status: rootIsAvailable ? 'connected' : 'unavailable' }
}
