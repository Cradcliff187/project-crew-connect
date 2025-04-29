# Design System: Textarea

This document describes the standard multi-line text input component.

## Base Component

- **`src/components/ui/textarea.tsx`:** Provides the base `Textarea` component.

## Styling

- The component uses Tailwind CSS classes for styling.
- **Base:** `flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ...`
- **Placeholder:** `placeholder:text-muted-foreground`
- **Focus:** Uses `focus-visible` states for accessibility (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`)
- **Disabled:** `disabled:cursor-not-allowed disabled:opacity-50`

## Props

- Accepts all standard HTML `<textarea>` attributes (e.g., `value`, `onChange`, `placeholder`, `disabled`, `rows`, `cols`, `name`, `id`, etc.).
- `className`: Allows adding custom Tailwind classes for specific overrides or additions.
- `ref`: Forwarded to the underlying `<textarea>` element.

## Usage Guidelines

- Always import the `Textarea` component from `@/components/ui/textarea`.
- Use `Textarea` for longer-form text input where a single line (`Input`) is insufficient.
- Utilize `placeholder` text to guide user input.
- Always associate a `Textarea` with a `Label` component for accessibility using `htmlFor` and `id`.
- Integrate with form libraries like `react-hook-form` by spreading the `register` props.
- Control the default size using the `rows` attribute if needed, but the component has a `min-h-[80px]` set by default.

## Examples

### Basic Textarea

```tsx
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function BasicTextarea() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your Message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  );
}
```

### Textarea with Custom Rows

```tsx
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function SizedTextarea() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="description">Description</Label>
      <Textarea placeholder="Provide details..." id="description" rows={6} />
    </div>
  );
}
```

### Textarea with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FeedbackData {
  feedback: string;
}

function FormTextarea() {
  const { register, handleSubmit } = useForm<FeedbackData>();

  const onSubmit = (data: FeedbackData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Share your thoughts..."
          {...register('feedback', { required: 'Feedback is required.' })}
        />
      </div>
      <Button type="submit">Submit Feedback</Button>
    </form>
  );
}
```

</rewritten_file>
