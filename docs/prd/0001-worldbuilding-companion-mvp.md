# Worldbuilding Companion MVP PRD

## Problem Statement

Writers, tabletop RPG creators, and game lore creators often keep their worldbuilding in Notion because it is flexible, familiar, and already part of their workflow. Over time, that flexibility becomes a liability: Characters, Locations, Factions, Events, Lore Entries, Relationships, and Sources spread across pages and databases without a consistent Canon model.

The creator needs help shaping, checking, and navigating a Canon without giving up Notion as the canonical source of their work. They also need AI assistance that helps them understand gaps and inconsistencies without silently inventing or changing lore on their behalf.

## Solution

Build a single-user, local web app companion for Notion-first worldbuilding. The app creates and maintains a minimal owned Notion structure for a Canon, syncs it into a local Postgres sidecar database, and provides a Canon Dashboard, Entity Workspace, Review Queue, and diagnostic AI actions.

The MVP focuses on structured worldbuilding and trust. Notion remains the canonical source. The companion app keeps derived state such as sync metadata, indexes, review items, diagnostic outputs, and analysis state. AI actions in the MVP are diagnostic only: Summarize Entity, Find Gaps, and Consistency Check. AI output must enter the Review Queue before it can affect the Canon or be written back to Notion.

## User Stories

1. As a creator, I want to connect my Notion workspace with an internal Notion integration, so that the companion app can work with my existing worldbuilding environment.
2. As a creator, I want to create a Canon from the app, so that my worldbuilding has a coherent top-level body of truth.
3. As a creator, I want the app to create a minimal Notion structure for my Canon, so that I do not have to design databases manually before writing.
4. As a creator, I want separate Notion databases for Characters, Locations, Factions, Events, Lore Entries, Relationships, and Sources, so that the Notion workspace remains usable directly.
5. As a creator, I want Characters to be first-class Canon elements, so that protagonists, NPCs, deities, creatures, and other named actors are easy to manage.
6. As a creator, I want Locations to be first-class Canon elements, so that places, regions, structures, realms, planets, and other spatial settings are easy to manage.
7. As a creator, I want Factions to be first-class Canon elements, so that empires, guilds, cults, governments, armies, schools, clans, and similar groups have clear identity and membership.
8. As a creator, I want Events to be first-class Canon elements, so that wars, betrayals, deaths, rituals, discoveries, journeys, battles, and session events can be tracked.
9. As a creator, I want Lore Entries to represent typed worldbuilding details, so that species, cultures, religions, magic systems, technologies, artifacts, languages, customs, and laws do not become miscellaneous notes.
10. As a creator, I want each Lore Entry to have a subtype, so that the Canon stays specific without creating too many databases too early.
11. As a creator, I want Sources to be first-class Canon elements, so that important details can point back to their origin.
12. As a creator, I want Relationships to be first-class Canon elements, so that the app captures what a connection means rather than only linking two pages.
13. As a creator, I want Relationship types such as Member Of, Located In, Allied With, Opposed To, Related To, Created By, Rules Over, and Participated In, so that common worldbuilding connections are explicit.
14. As a creator, I want each Relationship to support a description and Sources, so that nuanced connections can be explained and traced.
15. As a creator, I want to open a Canon Dashboard, so that I can see the current shape of my Canon at a glance.
16. As a creator, I want the Canon Dashboard to show counts and recent activity for major Canon element types, so that I can understand what areas are developed or sparse.
17. As a creator, I want to browse Characters, Locations, Factions, Events, Lore Entries, Relationships, and Sources from the app, so that I can navigate my Canon without manually hunting through Notion.
18. As a creator, I want to open an Entity Workspace for a Canon element, so that I can focus on its summary, fields, Relationships, Sources, and diagnostic findings.
19. As a creator, I want the Entity Workspace to show meaningful Relationships, so that I can understand how a Character, Location, Faction, Event, or Lore Entry fits into the Canon.
20. As a creator, I want the Entity Workspace to show Sources, so that I can trace where information came from.
21. As a creator, I want to trigger Summarize Entity, so that I can get a concise diagnostic summary of an existing Canon element.
22. As a creator, I want to trigger Find Gaps, so that I can see missing or weak areas in a Canon element without the app inventing content.
23. As a creator, I want to trigger Consistency Check, so that I can find contradictions, uncertain details, or suspicious mismatches in my Canon.
24. As a creator, I want AI output to appear in a Review Queue, so that nothing changes the Canon without my approval.
25. As a creator, I want to accept a Review Queue item, so that an approved summary, finding, or proposed change can affect the Canon.
26. As a creator, I want to reject a Review Queue item, so that unwanted AI output does not pollute the Canon.
27. As a creator, I want to see why a Review Queue item was created, so that I can judge whether it is useful.
28. As a creator, I want rejected Review Queue items to remain auditable at least locally, so that repeated diagnostics can avoid surfacing the same rejected suggestion without context.
29. As a creator, I want the app to sync Notion data into a local sidecar database, so that dashboards and diagnostics can run without repeatedly querying Notion for every view.
30. As a creator, I want sync state to be visible, so that I know whether the app is working with fresh or stale Notion data.
31. As a creator, I want sync failures to be understandable, so that I can fix missing permissions, deleted pages, schema drift, or rate limit issues.
32. As a creator, I want the app to preserve Notion as the canonical source, so that my lore remains accessible even if I stop using the companion app.
33. As a creator, I want the app to store only derived state in Postgres, so that the companion app does not become a hidden source of truth for lore.
34. As a creator, I want the local app to run in the browser, so that I can use a rich dashboard without installing a desktop app during the MVP.
35. As a creator, I want configuration for Notion and AI providers to be local, so that the MVP can stay single-user and private.
36. As a creator, I want AI model/provider selection to be configurable, so that I am not locked into one model vendor.
37. As a creator, I want the app to avoid freeform AI chat as the primary experience, so that worldbuilding remains grounded in the Canon structure.
38. As a creator, I want image generation to be deferred, so that the MVP first proves structured worldbuilding and diagnostic value.
39. As a creator, I want future graph visualization to be based on evidence from a spike, so that the app does not choose an unsuitable graph library too early.
40. As a developer, I want a clear domain glossary, so that implementation language matches the product's worldbuilding model.
41. As a developer, I want ADRs for major decisions, so that future implementation work respects decisions already made.
42. As a developer, I want a deep sync module with a stable interface, so that Notion API complexity does not leak into UI code.
43. As a developer, I want a deep diagnostic AI module with a stable interface, so that provider/model changes do not affect the domain model.
44. As a developer, I want a deep Review Queue module with a stable interface, so that approval rules remain consistent across the app.
45. As a developer, I want Effect to be limited to service-layer workflows that justify it, so that the codebase gains typed failures and retries without making UI code unnecessarily complex.

