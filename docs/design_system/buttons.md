# Design System: Buttons

This document describes the standard button component and its usage.

## Base Component

- **`src/components/ui/button.tsx`:** Provides the base `Button` component built using `class-variance-authority` (CVA) and Radix UI Slot.

## Variants

Based on `buttonVariants` defined in the component:

- **`default`:** Primary action button (`bg-primary text-primary-foreground hover:bg-primary/90`). Used for main confirm actions (e.g., Save, Submit, Retry).
- **`destructive`:** Destructive action button (`bg-destructive text-destructive-foreground hover:bg-destructive/90`). Used for actions like Delete or Cancel that have significant consequences.
- **`outline`:** Secondary action button with a border (`border border-input bg-background hover:bg-accent hover:text-accent-foreground`). Often used for secondary confirmation actions or less prominent actions like "Upload Document".
- **`secondary`:** Alternative secondary action button (`bg-secondary text-secondary-foreground hover:bg-secondary/80`). Used for actions like "Login" when primary is not suitable.
- **`ghost`:** Button with no background or border, often used for icons or subtle actions (`hover:bg-accent hover:text-accent-foreground`). Used for SidebarTrigger, Notification Bell.
- **`link`:** Button styled as a link (`text-primary underline-offset-4 hover:underline`).

## Sizes

- **`default`:** Standard size (`h-10 px-4 py-2`).
- **`sm`:** Small size (`h-9 rounded-md px-3`). Used in `DocumentCard`.
- **`xs`:** Extra-small size (`h-6 px-2 rounded-md text-xs`). Custom addition.
- **`lg`:** Large size (`h-11 rounded-md px-8`).
- **`icon`:** Square button for icons (`h-10 w-10`). Used for SidebarTrigger, Back button in `PageHeader`.

## Usage Guidelines

- Always import the `Button` component from `@/components/ui/button`.
- Choose the `variant` that best represents the semantic meaning of the action (primary, secondary, destructive, etc.).
- Use the appropriate `size` based on the context.
- **Consistency:** Avoid applying custom styles that override the defined variants (like the hardcoded colors previously found in `DocumentsSection`). If a new style is needed, consider adding a new variant to `button.tsx`.
- Use the `asChild` prop when nesting a `Link` or other component inside the `Button` to ensure proper rendering and accessibility.

## Examples

```tsx
// Default button
<Button onClick={handleSave}>Save Changes</Button>

// Destructive button
<Button variant="destructive" onClick={handleDelete}>Delete Item</Button>

// Outline button
<Button variant="outline" onClick={handleUpload}>Upload</Button>

// Small outline button with icon
<Button variant="outline" size="sm" onClick={handleView}>
  <Eye className="h-4 w-4 mr-1" /> View
</Button>

// Icon button (ghost variant)
<Button variant="ghost" size="icon" onClick={toggleSidebar}>
  <PanelLeft />
</Button>

// Button containing a Link
<Button variant="secondary" size="sm" asChild>
  <Link to="/settings">Settings</Link>
</Button>
```
