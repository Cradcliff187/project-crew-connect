# Calendar Implementation Plan

## Immediate Action Items

### Phase 1: Backend API Implementation (2-3 days)

#### 1.1 Create Enhanced Calendar API Endpoints

**File: `server/routes/calendar.js`**

```javascript
// POST /api/calendar/events - Create calendar event
// POST /api/calendar/invites - Send individual invite
// PUT /api/calendar/events/:id - Update event
// DELETE /api/calendar/events/:id - Delete event
```

#### 1.2 Update Server Integration

**File: `server/server.js`**

- Add new calendar routes
- Update existing schedule sync to use CalendarSelectionService
- Add email/assignee lookup functionality

#### 1.3 Database Enhancements

**Migration: `add_enhanced_calendar_fields.sql`**

```sql
-- Add calendar selection metadata to schedule_items
ALTER TABLE schedule_items
ADD COLUMN calendar_selection_data JSONB,
ADD COLUMN primary_calendar_id TEXT,
ADD COLUMN additional_event_ids TEXT[];

-- Add employee email lookup optimization
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_subcontractors_email ON subcontractors(contactemail);
```

### Phase 2: Frontend Integration (3-4 days)

#### 2.1 Replace Existing Schedule Dialog

**Target: `src/components/projects/schedule/ScheduleItemFormDialog.tsx`**

- Replace with UnifiedSchedulingDialog
- Add migration logic for existing schedule items
- Test calendar selection preview

#### 2.2 Work Order Scheduling Integration

**Target: `src/components/workOrders/dialog/WorkOrderScheduleFields.tsx`**

- Integrate UnifiedSchedulingDialog
- Add project-work order cross-linking
- Test dual calendar event creation

#### 2.3 Client Meeting Integration

**Target: `src/components/contacts/detail/InteractionsSection.tsx`**

- Add UnifiedSchedulingDialog for meetings
- Test project-context meeting scheduling

### Phase 3: Testing & Validation (2-3 days)

#### 3.1 End-to-End Testing

**Scenarios to Test:**

1. **Project Schedule Item**:
   - Event on AJC Projects Calendar ✓
   - Invite to assigned employee ✓
2. **Work Order (Project-related)**:
   - Event on Work Orders Calendar ✓
   - Event on AJC Projects Calendar ✓
   - Invite to technician ✓
3. **Client Meeting (Project-related)**:
   - Event on AJC Projects Calendar ✓
   - Invite to client + attendees ✓
4. **Personal Task**:
   - Event on Personal Calendar ✓
   - Optional attendee invites ✓

#### 3.2 Calendar Validation

**Manual Verification:**

- Check Google Calendar PROJECT group calendar
- Check Google Calendar WORK_ORDER group calendar
- Check individual attendee calendars
- Verify email invitations sent

### Phase 4: Production Deployment (1-2 days)

#### 4.1 Configuration Validation

- Verify all environment variables
- Test service account permissions
- Validate calendar access rights

#### 4.2 Migration Strategy

- Gradual rollout to avoid disruption
- Backup existing calendar integration
- Monitor error logs during transition

## Priority Implementation Order

### 🚨 **CRITICAL PATH:**

1. **Backend Calendar API** (server/routes/calendar.js)
2. **Employee Email Lookup** (database queries)
3. **Project Schedule Integration** (replace existing dialog)
4. **End-to-End Testing** (one complete workflow)

### 📋 **DETAILED TASKS:**

#### Task 1: Backend Calendar Events API

```javascript
// server/routes/calendar.js
router.post('/events', async (req, res) => {
  const { title, startTime, endTime, calendarId, entityType, entityId } = req.body;

  // Use existing calendar-helper.js with specific calendarId
  const result = await createEvent(authClient, {
    title,
    startTime,
    endTime,
    targetCalendarId: calendarId, // Key change - use specific calendar
  });

  res.json({ success: true, eventId: result.id });
});
```

#### Task 2: Employee Email Lookup Service

```javascript
// server/services/assigneeService.js
async function getAssigneeEmails(assignees) {
  const employees = await supabase
    .from('employees')
    .select('employee_id, email')
    .in(
      'employee_id',
      assignees.filter(a => a.type === 'employee').map(a => a.id)
    );

  const subcontractors = await supabase
    .from('subcontractors')
    .select('subid, contactemail')
    .in(
      'subid',
      assignees.filter(a => a.type === 'subcontractor').map(a => a.id)
    );

  return [...employees.data, ...subcontractors.data];
}
```

#### Task 3: Frontend Schedule Dialog Replacement

```typescript
// Replace in src/components/projects/schedule/ProjectScheduleTab.tsx
const handleAddScheduleItem = () => {
  setSchedulingContext({
    entityType: 'schedule_item',
    projectId: project.id,
    projectName: project.name,
  });
  setUnifiedSchedulingOpen(true);
};

const handleSaveScheduleItem = async (eventData: EnhancedCalendarEventData) => {
  // Create schedule item in database
  const scheduleItem = await createScheduleItem({
    project_id: project.id,
    title: eventData.title,
    description: eventData.description,
    start_datetime: eventData.startTime,
    end_datetime: eventData.endTime,
    calendar_integration_enabled: true,
  });

  // Create calendar events using enhanced service
  eventData.entityId = scheduleItem.id;
  const result = await EnhancedCalendarService.createEvent(eventData);

  return result.success;
};
```

## Success Metrics

### ✅ **Completion Criteria:**

1. **"Claude 4 Test 1" appears on Google Calendar**: AJC Projects Calendar shows the event
2. **Work Order Scheduling**: Creates events on BOTH work order AND project calendars
3. **Individual Invites**: Employees receive calendar invites on personal calendars
4. **Context Awareness**: System automatically selects correct calendar based on context
5. **No Manual Calendar Selection**: User doesn't need to choose calendar ID

### 📊 **Testing Checklist:**

- [ ] Project schedule item creates event on AJC Projects Calendar
- [ ] Project schedule item sends invite to assigned employee
- [ ] Work order creates event on Work Orders Calendar
- [ ] Project-related work order ALSO creates event on AJC Projects Calendar
- [ ] Client meeting (project-related) creates event on AJC Projects Calendar
- [ ] Personal task creates event on Personal Calendar
- [ ] All invites are received as Google Calendar invitations
- [ ] Events appear in correct Google Calendar groups

## Next Steps

1. **Review this plan together** - Validate approach and timeline
2. **Start with Backend API** - Most critical component
3. **Incremental testing** - Test each piece as we build it
4. **Deploy gradually** - Start with one workflow, expand

This architecture solves all the identified gaps and provides the intelligent, context-aware calendar system you described for construction management.
