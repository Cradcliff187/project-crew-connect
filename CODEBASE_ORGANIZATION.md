# 📁 CODEBASE ORGANIZATION & ARCHITECTURE

## 🎯 **CURRENT STATE SUMMARY**

This is a **React + TypeScript + Supabase** construction management application with **Google Calendar integration**. The system has been enhanced with an **intelligent scheduling system** that provides context-aware calendar management.

### **🚀 LATEST MAJOR UPDATES**

- ✅ **Enhanced Scheduling System** - Intelligent calendar selection and UX improvements
- ✅ **API URL Fixes** - Resolved 401 Unauthorized errors with proper proxy configuration
- ✅ **Google Calendar Integration** - Full OAuth flow and calendar sync functionality
- ✅ **Uniform UX** - Context-aware dropdowns and cognitive load reduction

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Frontend (React + TypeScript + Vite)**

- **Port**: `8080` (Vite dev server)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + context

### **Backend (Express.js + Node.js)**

- **Port**: `3000` (Express server)
- **Authentication**: Google OAuth 2.0 with session-based auth
- **Database**: Supabase (PostgreSQL)
- **APIs**: Google Calendar, Gmail, Drive, Sheets, Docs, Maps

### **Database (Supabase)**

- **Type**: PostgreSQL with real-time subscriptions
- **Auth**: Supabase Auth + Google OAuth integration
- **Storage**: File uploads and document management

---

## 📂 **DIRECTORY STRUCTURE**

```
AKC Revisions-V1/
├── 📁 src/                          # Frontend source code
│   ├── 📁 components/               # React components
│   │   ├── 📁 scheduling/           # 🆕 Intelligent scheduling system
│   │   │   └── UnifiedSchedulingDialog.tsx
│   │   ├── 📁 common/               # Shared components
│   │   ├── 📁 layout/               # Layout components
│   │   └── 📁 ui/                   # shadcn/ui components
│   ├── 📁 services/                 # 🆕 Business logic services
│   │   ├── calendarSelectionService.ts    # Smart calendar selection
│   │   └── enhancedCalendarService.ts     # Calendar event management
│   ├── 📁 hooks/                    # Custom React hooks
│   │   └── useGoogleCalendar.tsx    # Google Calendar integration
│   ├── 📁 pages/                    # Page components
│   │   └── SchedulingPage.tsx       # 🆕 Scheduling center
│   └── 📁 integrations/             # Third-party integrations
│       └── 📁 supabase/             # Supabase client & types
├── 📁 server/                       # Backend Express server
│   ├── server.js                    # Main server file
│   └── 📁 google-api-helpers/       # Google API integration
├── 📁 db/                          # Database scripts & migrations
├── 📁 docs/                        # Documentation
└── 📁 tests/                       # Test files
```

---

## 🔧 **KEY SERVICES & COMPONENTS**

### **🆕 Intelligent Scheduling System**

#### **1. CalendarSelectionService** (`src/services/calendarSelectionService.ts`)

**Purpose**: Intelligently determines which calendar(s) to use based on context

```typescript
// Context-aware calendar selection
CalendarSelectionService.selectCalendars(context) → CalendarSelection
```

**Business Rules**:

- **Project items** → AJC Projects Calendar + assignee invites
- **Work orders** → Work Orders Calendar + assignee invites
- **Client meetings (project)** → AJC Projects Calendar + attendee invites
- **Client meetings (general)** → Personal Calendar + attendee invites
- **Personal tasks** → Personal Calendar + assignee invites

#### **2. EnhancedCalendarService** (`src/services/enhancedCalendarService.ts`)

**Purpose**: Handles multiple calendar event creation and individual invites

```typescript
// Create events with intelligent calendar selection
EnhancedCalendarService.createEvent(eventData) → CalendarEventResult
```

#### **3. UnifiedSchedulingDialog** (`src/components/scheduling/UnifiedSchedulingDialog.tsx`)

**Purpose**: Single scheduling interface for all entity types

- ✅ Context-aware dropdowns (projects/work orders)
- ✅ Google Calendar field alignment
- ✅ Automatic assignee email lookup
- ✅ Real-time calendar preview

#### **4. SchedulingPage** (`src/pages/SchedulingPage.tsx`)

**Purpose**: Central scheduling hub accessible from sidebar

- ✅ Visual scheduling type cards
- ✅ Feature explanations and examples
- ✅ One-click scheduling with context

---

## 🌐 **API ARCHITECTURE**

### **Proxy Configuration** (Critical for Development)

```typescript
// vite.config.ts - Forwards frontend API calls to backend
proxy: {
  '/api': { target: 'http://localhost:3000' },
  '/auth/google': { target: 'http://localhost:3000' }
}
```

### **Backend API Endpoints**

```
Authentication:
  GET  /api/auth/status           # Check auth status
  POST /api/auth/logout           # Logout user
  GET  /auth/google               # Initiate OAuth
  GET  /auth/google/callback      # OAuth callback

Calendar:
  GET  /api/calendar/config       # Calendar configuration
  POST /api/calendar/events       # Create calendar event
  POST /api/calendar/invites      # Send individual invites
  GET  /api/calendar/list         # List user calendars

Data:
  GET  /api/projects              # 🆕 Project dropdown data
  GET  /api/work-orders           # 🆕 Work order dropdown data
  GET  /api/assignees/{type}/{id}/email  # 🆕 Email lookup
```

