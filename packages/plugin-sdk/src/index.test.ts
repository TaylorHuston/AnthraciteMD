import { describe, expect, it, vi } from 'vitest'

import {
  createAssistantCapabilities,
  PluginCapabilityDenied,
  PluginHost,
  createCapabilityBroker,
  createPluginStateAdapter,
  resourceId,
  validatePluginManifest,
  type AssistantQuestion,
  type GraphitePlugin,
  type PluginManifest,
  type PluginStateBackend,
} from './index.js'

const manifest: PluginManifest = {
  schemaVersion: 1, id: 'system-status', name: 'System Status', version: '1.0.0',
  compatibility: { host: '^1.0.0' }, permissions: ['status:read'], dependencies: [],
  state: { schemaVersion: 1 }, contributions: { commands: [{ id: 'show-status', title: 'Show system status' }] },
}

function memoryState(): PluginStateBackend & { values: Map<string, unknown> } {
  const values = new Map<string, unknown>()
  return {
    values,
    async read(id) { return values.get(id) },
    async transaction(id, value) { values.set(id, value) },
    async recovery() { return 'clean' },
  }
}

describe('GMD-003/S1 R1 manifest validation', () => {
  it('accepts a complete compatible versioned manifest', () => {
    const result = validatePluginManifest({
      schemaVersion: 1,
      id: 'system-status',
      name: 'System Status',
      version: '1.0.0',
      compatibility: { host: '^1.0.0' },
      permissions: ['status:read'],
      dependencies: [],
      state: { schemaVersion: 1 },
      contributions: { commands: [{ id: 'show-status', title: 'Show system status' }] },
    }, '1.2.0')

    expect(result).toEqual(expect.objectContaining({ ok: true }))
  })

  it('rejects incompatible and malformed manifests with recoverable codes', () => {
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^2.0.0' } }, '1.0.0')).toEqual(expect.objectContaining({ ok: false, code: 'incompatible_host' }))
    expect(validatePluginManifest({ id: 'missing-fields' }, '1.0.0')).toEqual(expect.objectContaining({ ok: false, code: 'invalid_manifest' }))
    expect(validatePluginManifest({ ...manifest, contributions: { commands: [{ id: '../escape', title: '' }] } }, '1.0.0')).toEqual(expect.objectContaining({ ok: false, code: 'invalid_manifest' }))
  })

  it('enforces caret lower bounds and zero-major compatibility boundaries', () => {
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^1.2.3' } }, '1.2.0')).toEqual(expect.objectContaining({ ok: false, code: 'incompatible_host' }))
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^1.2.3' } }, '1.2.3')).toEqual(expect.objectContaining({ ok: true }))
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^1.2.3' } }, '1.9.0')).toEqual(expect.objectContaining({ ok: true }))
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^1.2.3' } }, '2.0.0')).toEqual(expect.objectContaining({ ok: false, code: 'incompatible_host' }))
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^0.1.2' } }, '0.2.0')).toEqual(expect.objectContaining({ ok: false, code: 'incompatible_host' }))
    expect(validatePluginManifest({ ...manifest, compatibility: { host: '^0.0.3' } }, '0.0.4')).toEqual(expect.objectContaining({ ok: false, code: 'incompatible_host' }))
  })
})

