# Google Calendar API ↔ Frontend Data Alignment Analysis

## 🎯 **Executive Summary**

This document analyzes the alignment between **Google Calendar API v3 event fields** and **AKC CRM frontend data capture**, identifying gaps and providing enhancement strategies.

---

## 📊 **Google Calendar API Event Fields Analysis**

### **🔴 Required Fields**

| Field   | Type                         | Frontend Status |
| ------- | ---------------------------- | --------------- |
| `start` | object (dateTime + timeZone) | ✅ **CAPTURED** |
| `end`   | object (dateTime + timeZone) | ✅ **CAPTURED** |

### **🟢 Core Optional Fields We're Missing**

| Field               | Type   | Current Gap    | Enhancement Opportunity              |
| ------------------- | ------ | -------------- | ------------------------------------ |
| `colorId`           | string | ❌ **MISSING** | Add event categorization with colors |
| `attendees[].email` | string | ❌ **MISSING** | Need email mapping for assignees     |
| `conferenceData`    | object | ❌ **MISSING** | Auto-create Google Meet links        |
| `reminders`         | object | ❌ **MISSING** | Custom reminder settings             |
| `eventType`         | string | ❌ **MISSING** | Work location/focus time support     |
| `attachments[]`     | array  | ❌ **MISSING** | Document linking                     |
| `visibility`        | string | ❌ **MISSING** | Private/public event control         |

### **🟡 Partially Implemented**

| Field         | Current Implementation       | Gap                       |
| ------------- | ---------------------------- | ------------------------- |
| `attendees[]` | Assignee IDs captured        | Missing email addresses   |
| `recurrence`  | Schema exists                | Limited UI implementation |
| `timeZone`    | Hardcoded 'America/New_York' | No user preferences       |

---

## 🎯 **Frontend Data Capture Analysis**

### **✅ Currently Well-Captured**

- **Basic Event Data**: title → summary, description, location
- **Timing**: start/end dates & times
- **Entity Context**: project_id, entityType, entityId
- **Assignment**: assignee IDs and types
- **Integration Flags**: send_invite, calendar_integration_enabled

### **❌ Key Missing Opportunities**

- **Email Resolution**: Assignee IDs → Email addresses for invites
- **Event Categorization**: No color coding or categories
- **Google Meet**: No automatic meeting creation
- **File Attachments**: No document linking to events
- **Reminder Management**: No custom reminder settings
- **Advanced Permissions**: No guest management controls

---

## 🚀 **Priority Enhancement Roadmap**

### **🔥 Phase 1: Critical Fixes (Immediate)**

#### **1. Email Address Resolution**

```typescript
interface EnhancedAssignee {
  type: 'employee' | 'subcontractor';
  id: string;
  email: string; // 🆕 CRITICAL for Google Calendar
  displayName: string; // 🆕 Better UX
  optional?: boolean; // 🆕 Optional attendee flag
}
```

#### **2. Event Color Coding**

```typescript
const EVENT_COLORS = {
  meeting: '4', // Blue - Client meetings
  deadline: '11', // Red - Project deadlines
  milestone: '5', // Yellow - Project milestones
  inspection: '6', // Orange - Inspections
  maintenance: '2', // Green - Maintenance work
  default: '1', // Lavender - General events
};
```

#### **3. Time Zone Enhancement**

```typescript
interface TimeZoneConfig {
  userTimeZone: string; // From user profile
  projectTimeZone: string; // From project settings
  autoDetect: boolean; // Browser detection
}
```

### **🔶 Phase 2: Advanced Features (Short Term)**

#### **4. Google Meet Integration**

```typescript
interface ConferenceOptions {
  autoCreateMeet: boolean;
  requireMeeting: boolean;
  externalMeetingUrl?: string;
}
```

#### **5. Smart Reminders**

```typescript
interface ReminderConfig {
  useDefault: boolean;
  custom: Array<{
    method: 'email' | 'popup';
    minutes: number; // 15, 30, 1440 (24hrs), etc.
  }>;
}
```

---

## 🔄 **Data Transformation Examples**

### **Enhanced Frontend → Google Calendar**

