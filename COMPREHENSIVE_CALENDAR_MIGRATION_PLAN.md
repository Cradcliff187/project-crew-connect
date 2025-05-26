# 🚀 COMPREHENSIVE CALENDAR MIGRATION PLAN

## ✅ **BUSINESS LOGIC CLARIFICATIONS**

Based on user requirements, the intelligent calendar system follows these rules:

### **Intelligent Calendar Selection:**

- **Project items** → AJC Projects Calendar + individual invites
- **Work orders** → Work Orders Calendar ONLY + individual invites (separate service line)
- **Contact meetings** → Project calendar (if project-related), otherwise personal + invites
- **Time entries** → NO automatic calendar events (manual manager scheduling only)

### **Automatic Calendar Sync:**

- **Work orders**: ✅ Automatic sync enabled by default
- **Project items**: ✅ Automatic sync enabled by default
- **Contact meetings**: ✅ Automatic sync enabled by default
- **Time entries**: ❌ NO automatic sync (manual only)

### **Manager Capabilities:**

- Managers can schedule employees on any entity type
- Calendar selection is intelligent and context-aware
- Individual invites automatically sent to assignees

---

## 📋 **MIGRATION PHASES**

### **PHASE 1: CRITICAL COMPONENT REPLACEMENTS**

#### **1.1 Replace Work Order Calendar Integration**

**Priority**: 🔴 **CRITICAL**
**Current**: `WorkOrderScheduleFields` → `CalendarIntegrationToggle` → `useCalendarIntegration`
**New**: `WorkOrderScheduleFields` → `EnhancedCalendarService` with automatic sync

**Changes Required:**

```typescript
// File: src/components/workOrders/dialog/hooks/useWorkOrderSubmit.ts
// Replace the old calendar integration:

// OLD CODE (remove):
const { createEvent } = useCalendarIntegration();
const calendarResult = await createEvent({
  title: values.title,
  description: values.description || '',
  startTime: scheduledDate,
  endTime: dueByDate || undefined,
  // ... other fields
});

// NEW CODE (add):
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

const calendarResult = await EnhancedCalendarService.createEvent({
  title: values.title,
  description: values.description || '',
  startTime: scheduledDate,
  endTime: dueByDate || undefined,
  location: '', // Add location from work order if available
  entityType: 'work_order',
  entityId: workOrderId,
  assignees: [
    {
      type: 'employee', // or 'subcontractor' based on assignment
      id: values.assigned_to,
      email: undefined, // Will be fetched automatically
    },
  ],
  userEmail: 'current-user@example.com', // From auth context
  sendNotifications: true,
});
```

**Expected Result:**

- Work orders automatically appear on Work Orders Calendar
- Assignees automatically receive calendar invites
- No manual calendar selection required

---

#### **1.2 Replace Contact Scheduling System**

**Priority**: 🔴 **CRITICAL**
**Current**: `ContactActionButtons` → `InteractionsSection` → custom appointment form
**New**: `ContactActionButtons` → `UnifiedSchedulingDialog` with contact + project context

**Changes Required:**

**File**: `src/components/contacts/detail/ContactActionButtons.tsx`

```typescript
// Replace the Schedule Dialog with UnifiedSchedulingDialog:

// OLD CODE (remove):
<Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
  <DialogContent className="max-w-3xl">
    <DialogTitle>Schedule Meeting with {contact.full_name || contact.name}</DialogTitle>
    <InteractionsSection
      contact={contact}
      onInteractionAdded={() => setScheduleDialogOpen(false)}
    />
  </DialogContent>
</Dialog>

// NEW CODE (add):
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

<UnifiedSchedulingDialog
  open={scheduleDialogOpen}
  onOpenChange={setScheduleDialogOpen}
  context={{
    entityType: 'contact_interaction',
    // Add projectId if contact is associated with a project
    projectId: contact.current_project_id, // If this field exists
    title: `Meeting with ${contact.full_name || contact.name}`,
    assignees: [
      {
        type: 'employee',
        id: 'current-user-id', // From auth context
        email: 'current-user@example.com',
      }
    ],
  }}
  onSave={async (eventData) => {
    const result = await EnhancedCalendarService.createEvent({
      ...eventData,
      entityId: `contact-meeting-${Date.now()}`,
    });

    if (result.success) {
      // Optionally save interaction record to database
      // ... interaction creation logic
    }

    return result.success;
  }}
  onCancel={() => setScheduleDialogOpen(false)}
/>
```

**Expected Result:**

- Contact meetings intelligently use project calendars when project-related
- Automatic calendar invites to attendees
- Consistent scheduling experience across app

---

#### **1.3 Enhance Schedule Item Editing**