describe('GMD-003/S1 R2 plugin lifecycle', () => {
  it('applies persisted disablement before activation and removes contributions on disable', async () => {
    let activations = 0
    let disposed = false
    const plugin: GraphitePlugin = { manifest, async activate() { activations++; return () => { disposed = true } } }
    const backend = memoryState()
    const disabledHost = new PluginHost({ hostVersion: '1.0.0', enabled: { 'system-status': false }, provider: { async perform() {} }, stateBackend: backend })
    await disabledHost.load([plugin])
    expect(activations).toBe(0)
    expect(disabledHost.list()[0]).toEqual(expect.objectContaining({ status: 'disabled', contributions: {} }))

    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: backend })
    await host.load([plugin])
    expect(host.list()[0]?.contributions.commands).toHaveLength(1)
    await host.disable('system-status')
    expect(disposed).toBe(true)
    expect(host.list()[0]).toEqual(expect.objectContaining({ status: 'disabled', contributions: {} }))
  })

  it('fails duplicate and unresolved dependency plugins closed', async () => {
    const plugin: GraphitePlugin = { manifest, async activate() {} }
    const missing: GraphitePlugin = { manifest: { ...manifest, id: 'dependent', dependencies: [{ id: 'absent', version: '^1.0.0' }] }, async activate() {} }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: memoryState() })
    await host.load([plugin, plugin, missing])
    expect(host.list().find((item) => item.id === 'system-status')).toEqual(expect.objectContaining({ status: 'duplicate', contributions: {} }))
    expect(host.list().find((item) => item.id === 'dependent')).toEqual(expect.objectContaining({ status: 'dependency_missing', contributions: {} }))
  })

  it('does not resolve a dependency from an invalid or version-mismatched candidate', async () => {
    const dependency: GraphitePlugin = { manifest: { ...manifest, id: 'dependency', version: '1.0.0' }, async activate() {} }
    const dependent: GraphitePlugin = { manifest: { ...manifest, id: 'dependent', dependencies: [{ id: 'dependency', version: '^2.0.0' }] }, async activate() {} }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: memoryState() })
    await host.load([dependency, dependent])
    expect(host.list().find((item) => item.id === 'dependent')?.status).toBe('dependency_missing')
  })

  it('does not activate a dependent when its dependency identity is duplicated', async () => {
    const dependency: GraphitePlugin = { manifest: { ...manifest, id: 'dependency' }, async activate() {} }
    let dependentActivated = false
    const dependent: GraphitePlugin = {
      manifest: { ...manifest, id: 'dependent', dependencies: [{ id: 'dependency', version: '^1.0.0' }] },
      async activate() { dependentActivated = true },
    }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: memoryState() })
    await host.load([dependency, dependency, dependent])

    expect(dependentActivated).toBe(false)
    expect(host.list().find((item) => item.id === 'dependent')?.status).toBe('dependency_missing')
  })

  it('activates dependencies before dependents and fails closed when dependency activation fails', async () => {
    const activationOrder: string[] = []
    const dependency: GraphitePlugin = { manifest: { ...manifest, id: 'dependency' }, async activate() { activationOrder.push('dependency'); throw new Error('Dependency failed.') } }
    const dependent: GraphitePlugin = {
      manifest: { ...manifest, id: 'dependent', dependencies: [{ id: 'dependency', version: '^1.0.0' }] },
      async activate() { activationOrder.push('dependent') },
    }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: memoryState() })
    await host.load([dependent, dependency])

    expect(activationOrder).toEqual(['dependency'])
    expect(host.list().find((item) => item.id === 'dependency')?.status).toBe('activation_failed')
    expect(host.list().find((item) => item.id === 'dependent')?.status).toBe('dependency_missing')
  })

  it('fails a dependency cycle closed without activating either plugin', async () => {
    let activations = 0
    const first: GraphitePlugin = { manifest: { ...manifest, id: 'first', dependencies: [{ id: 'second', version: '^1.0.0' }] }, async activate() { activations++ } }
    const second: GraphitePlugin = { manifest: { ...manifest, id: 'second', dependencies: [{ id: 'first', version: '^1.0.0' }] }, async activate() { activations++ } }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: memoryState() })
    await host.load([first, second])

    expect(activations).toBe(0)
    expect(host.list().map((item) => item.status)).toEqual(['dependency_missing', 'dependency_missing'])
  })

  it('disables active dependents before their dependency', async () => {
    const disposalOrder: string[] = []
    const dependency: GraphitePlugin = {
      manifest: { ...manifest, id: 'dependency' },
      async activate() { return () => { disposalOrder.push('dependency') } },
    }
    const dependent: GraphitePlugin = {
      manifest: { ...manifest, id: 'dependent', dependencies: [{ id: 'dependency', version: '^1.0.0' }] },
      async activate() { return () => { disposalOrder.push('dependent') } },
    }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() {} }, stateBackend: memoryState() })
    await host.load([dependent, dependency])

    await host.disable('dependency')

    expect(disposalOrder).toEqual(['dependent', 'dependency'])
    expect(host.list().find((item) => item.id === 'dependent')?.status).toBe('disabled')
    expect(host.list().find((item) => item.id === 'dependency')?.status).toBe('disabled')
  })
})

