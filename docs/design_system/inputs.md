# Design System: Input

This document describes the standard text input component and its usage.

## Base Component

- **`src/components/ui/input.tsx`:** Provides the base `Input` component.

## Styling

- The component uses Tailwind CSS classes for styling.
- **Base:** `flex h-11 w-full rounded-md border-2 border-input bg-background px-4 py-2.5 text-base ...`
- **Placeholder:** `placeholder:text-muted-foreground`
- **Focus:** Uses `focus-visible` states for enhanced accessibility (`focus-visible:outline-none focus-visible:border-[#0485ea] focus-visible:ring-2 ...`)
- **Disabled:** `disabled:cursor-not-allowed disabled:opacity-50`
- **Responsiveness:** Font size adjusts slightly on medium screens (`md:text-sm`).
- **Transitions:** Includes a smooth transition effect (`transition-all duration-200`).

## Props

- Accepts all standard HTML `<input>` attributes (e.g., `type`, `value`, `onChange`, `placeholder`, `disabled`, `name`, `id`, etc.).
- `className`: Allows adding custom Tailwind classes for specific overrides or additions.
- `ref`: Forwarded to the underlying `<input>` element.

## Usage Guidelines

- Always import the `Input` component from `@/components/ui/input`.
- Use standard `type` attributes like `text`, `email`, `password`, `number`, `date`, etc., as needed.
- Utilize `placeholder` text to guide user input.
- Always associate an input with a `label` for accessibility, often using `htmlFor` on the label pointing to the input's `id`. Consider using the `Label` component from `@/components/ui/label`.
- For forms, integrate with form libraries like `react-hook-form` by spreading the `register` props onto the input.
- Avoid applying excessive custom styling via `className`. If significant variations are needed frequently, consider creating a custom wrapper component or discussing the need for variants in the base `Input` component.

## Examples

### Basic Text Input

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function BasicInput() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
  );
}
```

### Disabled Input

```tsx
import { Input } from '@/components/ui/input';

function DisabledInput() {
  return <Input disabled type="text" placeholder="Cannot edit" />;
}
```

### Input with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FormData {
  username: string;
}

function FormInput() {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Your username"
          {...register('username', { required: true })}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```
