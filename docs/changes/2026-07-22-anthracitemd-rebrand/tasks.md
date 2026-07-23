---
status: in_progress
---
# Tasks: AnthraciteMD Rebrand

## Resume Here

- Last completed action: implemented and verified R1-R4 plus current repository documentation and Epic identity.
- Next action: commit the coherent application candidate, then perform R5 repository/private/SDD topology cutover and rendered verification.
- Expected dirty files: application, tests, current docs/Epics, and this Change folder for the rebrand candidate.
- Known blockers: none.

## Task Checklist

- [x] Planning defines canonical identity, legacy boundaries, migration conflicts, session transition, Epic ownership, topology order, rendered evidence, and aggregate gates.
- [x] R1 canonicalize package scope, SDK types, production condition, UI copy, runtime metadata, tests, and lockfile.
- [x] R2 implement canonical environment variables with legacy fallback and precedence tests.
- [x] R3 implement safe workspace and implicit machine-state migration with conflict/symlink tests.
- [x] R4 migrate auth/session identity, preserve credentials/provider state, invalidate legacy sessions, and test sign-in recovery.
- [ ] R5 reconcile README, changelog, current ADRs, canonical Epics/IDs/directories, current private planning truth, repository guidance, and SDD config.
- [ ] Render desktop/mobile sign-in and workbench identity; inspect accessibility, console, and network state.
- [ ] Run focused and aggregate verification, stale-identifier inventory, reverse traceability, and implementation self-check.
- [ ] Commit each verified phase, record the immutable candidate, transition to `in_review`, and hand off to `/sdd-review`.

## Implementation Ledger

| Date | Slice | Result | Commit / Ref |
|---|---|---|---|
| 2026-07-22 | Replan | Compatibility, migration, auth, topology, and verification obligations resolved. | planning only |
| 2026-07-22 | R1-R4 | Canonical identity, configuration compatibility, safe state migration, and auth transition implemented; combined because package/config/migration imports overlap the same runtime files. | commit pending |

## Verification Ledger

| Date | Check | Evidence Type | Result |
|---|---|---|---|
| 2026-07-22 | `sdd validate` after replan | structural planning gate | pending final run |
| 2026-07-22 | `pnpm lint`; `pnpm typecheck`; `pnpm test` | broad supporting gates | passed; 255 tests across contracts, domain, workspace, SDK, web, bundled plugins, and server |
| 2026-07-22 | `pnpm build`; `pnpm test:storybook`; `pnpm test:e2e`; `pnpm audit --audit-level high` | production build, rendered interaction automation, deterministic E2E, security gate | passed; 31 Storybook tests, 2 E2E tests, no known vulnerabilities |

## Planning Updates

| Date | Discovery | Classification | Planning Updates | Next Apply Starting Point |
|---|---|---|---|---|
| 2026-07-22 | Full rename crosses persistent state, configuration precedence, auth/session identity, SDD ownership, and external topology. | in-scope refinement; technical constraint | Added R1-R5, migration conflict behavior, intentional session invalidation, historical-evidence policy, topology sequencing, and concrete verification. | `/sdd-apply` R1 canonical identity |

## Implementation Risk And Confirmation Matrix

| Requirement / Surface | End-State Invariant | Risk / Failure Mode | Check Needed | Status |
|---|---|---|---|---|
| R1 packages/UI | AnthraciteMD is canonical and all imports/build conditions resolve. | split identity or broken production resolution | package tests, build, stale-name inventory, rendered UI | proved; direct visual inspection pending |
| R2 environment | canonical wins; legacy is fallback only | invalid canonical silently masked or config drift | canonical-only, legacy-only, both-set, invalid-canonical tests | proved |
| R3 state | data migrates atomically without merge/delete/symlink traversal | loss, unsafe traversal, conflicting sources | populated migration plus conflict and symlink tests | proved |
| R4 auth | owner/provider state survives; legacy sessions fail; new login works | lockout or stale trigger/session acceptance | security migration and HTTP auth tests | proved |
| R5 topology | GitHub/local/SDD/private paths agree | broken origin, context, links, or historical evidence | provider query, origin, context, validation, link scan | known |