describe('GMD-003/S1 R3 capability mediation', () => {
  it('permits declared opaque operations and normalizes undeclared or raw-path denial', async () => {
    const broker = createCapabilityBroker(manifest, { async perform(operation) { return { resource: operation.resource, healthy: true } } })
    await expect(broker.perform({ permission: 'status:read', resource: resourceId('workspace-root') })).resolves.toEqual({ resource: 'workspace-root', healthy: true })
    await expect(broker.perform({ permission: 'workspace:write', resource: resourceId('workspace-root') })).rejects.toMatchObject({ code: 'plugin_capability_denied', reason: 'undeclared' })
    expect(() => resourceId('/Users/private')).toThrow(PluginCapabilityDenied)
    await expect(broker.perform({ permission: 'status:read', resource: '/Users/private' as never })).rejects.toMatchObject({ reason: 'invalid_resource' })
  })

  it('exposes a bounded model-session only through declared service-owned capabilities', async () => {
    const operations: unknown[] = []
    const assistantManifest: PluginManifest = {
      ...manifest,
      id: 'assistant',
      permissions: ['assistant:model-session', 'workspace:search', 'workspace:read'],
    }
    const broker = createCapabilityBroker(assistantManifest, {
      async perform(operation) {
        operations.push(operation)
        if (operation.permission === 'assistant:model-session') return { turnId: 'turn_alpha', conversationId: 'conv_alpha', status: 'completed', question: 'What changed?', provider: 'openai-codex', model: 'gpt-5.4', createdAt: '2026-07-19T12:00:00.000Z', completedAt: '2026-07-19T12:00:02.000Z', answer: 'Nothing yet.', error: null, sources: [] }
        if (operation.permission === 'workspace:search') return { results: [] }
        return { resourceId: operation.resource, displayPath: 'Notes/Alpha.md', source: '# Alpha', revision: 'rev_alpha', yamlProperties: [], yamlParseError: null }
      },
    })
    const assistant = createAssistantCapabilities(broker)

    await expect(assistant.runModelSession({
      conversationId: 'conv_alpha', question: 'What changed?',
      policy: { prompt: 'Answer only from read workspace notes.', tools: ['workspace_search', 'workspace_read'] },
    })).resolves.toMatchObject({ turnId: 'turn_alpha', status: 'completed' })
    await expect(assistant.search({ query: 'GraphiteMD', limit: 4 })).resolves.toEqual({ results: [] })
    await expect(assistant.read(resourceId('res_alpha'))).resolves.toMatchObject({ resourceId: 'res_alpha' })
    expect(operations).toEqual([
      expect.objectContaining({ permission: 'assistant:model-session', resource: 'assistant', input: {
        conversationId: 'conv_alpha', question: 'What changed?',
        policy: { prompt: 'Answer only from read workspace notes.', tools: ['workspace_search', 'workspace_read'] },
      } }),
      expect.objectContaining({ permission: 'workspace:search', resource: 'workspace', input: { query: 'GraphiteMD', limit: 4 } }),
      expect.objectContaining({ permission: 'workspace:read', resource: 'res_alpha' }),
    ])
  })

  it('fails closed when an Assistant capability is not declared', async () => {
    const assistant = createAssistantCapabilities(createCapabilityBroker(manifest, { async perform() { return undefined } }))
    await expect(assistant.runModelSession({
      question: 'What changed?', policy: { prompt: 'Ground answers.', tools: ['workspace_search'] },
    })).rejects.toMatchObject({ code: 'plugin_capability_denied', reason: 'undeclared' })
  })
})

