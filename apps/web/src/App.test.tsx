import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

const workspace = {
  available: true,
  workspaceId: 'wrk_primary',
  notes: [
    { kind: 'note', resourceId: 'res_alpha', displayPath: 'Alpha.md' },
    { kind: 'note', resourceId: 'res_roadmap', displayPath: 'Areas/Roadmap.md' },
  ],
  inventory: [
    { kind: 'folder', displayPath: 'Areas' },
    { kind: 'note', resourceId: 'res_roadmap', displayPath: 'Areas/Roadmap.md' },
    { kind: 'note', resourceId: 'res_alpha', displayPath: 'Alpha.md' },
  ],
}

function response(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  }))
}

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('GMD-002/S1 responsive browse shell', () => {
  it('R2-S1 presents a deterministic accessible tree with selection and collapse', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => response(200, { owner: { id: 'owner' } }))
      .mockImplementationOnce(() => response(200, workspace)))
    const user = userEvent.setup()

    render(<App />)

    const tree = await screen.findByRole('tree', { name: 'Workspace files' })
    expect(within(tree).getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Areas'),
      expect.stringContaining('Roadmap'),
      expect.stringContaining('Alpha'),
    ])

    await user.click(within(tree).getByRole('treeitem', { name: /Roadmap/ }))
    expect(within(tree).getByRole('treeitem', { name: /Roadmap/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Roadmap', level: 1 })).toBeVisible()

    await user.click(within(tree).getByRole('treeitem', { name: /Areas/ }))
    expect(within(tree).queryByRole('treeitem', { name: /Roadmap/ })).not.toBeInTheDocument()
  })

  it('R2-S3 keeps files, search, context, and settings reachable in an empty workspace', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => response(200, { owner: { id: 'owner' } }))
      .mockImplementationOnce(() => response(200, { ...workspace, notes: [], inventory: [] })))

    render(<App />)

    expect(await screen.findByText('This workspace has no Markdown notes yet.')).toBeVisible()
    expect(screen.getAllByRole('button', { name: 'Files' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Search' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Context' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Settings' }).length).toBeGreaterThan(0)
  })

  it('R4-S2 opens keyboard-accessible narrow-layout drawers and closes them with Escape', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => response(200, { owner: { id: 'owner' } }))
      .mockImplementationOnce(() => response(200, workspace)))
    const user = userEvent.setup()

    render(<App />)
    await screen.findByRole('tree', { name: 'Workspace files' })
    await user.click(screen.getByTestId('mobile-files'))

    const drawer = screen.getByRole('dialog', { name: 'Files' })
    expect(drawer).toBeVisible()
    expect(within(drawer).getByRole('button', { name: 'Close Files' })).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Files' })).not.toBeInTheDocument())
  })

  it('returns an expired session to an honest login state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(() => response(401, {
      error: { code: 'unauthenticated', message: 'Authentication required.' },
    })))

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Sign in to GraphiteMD' })).toBeVisible()
    expect(screen.getByText('Your session has expired. Sign in again to continue.')).toBeVisible()
  })
})
