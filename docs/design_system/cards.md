# Design System: Cards

Cards are used extensively to group related information and actions.

## Base Component

- **`src/components/ui/card.tsx`:** Provides the standard Shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` components.

## Base Styling

- Defined in `src/index.css`:
  - `--card`: `32 30% 98%` (Background)
  - `--card-foreground`: `222.2 84% 4.9%` (Text/Icon Color)
- The default `Card` component likely uses these variables along with `border` and `rounded-lg`.

## Custom Card Styles (`src/index.css`)

These utility classes can be added to `Card` components for specific visual effects:

- **`.card-gradient`:** Applies a gradient background (`bg-gradient-to-br from-card to-secondary/80`).
- **`.card-glass`:** Applies a semi-transparent background with blur and border (`bg-white/70 backdrop-blur-sm border border-white/20`).
- **`.premium-card`:** Applies standard card styles plus a subtle gradient overlay (`::before` pseudo-element with `bg-gradient-to-br from-construction-50/40 to-white`).

## Usage Guidelines

- Use the standard `Card` component and its sub-components (`CardHeader`, `CardContent`, etc.) for structuring card content.
- Use `CardTitle` for the main heading within a card. Check if `font-montserrat` should be applied consistently here.
- Use `CardDescription` for secondary text in the header.
- Place primary content within `CardContent`.
- Place actions or summary information in `CardFooter`.
- Apply custom styles like `.card-gradient` or `.premium-card` sparingly for specific visual emphasis where appropriate.

## Examples

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Project Details</CardTitle>
    <CardDescription>Basic project information.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Details go here...</p>
  </CardContent>
  <CardFooter>
    <Button>View More</Button>
  </CardFooter>
</Card>

// Card with custom gradient style
<Card className="card-gradient">
  <CardHeader>
    <CardTitle>Special Announcement</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Something visually distinct.</p>
  </CardContent>
</Card>
```

_(TODO: Add screenshots or visual examples of different card types)._

## Common Content Patterns

### Icon - Label/Value List

A common pattern for displaying key-value pairs or definition lists within a `CardContent` involves using a flexbox layout with an icon.

- **Structure:**

  - Outer container (e.g., `<div className="space-y-4">`).
  - Each item: `<div className="flex items-start">`.
  - Icon: `<Icon className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />` (Adjust icon, size, margin as needed).
  - Text Block: `<div>` containing:
    - Label: `<p className="font-medium">Label Text</p>`
    - Value: `<p className="text-sm text-muted-foreground">Value Text</p>` (Consider `font-medium` for emphasized values).
    - Optional Secondary Value: `<p className="text-xs text-muted-foreground">Secondary Info</p>`

- **Example Usage:** Found in `ProjectInfoCard`, `ProjectClientCard`.

```tsx
// Example within CardContent
<CardContent className="pt-6">
  {' '}
  {/* pt-6 often used */}
  <div className="space-y-4">
    {/* Item 1 */}
    <div className="flex items-start">
      <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
      <div>
        <p className="font-medium">Created On</p>
        <p className="text-sm text-muted-foreground">{formatDate(project.created_at)}</p>
      </div>
    </div>
    {/* Item 2 */}
    <div className="flex items-start">
      <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
      <div>
        <p className="font-medium">Client</p>
        <p className="text-sm font-medium">{customerName || 'N/A'}</p>
        <p className="text-xs text-muted-foreground">ID: {customerId || 'N/A'}</p>
      </div>
    </div>
    {/* ... more items ... */}
  </div>
</CardContent>
```
