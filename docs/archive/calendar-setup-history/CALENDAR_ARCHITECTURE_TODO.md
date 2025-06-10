# Calendar Architecture Fix Required

## Current Issue

Events are being created in the **logged-in user's personal calendar** when they should be going to project/work order/assignee calendars.

## Intended Architecture

### 1. Project Calendars

- Each project should have its own dedicated Google Calendar
- When creating schedule items for a project, they should go to that project's calendar
- Project team members should have access to view/edit the project calendar

### 2. Work Order Calendar

- All work orders should go to a centralized work order calendar
- This should be a shared calendar accessible by operations team

### 3. Individual Assignee Calendars

- When assigning tasks to employees/subcontractors, events should optionally be added to their personal calendars
- This requires their calendar permissions

## Required Changes

### Option 1: Service Account Architecture (Recommended)

Use a Google Service Account to manage all calendars:

1. **Setup Service Account**

   - Create a Google Service Account
   - Grant it Calendar API permissions
   - Store service account credentials securely

2. **Calendar Management**

   - Service account creates/manages project calendars
   - Service account shares calendars with appropriate users
   - Events are created in the correct calendar using service account auth

3. **Benefits**
   - No need for user to be logged in to create events
   - Centralized calendar management
   - Better permissions control

### Option 2: Shared Calendar IDs

If you already have calendars set up:

1. **Store Calendar IDs**

   ```env
   # Shared calendars
   GOOGLE_CALENDAR_PROJECTS=projects@yourcompany.com
   GOOGLE_CALENDAR_WORK_ORDERS=workorders@yourcompany.com
   ```

2. **Update Code**
   - Remove "primary" fallback
   - Use specific calendar IDs
   - Ensure logged-in user has write access to these calendars

## Immediate Fix Needed

Update `src/lib/calendarService.ts` to stop using "primary":

```typescript
// Instead of:
const primaryCalendarId = 'primary';

// Use:
const projectCalendarId = process.env.VITE_GOOGLE_CALENDAR_PROJECTS ||
  throw new Error('Project calendar not configured');
```

## Environment Variables Needed

```env
# Required calendar IDs
VITE_GOOGLE_CALENDAR_PROJECTS=<shared-projects-calendar-id>
VITE_GOOGLE_CALENDAR_WORK_ORDER=<shared-work-orders-calendar-id>

# Optional: Service account for calendar management
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded-key>
```

## Security Considerations

1. **Permissions**: Ensure only authorized users can create events in shared calendars
2. **Audit Trail**: Log who creates/modifies calendar events
3. **Access Control**: Regularly review who has access to shared calendars

## Next Steps

1. Decide between Service Account vs Shared Calendar approach
2. Set up the required Google Calendar infrastructure
3. Update the code to use correct calendar IDs
4. Test with non-admin users to ensure proper access
