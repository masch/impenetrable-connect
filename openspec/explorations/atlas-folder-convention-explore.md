## Exploration: .atl/ folder conventions for impenetrable-connect

### Current State

The `.atl/` folder contains:

- `skill-registry.md` (220 lines) — Auto-generated skill registry with compact rules
- `.skill-registry.cache.json` (3 lines) — Fingerprint/cache file

The `skill-registry.md` includes:

- System-level skills from global skill folders (`~/.config/opencode/skills`, `~/.agents/skills`, etc.)
- User-level skills from project-local `.agent/skills/` (currently empty in this project)
- Trigger-based compact rules for each skill

### Relationship with AGENTS.md

There's already a documented convention from a previous change (ag-standards-integration):

- **AGENTS.md** = Canonical source for Project Standards (read by skill-registry, NEVER written)
- **`.atl/skill-registry.md`** = Auto-generated, may be overwritten on every skill-registry run
- The migration was completed: Project Standards live in AGENTS.md, not in `.atl/skill-registry.md`

### Gentle AI Conventions

1. `.atl/` is the standard location for skill registry in projects
2. Auto-generated via `gentle-ai skill-registry refresh`
3. Convention files (like AGENTS.md) are READ by skill-registry but NEVER written
4. Project-specific standards go in AGENTS.md, not in `.atl/`

### Approaches

| Approach                  | Pros                                         | Cons                                        | Effort |
| ------------------------- | -------------------------------------------- | ------------------------------------------- | ------ |
| **Keep as-is**            | Follows standard convention, works correctly | `.skill-registry.cache.json` is unused      | Low    |
| **Remove cache file**     | Clean up unnecessary file                    | None — cache is auto-regenerated            | Low    |
| **Delete entire `.atl/`** | Removes auto-generated folder                | skill-registry will recreate it on next run | Low    |

### Recommendation

**Keep `.atl/` as-is**, but optionally remove `.skill-registry.cache.json`:

- The folder follows Gentle AI standard convention
- The skill-registry works correctly with AGENTS.md
- The cache file (fingerprint) is not necessary — it's auto-generated on each run
- Deleting the folder entirely won't help since skill-registry will recreate it

### Risks

- **None identified** — The current setup follows conventions correctly
- The `.skill-registry.cache.json` is just a fingerprint for caching purposes and can be ignored

### Ready for Proposal

**No** — This is already the established convention. No change needed unless the user wants to clean up the cache file for aesthetic reasons.
