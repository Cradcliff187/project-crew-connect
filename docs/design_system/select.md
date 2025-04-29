# Design System: Select

This document describes the standard dropdown select component.

## Base Components

- **`src/components/ui/select.tsx`:** Provides the various parts needed to build a Select dropdown.
- **Underlying Primitive:** Built upon `@radix-ui/react-select`.
- **Exports:**
  - `Select`: The main wrapper component (Radix `Root`).
  - `SelectGroup`: Groups related options (Radix `Group`).
  - `SelectValue`: Displays the selected value inside the trigger (Radix `Value`).
  - `SelectTrigger`: The button element that opens/closes the dropdown.
  - `SelectContent`: The container for the options list, rendered in a portal.
  - `SelectLabel`: A label for a group of options within the content (Radix `Label`).
  - `SelectItem`: Represents an individual selectable option (Radix `Item`).
  - `SelectSeparator`: A visual separator between items or groups (Radix `Separator`).
  - `SelectScrollUpButton`, `SelectScrollDownButton`: Buttons for scrolling within long lists.

## Styling

- Components are styled using `cn` and Tailwind CSS.
- **Trigger (`SelectTrigger`):** Styled like an input (`h-10`, `border`, `rounded-md`, etc.), includes a `ChevronDown` icon.
- **Content (`SelectContent`):** Positioned via `popper`, includes border, background, shadow, and animations (`animate-in`, `fade-in-0`, `zoom-in-95` on open).
- **Item (`SelectItem`):** Includes padding, focus styles (`focus:bg-accent`), disabled styles, and reserves space for a checkmark indicator.
- **Indicator:** A `Check` icon is displayed next to the selected item.

## Props

- Each exported component accepts props relevant to its underlying Radix primitive.
- Key props for common usage:
  - **`Select`:** `value`, `onValueChange`, `defaultValue`, `name`, `disabled`.
  - **`SelectTrigger`:** Often just needs `children` (usually a `SelectValue`).
  - **`SelectValue`:** `placeholder`.
  - **`SelectItem`:** `value`, `disabled`.

## Usage Guidelines

- Import the necessary components from `@/components/ui/select`.
- Compose the components together: `Select` > `SelectTrigger` > `SelectValue` (and icon), followed by `SelectContent` > (`SelectGroup` > `SelectLabel`?) > `SelectItem`s.
- Use the `value` and `onValueChange` props on the root `Select` component to control its state.
- Provide a unique `value` prop to each `SelectItem`.
- Use `SelectGroup` and `SelectLabel` for organizing longer lists of options.
- Associate with a `Label` component for accessibility.

## Examples

### Basic Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function BasicSelect() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="framework">Framework</Label>
      <Select name="framework">
        <SelectTrigger id="framework">
          <SelectValue placeholder="Select a framework" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
          <SelectItem value="angular">Angular</SelectItem>
          <SelectItem value="svelte">Svelte</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### Select with Groups

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function GroupedSelect() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="timezone">Timezone</Label>
      <Select name="timezone">
        <SelectTrigger id="timezone">
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
            <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
            <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
            <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Europe & Africa</SelectLabel>
            <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
            <SelectItem value="cet">Central European Time (CET)</SelectItem>
            <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### Controlled Select

```tsx
import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function ControlledSelect() {
  const [value, setValue] = React.useState('apple');

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="fruit">Fruit</Label>
      <Select name="fruit" value={value} onValueChange={setValue}>
        <SelectTrigger id="fruit">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  );
}
```