**Priority**: 🟡 **HIGH**
**Current**: `ScheduleItemFormDialog` → manual calendar sync checkboxes
**New**: `ScheduleItemFormDialog` → integrated `EnhancedCalendarService`

**Changes Required:**

**File**: `src/components/projects/schedule/ScheduleItemFormDialog.tsx`

```typescript
// Replace the manual calendar sync with intelligent system:

// In the handleSave function, replace the old calendar logic:

// OLD CODE (remove):
calendar_integration_enabled: enableCalendarSync,

// NEW CODE (add):
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

const handleSave = async () => {
  // ... existing validation logic ...

  // Save the schedule item first
  const itemData: Partial<ScheduleItem> = {
    // ... existing item data ...
  };

  const success = await onSave(itemData);

  if (success && enableCalendarSync) {
    // Create calendar event using intelligent system
    const calendarResult = await EnhancedCalendarService.createEvent({
      title: title.trim(),
      description: description || undefined,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      entityType: 'schedule_item',
      entityId: itemData.id || `temp-${Date.now()}`,
      projectId: projectId,
      assignees: assignees?.map(a => ({
        type: a.type as 'employee' | 'subcontractor',
        id: a.id,
        email: undefined, // Will be fetched automatically
      })),
      userEmail: 'current-user@example.com', // From auth context
      sendNotifications: sendInvite,
    });

    if (calendarResult.success) {
      toast({
        title: 'Schedule Item Created',
        description: `Added to ${calendarResult.calendarSelection?.primaryCalendar.name} and sent ${calendarResult.invitesSent?.length || 0} invites`,
      });
    }
  }

  if (success) {
    onOpenChange(false);
  }
};
```

**Expected Result:**

- Schedule item editing uses intelligent calendar selection
- Consistent behavior between creating and editing items
- Automatic calendar sync and invite management

---

### **PHASE 2: REMOVE OLD CALENDAR SYSTEM**

#### **2.1 Deprecate Old Calendar Integration Hook**

**Priority**: 🟡 **HIGH**

**Changes Required:**

```typescript
// File: src/hooks/useCalendarIntegration.ts
// Add deprecation warning and redirect to new system:

/**
 * @deprecated This hook is deprecated. Use EnhancedCalendarService instead.
 * This hook will be removed in a future version.
 */
export function useCalendarIntegration() {
  console.warn('useCalendarIntegration is deprecated. Use EnhancedCalendarService instead.');

  // Keep minimal functionality for backward compatibility during transition
  // but log usage for tracking

  return {
    // ... existing implementation with deprecation warnings
  };
}
```

#### **2.2 Remove CalendarIntegrationToggle from Work Orders**

**Priority**: 🟡 **HIGH**

**File**: `src/components/workOrders/dialog/WorkOrderScheduleFields.tsx`

```typescript
// Remove the CalendarIntegrationToggle component entirely since work orders
// now have automatic calendar sync:

// REMOVE THIS SECTION:
<FormField
  control={form.control}
  name="calendar_sync_enabled"
  render={({ field }) => (
    <FormControl>
      <CalendarIntegrationToggle
        value={field.value}
        onChange={field.onChange}
        // ... props
      />
    </FormControl>
  )}
/>

// Replace with informational text:
<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
  <p className="text-sm text-blue-700">
    📅 Work orders are automatically added to your Work Orders Calendar when scheduled.
    Assignees will receive calendar invites automatically.
  </p>
</div>
```

#### **2.3 Update Time Entry System**

**Priority**: 🟢 **MEDIUM**

**File**: `src/hooks/useTimeEntrySubmit.ts`

```typescript
// Remove automatic calendar event creation from time entries:

// REMOVE THIS ENTIRE SECTION:
// Handle Google Calendar integration if enabled
if (data.calendar_sync_enabled && insertedEntry) {
  // ... calendar creation logic
}

// Time entries should NOT automatically create calendar events
// Managers can schedule employees manually using the scheduling system
```

---

### **PHASE 3: ADD MANAGER SCHEDULING CAPABILITIES**

#### **3.1 Add Manager Scheduling Interface**

**Priority**: 🟢 **MEDIUM**

Create a new component for managers to schedule employees:

**File**: `src/components/scheduling/ManagerSchedulingDialog.tsx`

