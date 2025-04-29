# Design System: Dialog (Modal)

This document describes the standard dialog (modal) component.

## Base Components

- **`src/components/ui/dialog.tsx`:** Provides the various parts needed to build a Dialog.
- **Underlying Primitive:** Built upon `@radix-ui/react-dialog`.
- **Exports:**
  - `Dialog`: The main wrapper component (Radix `Root`).
  - `DialogTrigger`: A button or element that opens the dialog (Radix `Trigger`).
  - `DialogPortal`: Renders its children into a separate DOM node (Radix `Portal`).
  - `DialogOverlay`: The fixed-position backdrop behind the content.
  - `DialogContent`: The main modal window container.
  - `DialogHeader`: A styled `div` for the dialog header area.
  - `DialogFooter`: A styled `div` for the dialog footer area (often for action buttons).
  - `DialogTitle`: The accessible title for the dialog (Radix `Title`).
  - `DialogDescription`: An optional accessible description (Radix `Description`).
  - `DialogClose`: A button or element that closes the dialog (Radix `Close`).
  - `VisuallyHidden`: Utility component for accessibility.

## Styling

- Components are styled using `cn` and Tailwind CSS, with animations.
- **Overlay (`DialogOverlay`):** Fixed position, covers viewport, `bg-black/80`, fade-in/out animations.
- **Content (`DialogContent`):**
  - Fixed position, centered (`left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`).
  - Styled container (`max-w-lg`, `border`, `bg-background`, `p-6`, `shadow-lg`, `sm:rounded-lg`).
  - Entry/Exit animations (`data-[state=open]:animate-in data-[state=closed]:animate-out`, using fade, zoom, and slide effects).
  - Includes an absolute positioned close (`X`) button in the top-right corner.
- **Header (`DialogHeader`):** `flex flex-col space-y-1.5 text-center sm:text-left`.
- **Footer (`DialogFooter`):** `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`.
- **Title (`DialogTitle`):** `text-lg font-semibold leading-none tracking-tight`.
- **Description (`DialogDescription`):** `text-sm text-muted-foreground`.

## Accessibility

- Built on Radix UI primitives, handling focus management, keyboard navigation (Esc to close), and aria attributes.
- `DialogContent` automatically adds a visually hidden `h2` based on the `accessibleTitle` prop (defaulting to "Dialog") if a `DialogTitle` component is not found among its children. This ensures modals always have an accessible name.
- The close button includes visually hidden text "Close".
- Use `DialogTitle` and optionally `DialogDescription` for better screen reader announcements.

## Props

- Each exported component accepts props relevant to its underlying Radix primitive or HTML element.
- Key props:
  - **`Dialog`:** `open`, `onOpenChange`, `defaultOpen`, `modal` (defaults to `true`).
  - **`DialogContent`:** `onEscapeKeyDown`, `onPointerDownOutside`, `accessibleTitle` (custom prop, defaults to 'Dialog').
- `className`: Allows adding custom Tailwind classes to any part.
- `ref`: Forwarded where applicable (e.g., `DialogContent`).

## Usage Guidelines

- Import the necessary components from `@/components/ui/dialog`.
- Structure: `Dialog` > `DialogTrigger` + `DialogPortal` > `DialogOverlay` + `DialogContent`.
- Inside `DialogContent`, typically use `DialogHeader` > `DialogTitle` / `DialogDescription`, followed by content, and then `DialogFooter` > buttons (including `DialogClose` if needed).
- Control the open state via `open` / `onOpenChange` on the root `Dialog` component.
- Use `DialogClose` around buttons or elements intended to close the modal.

## Examples

### Basic Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button">Confirm</Button> {/* Add action */}
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
```

### Dialog without Explicit Title (Uses default hidden title)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  // DialogTitle is omitted
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function SimpleDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Show Info</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        {/* accessibleTitle prop could be added here if "Dialog" isn't descriptive enough */}
        <DialogContent>
          <DialogHeader>
            {/* No DialogTitle */}
            <DialogDescription>This dialog provides some additional information.</DialogDescription>
          </DialogHeader>
          {/* ... content ... */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
```
