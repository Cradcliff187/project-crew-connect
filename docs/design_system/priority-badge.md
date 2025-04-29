# Design System: Priority Badge

This document describes the standard `PriorityBadge` component used for displaying priority levels (High, Medium, Low).

## Base Component

- **`src/components/common/status/PriorityBadge.tsx`:** Provides the `PriorityBadge` component.

## Styling

- The component renders a `<span>` element.
- Base styles: `px-2 py-0.5 rounded-full text-xs font-medium`.
- Color styles are determined by the `priority` prop:
  - **`HIGH`**: `bg-red-100 text-red-800`
  - **`MEDIUM`** (or null/undefined/unknown): `bg-amber-100 text-amber-800`
  - **`LOW`**: `bg-blue-100 text-blue-800`
- Text content is the priority level (defaulting to "Medium") with the first letter capitalized.

## Props

- **`priority: 'HIGH' | 'MEDIUM' | 'LOW' | string | null | undefined`**: The priority level to display. Case-insensitive matching is performed.
- **`className?: string`**: Optional class name(s) to apply to the `<span>` element for additional styling.

## Usage Guidelines

- Import the component: `import PriorityBadge from '@/components/common/status/PriorityBadge';`
- Use to visually indicate priority in tables, lists, or cards.
- Pass the priority value (typically 'HIGH', 'MEDIUM', or 'LOW') to the `priority` prop.

## Examples

### Basic Usage

```tsx
import PriorityBadge from '@/components/common/status/PriorityBadge';

function PriorityExamples() {
  return (
    <div className="space-x-2">
      <PriorityBadge priority="HIGH" /> {/* Renders High */}
      <PriorityBadge priority="medium" /> {/* Renders Medium */}
      <PriorityBadge priority="Low" /> {/* Renders Low */}
      <PriorityBadge priority={null} /> {/* Renders Medium (Default) */}
      <PriorityBadge priority="Urgent" /> {/* Renders Medium (Default) */}
    </div>
  );
}
```

### Usage with Custom Class

```tsx
<PriorityBadge priority="HIGH" className="font-bold" />
```
