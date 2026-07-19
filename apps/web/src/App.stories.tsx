import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'
import { expect, userEvent, within } from 'storybook/test'
import { App } from './App.js'

const workspace = {
  available: true as const,
  workspaceId: 'wrk_storybook',
  notes: [
    { kind: 'note' as const, resourceId: 'res_welcome', displayPath: 'Welcome.md' },
    { kind: 'note' as const, resourceId: 'res_plan', displayPath: 'Projects/Plan.md' },
  ],
  inventory: [
    { kind: 'note' as const, resourceId: 'res_welcome', displayPath: 'Welcome.md' },
    { kind: 'folder' as const, displayPath: 'Projects' },
    { kind: 'note' as const, resourceId: 'res_plan', displayPath: 'Projects/Plan.md' },
  ],
}

const note = {
  resourceId: 'res_welcome', displayPath: 'Welcome.md',
  source: '---\nstatus: active\n---\n# Welcome\n\nGraphiteMD keeps Markdown authoritative.\n',
  revision: 'rev-storybook', yamlProperties: [{ name: 'status', value: 'active' }], yamlParseError: null,
}

const activePlugin = {
  id: 'system-status', status: 'active',
  manifest: { name: 'System Status', version: '0.1.0', permissions: ['status:read'] },
  contributions: { views: [{ id: 'system-status', title: 'System Status' }] },
}

function handlers(options: { workspace?: typeof workspace; plugins?: unknown[]; searchError?: boolean; note?: typeof note } = {}) {
  return [
    http.get('/api/v1/auth/current', () => HttpResponse.json({ owner: { id: 'owner' } })),
    http.get('/api/v1/workspace', () => HttpResponse.json(options.workspace ?? workspace)),
    http.get('/api/v1/plugins', () => HttpResponse.json({ plugins: options.plugins ?? [activePlugin] })),
    http.get('/api/v1/notes/:resourceId', ({ params }) => HttpResponse.json({ ...(options.note ?? note), resourceId: String(params.resourceId) })),
    http.get('/api/v1/search', () => options.searchError
      ? HttpResponse.json({ error: { code: 'search_unavailable' } }, { status: 503 })
      : HttpResponse.json({ results: [{ resourceId: 'res_plan', title: 'Plan', displayPath: 'Projects/Plan.md', snippet: 'Foundation plan' }] })),
    http.put('/api/v1/plugins/:pluginId', () => HttpResponse.json({ plugin: { ...activePlugin, status: 'disabled', contributions: {} } })),
  ]
}

const meta = {
  title: 'Application/GraphiteMD Workbench', component: App,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof App>
export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  parameters: { msw: { handlers: [http.get('/api/v1/auth/current', async () => { await delay('infinite') })] } },
  play: async ({ canvasElement }) => expect(await within(canvasElement).findByText('Opening your workspace…')).toBeVisible(),
}

export const AuthenticationRequired: Story = {
  parameters: { msw: { handlers: [http.get('/api/v1/auth/current', () => HttpResponse.json({}, { status: 401 }))] } },
  play: async ({ canvasElement }) => expect(await within(canvasElement).findByRole('heading', { name: 'Sign in to GraphiteMD' })).toBeVisible(),
}

export const InvalidCredentials: Story = {
  parameters: { msw: { handlers: [
    http.get('/api/v1/auth/current', () => HttpResponse.json({}, { status: 401 })),
    http.post('/api/v1/auth/login', () => HttpResponse.json({ error: { code: 'invalid_credentials' } }, { status: 401 })),
  ] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByLabelText('Password'), 'not the password')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent('The password was not accepted.')
  },
}

export const AuthenticationPending: Story = {
  parameters: { msw: { handlers: [
    http.get('/api/v1/auth/current', () => HttpResponse.json({}, { status: 401 })),
    http.post('/api/v1/auth/login', async () => { await delay('infinite') }),
  ] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByLabelText('Password'), 'pending passphrase')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await expect(canvas.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
  },
}

export const SessionExpired: Story = {
  parameters: { msw: { handlers: [
    http.get('/api/v1/auth/current', () => HttpResponse.json({ owner: { id: 'owner' } })),
    http.get('/api/v1/workspace', () => HttpResponse.json({}, { status: 401 })),
  ] } },
  play: async ({ canvasElement }) => expect(await within(canvasElement).findByText('Your session has expired. Sign in again to continue.')).toBeVisible(),
}

export const EmptyWorkspace: Story = {
  parameters: { msw: { handlers: handlers({ workspace: { ...workspace, notes: [], inventory: [] } }) } },
  play: async ({ canvasElement }) => expect(await within(canvasElement).findByText('This workspace has no Markdown notes yet.')).toBeVisible(),
}

export const ServiceError: Story = {
  parameters: { msw: { handlers: [
    http.get('/api/v1/auth/current', () => HttpResponse.json({ owner: { id: 'owner' } })),
    http.get('/api/v1/workspace', () => HttpResponse.json({}, { status: 503 })),
  ] } },
  play: async ({ canvasElement }) => expect(await within(canvasElement).findByRole('heading', { name: 'Workspace unavailable' })).toBeVisible(),
}

export const WorkbenchAndEditor: Story = {
  parameters: { msw: { handlers: handlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Welcome/ }))
    await expect(await canvas.findByRole('heading', { name: 'Welcome', level: 1 })).toBeVisible()
    await expect(canvasElement.querySelector('.markdown-editor')).toBeTruthy()
    await expect(canvas.getByText('Service connected')).toBeVisible()
  },
}

