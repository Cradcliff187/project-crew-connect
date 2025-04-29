# Design System: Checkbox

This document describes the standard checkbox component.

## Base Component

- **`src/components/ui/checkbox.tsx`:** Provides the base `Checkbox` component.
- **Underlying Primitive:** Built upon `@radix-ui/react-checkbox`.

## Styling

- The component uses Tailwind CSS classes for styling.
- **Base:** `peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background...` (Note: `peer` class is useful for styling sibling labels based on the checkbox state).
- **Focus:** Standard `focus-visible` ring styles.
- **Disabled:** `disabled:cursor-not-allowed disabled:opacity-50`.
- **Checked State:** `data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground`. The background and text color change when checked.
- **Indicator:** A `Check` icon (`lucide-react`) is displayed inside when checked.

## Props

- Accepts all props from `@radix-ui/react-checkbox`'s `Root` component.
- Key props:
  - **`checked`:** Controls the checked state (can be `true`, `false`, or `'indeterminate'`).
  - **`onCheckedChange`:** Callback function when the checked state changes.
  - **`disabled`:** Disables the checkbox.
  - **`required`:** Marks the checkbox as required in a form.
  - **`name`:** Name attribute for form submission.
  - **`value`:** Value attribute for form submission.
  - **`id`:** Important for associating with a `Label`.
- `className`: Allows adding custom Tailwind classes.
- `ref`: Forwarded to the underlying Radix UI checkbox element.

## Usage Guidelines

- Always import the `Checkbox` component from `@/components/ui/checkbox`.
- Use checkboxes for selecting one or more options from a set, or for binary choices (e.g., agree/disagree).
- Always associate a `Checkbox` with a `Label` component for accessibility. Set the `id` on the `Checkbox` and the `htmlFor` on the `Label`.
- Clicking the associated `Label` should also toggle the `Checkbox`.
- Use the `peer` class on the `Checkbox` to style the `Label` based on the checkbox's state if needed (e.g., `peer-checked:line-through`).

## Examples

### Basic Checkbox with Label

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function LabeledCheckbox() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms1" />
      <Label htmlFor="terms1">Accept terms and conditions</Label>
    </div>
  );
}
```

### Disabled Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function DisabledCheckbox() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms2" disabled />
      <Label htmlFor="terms2">Accept terms (disabled)</Label>
    </div>
  );
}
```

### Controlled Checkbox

```tsx
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function ControlledCheckbox() {
  const [checked, setChecked] = React.useState(true);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="newsletter"
        checked={checked}
        onCheckedChange={isChecked => setChecked(Boolean(isChecked))}
      />
      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      <p className="text-sm text-muted-foreground">Checked: {String(checked)}</p>
    </div>
  );
}
```

### Checkbox with Indeterminate State

```tsx
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function IndeterminateCheckbox() {
  // Example: Represents a parent checkbox whose children are partially selected
  const [checked, setChecked] = React.useState<'indeterminate' | boolean>('indeterminate');

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="select-all" checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor="select-all">Select All Items</Label>
    </div>
  );
}
```
