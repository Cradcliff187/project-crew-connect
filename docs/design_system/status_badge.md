# Design System: Status Badge

This document describes the component used for displaying status labels.

## Component

- **`src/components/common/status/StatusBadge.tsx`:** The consolidated component for displaying statuses.

## Dependencies

- Uses the base Shadcn `Badge` component (`@/components/ui/badge`).
- Uses icons from `lucide-react`.
- Expects a `status` prop whose value should align with the `StatusType` defined in `src/types/common.ts`.

## Features & Usage

- **Purpose:** Displays a status with an appropriate icon and color coding based on the semantic meaning of the status.
- **Props:**
  - `status: StatusType | string | null | undefined`: The status value (required, ideally `StatusType`). Handles uppercase/lowercase and converts hyphens to underscores internally.
  - `label?: string`: Optional custom label text. If omitted, a formatted label is generated from the `status` value (e.g., `IN_PROGRESS` becomes "In Progress").
  - `size?: 'sm' | 'default'`: Controls the padding and font size (`default` is default).
  - `className?: string`: Allows adding custom Tailwind classes.
- **Styling:** Applies the `outline` variant to the base `Badge` and then overrides background, text, and border colors based on the `status` prop.
- **Iconography:** Automatically displays an appropriate icon based on the `status`.

## Status Mapping (Examples)

| Status (`StatusType`) | Icon         | Styling Classes                                  |
| --------------------- | ------------ | ------------------------------------------------ |
| `COMPLETED`           | CheckCircle2 | `bg-green-50 text-green-700 border-green-200`    |
| `APPROVED`            | CheckCircle2 | `bg-green-50 text-green-700 border-green-200`    |
| `ACTIVE`              | CheckCircle2 | `bg-green-50 text-green-700 border-green-200`    |
| `IMPLEMENTED`         | CheckCircle2 | `bg-green-50 text-green-700 border-green-200`    |
| `SENT`                | Send         | `bg-blue-50 text-blue-700 border-blue-200`       |
| `IN_PROGRESS`         | Clock        | `bg-primary/10 text-primary border-primary/20`   |
| `PENDING`             | Info         | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| `DRAFT`               | CircleDashed | `bg-gray-50 text-gray-700 border-gray-200`       |
| `ON_HOLD`             | MinusCircle  | `bg-orange-50 text-orange-700 border-orange-200` |
| `REJECTED`            | XCircle      | `bg-red-50 text-red-700 border-red-200`          |
| `CANCELLED`           | XCircle      | `bg-red-50 text-red-700 border-red-200`          |
| `INACTIVE`            | Archive      | `bg-gray-50 text-gray-600 border-gray-200`       |
| `UNKNOWN` / _default_ | HelpCircle   | `bg-gray-50 text-gray-500 border-gray-200`       |

_(Note: Refer to the component source for the complete mapping)._

## Examples

```tsx
import StatusBadge from '@/components/common/status/StatusBadge';
import { StatusType } from '@/types/common';

let projectStatus: StatusType = 'IN_PROGRESS';

// Standard usage
<StatusBadge status={projectStatus} /> // Renders: Icon + "In Progress"

// With custom label
<StatusBadge status="COMPLETED" label="Finished!" /> // Renders: Icon + "Finished!"

// Small size
<StatusBadge status="PENDING" size="sm" /> // Renders smaller badge

// Usage within ActivityLogTable (example)
<StatusBadge status={activity.status} />
<StatusBadge status={activity.previousstatus} size="sm" />
```

## Related Components

- **`src/components/common/status/UniversalStatusControl.tsx`:** Uses this `StatusBadge` to display the current status within its dropdown trigger.