describe('GMD-004/S2 R1-S1 Assistant context handler', () => {
  const question: AssistantQuestion = { question: 'What changed?' }
  const sessionResult = { turnId: 'turn_alpha', conversationId: 'conv_alpha', status: 'completed' as const, question: 'What changed?', provider: 'openai-codex' as const, model: 'gpt-5.4', createdAt: '2026-07-20T12:00:00.000Z', completedAt: '2026-07-20T12:00:01.000Z', answer: 'Nothing yet.', error: null, sources: [] }

  it('registers one declared Context handler and removes it when disabled', async () => {
    const handler = vi.fn(async () => sessionResult)
    const assistantPlugin: GraphitePlugin = {
      manifest: {
        ...manifest, id: 'assistant', permissions: ['assistant:model-session', 'workspace:search', 'workspace:read'],
        contributions: { views: [{ id: 'assistant-context', title: 'Assistant' }] },
      },
      async activate(context) { context.registerAssistantQuestionHandler(handler) },
    }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() { return sessionResult } }, stateBackend: memoryState() })
    await host.load([assistantPlugin])
    await expect(host.dispatchAssistantQuestion(question)).resolves.toEqual({ kind: 'handled', turn: sessionResult })
    await host.disable('assistant')
    await expect(host.dispatchAssistantQuestion(question)).resolves.toEqual({ kind: 'unavailable' })
  })

  it('refuses an undeclared assistant Context owner and sanitizes duplicate handler failures', async () => {
    const noView: GraphitePlugin = {
      manifest: { ...manifest, id: 'no-view', permissions: ['assistant:model-session', 'workspace:search', 'workspace:read'] },
      async activate(context) { context.registerAssistantQuestionHandler(async () => sessionResult) },
    }
    const first: GraphitePlugin = {
      manifest: { ...manifest, id: 'first', permissions: ['assistant:model-session', 'workspace:search', 'workspace:read'], contributions: { views: [{ id: 'assistant-context', title: 'Assistant' }] } },
      async activate(context) { context.registerAssistantQuestionHandler(async () => sessionResult) },
    }
    const duplicate: GraphitePlugin = {
      manifest: { ...manifest, id: 'duplicate', permissions: ['assistant:model-session', 'workspace:search', 'workspace:read'], contributions: { views: [{ id: 'assistant-context', title: 'Assistant' }] } },
      async activate(context) { context.registerAssistantQuestionHandler(async () => sessionResult) },
    }
    const host = new PluginHost({ hostVersion: '1.0.0', enabled: {}, provider: { async perform() { return sessionResult } }, stateBackend: memoryState() })
    await host.load([noView, first, duplicate])
    expect(host.list().find((item) => item.id === 'no-view')).toMatchObject({ status: 'activation_failed' })
    expect(host.list().find((item) => item.id === 'duplicate')).toMatchObject({ status: 'activation_failed' })
    await expect(host.dispatchAssistantQuestion({ question: '   ' })).resolves.toEqual({ kind: 'denied' })
  })
})

describe('GMD-003/S1 R4 namespaced state', () => {
  it('binds state access to one namespace and commits versioned values transactionally', async () => {
    const backend = memoryState()
    const system = createPluginStateAdapter('system-status', 1, backend)
    const other = createPluginStateAdapter('other-plugin', 1, backend)
    await system.write({ lastCheck: 'ok' })
    expect(system.namespace).toBe('.graphitemd/plugins/system-status/')
    await expect(system.read()).resolves.toEqual({ lastCheck: 'ok' })
    await expect(other.read()).resolves.toBeUndefined()
    expect(backend.values.get('system-status')).toEqual({ schemaVersion: 1, value: { lastCheck: 'ok' } })
    await expect(system.recoveryStatus()).resolves.toBe('clean')
  })
})
