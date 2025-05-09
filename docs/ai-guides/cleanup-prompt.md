# 📁 AI Agent Prompt: Workspace Cleanup and Reorganization

**Generated:** 2025-05-08 01:08:28

---

## 🧠 Objective

You are tasked with performing a comprehensive cleanup and reorganization of our project workspace to ensure it is streamlined, accurate, and production-ready. The workspace contains a wide mix of documentation, test files, config files, and historical artifacts generated during AI-assisted development and testing.

---

## 🔍 1. FILE DISCOVERY & CLASSIFICATION

Scan **all directories recursively** and categorize all files into the following buckets:
- `README / .md files`
- `Test files (unit/integration)`
- `MCP config files`
- `Supabase config/SQL files`
- `Google API & Calendar integration files`
- `Redundant/placeholder/duplicate/obsolete files`
- `Environment & credentials files (.env, secrets)`
- `Helper scripts & utilities`

➡️ Create a summary table of all files, grouped by category, with their relative path and last modified date.

---

## 🗃️ 2. DOCUMENTATION & README CONSOLIDATION

- Identify all README.md and other .md documentation files.
- Merge and rewrite into a **single top-level `README.md`** that includes:
  - Project Overview
  - Setup Instructions
  - Backend/Frontend Start Commands
  - Supabase integration notes
  - MCP usage guide
  - Google API setup steps
  - Directory map with file responsibilities
  - Agent usage tips (if applicable)
- Validate that all setup and usage instructions in the new README **still function correctly**.

---

## 🔁 3. FILE VALIDATION & CONSOLIDATION

For each category from step 1:
- **MCP Files**: Identify duplicates, remove legacy files, and keep only the active config with usage notes.
- **Supabase SQL/Config**: Validate against the current schema using MCP; remove unused SQL files.
- **Google API/Calendar Integration**: Ensure integration is functioning and service files are structured properly.
- **Testing Files**: Archive or delete outdated/unused files; ensure tests are tied to live components and pass.

---

## 🧹 4. CLEANUP

- Remove:
  - Placeholder files (e.g., `temp.ts`, `example.md`)
  - Obsolete, migrated, or unused files
  - Superseded helper scripts
- Ensure active files are renamed and placed according to role.

---

## 🗂️ 5. WORKSPACE STRUCTURE IMPROVEMENT

Propose and implement a clean directory structure, such as:
- `/docs`
- `/src/components`
- `/backend/services`
- `/integration/google`
- `/integration/supabase`
- `/tests`
- `/mcp`

➡️ Validate all file moves and imports before applying changes.

---

## ✅ 6. OUTPUT & DELIVERABLES

Produce the following deliverables:
- Cleaned workspace
- Finalized and consolidated `README.md`
- `docs/CleanupReport.md` listing:
  - Removed or merged files
  - Cleanup justifications
  - Updated file structure
  - Best practices for future hygiene

---

## 🛠️ Integration Requirements

Use MCP and Supabase integrations to validate relevance and structure before removing or renaming files. Only clean up once validations confirm files are unused or replaced.
