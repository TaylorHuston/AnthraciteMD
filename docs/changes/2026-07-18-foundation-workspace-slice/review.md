# Review: Foundation Workspace Slice

## Verdict

changes-requested

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts | pass after safe fixes | System Status scope and cold-resume truth were reconciled. |
| Change status | pass | Returned to `in_progress` for implementation remediation. |
| Epic truth | pass after safe fix | GMD-003 now describes the implemented status contribution. |
| Requirements and Scenarios | findings | Stable accepted workspace identity is not enforced across later reinitialization paths. |
| Story reference traceability | pass | Epic-scoped Story, Requirement, and Scenario identifiers remain unique and current. |
| Reverse traceability | pass | 113 changed candidates audited per affected Epic; zero missing implementation or verification references. |
| Tests and verification | findings | All existing checks pass, but replacement-root coverage misses reauthorization through refresh, workspace retrieval, search rebuild, and first plugin startup. |
| Manual UI confirmation | pending user | Walkthrough is complete and current; confirmation remains intentionally unclaimed. |
| Code review | findings | Accepted workspace identity can be silently replaced in-process. |
| Visual / UX consistency | pass | Required responsive states, interaction previews, accessibility checks, and deterministic E2E pass. |
| Security review | findings | Replacement-root reauthorization permits reads and later mutations against a path the service previously rejected. |
| Documentation | pass after safe fixes | Design, Epic, changelog, task ledger, and Idea front door were reconciled. |
| Idea repository / current-state truth | pass after safe fix | The Idea front door now routes to the remaining remediation. |
| Release communication | pass after safe fix | The changelog no longer overstates System Status health coverage. |
| Branch and merge readiness | blocked | Branch and conflict state are clean, but the blocking authority defect and pending manual acceptance prevent integration. |
| PRD alignment | pass | Scope remains within the accepted foundation boundary. |

## Findings

### BLOCKING

- [ ] `packages/workspace/src/index.ts#ConfiguredWorkspaceAuthority.current/refresh`, `apps/server/start/routes.ts#GET /api/v1/workspace`, `apps/server/app/plugins/plugin_runtime_service.ts#PluginRuntimeService.start` - After an accepted workspace root is replaced, `current()` reports `identity_changed` but clears the accepted handle; later refresh, authenticated workspace retrieval, or first plugin startup can call `openConfigured()` and silently provision and authorize the replacement path. The service then exposes replacement notes and permits later search/plugin/workspace mutations there. Preserve the accepted identity after loss and fail closed until service restart or an explicit host-authorized reconfiguration; add deterministic coverage for every reopening path.

### REQUIRED

- [ ] User manual terminal, visual/device, and screen-reader confirmation remains pending after the implementation defect is remediated and rereviewed.

### SUGGESTION

- [ ] Track the existing 812 KB initial browser chunk and Node `module.register()` deprecation outside this correctness gate.

## Verification Evidence

| Command / Scenario | Evidence Type | Requirement / Scenario | Result | What It Proves |
|---|---|---|---|---|
| `sdd validate graphitemd --change 2026-07-18-foundation-workspace-slice ... --json` | broad supporting gate | all affected Epics | pass, zero errors/warnings | Canonical artifacts and references are structurally valid. |
| Per-Epic `sdd_orphan_audit.py . --epic GMD-00N --changed-from develop --format json` | reverse traceability | GMD-001, GMD-002, GMD-003 | pass | 113 candidates per pass; zero broken implementation or verification references. |
| `pnpm lint && pnpm typecheck && pnpm test && pnpm build` | focused and broad automated evidence | mapped Scenarios | pass | Contracts 6, domain 4, plugin SDK 7, workspace 30, web 44, System Status 1, and server 60 tests pass and production artifacts build. |
| `pnpm test:storybook` | component/accessibility evidence | GMD-001..003 UI states | 30/30 pass | Required deterministic component states and configured accessibility checks pass. |
| `pnpm test:e2e` | deterministic E2E | foundation owner paths | 2/2 pass | Compiled same-origin desktop and 390x844 flows pass. |
| `pnpm audit --prod --audit-level=high` | dependency security | production dependencies | pass | No known vulnerabilities reported. |
| Replacement-root adversarial probe against `514e15f` | focused adversarial evidence | GMD-002/S1 R1-S1/R1-S2 | reproduced | `current()` reports `identity_changed`, then `refresh()` adopts a new workspace ID and inventories `Replacement.md`. |

## Review Bundle

- Source branch/ref: `change/foundation-workspace-slice`
- Reviewed source commit: `514e15fbcee18824d902db4344b93f218499bbff`
- Target branch/ref: `develop` at `15901773ce4565c4facfc7c50d1835463ef808c8`
- Merge base: `15901773ce4565c4facfc7c50d1835463ef808c8`
- Source-only commits: 36
- Target-only commits: 0
- Changed files: 113
- Conflict check: clean; merge tree `a0a968f2d06de084f8602acf4dc7021228420159`
- Dirty state: clean at discovery; only review reconciliation files changed afterward.
- Branch policy: correct `change/*` source targeting non-production `develop`; no PR, merge, or closeout authorized.

## Consolidated Remediation

- Safe-fix batch: narrowed System Status claims in design, Epic, and changelog; corrected Change resume state and private Idea current-state routing.
- Deferred implementation: preserve accepted workspace identity after replacement and deny every implicit reopening path, with focused regression tests.
- Regression rereview: documentation validation and diff hygiene rerun after safe fixes; no application code changed.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- PR status: none; routine local integration does not require one.
- Merge status: blocked by the workspace identity defect and pending user acceptance.
- Closeout status: not authorized and not eligible.

## Review Log

- 2026-07-18: Initial deep review; verdict `changes-requested`.
- 2026-07-19: Rereview found additional adversarial and contract/experience findings; verdict `changes-requested`.
- 2026-07-19: Fresh review against `514e15f`; all automated gates passed, but replacement-root reauthorization remains blocking. Safe documentation truth fixes applied and Change returned to `in_progress`.
