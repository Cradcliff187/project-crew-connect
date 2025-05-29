# IMMEDIATE NEXT STEPS - Calendar Integration Implementation

## STATUS AFTER PHASE 0 REALITY CHECK

### ✅ COMPLETED & WORKING

1. **CalendarSelectionService** - Intelligently selects calendars based on context
2. **Backend Server** - Running with comprehensive Google integration
3. **Authentication** - OAuth 2.0 working with session management
4. **Calendar Config API** - `/api/calendar/config` endpoint added
5. **Environment Setup** - All calendar IDs configured correctly

### 🚧 PHASE 1: Missing Backend Endpoints (CRITICAL PATH)

#### 1.1 Add Generic Calendar Event Creation Endpoint

**File**: `server/server.js`
**Endpoint**: `POST /api/calendar/events`

```javascript
// Add after existing calendar endpoints around line 980
app.post('/api/calendar/events', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      calendarId = 'primary',
      entityType,
      entityId,
      sendNotifications = false,
      timezone = 'America/New_York',
    } = req.body;

    // Validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, startTime, endTime',
      });
    }

    // Create event data
    const eventData = {
      title,
      description: description || '',
      startTime,
      endTime,
      location: location || '',
      targetCalendarId: calendarId,
      entityType: entityType || 'generic',
      entityId: entityId || '',
      sendNotifications,
      timezone,
    };

    // Use service account for group calendars, user auth for personal
    const authClient =
      calendarId !== 'primary' && serviceAccountAuth
        ? await serviceAccountAuth.getClient()
        : req.googleClient;

    const event = await calendarHelper.createEvent(authClient, eventData);

    res.json({
      success: true,
      event,
      eventId: event.id,
      message: 'Calendar event created successfully',
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create calendar event',
    });
  }
});
```

#### 1.2 Add Individual Calendar Invite Endpoint

**File**: `server/server.js`
**Endpoint**: `POST /api/calendar/invites`

```javascript
// Add after the events endpoint
app.post('/api/calendar/invites', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      attendeeEmail,
      attendeeRole = 'attendee',
      attendeeType = 'employee',
      primaryEventId,
      entityType,
      entityId,
      sendNotifications = true,
      timezone = 'America/New_York',
    } = req.body;

    // Validation
    if (!title || !startTime || !endTime || !attendeeEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, startTime, endTime, attendeeEmail',
      });
    }

    // Create invite event data
    const eventData = {
      title: `${title} (Invite)`,
      description: `${description || ''}\n\nRelated to event: ${primaryEventId || 'N/A'}`,
      startTime,
      endTime,
      location: location || '',
      attendees: [{ email: attendeeEmail }],
      targetCalendarId: 'primary', // Send to attendee's personal calendar
      entityType: entityType || 'invite',
      entityId: entityId || '',
      sendNotifications,
      timezone,
    };

    // Use user's auth client for personal calendar invites
    const event = await calendarHelper.createEvent(req.googleClient, eventData);

    res.json({
      success: true,
      event,
      eventId: event.id,
      attendeeEmail,
      message: 'Calendar invite sent successfully',
    });
  } catch (error) {
    console.error('Error sending calendar invite:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send calendar invite',
    });
  }
});
```

### 🚧 PHASE 2: Fix EnhancedCalendarService (30 minutes)

The service is already mostly correct, but needs the API_BASE_URL adjusted:

**File**: `src/services/enhancedCalendarService.ts`

```typescript
// Line 47: Update API base URL
private static readonly API_BASE_URL = 'http://localhost:3000';
```

### 🚧 PHASE 3: Fix UnifiedSchedulingDialog (1 hour)

#### 3.1 Fix Missing DatePicker Import

**File**: `src/components/scheduling/UnifiedSchedulingDialog.tsx`

```typescript
// Replace line 14 with existing UI component
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Replace DatePicker usage with:
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start">
      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <CalendarComponent
      mode="single"
      selected={startDate}
      onSelect={setStartDate}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

#### 3.2 Add Real Email Lookup

Update the AssigneeSelector onChange to fetch emails:

```typescript
onChange={async (selected) => {
  if (!selected) {
    setAssignees([]);
    return;
  }

  // Fetch emails from backend
  const assigneesWithEmails = await Promise.all(
    selected.map(async (s) => {
      try {
        const response = await fetch(`/api/assignees/${s.type}/${s.id}/email`, {
          credentials: 'include'
        });
        const data = await response.json();
        return {
          type: s.type,
          id: s.id,
          email: data.email
        };
      } catch {
        return {
          type: s.type,
          id: s.id,
          email: undefined
        };
      }
    })
  );

  setAssignees(assigneesWithEmails);
}}
```

### 🚧 PHASE 4: End-to-End Testing (1 hour)

#### 4.1 Test Calendar Event Creation

```bash
# Test project schedule item
curl -X POST "http://localhost:3000/api/calendar/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Foundation Inspection Test",
    "startTime": "2025-01-24T09:00:00Z",
    "endTime": "2025-01-24T10:00:00Z",
    "calendarId": "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com",
    "entityType": "schedule_item"
  }'
```

#### 4.2 Verify Google Calendar

1. Check AJC Projects Calendar for the event
2. Verify event appears with correct title and time
3. Test individual invite sending

### 🚧 PHASE 5: Integration with Existing App (2 hours)

#### 5.1 Replace Existing Schedule Dialog

**File**: `src/components/projects/schedule/ProjectScheduleTab.tsx`

```typescript
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';

// Replace existing dialog with:
<UnifiedSchedulingDialog
  open={schedulingOpen}
  onOpenChange={setSchedulingOpen}
  context={{
    entityType: 'schedule_item',
    projectId: project.id,
    projectName: project.name
  }}
  onSave={async (eventData) => {
    const result = await EnhancedCalendarService.createEvent(eventData);
    return result.success;
  }}
  onCancel={() => setSchedulingOpen(false)}
/>
```

## SUCCESS METRICS

### ✅ COMPLETION CRITERIA

1. **API Endpoints Working**: Can create events and send invites via API
2. **Calendar Integration**: Events appear on correct group calendars
3. **Individual Invites**: Attendees receive calendar invitations
4. **UI Functional**: UnifiedSchedulingDialog works in app
5. **Context Awareness**: Different entity types use correct calendars

### 📊 TESTING CHECKLIST

- [ ] Project schedule item → AJC Projects Calendar ✓
- [ ] Work order → Work Orders Calendar + Projects Calendar (if project-related) ✓
- [ ] Client meeting → Context-dependent calendar ✓
- [ ] Personal task → Personal calendar ✓
- [ ] Individual invites sent to assignees ✓
- [ ] No manual calendar selection required ✓

## ESTIMATED COMPLETION TIME: 4-6 HOURS

This completes the intelligent, context-aware calendar system for construction management!
