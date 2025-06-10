# Google Calendar API ↔ Frontend Data Alignment Analysis

## 🎯 **Executive Summary**

This document analyzes the alignment between **Google Calendar API v3 event fields** and **AKC CRM frontend data capture**, identifying gaps and providing enhancement strategies for optimal calendar integration.

---

## 📊 **Google Calendar API Event Fields (Complete)**

### **🔴 Required Fields**

| Field   | Type   | Description                              | Status in Frontend                      |
| ------- | ------ | ---------------------------------------- | --------------------------------------- |
| `start` | object | Start time with dateTime/date + timeZone | ✅ **CAPTURED** (startDate + startTime) |
| `end`   | object | End time with dateTime/date + timeZone   | ✅ **CAPTURED** (endDate + endTime)     |

### **🟢 Core Optional Fields**

| Field         | Type   | Description                          | Status in Frontend                  |
| ------------- | ------ | ------------------------------------ | ----------------------------------- |
| `summary`     | string | Event title/name                     | ✅ **CAPTURED** (title field)       |
| `description` | string | Event description (can contain HTML) | ✅ **CAPTURED** (description field) |
| `location`    | string | Geographic location as free text     | ✅ **CAPTURED** (location field)    |
| `colorId`     | string | Color coding (1-11)                  | ❌ **MISSING**                      |

### **🟡 Advanced Optional Fields**

| Field                        | Type    | Description                              | Status in Frontend                    |
| ---------------------------- | ------- | ---------------------------------------- | ------------------------------------- |
| `attendees[]`                | array   | Event attendees with email, name, status | 🟡 **PARTIAL** (assignees captured)   |
| `attendees[].email`          | string  | Required for each attendee               | ❌ **MISSING** (need email mapping)   |
| `attendees[].displayName`    | string  | Attendee name                            | 🟡 **PARTIAL** (have IDs, need names) |
| `attendees[].optional`       | boolean | Whether attendee is optional             | ❌ **MISSING**                        |
| `attendees[].responseStatus` | string  | needsAction/accepted/declined/tentative  | ❌ **MISSING**                        |

### **🔵 Conference & Meeting Fields**

| Field                          | Type   | Description             | Status in Frontend |
| ------------------------------ | ------ | ----------------------- | ------------------ |
| `conferenceData`               | object | Google Meet integration | ❌ **MISSING**     |
| `conferenceData.createRequest` | object | Auto-create Google Meet | ❌ **MISSING**     |
| `hangoutLink`                  | string | Legacy Hangout link     | ❌ **MISSING**     |

### **🟣 Recurrence & Timing Fields**

| Field                   | Type    | Description                    | Status in Frontend             |
| ----------------------- | ------- | ------------------------------ | ------------------------------ |
| `recurrence[]`          | array   | RRULE for repeating events     | 🟡 **PARTIAL** (schema exists) |
| `reminders.overrides[]` | array   | Custom reminder settings       | ❌ **MISSING**                 |
| `reminders.useDefault`  | boolean | Use default calendar reminders | ❌ **MISSING**                 |
| `transparency`          | string  | Show as busy/free              | ❌ **MISSING**                 |

### **🔶 Advanced Features**

| Field                        | Type   | Description                            | Status in Frontend            |
| ---------------------------- | ------ | -------------------------------------- | ----------------------------- |
| `extendedProperties.private` | object | App-specific metadata                  | ✅ **USED** (entity tracking) |
| `extendedProperties.shared`  | object | Shared metadata across calendars       | ❌ **MISSING**                |
| `attachments[]`              | array  | File attachments (max 25)              | ❌ **MISSING**                |
| `eventType`                  | string | default/birthday/focusTime/outOfOffice | ❌ **MISSING**                |
| `visibility`                 | string | private/public/confidential            | ❌ **MISSING**                |

### **🔸 Guest Management**

| Field                     | Type    | Description                       | Status in Frontend |
| ------------------------- | ------- | --------------------------------- | ------------------ |
| `guestsCanInviteOthers`   | boolean | Attendees can invite others       | ❌ **MISSING**     |
| `guestsCanModify`         | boolean | Attendees can modify event        | ❌ **MISSING**     |
| `guestsCanSeeOtherGuests` | boolean | Attendees can see other attendees | ❌ **MISSING**     |

---

## 🎯 **Frontend Data Capture Analysis**