## Pattern Parity Matrix

| Concern | Reference | New Contract | Proof | Status |
|---|---|---|---|---|
| workspace migration safety | existing `.graphite` -> `.graphitemd` migration | `.graphite` or `.graphitemd` -> `.anthracitemd` | focused workspace tests | pending |
| machine state safety | workspace confinement rules | implicit default-only machine migration | focused security tests | pending |

## Boundary Contract Matrix

| Producer | Boundary | Consumer | Mapping / Invariant | Evidence | Status |
|---|---|---|---|---|---|
| environment | server configuration | workspace/security/web runtime | canonical precedence and exact legacy fallback | focused configuration tests | pending |
| package manifests | Node/pnpm resolution | server/web/plugins/tests | scope and production condition match everywhere | typecheck/build/import-boundary tests | pending |
| security database | session payload/triggers | authenticated routes | new key accepted; old sessions invalid | security and HTTP tests | pending |

## Stateful Transition Matrix

| Start State | Trigger | Expected Invariant | Proof | Result |
|---|---|---|---|---|
| legacy workspace only | first canonical startup | entire directory atomically becomes `.anthracitemd` | workspace migration test | pending |
| canonical plus any legacy | startup | fail without mutation | conflict test | pending |
| legacy machine state | implicit default startup | credentials/provider state move; sessions require re-login | security migration/auth test | pending |

## Decision Fan-Out Ledger

| Date | Decision | Affected Surfaces | Status |
|---|---|---|---|
| 2026-07-22 | Rebrand everything; retain narrow legacy migration/config boundaries and historical evidence. | code, packages, env, persistence, auth, UI, tests, README, changelog, ADRs, Epics, SDD/private topology, GitHub/local path | planned |

## Verification Environment

| Obligation | Required Setup | Readiness | Resolution |
|---|---|---|---|
| migration/auth | disposable workspace, home/state root, and database | ready through test fixtures | pending run |
| rendered identity | local Storybook or production app at desktop/mobile | available | pending run |
| E2E | Playwright disposable roots | available | pending run |
| topology | GitHub CLI plus local filesystem and SDD config | available; run last | pending run |

## Verification Scope Decision

- Aggregate gate required: yes; the change crosses packages, persistence, auth, process-global configuration, UI, SDD truth, and repository topology.
- Authoritative gates: root lint, typecheck, test, build, Storybook, E2E, audit, scoped SDD validation, stale-identifier inventory, and clean prospective integration tree.
- Exact candidate and results: pending implementation commits.
- Remote CI role: corroborating.

## Manual UI Confirmation

- Status: pending user
- Route: sign-in and authenticated workbench.
- Confirm AnthraciteMD name and `A` mark on desktop/mobile, normal sign-in after migration, and no former brand in current UI.
- Defects include old branding outside declared compatibility/history, inaccessible labels, layout regression, or inability to sign in after migration.

## Visual Verification Matrix

| Surface | Viewport | State | Expected | Tool | Result |
|---|---|---|---|---|---|
| sign-in | 1440x900 and 390x844 | default/error | AnthraciteMD name and A mark; unchanged usable layout and accessible labels | Storybook/browser | pending |
| workbench | 1440x900 and 390x844 | populated/settings | AnthraciteMD identity with no layout or interaction change | Storybook/browser | pending |

## Blockers / Open Questions

- None.

## Review Handoff Candidate

- Integration target: `develop`
- Candidate source commit: pending
- Intended implementation committed: pending
- Required risk, fan-out, environment, aggregate, reverse-traceability, and fresh-context self-check gates: pending

## Closeout

- Change status: planned; Apply will later own `in_progress` and `in_review`.
- Epic/current docs/topology reconciliation: pending implementation.
- Review, PR, merge, and closeout: pending.
