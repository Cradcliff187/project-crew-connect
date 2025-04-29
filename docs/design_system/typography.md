# Design System: Typography

This document outlines the typographic styles and fonts used.

## Fonts

- **Primary Font (Body Text):** 'Open Sans' (imported via Google Fonts in `src/index.css`)
- **Secondary Font (Headings):** 'Montserrat' (imported via Google Fonts in `src/index.css`)

## Base Styles (`src/index.css`)

- **Body:** Applies `font-family: 'Open Sans', sans-serif;`
- **Headings (`h1`-`h6`):** Applies `font-family: 'Montserrat', sans-serif; font-weight: 700;`

## Usage Guidelines

- Standard text content within paragraphs, labels, table cells, etc., should use the default `font-opensans` (applied via Tailwind's base body style).
- Page titles, card titles, section headings, and other major headings should use `font-montserrat`.
- Use Tailwind utility classes (e.g., `text-lg`, `font-medium`, `text-destructive`) for specific size, weight, and color adjustments.
- The `PageHeader` component currently applies `font-montserrat` directly to its `h1` title.

## Examples

```tsx
// Standard paragraph
<p>This uses Open Sans.</p>

// Heading (implicitly uses Montserrat via h1 tag)
<h1>Main Page Title</h1>

// Card Title (likely styled via CardTitle component)
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle> // Check CardTitle implementation for font
  </CardHeader>
  <CardContent>
    <p>Card content uses Open Sans.</p>
  </CardContent>
</Card>

// Explicit font usage (if needed, prefer semantic elements)
<div className="font-montserrat font-bold text-xl">Custom Heading Style</div>
```

_(TODO: Document specific text sizes, weights, and line heights used for different elements like form labels, input text, table headers, etc.)_
