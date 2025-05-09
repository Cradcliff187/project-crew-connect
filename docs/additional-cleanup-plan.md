# Additional Cleanup Plan

## AI Agent Files Reorganization

The current organization includes two separate directories for AI agent files:

- `Ai Agent Helper Files/`
- `ai-agent-helpers/`

These should be consolidated into a single directory with a proper structure.

### New Directory Structure for AI Agent Files

```
docs/
├── ai-guides/                             # All AI agent related documentation
│   ├── README.md                          # Overview of AI guides
│   ├── supabase/                          # Supabase-related guides
│   │   ├── supabase-maintenance.md        # From README_SUPABASE_MAINTENANCE.md
│   │   ├── supabase-mcp-audit.md          # From SUPABASE_MCP_AUDIT.md
│   │   └── schema-map.md                  # From schema_map.md
│   ├── ui-ux/                             # UI/UX-related guides
│   │   ├── ui-ux-alignment-plan.md        # From ui_ux_alignment_plan.md
│   │   ├── ui-ux-alignment-report.md      # From ui_ux_alignment_report.md
│   │   └── ui-ux-review-build-tracker.md  # From ui_ux_review_build_tracker.md
│   ├── implementation/                    # Implementation-related guides
│   │   ├── construction-pm-plan.md        # From construction-pm-plan.md
│   │   ├── current-implementation-analysis.md # From current_implementation_analysis.md
│   │   └── vendor-sub-alignment-report.md # From vendor_sub_alignment_report.md
│   ├── google-calendar/                   # Google Calendar specific guides
│   │   ├── gcal-shared-id-audit.md        # From ai-agent-helpers/
│   │   └── google-auth-debug-report.md    # From ai-agent-helpers/
│   └── archive/                           # Archive directory for historical files
│       └── ... (contents from Ai Agent Helper Files/archive/)
```

### Files to Move

From `Ai Agent Helper Files/`:

1. `README_SUPABASE_MAINTENANCE.md` → `docs/ai-guides/supabase/supabase-maintenance.md`
2. `SUPABASE_MCP_AUDIT.md` → `docs/ai-guides/supabase/supabase-mcp-audit.md`
3. `schema_map.md` → `docs/ai-guides/supabase/schema-map.md`
4. `ui_ux_alignment_plan.md` → `docs/ai-guides/ui-ux/ui-ux-alignment-plan.md`
5. `ui_ux_alignment_report.md` → `docs/ai-guides/ui-ux/ui-ux-alignment-report.md`
6. `ui_ux_review_build_tracker.md` → `docs/ai-guides/ui-ux/ui-ux-review-build-tracker.md`
7. `construction-pm-plan.md` → `docs/ai-guides/implementation/construction-pm-plan.md`
8. `current_implementation_analysis.md` → `docs/ai-guides/implementation/current-implementation-analysis.md`
9. `vendor_sub_alignment_report.md` → `docs/ai-guides/implementation/vendor-sub-alignment-report.md`
10. `build_tracker_001.md` → `docs/ai-guides/ui-ux/build-tracker-001.md`
11. `progress.md` → `docs/ai-guides/implementation/progress.md`
12. `README_Cleanup_Prompt.md` → `docs/ai-guides/cleanup-prompt.md`
13. `components/` (folder) → `docs/ai-guides/components/`

From `ai-agent-helpers/`:

1. `gcal-shared-id-audit.md` → `docs/ai-guides/google-calendar/gcal-shared-id-audit.md`
2. `google-auth-debug-report.md` → `docs/ai-guides/google-calendar/google-auth-debug-report.md`
3. `update-ajc-calendar.js` → `tools/calendar/update-ajc-calendar.js`

## Loose Files Reorganization

Several loose files remain in the root directory that should be organized.

### Configuration Files - Keep in Root

These files are standard configuration files that typically stay in the root:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `tsconfig.app.json`
- `postcss.config.js`
- `eslint.config.js`
- `tailwind.config.ts`
- `vite.config.ts`
- `.prettierrc`
- `.gitignore`
- `components.json`
- `index.html`
- `AKC Revisions-V1.code-workspace`

### Environment Files - Move to tools/setup/

- `env-template.txt` → `tools/setup/env-template.txt`
- `env-complete.txt` → `tools/setup/env-complete.txt`

### Documentation Files - Move to docs/

- `AI_AGENT_GUIDE.md` → `docs/ai-guides/ai-agent-guide.md`
- `CALENDAR_INTEGRATION_SETUP.md` → `docs/guides/calendar-integration-setup.md`
- `GOOGLE_CALENDAR_SETUP.md` → `docs/guides/google-calendar-setup.md`
- `COMPLETED.md` → `docs/project-history/completed.md`
- `schema-summary.md` → `docs/db/schema-summary.md`
- `discovered-schema.json` → `docs/db/discovered-schema.json`

### Script Files - Previously Organized

These files have already been organized into proper locations in the reorganization:

- `test-*.js` files -> `tests/` directory
- Calendar webhook scripts -> `tools/calendar/webhooks/`
- Database scripts -> `db/scripts/`

### Steps to Rename the README

Once all reorganization is complete:

1. Rename the current `README.md` to `README.md.old`
2. Rename `README.md.new` to `README.md`

## Files That Can Be Removed

After verifying functionality, these files can likely be removed as they are redundant based on existing tests:

- `dev-output.log` - This appears to be a log file, not needed for version control
- `renewal-log.txt` - This appears to be a log file, not needed for version control
- Root level test files that have already been moved to the tests/ directory

## Implementation Steps

1. Create the new directory structure
2. Move all AI agent files to their new locations
3. Move loose files to their appropriate directories
4. Update the README.md
5. Test all functionality
6. Clean up by removing redundant files after testing

## Verification After Reorganization

After reorganizing:

1. Run tests to ensure all functionality works
2. Check that all documentation is accessible
3. Ensure all tools and scripts run from their new locations
