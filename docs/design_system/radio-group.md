# Design System: Radio Group

This document describes the standard radio button group component.

## Base Components

- **`src/components/ui/radio-group.tsx`:** Provides the `RadioGroup` and `RadioGroupItem` components.
- **Underlying Primitive:** Built upon `@radix-ui/react-radio-group`.
- **Exports:**
  - `RadioGroup`: The root container for the radio buttons (Radix `Root`).
  - `RadioGroupItem`: Represents an individual radio button (Radix `Item`).

## Styling

- Components are styled using `cn` and Tailwind CSS.
- **Group (`RadioGroup`):** Uses `grid gap-2` by default for layout.
- **Item (`RadioGroupItem`):**
  - Base: `aspect-square h-4 w-4 rounded-full border border-primary...`
  - Focus: Standard `focus-visible` ring styles.
  - Disabled: `disabled:cursor-not-allowed disabled:opacity-50`.
  - Checked State: The `RadioGroupPrimitive.Indicator` is displayed.
  - Indicator: A smaller, filled `Circle` icon (`lucide-react`) centered within the item.

## Props

- Components accept props relevant to their underlying Radix primitives.
- Key props:
  - **`RadioGroup`:** `value`, `onValueChange`, `defaultValue`, `name`, `orientation` (`'horizontal'` | `'vertical'`), `disabled`, `required`.
  - **`RadioGroupItem`:** `value`, `id`, `disabled`.
- `className`: Allows adding custom Tailwind classes to either `RadioGroup` or `RadioGroupItem`.
- `ref`: Forwarded to the underlying Radix elements.

## Usage Guidelines

- Always import `RadioGroup` and `RadioGroupItem` from `@/components/ui/radio-group`.
- Use Radio Groups when users must select only one option from a list.
- Wrap `RadioGroupItem` components within a `RadioGroup`.
- Provide a unique `value` prop to each `RadioGroupItem` within the same group.
- Control the selected value using `value` and `onValueChange` (or `defaultValue`) on the `RadioGroup` component.
- Associate each `RadioGroupItem` with a `Label` for accessibility. Set the `id` on the `RadioGroupItem` and the `htmlFor` on the `Label`.
- Clicking the associated `Label` should select the corresponding `RadioGroupItem`.

## Examples

### Basic Radio Group

```tsx
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function BasicRadioGroup() {
  return (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="r1" />
        <Label htmlFor="r1">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="r2" />
        <Label htmlFor="r2">Option Two</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-three" id="r3" />
        <Label htmlFor="r3">Option Three</Label>
      </div>
    </RadioGroup>
  );
}
```

### Controlled Radio Group

```tsx
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function ControlledRadioGroup() {
  const [value, setValue] = React.useState('default');

  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="cr1" />
        <Label htmlFor="cr1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="cr2" />
        <Label htmlFor="cr2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="cr3" />
        <Label htmlFor="cr3">Compact</Label>
      </div>
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </RadioGroup>
  );
}
```

### Horizontal Radio Group

```tsx
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function HorizontalRadioGroup() {
  return (
    <RadioGroup defaultValue="card" className="flex space-x-4" orientation="horizontal">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="card" id="hr1" />
        <Label htmlFor="hr1">Card</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paypal" id="hr2" />
        <Label htmlFor="hr2">Paypal</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="apple" id="hr3" />
        <Label htmlFor="hr3">Apple Pay</Label>
      </div>
    </RadioGroup>
  );
}
```
