# AGENTS.md Project Standards Integration Specification

## Overview

This specification defines the migration of Project Standards from `.atl/skill-registry.md` to `AGENTS.md` to prevent loss during skill-registry regeneration.

## Problem Statement

The user's `.atl/skill-registry.md` contains approximately 139 lines of custom Project Standards that get **overwritten** every time the `skill-registry` skill runs during an SDD session. This results in loss of critical project standards including:

- Global Context (project identity, language policy, GPG signing, etc.)
- TypeScript rules (strict typing, immutability, interface-first)
- React & React Native patterns (Button standardization, i18n, accessibility)
- Styling (NativeWind v4)
- Architecture (single source of truth, centralized logging)
- Backend Security (Zero-Direct-Env policy)
- Testing (TDD, coverage requirements)
- Git & Workflow (branching, PR standards)

## Solution

Move Project Standards to `AGENTS.md`, which is a **convention file** that skill-registry reads but **never writes**. The thin registry (`.atl/skill-registry.md`) will contain only the User Skills table, which can be safely regenerated.

---

## 2. Requirements

### 2.1 AGENTS.md Structure Requirements

AGENTS.md MUST contain:

1. **Preserve Existing Content**:
   - All current content (Mission Control, Operational Model sections)
   - Total of 19 lines of existing content

2. **New Project Standards Section**:
   - Full migration of all Project Standards rules (~139 lines)
   - Organized by category:
     - Global Context
     - TypeScript
     - React & React Native
     - Styling (NativeWind v4 + Tailwind v3)
     - UI/UX & Interaction Patterns
     - Architecture & Monorepo
     - Backend Security & Configuration
     - Testing
     - Git & Workflow

### 2.2 Updated Reference

The Mission Control section in AGENTS.md MUST be updated to reflect that Project Standards now live in AGENTS.md:

```markdown
## 🧠 Mission Control

All technical standards, code conventions, and agent skill mappings are centralized in:

- **Project Standards** (rules & conventions): 👉 [AGENTS.md](AGENTS.md)
- **User Skills** (trigger-based): 👉 [.atl/skill-registry.md](.atl/skill-registry.md)
```

### 2.3 Thin Registry (.atl/skill-registry.md)

After migration, `.atl/skill-registry.md` MUST contain:

- Only the "User Skills" table (lines 148-171 of current file)
- Approximately 24 lines
- The "Project Standards" section MUST be removed

### 2.4 Preserve Git History

- The original `.atl/skill-registry.md` content will be backed up by Git history
- No manual backup required since the file is version-controlled

---

## 3. Scenarios

### 3.1 SDD Session After Migration

**Trigger**: User starts a new SDD session

**Expected Behavior**:

1. skill-registry skill runs automatically
2. Regenerates `.atl/skill-registry.md` with fresh User Skills table
3. Project Standards in AGENTS.md remain **untouched**
4. Agent loads standards from AGENTS.md on session start

### 3.2 Manual Skill Registry Update

**Trigger**: User invokes `skill-registry` skill manually

**Expected Behavior**:

1. Skill regenerates `.atl/skill-registry.md` with fresh User Skills
2. AGENTS.md remains intact (skill-registry only reads it)
3. No data loss occurs

### 3.3 Developer Edits Standards

**Trigger**: Developer needs to modify project standards

**Expected Behavior**:

1. Developer edits `AGENTS.md` directly
2. Changes persist through skill-registry regenerations
3. No accidental overwrites

### 3.4 Skill-Registry Detection

**Trigger**: skill-registry skill initializes

**Expected Behavior**:

1. Reads AGENTS.md for Project Standards
2. Reads .atl/skill-registry.md for User Skills
3. Merges both into agent context
4. This behavior already exists - no code changes needed

---

## 4. Technical Specification

### 4.1 Files Affected

| File                     | Action                            | Lines (approx)                    |
| ------------------------ | --------------------------------- | --------------------------------- |
| `AGENTS.md`              | Update + Insert Project Standards | 19 existing + ~139 new = ~158     |
| `.atl/skill-registry.md` | Remove Project Standards section  | Keep only User Skills (~24 lines) |

### 4.2 AGENTS.md Final Structure

```markdown
# Agent Hub

This project uses **Agent Teams Lite (ATL)** and **Spec-Driven Development (SDD)**.

## 🧠 Mission Control

All technical standards, code conventions, and agent skill mappings are centralized in:

- **Project Standards** (rules & conventions): 👉 [AGENTS.md](AGENTS.md)
- **User Skills** (trigger-based): 👉 [.atl/skill-registry.md](.atl/skill-registry.md)

## 🛠️ Operational Model

1. **Specs First**: All changes must be backed by an OpenSpec in `openspec/specs/`.
2. **Auto-Load Skills**: The registry ensures that the AI assistant follows project-specific patterns (NativeWind v4, Drizzle, Hono).
3. **Deployment**: Backend deployment workflow and secrets management are documented in [docs/BACKEND_DEPLOYMENT.md](docs/BACKEND_DEPLOYMENT.md).
4. **Consistency**: Do not add technical rules here. Update the registry instead.

---

_Senior Architect's Note: Keep the brain clean. One source of truth is better than two guesses._

---

## Project Standards

[Full migration of all rules from .atl/skill-registry.md]
```

### 4.3 .atl/skill-registry.md Final Structure

```markdown
# Skill Registry - impenetrable-connect

## User Skills

| Skill       | Trigger                                    | Description                              |
| ----------- | ------------------------------------------ | ---------------------------------------- |
| drizzle-orm | database, schema, migration, @repo/backend | Schema patterns, relations, transactions |

...
```

---

## 5. Acceptance Criteria

- [ ] **AC1**: AGENTS.md contains all Project Standards rules (~139 lines migrated)
- [ ] **AC2**: AGENTS.md still contains original content (Mission Control, Operational Model)
- [ ] **AC3**: AGENTS.md has updated reference explaining where standards live
- [ ] **AC4**: `.atl/skill-registry.md` contains only the User Skills table after migration
- [ ] **AC5**: Skill-registry detects and reads AGENTS.md standards (no code changes - existing behavior)
- [ ] **AC6**: No Project Standards content is lost during migration
- [ ] **AC7**: Git history preserved for both files
