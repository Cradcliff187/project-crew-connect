# 🚀 Crew‑Connect Refactor – Role‑Based Time‑Tracking & Receipts (Phase 2)

## 📍 Context

**Project:** project‑crew‑connect
**Stack:** React + shadcn/ui • Supabase (Postgres, Auth, Storage) • Google Cloud (Vision API for OCR) • GAS back‑office scripts
**Current branch:** main (tag `time-refactor-phase1`)
**Node:** ≥ 18 (global fetch), pnpm, Vitest/Jest

## 🎯 Goals

1. Implement **two‑role system** (`admin`, `field_user`) enforced in UI **and** Supabase RLS
2. Overhaul **Field User experience**: Mobile‑first Active Work dashboard, Quick Log wizard, Receipt wizard (camera, OCR)
3. Enhance **Admin Time Entry view**: processed checkbox, OT split, filters
4. Centralize persistence logic (`saveTimeEntry`) with labor expense + activity log
5. Expand schema: processed flags, OT, receipts, activity_log, employees.user_id FK
6. Provide automated **Google Vision OCR** service for receipts
7. Remove deprecated components & device‑width branching; switch to **role‑based** routing/menu
8. Deliver tests, docs, and migration scripts

---

## ⏳ Timeline (Revised)

| Day | Milestone                                                             |
| --- | --------------------------------------------------------------------- |
| 0‑1 | Schema migration + seed roles + RLS implementation                    |
| 1‑3 | `saveTimeEntry` helper, OT calc, activity triggers + Auth role system |
| 3‑5 | Field UI (Active Work dashboard, Quick Log wizard, My Entries)        |
| 5‑7 | Admin UI (processed flags, OT columns, filters)                       |
| 7‑9 | GCP OCR function + receipt wizard autofill                            |
| 10  | QA, README updates, release PR                                        |

---

## 🔨 Detailed Tasks

### 1️⃣ Schema & RLS (Day 0-1)

#### **1.1 Database Schema Migration**

**File:** `supabase/migrations/20250527_role_ot_receipts.sql`

```sql
-- Add user_id to employees table for auth linking
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'field_user' CHECK (role IN ('admin', 'field_user'));

-- Extend time_entries for processing and OT
ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS processed_by uuid REFERENCES employees(employee_id),
  ADD COLUMN IF NOT EXISTS hours_regular numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_ot numeric DEFAULT 0;

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(employee_id),
  project_id uuid REFERENCES projects(projectid),
  work_order_id uuid REFERENCES maintenance_work_orders(id),
  amount numeric,
  merchant text,
  tax numeric,
  currency char(3) DEFAULT 'USD',
  receipt_date date,
  ocr_raw jsonb,
  ocr_confidence numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Link receipts to time entries
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS receipt_id uuid REFERENCES receipts(id);

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entry_id uuid REFERENCES time_entries(id),
  user_id uuid REFERENCES employees(employee_id),
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_processed ON time_entries(processed_at);
CREATE INDEX IF NOT EXISTS idx_receipts_employee ON receipts(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entry ON activity_log(entry_id);

-- RLS Policies
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Field users can only see their own unprocessed entries
CREATE POLICY "field_users_own_unprocessed" ON time_entries
  FOR ALL USING (
    CASE
      WHEN auth.jwt() ->> 'role' = 'admin' THEN true
      ELSE (
        employee_id = (
          SELECT employee_id FROM employees WHERE user_id = auth.uid()
        ) AND processed_at IS NULL
      )
    END
  );

-- Similar policies for receipts and activity_log
CREATE POLICY "field_users_own_receipts" ON receipts
  FOR ALL USING (
    CASE
      WHEN auth.jwt() ->> 'role' = 'admin' THEN true
      ELSE employee_id = (
        SELECT employee_id FROM employees WHERE user_id = auth.uid()
      )
    END
  );

CREATE POLICY "activity_log_access" ON activity_log
  FOR ALL USING (
    CASE
      WHEN auth.jwt() ->> 'role' = 'admin' THEN true
      ELSE user_id = (
        SELECT employee_id FROM employees WHERE user_id = auth.uid()
      )
    END
  );
```

#### **1.2 Seed Data for Roles**

**File:** `db/scripts/seed-roles.sql`

