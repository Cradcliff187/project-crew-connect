# 🎯 Comprehensive Design & Functionality Game Plan

**Date:** 2025-05-29
**Branch:** `maintenance/system-validation-check`
**Scope:** Fix all broken functionality + Implement consistent design system
**Timeline:** 3 weeks

## 📊 Executive Summary

This plan addresses **two critical objectives simultaneously:**

1. **🔧 Fix 40+ broken buttons** and restore core business functionality
2. **🎨 Implement consistent design system** based on successful Time Entry Management and Scheduling patterns

**Strategy:** Since we're already touching every component to fix functionality, we'll implement the design system at the same time to avoid future disruption.

---

## 🎨 Design System Foundation

### **AKC LLC Brand Integration**

Our design system is now **fully aligned** with the enhanced AKC LLC Brand Guidelines (see `AKC_BRAND_GUIDELINES.md`). The implementation preserves your core brand identity while extending it for modern digital applications.

#### **Brand Color Preservation:**

- **Primary Brand Blue:** `#0485ea` (unchanged from your guidelines)
- **Interactive Blue:** `#0375d1` (hover states)
- **Logo Color:** Always `#0485ea` (strictly preserved)

#### **Typography Alignment:**

- **Montserrat Bold:** Page headers and section titles
- **Montserrat Regular:** Subheadings and emphasis
- **Open Sans Regular:** Body text and descriptions
- **Open Sans Medium:** Button text and form labels

#### **Enhanced Accessibility:**

- Improved text color from `#333333` to `#334155` for better contrast
- All color combinations meet WCAG 2.1 AA standards
- Minimum 4.5:1 contrast ratio for normal text

### **Reference Implementations (Successful Patterns)**

#### **Time Entry Management Design Pattern:**

- **Background:** `bg-gradient-to-br from-slate-50 via-white to-blue-50`
- **Header:** Large title with icon, subtitle, role badge
- **Summary Cards:** Gradient cards with colored icons and metrics
- **Filters:** Clean card-based filter section
- **Tables:** Hover effects, proper spacing, icon integration
- **Actions:** Consistent button styling with icons

#### **Scheduling Design Pattern:**

- **Dialogs:** Clean, well-structured with sections
- **Form Layout:** Logical grouping with separators
- **Context Awareness:** Smart badges and alerts
- **Button Styling:** `bg-[#0485ea] hover:bg-[#0375d1]` (brand colors)
- **Icon Integration:** Meaningful icons with consistent sizing

### **Core Design Principles (Brand-Aligned):**

1. **AKC Brand Color Palette:**

   - **Primary Blue:** `#0485ea` (signature brand color)
   - **Interactive Blue:** `#0375d1` (hover states)
   - **Background Gradient:** `bg-gradient-to-br from-slate-50 via-white to-blue-50`
   - **Card Gradients:** `from-{color}-50 to-{color}-100 border-{color}-200`
   - **Functional Colors:** Success green, warning orange, error red

2. **AKC Typography System:**

   - **Page Headers:** `text-3xl font-bold text-gray-900` (Montserrat Bold)
   - **Section Headers:** `text-xl font-semibold text-gray-900` (Montserrat Bold)
   - **Body Text:** `text-base text-gray-600` (Open Sans Regular)
   - **Button Text:** `text-sm font-medium` (Open Sans Medium)

3. **Professional Layout Standards:**

   - **Container:** `container mx-auto px-4 py-6`
   - **Card Spacing:** `mb-6` or `mb-8`
   - **Grid Layouts:** Responsive with proper gaps
   - **Clean, minimalist approach** (brand guideline compliance)

4. **Interactive Elements:**
   - **Hover Effects:** `hover:bg-gray-50`, `hover:shadow-lg`
   - **Icons:** Consistent sizing (`h-4 w-4`, `h-5 w-5`, `h-8 w-8`)
   - **Buttons:** Icon + text pattern with brand colors

---

## 🚀 Implementation Strategy

### **Phase 1: Critical Workflow Restoration + Design (Week 1)**

#### **1.1 Field User Dashboard**

**File:** `src/pages/FieldUserDashboard.tsx`
**Priority:** 🔴 CRITICAL

**Functionality Fixes:**

- ✅ Fix Add Receipt button (no click handler)
- ✅ Implement receipt upload dialog
- ✅ Fix OCR endpoint integration

**Design Updates:**

- ✅ Apply gradient background pattern
- ✅ Redesign header with icon and description
- ✅ Convert action cards to gradient style
- ✅ Add hover effects and proper spacing
- ✅ Implement consistent button styling

