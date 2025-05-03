# Project Overview UI Specification

## Header Section

### Project Title & Status

- Typography: `heading-3` (16px Montserrat, font-weight: 600)
- Project ID: `text-sm` (14px Inter, font-weight: 400, text-muted-foreground)
- Status Badge:
  - Component: `StatusBadge`
  - Variants: success (green), warning (amber), danger (red), neutral (gray)
  - Border radius: `--radius` (6px)
  - Padding: `px-2 py-0.5`

### Client Information

- Container: Flex row, `items-center`, `gap-2`
- Client Name: `text-sm font-medium` (14px, font-weight: 500)
- Client ID: `text-xs text-muted-foreground` (12px, color: var(--muted-foreground))
- Icon: `User` from Lucide, 16x16px, color: var(--muted-foreground)

### Action Buttons

- Primary: `Button` with `variant="default"`, size="sm"
- Secondary: `Button` with `variant="outline"`, size="sm"
- Icon: `Button` with `variant="ghost"`, size="icon"
- Layout: Flex row, `gap-2`, aligned to right

## Project Details Card

### Card Container

- Component: `Card`
- Padding: `p-0` (custom padding in content areas)
- Background: var(--card) (HSL: 32 30% 98%)
- Border: 1px solid var(--border) (HSL: 30 15% 85%)
- Border radius: `--radius` (6px)
- Box shadow: `shadow-sm`

### Description Section

- Title: `text-sm font-medium` (14px, font-weight: 500), color: var(--foreground)
- Content: `text-sm` (14px), `leading-relaxed`, color: var(--foreground)
- Empty state: `text-sm text-muted-foreground` with CTA link
- Edit button: `Button` with `variant="ghost"`, size="sm", icon: `Edit`
- Spacing: `space-y-2` for vertical elements

### Key Dates Section

- Container: `space-y-4` inside CardContent
- Labels: `text-xs font-medium` (12px, font-weight: 500), color: var(--muted-foreground)
- Values: `text-sm` (14px), color: var(--foreground)
- Timeline: Custom component with:
  - Line color: var(--border)
  - Current marker: var(--primary)
  - Past markers: var(--muted-foreground)
  - Future markers: var(--secondary)
- Empty state: "TBD" with `text-xs text-muted-foreground`
- Warning state: Overdue text uses `text-destructive`

## Financial Snapshot Card

### Card Container

- Component: `Card` with `CardHeader` and `CardContent`
- Header:
  - Title: `CardTitle`, `text-sm font-medium` (14px, font-weight: 500)
  - Icon: `DollarSign` from Lucide, 16x16px, color: var(--muted-foreground)

### Financial Metrics

- Layout: Grid with 2 columns on desktop, 1 column on mobile
- Label: `text-xs text-muted-foreground` (12px)
- Value: `text-base font-medium` (16px, font-weight: 500)
- Percentage: `Badge` with appropriate variant:
  - Positive: variant="success" (green)
  - Negative: variant="destructive" (red)
  - Neutral: variant="outline" (gray)

### Visual Elements

- Contract gauge: `Progress` component with thickness 8px
  - Fill color: var(--primary)
  - Background: var(--secondary)
- Trend indicator: `Trend` component showing 7-day history
  - Upward trend: var(--green-500)
  - Downward trend: var(--red-500)
  - Horizontal trend: var(--muted-foreground)

## Project Health Card

### Card Container

- Component: `Card` with `CardHeader` and `CardContent`
- Header:
  - Title: `CardTitle`, `text-sm font-medium` (14px, font-weight: 500)
  - Icon: `ActivityIcon` from Lucide, 16x16px, color: var(--muted-foreground)

### Status Indicators

- Labels: `text-xs font-medium` (12px, font-weight: 500)
- Progress Bars: `Progress` component
  - Height: 8px
  - Border radius: `--radius-sm` (4px)
  - Color variants:
    - Good: var(--green-500)
    - Warning: var(--amber-500)
    - Critical: var(--red-500)
    - Neutral: var(--secondary)

### Status Badges

- Component: `Badge` with `variant="outline"`
- With icon: `CheckCircle`, `AlertTriangle`, or `XCircle`
- Text: `text-xs` (12px)
- Color variants:
  - Good: text-green-600
  - Warning: text-amber-600
  - Critical: text-red-600
  - Neutral: text-muted-foreground

## Responsive Layout

### Breakpoints

- Mobile: < 640px (default)
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Grid System

- Desktop: Grid with 12 columns, gap-4
  - Details section: 5 columns
  - Financial/Health: 7 columns
- Tablet: Grid with 8 columns, gap-3
  - Details section: 8 columns (full width)
  - Financial/Health: 8 columns (full width)
- Mobile: Single column, `space-y-4`

### Container Widths

- Max content width: 1280px (as defined in layout.md)
- Padding: px-4 on all sides
- Margins: mx-auto to center content

### Card Sizing

- Min height: 220px on desktop, auto on mobile
- Width: 100% of grid column
- Spacing: gap-4 between cards

## Component Extensions/Variants

### New Components

- **TimelineDisplay**: Visual timeline with past/current/future markers
- **HealthIndicator**: Combined status for multiple health factors
- **TrendIndicator**: Sparkline with directional indicator

### Extended Variants

- **StatusBadge**: Add neutral state for "Not Started"
- **Card**: Add `size="compact"` variant for dense displays
- **Button**: Ensure all have tooltips for accessibility

### Color Extensions

- **Semantic Colors**:
  - `--success`: var(--green-500) = HSL(142.1 76.2% 36.3%)
  - `--success-foreground`: white
  - `--warning`: var(--amber-500) = HSL(37.7 92.1% 50.2%)
  - `--warning-foreground`: black
