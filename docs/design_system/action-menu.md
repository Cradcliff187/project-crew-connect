# Design System: Action Menu

This document describes the standard `ActionMenu` component used for displaying a list of actions within a compact dropdown, often used in table rows or cards.

## Base Component

- **`src/components/ui/action-menu.tsx`:** Provides the `ActionMenu` component.
- **Underlying Primitives:** Built upon `@radix-ui/react-dropdown-menu` (`DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`) and optionally `@radix-ui/react-hover-card` (`HoverCard`, `HoverCardTrigger`, `HoverCardContent`).

## Structure

- Renders a trigger `Button` (defaulting to `variant="ghost"` and `size="icon"`) containing a `MoreHorizontal` icon.
- Opens a `DropdownMenuContent` containing grouped lists of actions based on the `groups` prop.
- Separators are automatically added between groups.
- Individual items can optionally trigger a `HoverCard` on hover if `hoverContent` is provided.

## Props

- **`groups: ActionGroup[]`** (Required): An array of action groups. Each `ActionGroup` has:
  - `items: ActionItem[]`: An array of actions within the group.
  - `label?: string`: An optional label for the group (currently not rendered, but could be used in the future).
- Each `ActionItem` has:
  - `label: string`: The text displayed for the menu item.
  - `onClick: (e: React.MouseEvent) => void`: Callback function executed when the item is clicked. Event propagation is stopped by default.
  - `icon?: React.ReactNode`: An optional icon element displayed before the label.
  - `className?: string`: Optional class name(s) to apply to the `DropdownMenuItem`.
  - `disabled?: boolean`: If true, disables the menu item.
  - `hoverContent?: React.ReactNode`: Optional content to display within a `HoverCard` when the menu item is hovered.
- **`align?: 'start' | 'center' | 'end'`**: Alignment of the dropdown content relative to the trigger (default: `'end'`).
- **`size?: 'default' | 'sm'`**: Controls the size of the trigger button (`icon` or `icon-sm`) and the icon inside (default: `'default'`).
- **`variant?: 'ghost' | 'outline'`**: Controls the visual style of the trigger button (default: `'ghost'`).
- **`triggerClassName?: string`**: Optional class name(s) to apply specifically to the trigger `Button`.

## Usage Guidelines

- Import the component: `import ActionMenu, { ActionGroup, ActionItem } from '@/components/ui/action-menu';`
- Define the structure of your actions using the `groups` and `items` interfaces.
- Use icons consistently (e.g., `h-4 w-4` from `lucide-react`).
- Use `className` for specific styling needs on items (e.g., text color for destructive actions).
- Ideal for contexts where space is limited, like table rows or item cards.

## Examples

### Basic Action Menu (e.g., for a table row)

```tsx
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Eye, Pencil, Trash2 } from 'lucide-react';

function RowActions() {
  const handleView = e => {
    e.stopPropagation(); // Already handled in component, but good practice
    console.log('View clicked');
  };
  const handleEdit = e => {
    console.log('Edit clicked');
  };
  const handleDelete = e => {
    console.log('Delete clicked');
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          onClick: handleView,
        },
        {
          label: 'Edit Item',
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleEdit,
        },
      ],
    },
    {
      items: [
        {
          label: 'Delete Item',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: handleDelete,
          className: 'text-destructive', // Example: Destructive action styling
          disabled: false,
        },
      ],
    },
  ];

  return (
    <ActionMenu
      groups={actionGroups}
      size="sm" // Use smaller trigger for table rows
      align="end"
    />
  );
}
```

### Action Menu Item with Hover Card

```tsx
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Info, MessageSquare } from 'lucide-react';

function HoverActionMenu() {
  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'User Info',
          icon: <Info className="h-4 w-4" />,
          onClick: () => {}, // Can be empty if hover is main interaction
          hoverContent: (
            <div className="text-sm space-y-1">
              <p className="font-semibold">Jane Doe</p>
              <p className="text-muted-foreground">jane.doe@example.com</p>
              <p>Status: Active</p>
            </div>
          ),
        },
        {
          label: 'Send Message',
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: () => console.log('Send message clicked'),
        },
      ],
    },
  ];

  return <ActionMenu groups={actionGroups} align="start" />;
}
```
