# Calendar Setup Checklist

Use this checklist to track your progress. Check off each item as you complete it.

## Phase 1: Preparation

- [ ] Open PowerShell in project directory (`C:\Dev\AKC Revisions-V1`)
- [ ] Run base64 conversion command
- [ ] Verify "Base64 key copied to clipboard!" message appears
- [ ] Keep PowerShell window open

## Phase 2: Create Google Secrets

- [ ] Open new Command Prompt or PowerShell for gcloud commands
- [ ] Create `webhook-token` secret
- [ ] Update `google-service-account-credentials` to base64 (paste from clipboard)
- [ ] Create `google-service-account-email` secret
- [ ] Create `vite-google-calendar-projects` secret
- [ ] Create `vite-google-calendar-work-order` secret
- [ ] Create `google-service-account-key-base64` secret (paste from clipboard)
- [ ] Copy raw JSON to clipboard in PowerShell
- [ ] Create `google-service-account-key` secret (paste raw JSON)
- [ ] Run verification command - see 6+ secrets listed

## Phase 3: Update Code Files

- [ ] Update `server-service-account.cjs` (initialize method)
- [ ] Update `src/lib/calendarService.ts` (line 20)
- [ ] Update `src/services/enhancedCalendarService.ts` (lines 77-80)
- [ ] Update `vite.config.ts` (add define section)
- [ ] Update `cloudbuild.yaml` (add 5 new --update-secrets lines after line 70)

## Phase 4: Deploy

- [ ] Run `git add` command for all 5 files
- [ ] Run `git commit` with the provided message
- [ ] Run `git push origin main`
- [ ] Watch Cloud Build logs (optional)

## Phase 5: Post-Deployment

- [ ] Wait for deployment to complete (5-10 minutes)
- [ ] Set up Supabase secrets (if using webhooks)
- [ ] Run calendar permissions script
- [ ] Test creating a project/work order
- [ ] Verify event appears in Google Calendar

## Verification

- [ ] No errors in Cloud Run logs
- [ ] Calendar events sync from app to Google
- [ ] Service account has calendar access
- [ ] Frontend can access calendar IDs

## If Issues Occur

- [ ] Check all secrets were created: `gcloud secrets list`
- [ ] Verify project ID: `gcloud config get-value project` (should be `crm-live-458710`)
- [ ] Check Cloud Run logs for errors
- [ ] Ensure all code changes were saved before committing
