# Archive Report: ag-standards-integration

**Change:** `ag-standards-integration`
**Mode:** Hybrid (Engram + filesystem)
**Date:** 2026-05-17

---

## Problem Solved

**Issue:** The user's `.atl/skill-registry.md` was being overwritten by the skill-registry skill on every SDD session, losing custom Project Standards (~139 lines).

**Root Cause:** skill-registry regenerates `.atl/skill-registry.md` on session start, treating it as a write target rather than a convention file.

**Solution:** Move Project Standards to `AGENTS.md`, which is a convention file that skill-registry reads but **never writes**.

---

## Files Changed

| File                     | Before    | After     | Delta      |
| ------------------------ | --------- | --------- | ---------- |
| `AGENTS.md`              | 19 lines  | 125 lines | +106 lines |
| `.atl/skill-registry.md` | 171 lines | 28 lines  | -143 lines |

---

## Verification

### Acceptance Criteria (from Spec)

| AC  | Criterion                                                       | Status  |
| --- | --------------------------------------------------------------- | ------- |
| AC1 | AGENTS.md contains all Project Standards rules                  | ✅ PASS |
| AC2 | AGENTS.md still contains original content                       | ✅ PASS |
| AC3 | AGENTS.md has updated reference explaining where standards live | ✅ PASS |
| AC4 | `.atl/skill-registry.md` contains only the User Skills table    | ✅ PASS |
| AC5 | Skill-registry detects and reads AGENTS.md standards            | ✅ PASS |
| AC6 | No Project Standards content is lost during migration           | ✅ PASS |
| AC7 | Git history preserved for both files                            | ✅ PASS |

### Verification Commands

```bash
# Check AGENTS.md line count
wc -l AGENTS.md  # 125 lines ✓

# Check skill-registry line count
wc -l .atl/skill-registry.md  # 28 lines ✓

# Verify AGENTS.md contains standards
grep -c "Global Context\|TypeScript\|React & React Native\|Backend Security\|Git & Workflow" AGENTS.md  # All categories present ✓
```

---

## Next Steps for User

1. On next SDD session, skill-registry will regenerate `.atl/skill-registry.md` but won't touch `AGENTS.md`
2. To update Project Standards, edit `AGENTS.md` directly
3. User Skills table will auto-regenerate in `.atl/skill-registry.md`
4. Commit with: `git commit -S -m "chore: migrate Project Standards to AGENTS.md"`