**Implementation:**

```typescript
// Background update (brand-aligned gradient)
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

// Header redesign (Montserrat Bold + brand blue icon)
<h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
  <User className="h-8 w-8 mr-3 text-blue-600" />
  Field User Dashboard
</h1>

// Subtitle (Open Sans Regular)
<p className="text-gray-600 font-opensans">Manage your daily tasks and upload receipts</p>

// Action cards with brand-aligned gradients
<Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
  <CardContent className="p-6 text-center">
    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
      <Camera className="h-6 w-6 text-green-600" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1 font-montserrat">Add Receipt</h3>
    <p className="text-sm text-gray-600 font-opensans">Scan expense receipts</p>
  </CardContent>
</Card>
```

#### **1.2 Work Order Management**

**Files:** `src/components/workOrders/components/WorkOrderRow.tsx`, related components
**Priority:** 🔴 CRITICAL

**Functionality Fixes:**

- ✅ Fix Schedule button (console.log only)
- ✅ Fix Messages button (console.log only)
- ✅ Implement scheduling dialog integration
- ✅ Fix expense/material editing buttons

**Design Updates:**

- ✅ Apply consistent table styling
- ✅ Update action menu styling
- ✅ Implement proper hover effects
- ✅ Add meaningful icons and badges

#### **1.3 Active Work Management**

**File:** `src/components/activeWork/ActiveWorkTable.tsx`
**Priority:** 🔴 CRITICAL

**Functionality Fixes:**

- ✅ Fix 12+ broken buttons (Add time log, Add document, Update status, etc.)
- ✅ Implement time logging functionality
- ✅ Implement document upload
- ✅ Implement status updates

**Design Updates:**

- ✅ Complete page redesign with gradient background
- ✅ Add summary cards with metrics
- ✅ Redesign table with proper styling
- ✅ Implement consistent action buttons

### **Phase 2: Contact & Project Management + Design (Week 2)**

#### **2.1 Contact Management**

**File:** `src/components/contacts/ContactCard.tsx`
**Priority:** 🔴 CRITICAL

**Functionality Fixes:**

- ✅ Fix 8+ broken buttons (View materials, Assign to project, Send email, etc.)
- ✅ Implement meeting scheduling
- ✅ Implement email functionality
- ✅ Implement project assignment

**Design Updates:**

- ✅ Redesign contact cards with gradient styling
- ✅ Implement consistent action menu
- ✅ Add proper hover effects and transitions
- ✅ Update typography and spacing

#### **2.2 Project Management**

**Files:** `src/components/projects/components/ProjectRow.tsx`, `src/components/projects/ProjectsHeader.tsx`
**Priority:** 🔴 CRITICAL

**Functionality Fixes:**

- ✅ Fix 5+ broken buttons (Schedule project, View time logs, Generate report, etc.)
- ✅ Implement project scheduling
- ✅ Implement time log viewing
- ✅ Implement report generation

**Design Updates:**

- ✅ Apply page-level gradient background
- ✅ Redesign project cards/rows
- ✅ Update header with icon and description
- ✅ Implement consistent action styling

#### **2.3 Work Order Details & Operations**

**Files:** Multiple work order components
**Priority:** 🟡 MEDIUM

**Functionality Fixes:**

- ✅ Fix expense editing (console.log only)
- ✅ Fix material editing (console.log only)
- ✅ Fix time entry viewing (console.log only)

**Design Updates:**

- ✅ Apply consistent styling to detail pages
- ✅ Update form dialogs with proper structure
- ✅ Implement gradient cards for sections

### **Phase 3: Secondary Features + Design Polish (Week 3)**

#### **3.1 Customer Management**

**File:** `src/pages/Customers.tsx`
**Priority:** 🟡 MEDIUM

**Functionality Fixes:**

- ✅ Fix Add Customer button (console.log only)
- ✅ Implement customer creation dialog

**Design Updates:**

- ✅ Complete page redesign with gradient background
- ✅ Add summary cards if applicable
- ✅ Implement consistent table/card styling

#### **3.2 Report Generation**

**File:** `src/components/reportBuilder/ReportBuilderPreview.tsx`
**Priority:** 🟡 MEDIUM

**Functionality Fixes:**

- ✅ Fix Export button (console.log only)
- ✅ Implement report export functionality

**Design Updates:**

- ✅ Update report builder interface
- ✅ Apply consistent styling patterns

#### **3.3 Document Management**

