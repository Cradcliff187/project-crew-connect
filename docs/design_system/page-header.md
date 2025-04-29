# Design System: Page Header

This document describes the standard `PageHeader` component used for consistent page titles, descriptions, and action areas.

## Base Component

- **`src/components/layout/PageHeader.tsx`:** Provides the `PageHeader` component.

## Structure

The component renders the following structure:

```html
<div class="flex flex-col gap-4 mb-6">
  <!-- Main container -->
  <div class="flex flex-col gap-2 animate-in">
    <!-- Title/Description block -->
    <h1 class="text-xl md:text-2xl font-semibold text-primary">{title}</h1>
    {description &&
    <p class="text-muted-foreground">{description}</p>
    }
  </div>

  {children && (
  <div
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in"
    style="animation-delay: 0.1s"
  >
    <!-- Actions/Controls block (Children) -->
    {children}
  </div>
  )}
</div>
```

- Provides vertical spacing (`gap-4`, `mb-6`).
- Title uses primary color and responsive text size.
- Description uses muted foreground color.
- Actions (`children`) container adjusts layout responsively (column on small, row on medium+).
- Includes subtle `animate-in` effects (requires `tailwindcss-animate`).

## Props

- **`title: string`** (Required): The main title text displayed as an `h1`.
- **`description?: string`** (Optional): Secondary text displayed below the title.
- **`children?: React.ReactNode`** (Optional): Content to be placed in the actions area (typically buttons, search inputs, filters).

## Usage Guidelines

- Import the component: `import PageHeader from '@/components/layout/PageHeader';`
- Use at the top of main page components to establish a consistent header structure.
- Provide a clear `title`.
- Optionally add a `description` for context.
- Pass action buttons, search fields, or filter controls as `children`.

## Examples

### Header with Title Only

```tsx
<PageHeader title="Dashboard" />
```

### Header with Title and Description

```tsx
<PageHeader title="Projects" description="Manage all company projects." />
```

### Header with Title, Description, and Actions

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

<PageHeader title="Work Orders" description="Manage maintenance work orders and service requests">
  {/* Children are placed in the actions area */}
  <div className="relative max-w-sm">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input type="search" placeholder="Search..." className="pl-9 rounded-md" />
  </div>
  <Button size="sm" variant="default">
    <Plus className="h-4 w-4 mr-1" />
    New Work Order
  </Button>
</PageHeader>;
```