## Implementation Decisions

- The product is scoped to fictional worldbuilding for writers, tabletop RPG creators, and game lore creators. It is not a general-purpose study system or generic note-taking tool.
- The top-level domain concept is Canon. World is a setting entity inside a Canon, not the root container.
- Notion is the initial canonical source for the Canon. The companion app keeps derived state only.
- The MVP uses an owned minimal Notion structure rather than inferring arbitrary user layouts.
- The Notion structure uses separate databases for Characters, Locations, Factions, Events, Lore Entries, Relationships, and Sources.
- The sidecar database uses Postgres from the MVP.
- The app is a single-user MVP, not a multi-user SaaS.
- The app runs as a local web app opened in the browser.
- The app uses an internal Notion integration for the MVP rather than public OAuth.
- The app uses TypeScript across the stack.
- The app uses Next.js as a full-stack local app. SSR and SEO are not product requirements; the value is co-locating UI, server routes/actions, Notion SDK access, Drizzle/Postgres access, and AI calls.
- The app uses Tailwind and shadcn for UI.
- The app uses Drizzle ORM for Postgres schema and migrations.
- The app uses the official Notion SDK for Notion integration.
- The app uses Vercel AI SDK behind an application-owned diagnostic service, not directly throughout the codebase.
- Effect is adopted only in the service layer where failure modes, retries, cancellation, concurrency, configuration, logging, or typed errors justify the complexity.
- Effect is not used in React components, UI state, simple CRUD, or ordinary rendering paths by default.
- Relationships are first-class Canon elements rather than simple relation properties or page links.
- Initial Relationship types are Member Of, Located In, Allied With, Opposed To, Related To, Created By, Rules Over, and Participated In.
- Lore Entry is a generic typed Canon element with a required subtype. Initial subtypes should include Species, Culture, Religion, Magic System, Technology, Artifact, Language, Custom, Law, and Other.
- Faction represents an organized group with identity, goals, and membership boundary. A religion as an institution is a Faction; a religion as doctrine is a Lore Entry.
- Event represents a meaningful occurrence in the Canon. Timeline is a derived view over Events, not a separate Canon element in the MVP.
- Claim is explicitly deferred from the MVP. Individual factual assertions remain embedded in entity fields and descriptions until contradiction analysis needs a more granular evidence model.
- The MVP experience centers on Canon Dashboard and Entity Workspace rather than freeform AI chat or image generation.
- MVP AI actions are Summarize Entity, Find Gaps, and Consistency Check.
- Draft Expansion, Suggest Relationships, Generate Image Brief, and image generation are deferred.
- AI output must enter the Review Queue before affecting the Canon or being written back to Notion.
- The graph visualization library is not chosen yet. A later spike will compare Sigma.js with Graphology, Cytoscape.js, and React Flow.