### **✅ Well-Captured Fields**

- **Basic Event Data**: title, description, start/end dates & times
- **Location**: Full location capture
- **Entity Context**: project_id, entityType, entityId
- **Assignment**: assignees (by ID and type)
- **Calendar Integration**: send_invite flag, calendar_integration_enabled

### **🟡 Partially Captured Fields**

- **Attendees**: Capture assignee IDs but missing email addresses and permissions
- **Recurrence**: Schema exists but UI implementation limited
- **Time Zones**: Hardcoded to 'America/New_York' instead of user preference

### **❌ Missing Opportunities**

- **Event Categorization**: No color coding or event types
- **Google Meet Integration**: No automatic meeting creation
- **Reminder Management**: No custom reminder settings
- **File Attachments**: No document linking
- **Advanced Guest Management**: No granular permissions
- **Availability Settings**: No busy/free transparency

---

## 🚀 **Enhancement Roadmap**

### **🔥 Priority 1: Core Improvements (Immediate)**

#### **1. Email Address Mapping**

```typescript
// Enhanced assignee structure
interface EnhancedAssignee {
  type: 'employee' | 'subcontractor';
  id: string;
  email: string; // 🆕 Required for Google Calendar
  displayName: string; // 🆕 For better UX
  optional?: boolean; // 🆕 Optional attendee flag
}
```

#### **2. Color Coding System**

```typescript
// Add to event creation
interface EventColorOptions {
  colorId: string; // '1'-'11' for Google Calendar colors
  category: 'meeting' | 'deadline' | 'milestone' | 'inspection' | 'default';
}

// Color mapping
const COLOR_MAP = {
  meeting: '4', // Blue
  deadline: '11', // Red
  milestone: '5', // Yellow
  inspection: '6', // Orange
  default: '1', // Lavender
};
```

#### **3. Time Zone Enhancement**

```typescript
// Replace hardcoded timezone
interface TimeZoneConfig {
  userTimeZone: string; // From user preferences
  projectTimeZone: string; // From project settings
  autoDetect: boolean; // Browser timezone detection
}
```

### **🔶 Priority 2: Advanced Features (Short Term)**

#### **4. Google Meet Integration**

```typescript
interface ConferenceSettings {
  autoCreateMeet: boolean;
  meetingType: 'google_meet' | 'none';
  externalMeetingUrl?: string;
}
```

#### **5. Reminder Management**

```typescript
interface ReminderSettings {
  useDefault: boolean;
  overrides: Array<{
    method: 'email' | 'popup';
    minutes: number; // 15, 30, 60, 1440 (24hrs)
  }>;
}
```

#### **6. Enhanced Recurrence**

```typescript
interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N periods
  endCondition: 'never' | 'count' | 'until';
  endValue?: number | Date;
  weekdays?: number[]; // For weekly: [1,2,3,4,5] = weekdays
}
```

### **🟣 Priority 3: Professional Features (Medium Term)**

#### **7. File Attachments**

```typescript
interface EventAttachment {
  fileUrl: string;
  title: string;
  mimeType: string;
  source: 'drive' | 'dropbox' | 'local';
}
```

#### **8. Guest Management**

```typescript
interface GuestPermissions {
  canInviteOthers: boolean;
  canModify: boolean;
  canSeeOtherGuests: boolean;
  sendNotifications: 'all' | 'externalOnly' | 'none';
}
```

#### **9. Event Categories**

```typescript
interface EventType {
  type: 'default' | 'focusTime' | 'outOfOffice' | 'workingLocation';
  workingLocation?: {
    type: 'home' | 'office' | 'client_site';
    customLocation?: string;
  };
}
```

---

## 🔄 **Data Transformation Mapping**

### **Frontend → Google Calendar API**

