# Comprehensive Action Plan

## ✅ Completed Tasks

### 1. Payee Selection Schema Fix

- **Status**: COMPLETED - Ready to Deploy
- **Solution**: Created database migration to add `subname` alias column
- **Files Created**:
  - `supabase/migrations/20250111_add_subname_alias.sql`
  - `PAYEE_SELECTION_SCHEMA_INVENTORY.md`
  - `PAYEE_SELECTION_IMPACT_MAP.md`
  - `PAYEE_SELECTION_FIX_SUMMARY.md`
- **Next Step**: Deploy migration to production via Supabase Dashboard

## 🚀 Tasks In Progress

### 2. Google Calendar Integration Enhancement

#### Current Status

- ✅ Calendar sync infrastructure exists (`schedule_items` table)
- ✅ Server endpoints implemented (`/api/schedule-items/:itemId/sync-calendar`)
- ✅ Helper functions ready (`server/google-api-helpers/calendar-helper.js`)
- ✅ React hooks available (`useScheduleItems` has `syncWithCalendar`)

#### Issues to Fix

1. **Missing UI Components**:

   - Need to add calendar toggle to schedule form
   - Need sync status indicators
   - Need error handling display

2. **Authentication Flow**:

   - Verify Google OAuth is properly configured
   - Ensure service account fallback works

3. **User Experience**:
   - Add loading states during sync
   - Show success/failure notifications
   - Display Google Calendar link after sync

#### Implementation Steps

##### Step 1: Add Calendar Integration to Schedule Form

```tsx
// src/components/projects/schedule/ScheduleForm.tsx
import { CalendarIntegrationToggle } from '@/components/common/CalendarIntegrationToggle';

// Add to form schema:
calendar_integration_enabled: z.boolean().default(false),
google_event_id: z.string().optional(),

// Add to form UI:
<CalendarIntegrationToggle
  value={form.watch('calendar_integration_enabled')}
  onChange={(value) => form.setValue('calendar_integration_enabled', value)}
  disabled={!form.watch('start_datetime')}
  disabledReason="Start date/time is required for calendar sync"
/>
```

##### Step 2: Add Sync Status Display

```tsx
// src/components/projects/schedule/ScheduleItemCard.tsx
{
  item.google_event_id && (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Calendar className="h-3 w-3" />
      Synced
    </Badge>
  );
}
{
  item.last_sync_error && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="destructive">Sync Error</Badge>
        </TooltipTrigger>
        <TooltipContent>{item.last_sync_error}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

##### Step 3: Add Manual Sync Button

```tsx
// src/components/projects/schedule/ScheduleActions.tsx
const handleSyncWithCalendar = async () => {
  setIsSyncing(true);
  const success = await syncWithCalendar(item.id);
  if (success) {
    await fetchScheduleItems(); // Refresh to show updated status
  }
  setIsSyncing(false);
};

<Button
  size="sm"
  variant="ghost"
  onClick={handleSyncWithCalendar}
  disabled={isSyncing || !item.calendar_integration_enabled}
>
  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
  Sync
</Button>;
```

### 3. Other Pending Items from Context

#### From the Error Logs

1. **Processed form data: undefined**
   - Need to investigate form submission handling
   - Add proper logging for form data processing

#### UI/UX Improvements

1. **Label Changes**:
   - "Vendor type" → "Payee category"
   - "Subcontractor" → "Independent contractor"

## 📅 Timeline

### Day 1 (Today)

- [x] Fix payee selection schema issue
- [ ] Implement calendar integration UI components
- [ ] Test calendar sync functionality

### Day 2

- [ ] Deploy payee selection fix to production
- [ ] Complete calendar integration testing
- [ ] Fix form data processing issues

### Day 3

- [ ] Update UI labels throughout the app
- [ ] Add comprehensive error handling
- [ ] Document all changes

### Day 4

- [ ] Final testing of all features
- [ ] Deploy to staging environment
- [ ] User acceptance testing

### Day 5

- [ ] Production deployment
- [ ] Monitor for issues
- [ ] Create post-deployment report

## 🧪 Testing Checklist

### Payee Selection

- [ ] Verify subcontractor dropdown works
- [ ] Test expense creation with both vendors and subcontractors
- [ ] Confirm no 400 errors
- [ ] Test search functionality

### Calendar Integration

- [ ] Test OAuth authentication flow
- [ ] Verify event creation in Google Calendar
- [ ] Test event updates
- [ ] Test event deletion
- [ ] Verify sync status updates
- [ ] Test error handling

### Form Processing

- [ ] Verify form data is properly captured
- [ ] Test validation messages
- [ ] Confirm successful submissions

## 📝 Documentation Updates Needed

1. **User Guide**:

   - How to connect Google Calendar
   - How to sync schedule items
   - Troubleshooting sync issues

2. **Developer Guide**:

   - Calendar integration architecture
   - Adding calendar sync to new entities
   - Debugging sync issues

3. **API Documentation**:
   - Calendar sync endpoints
   - Authentication requirements
   - Error codes and handling