```sql
-- Update existing employees with roles (admin for first user, field_user for others)
UPDATE employees SET role = 'admin' WHERE employee_id = (
  SELECT employee_id FROM employees ORDER BY created_at LIMIT 1
);

UPDATE employees SET role = 'field_user' WHERE role IS NULL;
```

### 2️⃣ Auth & Role Context (Day 1-2)

#### **2.1 Enhanced Auth Context**

**File:** `src/contexts/AuthContext.tsx` (extend existing)

```typescript
// Add to existing AuthContextType
type AuthContextType = {
  // ... existing fields
  role: 'admin' | 'field_user' | null;
  employeeId: string | null;
  isAdmin: boolean;
  isFieldUser: boolean;
};

// Add to AuthProvider
const [role, setRole] = useState<'admin' | 'field_user' | null>(null);
const [employeeId, setEmployeeId] = useState<string | null>(null);

// Enhanced session effect
useEffect(() => {
  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('employees')
      .select('employee_id, role')
      .eq('user_id', userId)
      .single();

    if (data) {
      setRole(data.role);
      setEmployeeId(data.employee_id);
    }
  };

  if (session?.user) {
    fetchUserRole(session.user.id);
  }
}, [session]);
```

#### **2.2 Route Guards**

**File:** `src/components/auth/AdminRoute.tsx`

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/active-work" replace />;

  return <>{children}</>;
};
```

### 3️⃣ Shared Logic (Day 2-3)

#### **3.1 Centralized Time Entry Service**

**File:** `src/utils/saveTimeEntry.ts`

```typescript
interface SaveTimeEntryParams {
  entryData: Partial<TimeEntry>;
  receipt?: File;
  actingUser: { employeeId: string; role: string };
}