```typescript
function transformToGoogleCalendar(frontendData: ScheduleFormData): GoogleCalendarEvent {
  return {
    // ✅ Core mappings (already working)
    summary: frontendData.title,
    description: frontendData.description,
    location: frontendData.location,
    start: {
      dateTime: frontendData.startDateTime,
      timeZone: frontendData.timeZone || 'America/New_York',
    },
    end: {
      dateTime: frontendData.endDateTime,
      timeZone: frontendData.timeZone || 'America/New_York',
    },

    // 🆕 Enhanced mappings
    colorId: mapCategoryToColor(frontendData.category),
    attendees: frontendData.assignees.map(assignee => ({
      email: assignee.email,
      displayName: assignee.displayName,
      optional: assignee.optional || false,
      responseStatus: 'needsAction',
    })),

    // 🆕 Conference integration
    conferenceData: frontendData.autoCreateMeet
      ? {
          createRequest: {
            requestId: generateUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        }
      : undefined,

    // 🆕 Reminders
    reminders: {
      useDefault: frontendData.reminders?.useDefault || false,
      overrides: frontendData.reminders?.overrides || [
        { method: 'email', minutes: 1440 }, // 24 hours
        { method: 'popup', minutes: 30 }, // 30 minutes
      ],
    },

    // ✅ Metadata (already working)
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

### **Google Calendar API → Frontend**

```typescript
function transformFromGoogleCalendar(googleEvent: GoogleCalendarEvent): ScheduleFormData {
  return {
    title: googleEvent.summary,
    description: googleEvent.description,
    location: googleEvent.location,
    startDateTime: googleEvent.start.dateTime,
    endDateTime: googleEvent.end.dateTime,
    timeZone: googleEvent.start.timeZone,

    // 🆕 Enhanced reverse mapping
    category: mapColorToCategory(googleEvent.colorId),
    assignees:
      googleEvent.attendees?.map(attendee => ({
        email: attendee.email,
        displayName: attendee.displayName,
        optional: attendee.optional,
        responseStatus: attendee.responseStatus,
      })) || [],

    // 🆕 Meeting info
    meetingUrl: googleEvent.conferenceData?.entryPoints?.[0]?.uri,

    // 🆕 Reminders
    reminders: {
      useDefault: googleEvent.reminders.useDefault,
      overrides: googleEvent.reminders.overrides,
    },

    // Metadata
    entityType: googleEvent.extendedProperties?.private?.entityType,
    entityId: googleEvent.extendedProperties?.private?.entityId,
    projectId: googleEvent.extendedProperties?.private?.projectId,
  };
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Enhancements**

- [ ] **Email Resolution System**: Create service to map assignee IDs to email addresses
- [ ] **Color Coding**: Add category field to forms with color mapping
- [ ] **Time Zone Detection**: Implement user timezone preferences
- [ ] **Enhanced Error Handling**: Better validation for required fields

### **Phase 2: Advanced Features**

- [ ] **Google Meet Integration**: Add automatic meeting creation option
- [ ] **Custom Reminders**: Add reminder configuration UI
- [ ] **Recurrence UI**: Complete recurring event interface
- [ ] **Attendee Management**: Enhanced attendee permissions UI

### **Phase 3: Professional Features**

- [ ] **File Attachments**: Document linking system
- [ ] **Event Templates**: Pre-configured event types
- [ ] **Bulk Operations**: Multiple event creation/editing
- [ ] **Calendar Sync Status**: Real-time sync monitoring

---

## 🎯 **Success Metrics**

### **Technical KPIs**

- **Sync Success Rate**: Target 99.5% successful calendar syncs
- **Data Completeness**: 100% of core fields properly mapped
- **Error Reduction**: <1% calendar integration errors

### **User Experience KPIs**

- **Feature Adoption**: 80% of users utilizing enhanced calendar features
- **Time Savings**: 50% reduction in manual calendar management
- **User Satisfaction**: 90%+ satisfaction with calendar integration

### **Business Impact KPIs**

- **Meeting Efficiency**: 25% reduction in scheduling conflicts
- **Communication Quality**: 90% of meetings include proper attendees
- **Project Coordination**: 100% of project events properly synchronized

---

## 🔧 **Technical Implementation Notes**

### **API Rate Limits**

- Google Calendar API: 1,000 requests per 100 seconds per user
- Implement intelligent batching for bulk operations
- Use exponential backoff for rate limit handling

### **Data Consistency**

- Implement bidirectional sync validation
- Add conflict resolution for simultaneous edits
- Maintain audit trail for calendar operations

### **Security Considerations**

- Encrypt sensitive calendar data in transit and at rest
- Implement proper OAuth scope management
- Add calendar access permission controls

---

_This analysis provides a comprehensive roadmap for optimizing Google Calendar integration in the AKC CRM system, ensuring maximum feature utilization while maintaining data integrity and user experience._
