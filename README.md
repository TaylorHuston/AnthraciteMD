# GraphiteMD

GraphiteMD is a self-hostable, document-native AI workbench built around user-controlled Markdown workspaces. A persistent service owns filesystem and agent authority, while responsive browser clients provide editing, search, navigation, conversation, and proposal review without copying the workspace onto every device.

The product is designed around four durable promises:

- Markdown and inspectable local files remain authoritative.
- The editor remains useful without an AI provider.
- AI reads and actions pass through visible, bounded capabilities.
- A minimal core can grow through constrained plugins without granting extensions unrestricted process or filesystem access.

## Repository Status

This is the new canonical repository with fresh history. It currently contains the portable SDD identity and accepted architecture decisions; application scaffolding will be introduced through a planned foundation Change.

## Architecture Decisions

- [Service-first web architecture](docs/adrs/2026-07-18-service-first-web-architecture.md)
- [Capability-mediated plugin platform](docs/adrs/2026-07-18-capability-mediated-plugin-platform.md)
- [Filesystem-canonical workspace state](docs/adrs/2026-07-18-filesystem-canonical-workspace-state.md)
- [Proposal-first agent authority](docs/adrs/2026-07-18-proposal-first-agent-authority.md)

Epics and Stories will remain authoritative for implemented behavior. ADRs explain the cross-cutting technical constraints future implementation must respect.