---

## 🔐 **AUTHENTICATION FLOW**

### **Google OAuth 2.0 Integration**

1. **Frontend**: User clicks "Connect Google Calendar"
2. **Redirect**: `/auth/google` → Google OAuth consent screen
3. **Callback**: Google redirects to `/auth/google/callback`
4. **Session**: Backend stores tokens in Express session
5. **Frontend**: Checks auth status via `/api/auth/status`

### **Session Management**

- **Storage**: Express sessions with secure cookies
- **Credentials**: All API calls use `credentials: 'include'`
- **Validation**: `requireAuth` middleware validates tokens

---

## 📊 **DATABASE SCHEMA (Key Tables)**

### **Core Entities**

```sql
projects              # Project management
├── projectid (PK)
├── projectname
└── status

maintenance_work_orders  # Work order management
├── work_order_id (PK)
├── title
└── status

schedule_items        # Project scheduling
├── id (PK)
├── title, description
├── start_datetime, end_datetime
├── assignee_id, assignee_type
└── google_event_id   # Calendar sync

employees             # Employee management
├── employee_id (PK)
└── email

subcontractors        # Subcontractor management
├── subid (PK)
└── contactemail
```

---

## 🎨 **UI/UX DESIGN SYSTEM**

### **Component Library**: shadcn/ui + Tailwind CSS

- **Colors**: Blue (projects), Orange (work orders), Green (meetings), Purple (personal)
- **Typography**: Clear hierarchy with proper spacing
- **Icons**: Lucide React icons for consistency
- **Animations**: Subtle hover effects and transitions

### **Design Principles**

- ✅ **Cognitive Load Reduction**: Progressive disclosure, smart defaults
- ✅ **Context Awareness**: Show only relevant options
- ✅ **Visual Hierarchy**: Clear sections with icons and badges
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation

---

## 🚀 **DEVELOPMENT WORKFLOW**

### **Starting the Application**

```bash
# Terminal 1: Backend server
cd server && node server.js

# Terminal 2: Frontend server
npm run dev
```

### **Environment Setup**

- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:3000`
- **Database**: Supabase cloud instance
- **Auth**: Google OAuth with configured redirect URIs

### **Key Environment Variables**

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_CALENDAR_PROJECT=group_calendar_id
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## 📋 **TESTING & VERIFICATION**

### **Health Checks**

```bash
# Backend health
curl http://localhost:3000/

# Frontend health
curl http://localhost:8080/

# API proxy test
curl http://localhost:8080/api/auth/status
```

### **Calendar Integration Test**

```bash
# Run the demo script
node calendar-integration-demo.js
```

---

## 🔮 **FUTURE DEVELOPMENT GUIDELINES**

### **For New AI Agents**

#### **1. Understanding the Current State**

- ✅ Read this document first
- ✅ Check `UX_IMPROVEMENTS_SUMMARY.md` for recent changes
- ✅ Review `API_URL_FIX_SUMMARY.md` for proxy configuration
- ✅ Understand the intelligent scheduling architecture

#### **2. Making Changes**

- ✅ **Services**: Add new business logic to `src/services/`
- ✅ **Components**: Follow the established component structure
- ✅ **API**: Add new endpoints to `server/server.js`
- ✅ **Database**: Use migration scripts in `db/migrations/`

#### **3. Testing Changes**

- ✅ Test both servers are running
- ✅ Verify API proxy functionality
- ✅ Check authentication flow
- ✅ Test calendar integration

#### **4. Documentation**

- ✅ Update this document for architectural changes
- ✅ Create summary documents for major features
- ✅ Document API changes in appropriate files

---

## 🎯 **CRITICAL SUCCESS FACTORS**

### **✅ What's Working Well**

- Intelligent calendar selection system
- Context-aware UI with reduced cognitive load
- Proper API routing through Vite proxy
- Google Calendar integration with OAuth
- Uniform scheduling experience

### **⚠️ What to Maintain**

- Proxy configuration for API calls
- Session-based authentication flow
- Calendar selection business logic
- Component organization and naming
- Documentation standards

### **🚀 What's Ready for Extension**

- Additional entity types for scheduling
- More calendar providers (Outlook, etc.)
- Enhanced assignee management
- Advanced scheduling features
- Mobile responsiveness improvements

---

## 📞 **QUICK REFERENCE**

### **Key Files to Know**

- `src/components/scheduling/UnifiedSchedulingDialog.tsx` - Main scheduling interface
- `src/services/calendarSelectionService.ts` - Calendar selection logic
- `server/server.js` - Backend API and authentication
- `vite.config.ts` - Proxy configuration (CRITICAL)

### **Common Tasks**

- **Add new entity type**: Update CalendarSelectionService + UnifiedSchedulingDialog
- **Add new API endpoint**: Add to server.js + update frontend service
- **Fix auth issues**: Check proxy config + session handling
- **Add new calendar**: Update calendar selection business rules

**🎉 The codebase is now clean, organized, and ready for future development!**