**File:** `src/components/contacts/detail/ContactActionButtons.tsx`
**Priority:** 🟡 MEDIUM

**Functionality Fixes:**

- ✅ Fix Open Documents button (console.log only)
- ✅ Implement document viewing

**Design Updates:**

- ✅ Update document interface styling
- ✅ Apply consistent button patterns

---

## 🎨 Detailed Design Implementation

### **Page-Level Template:**

```typescript
// AKC Brand-Aligned Page Structure
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
  <div className="container mx-auto px-4 py-6">
    {/* Header Section - AKC Brand Standards */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
          <IconComponent className="h-8 w-8 mr-3 text-blue-600" />
          Page Title
        </h1>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-opensans">
          Role/Status
        </Badge>
      </div>
      <p className="text-gray-600 font-opensans">Page description using Open Sans</p>
    </div>

    {/* Summary Cards - AKC Brand Colors */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium font-opensans">Metric Name</p>
              <p className="text-2xl font-bold text-blue-900 font-montserrat">Value</p>
            </div>
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Main Content - Professional Layout */}
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold font-montserrat">
          <Icon className="h-5 w-5 mr-2 text-blue-600" />
          Section Title
        </CardTitle>
      </CardHeader>
      <CardContent className="font-opensans">
        {/* Content using Open Sans for readability */}
      </CardContent>
    </Card>
  </div>
</div>
```

### **AKC Brand Button Standards:**

```typescript
// Primary Action Button - AKC Brand Blue
<Button className="bg-[#0485ea] hover:bg-[#0375d1] text-white font-medium font-opensans">
  <Icon className="h-4 w-4 mr-2" />
  Action Text
</Button>

// Secondary Action Button - Professional Gray
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-opensans">
  <Icon className="h-4 w-4 mr-2" />
  Action Text
</Button>

// Destructive Button - Functional Red
<Button variant="destructive" className="bg-red-600 hover:bg-red-700 font-opensans">
  <Icon className="h-4 w-4 mr-2" />
  Delete
</Button>
```

### **AKC Brand Card Standards:**

```typescript
// Summary/Metric Cards - Brand Gradient System
<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-blue-600 text-sm font-medium font-opensans">Metric Name</p>
        <p className="text-2xl font-bold text-blue-900 font-montserrat">Value</p>
      </div>
      <Icon className="h-8 w-8 text-blue-600" />
    </div>
  </CardContent>
</Card>

// Content Cards - Clean Professional Style
<Card className="mb-6 shadow-sm border border-gray-200">
  <CardHeader>
    <CardTitle className="flex items-center text-lg font-semibold font-montserrat">
      <Icon className="h-5 w-5 mr-2 text-blue-600" />
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent className="font-opensans">
    {/* Content with Open Sans for readability */}
  </CardContent>
</Card>

// Interactive Cards - Hover Effects
<Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-200">
  <CardContent className="p-6 font-opensans">
    {/* Interactive content */}
  </CardContent>
</Card>
```

---

## 🔧 Technical Implementation Details

### **Functionality Restoration Patterns:**

#### **1. Button Click Handler Pattern:**

```typescript
// Replace console.log with actual functionality
// OLD:
onClick: () => console.log('Action:', id),

// NEW:
onClick: () => {
  setSelectedItem(item);
  setDialogOpen(true);
},
```

#### **2. Dialog Integration Pattern:**

```typescript
// Add state management
const [showDialog, setShowDialog] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// Add dialog component
{showDialog && (
  <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent>
      {/* Dialog content */}
    </DialogContent>
  </Dialog>
)}
```

#### **3. API Integration Pattern:**

```typescript
// Add proper API calls
const handleAction = async (id: string) => {
  try {
    const response = await fetch(`/api/endpoint/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast({ title: 'Success', description: 'Action completed' });
      refetch(); // Refresh data
    }
  } catch (error) {
    toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
  }
};
```

### **Design Implementation Patterns:**

#### **1. Page Background:**

```typescript
// Apply to all main pages
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
```

#### **2. Header Pattern:**

```typescript
<div className="mb-8">
  <div className="flex items-center justify-between mb-2">
    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
      <Icon className="h-8 w-8 mr-3 text-blue-600" />
      {title}
    </h1>
    {badge && (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {badge}
      </Badge>
    )}
  </div>
  <p className="text-gray-600">{description}</p>
