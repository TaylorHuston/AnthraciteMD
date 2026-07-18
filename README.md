# GraphiteMD

GraphiteMD is a self-hostable, document-native AI workbench built around user-controlled Markdown workspaces. A persistent service owns filesystem and agent authority, while responsive browser clients provide editing, search, navigation, conversation, and proposal review without copying the workspace onto every device.

The product is designed around four durable promises:

- Markdown and inspectable local files remain authoritative.
- The editor remains useful without an AI provider.
- AI reads and actions pass through visible, bounded capabilities.
- A minimal core can grow through constrained plugins without granting extensions unrestricted process or filesystem access.

## Repository Status

The foundation monorepo is active. AdonisJS owns the service boundary, React/Vite is the browser adapter, and framework-neutral packages own contracts, domain rules, workspace operations, and plugin interfaces.

## Development

Requires Node.js 24 or newer and pnpm 11.5.2.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

`pnpm dev` runs the service on `http://127.0.0.1:3333` and the web client on `http://127.0.0.1:5173`. The web development server proxies `/api` to the service. Authentication is introduced by a later slice of the active foundation Change; do not expose this walking skeleton outside a trusted development machine yet.

## Packages

- `apps/server`: authoritative AdonisJS service and versioned HTTP adapters.
- `apps/web`: responsive React/Vite browser client.
- `packages/contracts`: runtime-validated public contracts and opaque identities.
- `packages/domain`: framework-neutral application rules.
- `packages/workspace`: server-owned Markdown workspace interfaces.
- `packages/plugin-sdk`: manifest and lifecycle contracts for every plugin.
- `packages/plugin-testkit`: headless plugin conformance helpers.
- `plugins/system-status`: bundled plugin proving the production SDK boundary.

## Architecture Decisions

- [Service-first web architecture](docs/adrs/2026-07-18-service-first-web-architecture.md)
- [Capability-mediated plugin platform](docs/adrs/2026-07-18-capability-mediated-plugin-platform.md)
- [Filesystem-canonical workspace state](docs/adrs/2026-07-18-filesystem-canonical-workspace-state.md)
- [Proposal-first agent authority](docs/adrs/2026-07-18-proposal-first-agent-authority.md)

Epics and Stories will remain authoritative for implemented behavior. ADRs explain the cross-cutting technical constraints future implementation must respect.
