# Design System: Label

This document describes the standard label component used for form elements.

## Base Component

- **`src/components/ui/label.tsx`:** Provides the base `Label` component.
- **Underlying Primitive:** Built upon `@radix-ui/react-label`.

## Styling

- The component uses `class-variance-authority` (CVA) and Tailwind CSS for base styling.
- **Base:** `text-sm font-medium leading-none`
- **Disabled State:** Applies styles when associated with a disabled peer element: `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`.

## Props

- Accepts all props from `@radix-ui/react-label`'s `Root` component.
- **`htmlFor`:** The primary prop used to associate the label with a form control (like `Input`, `Textarea`, `Select`) by matching the control's `id`.
- `className`: Allows adding custom Tailwind classes for specific overrides or additions.
- `ref`: Forwarded to the underlying Radix UI label element.

## Usage Guidelines

- Always import the `Label` component from `@/components/ui/label`.
- Use `Label` components to clearly identify form fields, improving accessibility and user experience.
- Always provide the `htmlFor` prop, linking it to the `id` of the corresponding form input/control.
- Place the `Label` before the input it describes, typically.
- Avoid embedding interactive elements within a `Label`.

## Examples

### Basic Label for Input

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LabeledInput() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {/* Associate label with input via htmlFor and id */}
      <Label htmlFor="firstname">First Name</Label>
      <Input type="text" id="firstname" placeholder="Enter your first name" />
    </div>
  );
}
```

### Label with Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function LabeledCheckbox() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      {/* Clicking label will also toggle checkbox */}
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  );
}
```
