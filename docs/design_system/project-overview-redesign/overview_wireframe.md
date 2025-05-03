# Project Overview Tab Wireframe

## Desktop Layout

```
+----------------------------------------------------------------------+
|                                                                      |
| [Project Name] - [Project ID]                        [Status Badge]  |
|                                                                      |
| Client: [Client Name]                           [Edit] [Add] [⋮]     |
+----------------------------------------------------------------------+
|                                    |                                 |
| PROJECT DETAILS                    | FINANCIAL SNAPSHOT              |
| +----------------------------+     | +---------------------------+   |
| | Description                |     | | Contract: $XX,XXX         |   |
| | Lorem ipsum dolor sit amet |     | | [Visual gauge: XX%]       |   |
| | consectetur adipiscing...  |     | |                           |   |
| |                            |     | | Budget:   $XX,XXX         |   |
| | [Edit Description]         |     | | Spent:    $XX,XXX         |   |
| +----------------------------+     | | Est. GP:  $XX,XXX (XX%)   |   |
| |                            |     | |                           |   |
| | KEY DATES                  |     | | [Trend Sparkline]         |   |
| | +------------------------+ |     | +---------------------------+   |
| | | Start:    MM/DD/YYYY   | |     |                                 |
| | | Target:   MM/DD/YYYY   | |     | PROJECT HEALTH                  |
| | | Timeline: XX Days      | |     | +---------------------------+   |
| | | [Timeline Visualization]| |     | | Budget Status             |   |
| | +------------------------+ |     | | [Progress: XX%] [Status ✓] |   |
| +----------------------------+     | |                           |   |
|                                    | | Schedule Status           |   |
|                                    | | [Progress: XX%] [Status !]|   |
|                                    | |                           |   |
|                                    | | [Visual Health Indicator] |   |
|                                    | +---------------------------+   |
+------------------------------------+---------------------------------+
```

## Mobile Layout

```
+----------------------------------+
| [Project Name]      [Status ●]   |
| [Project ID]                     |
|                                  |
| Client: [Client Name]            |
|                                  |
| [Edit] [Add] [⋮]                 |
+----------------------------------+
| PROJECT DETAILS                  |
| +------------------------------+ |
| | Description                  | |
| | Lorem ipsum dolor sit amet   | |
| | consectetur adipiscing elit  | |
| |                              | |
| | [Edit Description]           | |
| +------------------------------+ |
+----------------------------------+
| KEY DATES                        |
| +------------------------------+ |
| | Start:    MM/DD/YYYY         | |
| | Target:   MM/DD/YYYY         | |
| | Timeline: XX Days            | |
| |                              | |
| | [Timeline Visualization]     | |
| +------------------------------+ |
+----------------------------------+
| FINANCIAL SNAPSHOT               |
| +------------------------------+ |
| | Contract: $XX,XXX            | |
| | Budget:   $XX,XXX            | |
| | Spent:    $XX,XXX            | |
| | Est. GP:  $XX,XXX (XX%)      | |
| |                              | |
| | [Visual Financial Summary]   | |
| +------------------------------+ |
+----------------------------------+
| PROJECT HEALTH                   |
| +------------------------------+ |
| | Budget Status                | |
| | [Progress Bar: XX%]          | |
| |                              | |
| | Schedule Status              | |
| | [Progress Bar: XX%]          | |
| |                              | |
| | [Visual Health Indicator]    | |
| +------------------------------+ |
+----------------------------------+
```

## Component Annotations

### Header Section

- Use `PageHeader` component with title slot for project name
- Implement `StatusBadge` from design system for project status
- Group actions using `Button` and `DropdownMenu` components
- Client info uses `Tag` component with avatar slot for client logo

### Project Details Card

- Use standard `Card` component with `CardHeader` and `CardContent`
- Rich text area for description using `Textarea` with expandable view
- "Edit Description" uses `Button` with `variant="ghost"` and icon

### Key Dates Component

- Timeline visualization uses custom `Timeline` component
- Date displays use formatted text with semantic indicators
- Overdue dates use `StatusBadge` with `variant="destructive"`

### Financial Snapshot Card

- Values displayed using `StatCard` pattern from design system
- Percentage values use `Badge` component with color variants
- Trend indicator uses `Trend` component with up/down arrows

### Project Health Card

- Status bars use `Progress` component with semantic colors
- Status indicators use both color and icon for accessibility
- Overall health uses `HealthIndicator` component with levels