export const saveTimeEntry = async ({ entryData, receipt, actingUser }: SaveTimeEntryParams) => {
  // 1. Calculate OT (>=40 hrs Mon–Sun)
  const { hours_regular, hours_ot } = calculateOvertimeHours(entryData);

  // 2. Upsert time_entries
  const timeEntryResult = await supabase
    .from('time_entries')
    .upsert({
      ...entryData,
      hours_regular,
      hours_ot,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  // 3. Create matching expenses row (labor)
  await createLaborExpense(timeEntryResult.data);

  // 4. Handle receipt if provided
  let receiptId = null;
  if (receipt) {
    receiptId = await uploadAndProcessReceipt(receipt, timeEntryResult.data.id);
  }

  // 5. Log activity
  await logActivity({
    entry_id: timeEntryResult.data.id,
    user_id: actingUser.employeeId,
    action: entryData.id ? 'update' : 'create',
    payload: { ...entryData, receipt_attached: !!receipt },
  });

  return { ...timeEntryResult.data, receipt_id: receiptId };
};
```

#### **3.2 OT Calculation Utility**

**File:** `src/utils/overtimeCalculation.ts`

```typescript
export const calculateOvertimeHours = (entryData: Partial<TimeEntry>) => {
  // Get all entries for the same employee in the same week
  // Calculate total hours and split into regular (<=40) and OT (>40)
  // Return { hours_regular, hours_ot }
};
```

### 4️⃣ Field UI (Day 3-5)

#### **4.1 Active Work Dashboard**

**File:** `src/pages/active-work/FieldActiveWork.tsx`

```typescript
export const FieldActiveWork: React.FC = () => {
  const { employeeId } = useAuth();

  // Query projects/work orders where assignee = self
  const { data: assignments } = useQuery({
    queryKey: ['field-assignments', employeeId],
    queryFn: () => fetchFieldAssignments(employeeId)
  });

  return (
    <div className="container px-4 py-4">
      <h1 className="text-2xl font-bold mb-6">Active Work</h1>

      <div className="grid gap-4">
        {assignments?.map(assignment => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onLogTime={() => openQuickLog(assignment)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### **4.2 Quick Log Wizard**

**File:** `src/components/time/QuickLogWizard.tsx`

```typescript
// 4-step wizard: Entity & Date → Start/End → Notes & Receipt → Review
// Uses saveTimeEntry utility
// Hides employee select (implied self)
```

#### **4.3 My Entries View**

**File:** `src/components/time/MyEntriesView.tsx`

```typescript
// Card list with weekly navigation
// Shows: OT badge, Receipt ✓, Processed lock
// Tap to edit (disabled if processed)
```

### 5️⃣ Admin UI (Day 5-7)

#### **5.1 Enhanced Admin Time Entry View**

**File:** `src/components/timeTracking/AdminTimeEntryView.tsx`

```typescript
// Enhanced table with columns:
// Date | Employee | Entity | Reg hrs | OT hrs | Receipt | Processed ✓ | Actions
// Bulk "Mark processed" functionality
// Advanced filters: processed status, employee, project
```

### 6️⃣ Receipts OCR (Day 7-9)

#### **6.1 Google Cloud Function**

**File:** `supabase/functions/ocr-receipt/index.ts`

```typescript
// Trigger on storage.objects.finalize in receipts/**
// Use Vision API for text detection
// Parse merchant, total, date with regex heuristics
// Update receipts table with OCR results
```

#### **6.2 Receipt Processing Service**

**File:** `src/services/receiptOcrService.ts`

```typescript
// Frontend service to handle receipt uploads
// Trigger OCR processing
// Display confidence scores and allow manual correction
```

### 7️⃣ Navigation & Cleanup (Day 8-9)

#### **7.1 Role-Based Sidebar**

**File:** `src/components/layout/AppSidebar.tsx` (modify existing)

```typescript
// Filter menu items by role
// Field users: Active Work, Time Tracking, Documents
// Admins: All existing items + Admin Time Entry
```

#### **7.2 Route Configuration**

**File:** `src/App.tsx` (modify existing)

```typescript
// Add role-based routing
// /time-tracking → role === 'field_user' ? <FieldTimeEntryView/> : <AdminTimeEntryView/>
// /active-work → <AdminRoute><FieldActiveWork/></AdminRoute>
```

#### **7.3 Cleanup Deprecated Components**

- Remove `TimeEntryForm` (replaced by wizard)
- Remove `TimeEntryEditDialog` (integrated into views)
- Remove device-width branching logic
- Update imports and references

### 8️⃣ Tests & Documentation (Day 9-10)

#### **8.1 Unit Tests**

**Files:** `src/utils/__tests__/`

- `saveTimeEntry.test.ts`
- `overtimeCalculation.test.ts`
- `receiptOcrService.test.ts`

#### **8.2 E2E Tests**

**Files:** `tests/e2e/`

- Field user log flow
- Admin processed flow
- Edit lock behavior

#### **8.3 Documentation Updates**

**Files:**

- `README.md` - Setup roles, env vars, OCR deployment
- `docs/role-based-access.md` - RLS overview
- `docs/time-tracking-workflows.md` - User workflows

---

## 📦 Deliverables

### **PR: "phase‑2/role‑time‑tracking"**

- ✅ SQL migrations & Supabase schema diff
- ✅ New/updated components & hooks
- ✅ GCP function code + deploy script
- ✅ Unit & e2e tests passing
- ✅ Updated README with setup instructions
- ✅ Demo GIFs: Quick Log mobile, Admin processed toggle

### **Post‑merge Checklist**

- [ ] Staging deployment
- [ ] Data backfill script for existing users
- [ ] Role assignment for current employees
- [ ] OCR function deployment to GCP

---

## 🤔 Implementation Questions

1. **ENV names for Vision API creds:** `GOOGLE_VISION_API_KEY` or service account JSON?
2. **Activity log UI:** Surface in current phase or defer to Phase 3?
3. **Receipt image size limits:** 10MB max for mobile capture?
4. **OT calculation period:** Calendar week (Mon-Sun) or pay period?
5. **Processed entries:** Allow admin to "unprocess" or permanent lock?

---

## 🚨 Critical Dependencies

1. **Google Cloud Vision API** setup and credentials
2. **Supabase Edge Functions** for OCR processing
3. **Role assignment** for existing employees
4. **RLS policy testing** to ensure security
5. **Mobile camera permissions** for receipt capture

---

## 📋 Success Criteria

- [ ] Field users can only see/edit their own unprocessed entries
- [ ] Admins have full access with processing capabilities
- [ ] OT calculation is automatic and accurate
- [ ] Receipt OCR provides 80%+ accuracy for common fields
- [ ] Mobile Quick Log workflow takes <60 seconds
- [ ] All existing functionality remains intact
- [ ] Performance impact <200ms for typical operations

**Begin implementation now with schema migration as first priority.**
