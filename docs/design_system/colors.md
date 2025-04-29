# Design System: Colors

This document outlines the color palette used in the application, defined via CSS variables in `src/index.css`.

## Base Palette (Light Mode)

| Variable               | HSL Value        | Description                      |
| ---------------------- | ---------------- | -------------------------------- |
| `--background`         | `30 25% 97%`     | Main background color            |
| `--foreground`         | `222.2 84% 4.9%` | Main text/icon color             |
| `--card`               | `32 30% 98%`     | Card background                  |
| `--card-foreground`    | `222.2 84% 4.9%` | Text/icon color on cards         |
| `--popover`            | `0 0% 100%`      | Popover/Dropdown background      |
| `--popover-foreground` | `222.2 84% 4.9%` | Text/icon color on popovers      |
| `--border`             | `30 15% 85%`     | Default border color (warm gray) |
| `--input`              | `30 15% 85%`     | Default input border (warm gray) |
| `--ring`               | `213 94% 48%`    | Focus ring color (Primary Blue)  |

## Semantic Colors (Light Mode)

| Variable                   | HSL Value           | Hex Equivalent | Description                            |
| -------------------------- | ------------------- | -------------- | -------------------------------------- |
| `--primary`                | `213 94% 48%`       | `#0485ea`      | AKC Brand Blue - primary actions       |
| `--primary-foreground`     | `210 40% 98%`       | `#fafdff`      | Text/icon on primary background        |
| `--secondary`              | `30 10% 94%`        | `#f1efee`      | Secondary actions/elements (warm gray) |
| `--secondary-foreground`   | `222.2 47.4% 11.2%` | `#111827`      | Text/icon on secondary background      |
| `--muted`                  | `30 15% 94%`        | `#f2efee`      | Muted elements background (warm gray)  |
| `--muted-foreground`       | `215.4 16.3% 46.9%` | `#6b7280`      | Text/icon on muted background          |
| `--accent`                 | `17 70% 50%`        | `#d96c26`      | Accent color (terracotta-inspired)     |
| `--accent-foreground`      | `210 40% 98%`       | `#fafdff`      | Text/icon on accent background         |
| `--destructive`            | `0 84.2% 60.2%`     | `#f43f5e`      | Destructive actions (e.g., delete)     |
| `--destructive-foreground` | `210 40% 98%`       | `#fafdff`      | Text/icon on destructive background    |

## Sidebar Specific Colors (Light Mode)

These variables are defined specifically for the sidebar component (`@/components/ui/sidebar.tsx`).

| Variable                       | HSL Value           | Hex Equivalent | Description                            |
| ------------------------------ | ------------------- | -------------- | -------------------------------------- |
| `--sidebar-background`         | `32 30% 98%`        | `#fcfbfa`      | Sidebar background                     |
| `--sidebar-foreground`         | `222.2 84% 4.9%`    | `#0a0a0a`      | Default text/icon color in sidebar     |
| `--sidebar-primary`            | `213 94% 48%`       | `#0485ea`      | Primary elements in sidebar (AKC Blue) |
| `--sidebar-primary-foreground` | `210 40% 98%`       | `#fafdff`      | Text/icon on sidebar primary bg        |
| `--sidebar-muted`              | `213 94% 48%`       | `#0485ea`      | Muted elements in sidebar (AKC Blue)   |
| `--sidebar-muted-foreground`   | `215.4 16.3% 46.9%` | `#6b7280`      | Text/icon on sidebar muted bg          |
| `--sidebar-accent`             | `213 84% 95%`       | `#e0f1fe`      | Accent/hover background in sidebar     |
| `--sidebar-accent-foreground`  | `213 94% 48%`       | `#0485ea`      | Text/icon on sidebar accent bg         |
| `--sidebar-border`             | `30 15% 85%`        | `#dbd7d4`      | Border color within sidebar            |
| `--sidebar-ring`               | `213 94% 48% / 0.5` | `#0485ea80`    | Focus ring color within sidebar        |

## Dark Mode

_(Dark mode variables exist in `index.css` but are not documented here yet. TODO: Add dark mode palette)._

## Usage Guidelines

- Use semantic variables (`--primary`, `--destructive`, etc.) whenever possible for intent.
- Use base variables (`--background`, `--foreground`, etc.) for general layout and text.
- Use specific `--sidebar-*` variables only within the sidebar components.
- Avoid hardcoding hex values directly in components; always refer to these CSS variables via Tailwind utility classes (e.g., `bg-primary`, `text-destructive-foreground`).
