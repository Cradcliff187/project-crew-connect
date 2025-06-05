# AKC LLC Enhanced Brand Guidelines

**Version 2.0 - Updated for Digital Application Design**
**Date:** 2025-05-29

## 📊 Executive Summary

These enhanced brand guidelines maintain AKC LLC's core brand identity while expanding the design system for modern digital applications. The guidelines preserve the signature **Bright Blue (#0485ea)** brand color while introducing a comprehensive design system for consistent user experience.

---

## 🎨 1. Logo Usage

### **Primary Logo Standards**

- **Primary Color:** Always display the AKC LLC logo in **#0485ea (Bright Blue)** on white or light backgrounds
- **Aspect Ratio:** Never stretch or distort the logo - maintain original proportions
- **Clear Space:** Minimum clear space around logo should be equal to the height of the "A" in AKC
- **Minimum Size:** 24px height for digital applications, 0.5 inches for print

### **Logo Variations**

- **Primary:** Bright Blue (#0485ea) on white/light backgrounds
- **Reverse:** White version for dark or complex backgrounds
- **Monochrome:** Single color version when brand color cannot be used
- **Icon Version:** Simplified mark for small applications (favicons, app icons)

### **Digital Application Usage**

```typescript
// Header logo sizing
<img className="h-8 w-auto" /> // 32px height
<img className="h-6 w-auto" /> // 24px height (minimum)

// Navigation logo
<img className="h-10 w-auto" /> // 40px height
```

---

## 🎨 2. Enhanced Color Palette

### **Primary Brand Color**

- **AKC Blue:** `#0485ea` - The signature brand color (unchanged)
- **AKC Blue Hover:** `#0375d1` - Interactive state for buttons and links
- **Usage:** Primary buttons, headers, brand elements, call-to-action items

### **Extended Color System**

#### **Neutral Palette**

- **Pure White:** `#ffffff` - Primary background color
- **Light Gray:** `#f8fafc` - Secondary background
- **Medium Gray:** `#64748b` - Secondary text
- **Dark Gray:** `#334155` - Primary text (enhanced from #333333 for better accessibility)
- **Charcoal:** `#1e293b` - Headers and emphasis

#### **Functional Colors**

- **Success Green:** `#10b981` - Success states, confirmations
- **Warning Orange:** `#f59e0b` - Warnings, pending states
- **Error Red:** `#ef4444` - Errors, destructive actions
- **Info Blue:** `#3b82f6` - Information, secondary actions

#### **Gradient Backgrounds**

- **Primary Gradient:** `bg-gradient-to-br from-slate-50 via-white to-blue-50`
- **Card Gradients:**
  - Blue: `from-blue-50 to-blue-100 border-blue-200`
  - Green: `from-green-50 to-green-100 border-green-200`
  - Orange: `from-orange-50 to-orange-100 border-orange-200`
  - Purple: `from-purple-50 to-purple-100 border-purple-200`

### **Accessibility Compliance**

- All color combinations meet WCAG 2.1 AA standards
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text

---

## ✍️ 3. Typography System

### **Font Hierarchy**

#### **Primary Fonts (Preserved)**

- **Montserrat Bold** - Page headers, section titles
- **Montserrat Regular** - Subheadings, emphasis text
- **Open Sans Regular** - Body text, descriptions, labels
- **Open Sans Medium** - Button text, form labels

#### **Digital Typography Scale**

```typescript
// Page Headers
className = 'text-3xl font-bold text-gray-900'; // Montserrat Bold, 30px

// Section Headers
className = 'text-xl font-semibold text-gray-900'; // Montserrat Bold, 20px

// Subsection Headers
className = 'text-lg font-medium text-gray-900'; // Montserrat Regular, 18px

// Body Text
className = 'text-base text-gray-600'; // Open Sans Regular, 16px

// Small Text
className = 'text-sm text-gray-500'; // Open Sans Regular, 14px

// Button Text
className = 'text-sm font-medium'; // Open Sans Medium, 14px
```

#### **Font Loading & Fallbacks**

```css
/* Primary Font Stack */
font-family:
  'Montserrat',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;

/* Body Font Stack */
font-family:
  'Open Sans',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

---

## 🏗️ 4. Layout & Spacing System

### **Container Standards**

```typescript
// Page Container
className = 'container mx-auto px-4 py-6';

// Content Sections
className = 'mb-8'; // Major sections
className = 'mb-6'; // Content cards
className = 'mb-4'; // Form sections
```

### **Grid System**

```typescript
// Responsive Grids
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';

// Summary Cards
className = 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8';

// Form Layouts
className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
```

### **Spacing Scale**

- **xs:** 4px (`space-1`)
- **sm:** 8px (`space-2`)
- **md:** 16px (`space-4`)
- **lg:** 24px (`space-6`)
- **xl:** 32px (`space-8`)
- **2xl:** 48px (`space-12`)

---

## 🎯 5. Component Design Standards

### **Button System**

#### **Primary Buttons**

```typescript
<Button className="bg-[#0485ea] hover:bg-[#0375d1] text-white font-medium">
  <Icon className="h-4 w-4 mr-2" />
  Action Text
</Button>
```

#### **Secondary Buttons**

```typescript
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  <Icon className="h-4 w-4 mr-2" />
  Action Text
</Button>
```

#### **Destructive Buttons**

```typescript
<Button variant="destructive" className="bg-red-600 hover:bg-red-700">
  <Icon className="h-4 w-4 mr-2" />
  Delete
</Button>
```

### **Card System**

#### **Summary/Metric Cards**

```typescript
<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-blue-600 text-sm font-medium">Metric Name</p>
        <p className="text-2xl font-bold text-blue-900">Value</p>
      </div>
      <Icon className="h-8 w-8 text-blue-600" />
    </div>
  </CardContent>
</Card>
```

#### **Content Cards**

```typescript
<Card className="mb-6 shadow-sm border border-gray-200">
  <CardHeader>
    <CardTitle className="flex items-center text-lg font-semibold">
      <Icon className="h-5 w-5 mr-2 text-blue-600" />
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### **Interactive Cards**

```typescript
<Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-200">
  <CardContent className="p-6">
    {/* Interactive content */}
  </CardContent>
</Card>
```

### **Icon System**

- **Small Icons:** `h-4 w-4` (16px) - Buttons, inline elements
- **Medium Icons:** `h-5 w-5` (20px) - Section headers, navigation
- **Large Icons:** `h-8 w-8` (32px) - Page headers, summary cards
- **Color:** Primary icons use `text-blue-600` (#0485ea)

---

## 📱 6. Digital Application Standards

### **Page Structure Template**

```typescript
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
  <div className="container mx-auto px-4 py-6">
    {/* Header Section */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Icon className="h-8 w-8 mr-3 text-blue-600" />
          Page Title
        </h1>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Status/Role
        </Badge>
      </div>
      <p className="text-gray-600">Page description</p>
    </div>

    {/* Summary Cards (if applicable) */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Metric cards */}
    </div>

    {/* Main Content */}
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className="h-5 w-5 mr-2 text-blue-600" />
          Section Title
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  </div>
</div>
```

### **Form Design Standards**

- **Labels:** `text-sm font-medium text-gray-700`
- **Inputs:** Focus state uses brand blue border
- **Validation:** Error states use functional red color
- **Grouping:** Related fields grouped with consistent spacing

### **Table Design Standards**

- **Headers:** `text-sm font-medium text-gray-900`
- **Cells:** `text-sm text-gray-600`
- **Hover:** `hover:bg-gray-50`
- **Borders:** Subtle gray borders for separation

---

## 🖼️ 7. Imagery & Graphics Standards

### **Photography Style**

- **Professional:** Clean, modern, high-resolution images
- **Color Harmony:** Images should complement the blue brand color
- **Composition:** Minimalist approach with plenty of white space
- **Quality:** Minimum 2x resolution for retina displays

### **Iconography**

- **Style:** Outline style icons (Lucide React library)
- **Weight:** Consistent stroke width across all icons
- **Color:** Primary blue (#0485ea) for brand elements
- **Size:** Consistent sizing scale (16px, 20px, 32px)

### **Illustrations**

- **Style:** Clean, minimal line art
- **Color:** Limited palette using brand colors
- **Usage:** Empty states, onboarding, feature explanations

---

## 📄 8. Digital Collateral Standards

### **Business Applications**

- **Email Signatures:** Brand blue accents with clean typography
- **Digital Documents:** Consistent header styling with logo
- **Presentations:** Brand blue for headers and key elements

### **Web & Mobile Applications**

- **Primary Actions:** Always use brand blue (#0485ea)
- **Navigation:** Consistent styling with hover states
- **Loading States:** Brand blue progress indicators
- **Success States:** Green functional color for confirmations

---

## 🗣️ 9. Enhanced Tone & Voice

### **Digital Communication**

- **Professional:** Clear, authoritative, and trustworthy
- **Approachable:** Friendly and helpful, not intimidating
- **Concise:** Direct and to-the-point messaging
- **Consistent:** Same tone across all digital touchpoints

### **UI Copy Guidelines**

- **Button Text:** Action-oriented verbs ("Create", "Save", "Schedule")
- **Error Messages:** Helpful and solution-oriented
- **Success Messages:** Positive and confirming
- **Help Text:** Clear and instructional

---

## ❌ 10. Prohibited Uses

### **Logo Violations**

- ❌ Never stretch or distort the logo proportions
- ❌ Do not change the logo color from brand blue (#0485ea)
- ❌ Do not add effects, shadows, or outlines to the logo
- ❌ Do not place logo on busy or low-contrast backgrounds

### **Color Violations**

- ❌ Do not use colors outside the approved palette
- ❌ Do not use brand blue for error or warning states
- ❌ Do not use insufficient color contrast ratios
- ❌ Do not create new gradient combinations

### **Typography Violations**

- ❌ Do not use decorative or script fonts
- ❌ Do not use more than 3 font weights in a single design
- ❌ Do not use font sizes smaller than 14px for body text
- ❌ Do not use all caps for large blocks of text

### **Layout Violations**

- ❌ Do not overcrowd interfaces with too many elements
- ❌ Do not use inconsistent spacing between elements
- ❌ Do not ignore responsive design principles
- ❌ Do not create layouts that don't follow the grid system

---

## 🎯 11. Implementation Guidelines

### **Development Standards**

- Use Tailwind CSS classes for consistent styling
- Implement design tokens for colors and spacing
- Ensure responsive design across all screen sizes
- Test accessibility compliance regularly

### **Quality Assurance**

- Regular design reviews against brand guidelines
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Accessibility audit compliance

### **Maintenance**

- Annual review of brand guidelines
- Update guidelines based on user feedback
- Monitor brand consistency across all applications
- Document any approved variations or exceptions

---

## 📋 12. Quick Reference

### **Essential Colors**

- **Brand Blue:** `#0485ea`
- **Brand Blue Hover:** `#0375d1`
- **Background:** `bg-gradient-to-br from-slate-50 via-white to-blue-50`
- **Text Primary:** `#334155`
- **Text Secondary:** `#64748b`

### **Essential Typography**

- **Page Header:** `text-3xl font-bold text-gray-900`
- **Section Header:** `text-xl font-semibold text-gray-900`
- **Body Text:** `text-base text-gray-600`

### **Essential Components**

- **Primary Button:** `bg-[#0485ea] hover:bg-[#0375d1]`
- **Card:** `bg-white shadow-sm border border-gray-200`
- **Icon Size:** `h-4 w-4` (buttons), `h-5 w-5` (headers), `h-8 w-8` (page headers)

---

**These enhanced brand guidelines ensure consistent, professional, and accessible design across all AKC LLC digital applications while preserving the core brand identity and signature blue color.**