export const MobileWorkbenchWithFilesDrawer: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' }, msw: { handlers: handlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByTestId('mobile-files'))
    const dialog = await canvas.findByRole('dialog', { name: 'Files' })
    await expect(within(dialog).getByRole('button', { name: 'Close Files' })).toHaveFocus()
  },
}

export const LongNoteUsesLiteralSource: Story = {
  parameters: { msw: { handlers: handlers({ note: { ...note, source: 'x'.repeat(200_001) } }) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Welcome/ }))
    await expect(await canvas.findByText('Showing literal source for this note.')).toBeVisible()
  },
}

export const SourceEditorMode: Story = {
  parameters: { msw: { handlers: handlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Welcome/ }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Source' }))
    await expect(canvas.getByRole('button', { name: 'Source' })).toHaveAttribute('aria-pressed', 'true')
  },
}

export const DirtyNoteSaving: Story = {
  parameters: { msw: { handlers: [
    ...handlers(),
    http.put('/api/v1/notes/:resourceId', async () => { await delay('infinite') }),
  ] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Welcome/ }))
    await userEvent.click(await canvas.findByRole('textbox', { name: 'Markdown editor' }))
    await userEvent.keyboard('{End} pending')
    await expect(await canvas.findByText('Saving…')).toBeVisible()
  },
}

export const RevisionConflictRecovery: Story = {
  parameters: { msw: { handlers: [
    ...handlers(),
    http.put('/api/v1/notes/:resourceId', () => HttpResponse.json({ error: { code: 'revision_conflict' } }, { status: 409 })),
  ] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Welcome/ }))
    await userEvent.click(await canvas.findByRole('textbox', { name: 'Markdown editor' }))
    await userEvent.keyboard('{End} conflict')
    await expect(await canvas.findByRole('button', { name: 'Discard draft and reload' }, { timeout: 2_500 })).toBeVisible()
  },
}

export const SearchResults: Story = {
  parameters: { msw: { handlers: handlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Search' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Search' })
    await userEvent.type(within(dialog).getByRole('searchbox'), 'foundation')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Search' }))
    await expect(await within(dialog).findByRole('button', { name: /Plan/ })).toBeVisible()
  },
}

export const SearchError: Story = {
  parameters: { msw: { handlers: handlers({ searchError: true }) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Search' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Search' })
    await userEvent.type(within(dialog).getByRole('searchbox'), 'broken')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Search' }))
    await expect(await within(dialog).findByRole('alert')).toBeVisible()
  },
}

export const SettingsAndPluginLifecycle: Story = {
  parameters: { msw: { handlers: handlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Settings' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Settings' })
    await expect(await within(dialog).findByRole('heading', { name: 'Change password' })).toBeVisible()
    await expect(await within(dialog).findByRole('article', { name: 'System Status plugin' })).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Disable System Status' }))
    await expect(await within(dialog).findByText('Disabled')).toBeVisible()
  },
}

export const PluginValidationFailure: Story = {
  parameters: { msw: { handlers: handlers({ plugins: [{
    id: 'broken-manifest', status: 'invalid', message: 'Manifest validation failed.', contributions: {},
  }] }) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Settings' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Settings' })
    await expect(await within(dialog).findByText('Manifest validation failed.')).toBeVisible()
    await expect(within(dialog).getByText('Invalid')).toBeVisible()
  },
}

export const PluginActivationRecovery: Story = {
  parameters: { msw: { handlers: handlers({ plugins: [{
    id: 'system-status', status: 'activation_failed', message: 'Activation failed. Restart the service after correcting plugin state.',
    manifest: { name: 'System Status', version: '0.1.0', permissions: ['status:read'] }, contributions: {},
  }] }) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Settings' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Settings' })
    await expect(await within(dialog).findByText(/Activation failed/)).toBeVisible()
    await expect(within(dialog).getByText('Activation Failed')).toBeVisible()
  },
}