</div>
```

#### **3. Summary Cards Pattern:**

```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {metrics.map((metric, index) => (
    <Card key={index} className={`bg-gradient-to-r from-${metric.color}-50 to-${metric.color}-100 border-${metric.color}-200`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-${metric.color}-600 text-sm font-medium`}>{metric.label}</p>
            <p className={`text-2xl font-bold text-${metric.color}-900`}>{metric.value}</p>
          </div>
          <metric.icon className={`h-8 w-8 text-${metric.color}-600`} />
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

## 📋 Implementation Checklist

### **Week 1: Critical Workflows**

#### **Field User Dashboard**

- [ ] **Functionality:**
  - [ ] Fix Add Receipt button click handler
  - [ ] Implement receipt upload dialog
  - [ ] Fix OCR endpoint integration
  - [ ] Add proper error handling
- [ ] **Design:**
  - [ ] Apply gradient background
  - [ ] Redesign header with icon
  - [ ] Update action cards with gradients
  - [ ] Add hover effects
  - [ ] Implement consistent spacing

#### **Work Order Management**

- [ ] **Functionality:**
  - [ ] Fix Schedule button in WorkOrderRow
  - [ ] Fix Messages button in WorkOrderRow
  - [ ] Implement UnifiedSchedulingDialog integration
  - [ ] Fix expense editing buttons
  - [ ] Fix material editing buttons
- [ ] **Design:**
  - [ ] Update table styling
  - [ ] Redesign action menus
  - [ ] Add proper hover effects
  - [ ] Implement consistent icons

#### **Active Work Management**

- [ ] **Functionality:**
  - [ ] Fix Add Time Log buttons (6 instances)
  - [ ] Fix Add Document buttons (6 instances)
  - [ ] Fix Update Status buttons (6 instances)
  - [ ] Fix Update Progress buttons (6 instances)
  - [ ] Fix Archive buttons (6 instances)
  - [ ] Fix Edit Work Order button
- [ ] **Design:**
  - [ ] Complete page redesign
  - [ ] Add summary cards
  - [ ] Redesign table layout
  - [ ] Update action button styling

### **Week 2: Contact & Project Management**

#### **Contact Management**

- [ ] **Functionality:**
  - [ ] Fix View Materials button
  - [ ] Fix Assign to Project button
  - [ ] Fix View Timesheet button
  - [ ] Fix View Projects button
  - [ ] Fix View Estimates button
  - [ ] Fix Send Email button
  - [ ] Fix Schedule Meeting button
- [ ] **Design:**
  - [ ] Redesign contact cards
  - [ ] Update action menus
  - [ ] Apply gradient styling
  - [ ] Add hover effects

#### **Project Management**

- [ ] **Functionality:**
  - [ ] Fix Schedule Project button
  - [ ] Fix View Time Logs button
  - [ ] Fix Generate Report button
  - [ ] Fix Archive Project button
  - [ ] Fix View Schedule button
- [ ] **Design:**
  - [ ] Apply page-level styling
  - [ ] Redesign project rows/cards
  - [ ] Update header design
  - [ ] Implement consistent actions

### **Week 3: Secondary Features**

#### **Customer Management**

- [ ] **Functionality:**
  - [ ] Fix Add Customer button
  - [ ] Implement customer creation dialog
- [ ] **Design:**
  - [ ] Complete page redesign
  - [ ] Apply consistent styling

#### **Report & Document Management**

- [ ] **Functionality:**
  - [ ] Fix Export Report button
  - [ ] Fix Open Documents button
- [ ] **Design:**
  - [ ] Update interface styling
  - [ ] Apply consistent patterns

---

## 🎯 Success Criteria

### **Functionality Success:**

- ✅ **Zero console.log buttons** - All buttons perform actual functionality
- ✅ **Complete user workflows** - Users can complete all business processes
- ✅ **Backend integration** - All UI actions connect to working APIs
- ✅ **Error handling** - Graceful handling of failures
- ✅ **User feedback** - Clear success/error messages

### **Design Success:**

- ✅ **Consistent visual language** - All pages follow the same design patterns
- ✅ **Professional appearance** - Modern, clean, and polished interface
- ✅ **Improved user experience** - Intuitive navigation and interactions
- ✅ **Responsive design** - Works well on all screen sizes
- ✅ **Accessibility** - Proper contrast, focus states, and screen reader support

### **Quality Assurance:**

- ✅ **No breaking changes** - Existing functionality preserved
- ✅ **Performance maintained** - No degradation in load times
- ✅ **Cross-browser compatibility** - Works in all modern browsers
- ✅ **Mobile responsiveness** - Proper mobile experience

---

## 🚨 Risk Mitigation

### **Potential Risks:**

1. **Breaking existing functionality** while implementing changes
2. **Design inconsistencies** across different components
3. **Performance impact** from extensive styling changes
4. **Timeline overrun** due to scope complexity

### **Mitigation Strategies:**

1. **Incremental implementation** - Test each component thoroughly
2. **Design system documentation** - Clear guidelines and examples
3. **Performance monitoring** - Regular checks during implementation
4. **Phased rollout** - Complete critical features first

---

## 🎉 Expected Outcomes

### **User Experience:**

- **Dramatically improved** professional appearance
- **Fully functional** business workflows
- **Consistent** and intuitive interface
- **Reduced** user frustration and training time

### **Business Impact:**

- **Restored** core business operations
- **Increased** user productivity
- **Professional** client-facing interface
- **Reduced** support requests

### **Technical Benefits:**

- **Maintainable** codebase with consistent patterns
- **Scalable** design system for future features
- **Improved** code quality and organization
- **Better** developer experience

---

**This comprehensive plan ensures we fix all critical functionality issues while simultaneously implementing a professional, consistent design system throughout the application. The phased approach minimizes risk while maximizing impact.**

---

## 🔤 Font Implementation Requirements

### **AKC Brand Font Setup**

To ensure proper brand compliance, we need to implement the AKC brand fonts throughout the application:

#### **Required Fonts:**

- **Montserrat** (Bold, Regular) - Headers and emphasis
- **Open Sans** (Regular, Medium) - Body text and UI elements

#### **Implementation Steps:**

1. **Add Google Fonts to index.html:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

2. **Update Tailwind Config (tailwind.config.ts):**

```typescript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
      },
    },
  },
};
```

3. **CSS Font Classes:**

```css
/* Add to global CSS */
.font-montserrat {
  font-family:
    'Montserrat',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.font-opensans {
  font-family:
    'Open Sans',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
```

#### **Usage Guidelines:**

- **Headers:** Always use `font-montserrat` class
- **Body Text:** Always use `font-opensans` class
- **Buttons:** Use `font-opensans` for consistency
- **Form Labels:** Use `font-opensans` for readability

---

## 📅 Updated Implementation Status (2025-05-30)

### **Progress Since Initial Audit:**

#### ✅ **Completed:**

- Fixed foreign key relationships in database queries
- Resolved document viewing functionality
- Fixed BudgetItemFormDialog prop mismatches
- Implemented basic tab navigation in ProjectDetail

#### ⏳ **Partially Completed:**

- Some button functionality restored (but not all 40+)
- Basic page structures in place
- Data fetching and display working

#### ❌ **Not Started:**

- Gradient background implementation
- Color-coded summary cards
- Consistent header patterns
- Brand typography (Montserrat/Open Sans)
- Hover effects and micro-interactions

### **Revised Quick-Win Implementation Plan:**

#### **Day 1: Global Foundation**

1. **Create shared components:**

   ```typescript
   // src/components/ui/PageLayout.tsx
   export const PageLayout = ({ children, title, subtitle, icon: Icon, badge }) => (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
       <div className="container mx-auto px-4 py-6">
         <div className="mb-8">
           <div className="flex items-center justify-between mb-2">
             <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
               {Icon && <Icon className="h-8 w-8 mr-3 text-blue-600" />}
               {title}
             </h1>
             {badge}
           </div>
           {subtitle && <p className="text-gray-600 font-opensans">{subtitle}</p>}
         </div>
         {children}
       </div>
     </div>
   );
   ```

2. **Update Tailwind config for fonts**
3. **Create GradientCard component library**

#### **Day 2: ProjectDetail Implementation**

1. Wrap all tabs in PageLayout
2. Convert Overview tab cards to gradient style
3. Update Financials tab with proper card styling
4. Fix Budget tab summary cards

#### **Day 3: Remaining Core Pages**

1. Update Projects list page
2. Update Work Orders page
3. Update Employees page
4. Update Documents section

### **Measurement of Success:**

- [ ] All pages use gradient backgrounds
- [ ] Summary metrics use color-coded cards
- [ ] Headers follow AdminTimeEntries pattern
- [ ] Buttons use AKC brand colors consistently
- [ ] Typography uses brand fonts
- [ ] Hover states provide visual feedback

### **Next Steps:**

1. Implement shared components first
2. Start with ProjectDetail as it's the most complex
3. Roll out to other pages systematically
4. Document any new patterns discovered

---