```typescript
import UnifiedSchedulingDialog from './UnifiedSchedulingDialog';
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

interface ManagerSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
  projectId?: string;
  workOrderId?: string;
}

export default function ManagerSchedulingDialog({
  open,
  onOpenChange,
  employeeId,
  projectId,
  workOrderId,
}: ManagerSchedulingDialogProps) {

  const handleScheduleEmployee = async (eventData) => {
    const result = await EnhancedCalendarService.createEvent({
      ...eventData,
      assignees: [
        {
          type: 'employee',
          id: employeeId,
          email: undefined, // Will be fetched automatically
        }
      ],
      userEmail: 'manager@example.com', // From auth context
      sendNotifications: true,
    });

    return result.success;
  };

  return (
    <UnifiedSchedulingDialog
      open={open}
      onOpenChange={onOpenChange}
      context={{
        entityType: projectId ? 'schedule_item' : workOrderId ? 'work_order' : 'personal_task',
        projectId,
        workOrderId,
        title: `Schedule Employee Task`,
      }}
      onSave={handleScheduleEmployee}
      onCancel={() => onOpenChange(false)}
    />
  );
}
```

#### **3.2 Add Manager Scheduling Buttons**

**Priority**: 🟢 **MEDIUM**

Add scheduling buttons in relevant places:

- Employee detail pages
- Project management interfaces
- Work order assignment interfaces

---

### **PHASE 4: TESTING & VALIDATION**

#### **4.1 Component Integration Tests**

**Priority**: 🟡 **HIGH**

Create tests for each migrated component:

```typescript
// File: src/components/workOrders/__tests__/WorkOrderCalendarIntegration.test.tsx
describe('Work Order Calendar Integration', () => {
  it('should automatically create calendar event on work order with scheduled date', async () => {
    // Test that work orders automatically sync to Work Orders Calendar
  });

  it('should send invites to assigned employees/subcontractors', async () => {
    // Test that assignees receive calendar invites
  });

  it('should not create calendar events for work orders without scheduled dates', async () => {
    // Test that unscheduled work orders don't create events
  });
});
```

#### **4.2 End-to-End Calendar Flow Tests**

**Priority**: 🟡 **HIGH**

```typescript
// File: tests/e2e/calendar-integration.test.ts
describe('Calendar Integration E2E', () => {
  it('should handle complete project scheduling workflow', async () => {
    // Create project → schedule item → verify calendar event → verify invites
  });

  it('should handle complete work order workflow', async () => {
    // Create work order → verify automatic calendar sync → verify assignee invites
  });

  it('should handle contact meeting scheduling', async () => {
    // Schedule contact meeting → verify context-aware calendar selection
  });
});
```

---

## 📊 **MIGRATION CHECKLIST**

### **Components to Migrate:**

- [ ] **WorkOrderScheduleFields** → EnhancedCalendarService integration
- [ ] **ContactActionButtons** → UnifiedSchedulingDialog integration
- [ ] **ScheduleItemFormDialog** → EnhancedCalendarService integration
- [ ] **InteractionsSection** → Remove old calendar event creation
- [ ] **ScheduleSection** → UnifiedSchedulingDialog integration (contacts)
- [ ] **TimeEntrySubmit** → Remove automatic calendar creation

### **System Changes:**

- [ ] **Deprecate useCalendarIntegration hook**
- [ ] **Remove CalendarIntegrationToggle from work orders**
- [ ] **Update work order schema** (automatic calendar sync)
- [ ] **Add manager scheduling capabilities**
- [ ] **Update all calendar-related documentation**

### **Testing:**

- [ ] **Unit tests for each migrated component**
- [ ] **Integration tests for calendar workflows**
- [ ] **E2E tests for complete user journeys**
- [ ] **Manual testing of all scheduling paths**

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements:**

✅ **Consistent intelligent calendar selection across all scheduling**
✅ **Automatic calendar sync for work orders and project items**
✅ **Context-aware calendar selection for contact meetings**
✅ **No automatic calendar events for time entries**
✅ **Manager scheduling capabilities for employees**
✅ **Automatic assignee invites for all scheduled items**

### **Technical Requirements:**

✅ **Single calendar service (EnhancedCalendarService)**
✅ **Deprecated old calendar integration system**
✅ **Comprehensive test coverage**
✅ **Consistent UX across all scheduling interfaces**
✅ **Zero manual calendar selection required**

### **Business Requirements:**

✅ **Work orders separate from projects (different service lines)**
✅ **Project items use project calendars**
✅ **Work orders use work order calendars only**
✅ **Manager control over employee scheduling**
✅ **Automatic invite delivery to assignees**

---

## ⏱️ **ESTIMATED TIMELINE**

| Phase                             | Duration      | Priority    |
| --------------------------------- | ------------- | ----------- |
| **Phase 1**: Critical Components  | 2-3 days      | 🔴 Critical |
| **Phase 2**: Remove Old System    | 1-2 days      | 🟡 High     |
| **Phase 3**: Manager Capabilities | 2-3 days      | 🟢 Medium   |
| **Phase 4**: Testing & Validation | 2-3 days      | 🟡 High     |
| **Total**                         | **7-11 days** |             |

**🚀 After completion, the entire application will have unified, intelligent calendar integration that automatically handles context-aware scheduling across all workflows!**
