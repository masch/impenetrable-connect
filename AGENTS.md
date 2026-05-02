# Agent Hub

This project uses **Agent Teams Lite (ATL)** and **Spec-Driven Development (SDD)**.

## 🧠 Mission Control

All technical standards, code conventions, and agent skill mappings are centralized in:
👉 [.atl/skill-registry.md](.atl/skill-registry.md)

## 🛠️ Operational Model

1. **Specs First**: All changes must be backed by an OpenSpec in `openspec/specs/`.
2. **Auto-Load Skills**: The registry ensures that the AI assistant follows project-specific patterns (NativeWind v4, Drizzle, Hono).
3. **Deployment**: Backend deployment workflow and secrets management are documented in [docs/BACKEND_DEPLOYMENT.md](docs/BACKEND_DEPLOYMENT.md).
4. **Consistency**: Do not add technical rules here. Update the registry instead.

---

_Senior Architect's Note: Keep the brain clean. One source of truth is better than two guesses._
