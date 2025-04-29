# Design System: Switch

This document describes the standard switch (toggle) component.

## Base Component

- **`src/components/ui/switch.tsx`:** Provides the base `Switch` component.
- **Underlying Primitive:** Built upon `@radix-ui/react-switch` (`Root` and `Thumb`).

## Styling

- The component uses Tailwind CSS classes for styling.
- **Track (Root):** `inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors...`
  - Background changes based on state: `data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`.
- **Thumb:** `pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform...`
  - Position changes based on state: `data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0`.
- **Focus:** Standard `focus-visible` ring styles on the root.
- **Disabled:** `disabled:cursor-not-allowed disabled:opacity-50` on the root.

## Props

- Accepts all props from `@radix-ui/react-switch`'s `Root` component.
- Key props:
  - **`checked`:** Controls the checked (on/off) state.
  - **`onCheckedChange`:** Callback function when the checked state changes.
  - **`disabled`:** Disables the switch.
  - **`required`:** Marks the switch as required in a form.
  - **`name`:** Name attribute for form submission.
  - **`value`:** Value attribute for form submission (usually `'on'` if not specified).
  - **`id`:** Important for associating with a `Label`.
- `className`: Allows adding custom Tailwind classes to the root element.
- `ref`: Forwarded to the underlying Radix UI switch root element.

## Usage Guidelines

- Always import the `Switch` component from `@/components/ui/switch`.
- Use switches for toggling a single setting or option on or off instantly.
- Always associate a `Switch` with a `Label` component for accessibility. Set the `id` on the `Switch` and the `htmlFor` on the `Label`.
- Clicking the associated `Label` should also toggle the `Switch`.

## Examples

### Basic Switch with Label

```tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function LabeledSwitch() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  );
}
```

### Controlled Switch

```tsx
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function ControlledSwitch() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Switch id="dark-mode" checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor="dark-mode">Dark Mode</Label>
      <p className="text-sm text-muted-foreground">Enabled: {String(checked)}</p>
    </div>
  );
}
```

### Disabled Switch

```tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function DisabledSwitch() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="marketing-emails" disabled />
      <Label htmlFor="marketing-emails">Marketing emails (disabled)</Label>
    </div>
  );
}
```