```typescript
function createCalendarEvent(frontendData: ScheduleFormData): GoogleCalendarEvent {
  return {
    // ✅ Current mappings (working)
    summary: frontendData.title,
    description: frontendData.description,
    location: frontendData.location,
    start: {
      dateTime: frontendData.startDateTime,
      timeZone: getUserTimeZone(), // 🆕 Dynamic timezone
    },
    end: {
      dateTime: frontendData.endDateTime,
      timeZone: getUserTimeZone(),
    },

    // 🆕 Enhanced features
    colorId: mapCategoryToColor(frontendData.category),
    attendees: await resolveAssigneeEmails(frontendData.assignees),
    conferenceData: frontendData.autoCreateMeet ? createMeetRequest() : undefined,
    reminders: buildCustomReminders(frontendData.reminders),

    // ✅ Metadata (working)
    extendedProperties: {
      private: {
        appSource: 'akc_crm',
        entityType: frontendData.entityType,
        entityId: frontendData.entityId,
        projectId: frontendData.projectId,
      },
    },
  };
}
```

### **Email Resolution Service**

```typescript
async function resolveAssigneeEmails(
  assignees: AssigneeInput[]
): Promise<GoogleCalendarAttendee[]> {
  const attendees = [];

  for (const assignee of assignees) {
    let email: string;

    if (assignee.type === 'employee') {
      const employee = await getEmployee(assignee.id);
      email = employee.email;
    } else if (assignee.type === 'subcontractor') {
      const subcontractor = await getSubcontractor(assignee.id);
      email = subcontractor.email;
    }

    attendees.push({
      email,
      displayName: assignee.displayName,
      responseStatus: 'needsAction',
      optional: assignee.optional || false,
    });
  }

  return attendees;
}
```

---

## 📋 **Implementation Checklist**

### **Immediate Actions (This Week)**

- [ ] **Create Email Resolution Service** - Map assignee IDs to emails
- [ ] **Add Color Coding** - Event category with color mapping
- [ ] **Fix Time Zone Handling** - Replace hardcoded timezone
- [ ] **Enhanced Error Handling** - Better validation for required fields

### **Short Term (Next Sprint)**

- [ ] **Google Meet Integration** - Auto-create meeting links
- [ ] **Custom Reminders** - User-configurable reminder settings
- [ ] **Attendee Status Tracking** - Track invite responses
- [ ] **Event Templates** - Pre-configured event types

### **Medium Term (Next Month)**

- [ ] **File Attachments** - Link documents to calendar events
- [ ] **Bulk Operations** - Create multiple events efficiently
- [ ] **Sync Status Monitoring** - Real-time sync status
- [ ] **Advanced Permissions** - Guest management controls

---

## 🎯 **Success Metrics**

### **Technical KPIs**

- **Sync Success Rate**: Target 99.5%
- **Email Resolution**: 100% of assignees have valid emails
- **API Utilization**: Use 80%+ of relevant Google Calendar features

### **User Experience KPIs**

- **Feature Adoption**: 80% using enhanced calendar features
- **Error Reduction**: <1% calendar sync failures
- **Time Savings**: 50% less manual calendar management

---

## 💡 **Quick Win Implementation**

### **Today's Priority Fix**

The current calendar event creation issue is due to missing email addresses. Here's the immediate fix:

```typescript
// Add to server-google-calendar-auth.cjs
async function resolveAssigneeEmail(assigneeType: string, assigneeId: string) {
  if (assigneeType === 'employee') {
    // Query employees table
    const { data } = await supabase
      .from('employees')
      .select('email, first_name, last_name')
      .eq('id', assigneeId)
      .single();

    return {
      email: data.email,
      displayName: `${data.first_name} ${data.last_name}`,
    };
  } else if (assigneeType === 'subcontractor') {
    // Query subcontractors table
    const { data } = await supabase
      .from('subcontractors')
      .select('email, company_name')
      .eq('id', assigneeId)
      .single();

    return {
      email: data.email,
      displayName: data.company_name,
    };
  }

  return null;
}
```

This analysis provides a clear roadmap for maximizing Google Calendar integration while addressing immediate issues and planning strategic enhancements.