Major modules to build:

- Canon Domain Model: defines Canon element types, Relationship types, Lore Entry subtypes, statuses, and validation rules. This should be a deep module with no Notion or UI dependency.
- Notion Schema Provisioner: creates and verifies the required Notion databases and properties for a Canon.
- Notion Sync Engine: reads Notion databases, maps Notion pages/blocks/properties into the Canon model, detects schema drift, records sync state, and handles failures.
- Sidecar Persistence: owns Postgres schema, Drizzle migrations, repositories, and transaction boundaries for Canon elements, sync metadata, Review Queue items, and diagnostic outputs.
- Canon Dashboard Service: produces aggregate dashboard data from the sidecar database.
- Entity Workspace Service: loads a Canon element with Relationships, Sources, diagnostics, and review state.
- Diagnostic Model Service: wraps Vercel AI SDK and exposes Summarize Entity, Find Gaps, and Consistency Check through provider-agnostic interfaces.
- Diagnostic Output Validator: validates AI responses before they become Review Queue items.
- Review Queue Service: creates, lists, accepts, rejects, and records review decisions for AI-produced outputs.
- Local Configuration Module: loads and validates Notion tokens, database IDs, AI provider settings, model choices, and Postgres configuration.
- App UI Shell: provides local navigation, Canon Dashboard, Entity Workspace, setup screens, sync state, and Review Queue surfaces.

## Testing Decisions

- Tests should verify external behavior and domain contracts, not implementation details.
- The Canon Domain Model should have focused unit tests for valid and invalid Canon elements, Relationship types, Lore Entry subtypes, and terminology boundaries.
- The Notion Schema Provisioner should have tests against mocked Notion API responses to verify the app creates or validates the expected databases and properties.
- The Notion Sync Engine should have tests for mapping Notion pages into Canon elements, handling missing permissions, handling deleted pages, handling schema drift, and avoiding duplicate records on repeated sync.
- The Sidecar Persistence module should have integration tests against Postgres for migrations, constraints, transactions, and repository behavior.
- The Diagnostic Model Service should have tests using fake providers to verify model selection, prompt boundaries, typed failures, and provider errors.
- The Diagnostic Output Validator should have unit tests for valid, malformed, incomplete, and unsafe AI outputs.
- The Review Queue Service should have tests for create, accept, reject, idempotency, and write-back boundaries.
- The Canon Dashboard Service should have tests for aggregate outputs based on controlled sidecar data.
- The Entity Workspace Service should have tests that ensure related entities, Sources, diagnostics, and review state are loaded consistently.
- UI tests should cover the core user flows once the app exists: initial setup, sync, dashboard navigation, entity opening, diagnostic action, Review Queue accept/reject.
- There is no prior application test suite in this new project yet, so initial test conventions should be established with the first implementation slice.

## Out of Scope

- Multi-user SaaS behavior.
- Billing, subscriptions, or usage plans.
- Public Notion OAuth onboarding.
- Collaboration between multiple creators.
- Desktop packaging with Electron or Tauri.
- CLI or TUI interfaces.
- Obsidian plugin support.
- Generic study, history, or personal knowledge management use cases outside fictional worldbuilding.
- Arbitrary import/adaptation from any existing Notion layout.
- Claim as a first-class Canon element.
- Freeform AI chat as the primary experience.
- AI co-authoring as an MVP feature.
- Draft Expansion.
- Suggest Relationships.
- Generate Image Brief.
- Real image generation.
- Choosing the graph visualization library before a spike.
- Full graph visualization if it would require choosing the graph library before the schema is proven.
- Timeline as a stored Canon element.
- Production hosting, tenant isolation, and deployment automation.

## Further Notes

The PRD assumes a trust-first product posture: the creator owns the Canon, Notion remains the canonical source, and AI helps diagnose rather than write the world. This should shape copy, UX, prompts, and defaults.

The MVP should be built in vertical slices. A sensible first slice is local app setup, Postgres/Drizzle, local config, and Notion schema provisioning for one Canon. A second slice can add sync and dashboard read models. A third slice can add Entity Workspace and Relationships. A fourth slice can add diagnostic AI and Review Queue behavior.

The graph library should be evaluated only after real Canon data exists in the sidecar database. The spike should compare performance and UX for increasing node counts, filtering by Canon element type, highlighting neighborhoods, opening entities from nodes, and displaying Relationship types.

The issue tracker has not been configured for this new project yet, so this PRD is stored as a local project document. When an issue tracker is configured, this PRD can be published or broken into `ready-for-agent` implementation issues.
